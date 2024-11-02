import * as CONFIG from './config.js'
import * as UTILS from '../utils.js'

export async function wiki(json, env) {
    const query = json.data.options[0].value;

    let wikiUrl = `${CONFIG.WIKI_URL}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=7`;

    const wikiResponse = await fetch(wikiUrl);
    const text = await wikiResponse.text();
    if (text.charAt(0) == "<") {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Weird wiki bug :c\nDon't bother trying the command again lol",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
    const wikiData = await wikiResponse.json();

    if (wikiData?.query?.search?.length == 0) {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "No results found",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }

    const timestamp = wikiData.query.search[0]?.timestamp || "Error";
    let embed = {
        type: "rich",
        title: `Results for ${query}`,
        url: `${CONFIG.WIKI_URL}/wiki/Special:Search?search=${encodeURIComponent(query)}`,
        description: "",
        color: 0x006b2d,
        footer: {
            text: timestamp
        }
    };

    for (const result of wikiData.query.search) {
        const { title } = result;
        const pageUrl = `${CONFIG.WIKI_URL}/w/index.php?title=${encodeURIComponent(title)}`;

        embed.description += `[${title}](<${pageUrl}>)\n`;
    }

    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "",
            embeds: [embed],
            allowed_mentions: { parse: [] }
        }
    });
}