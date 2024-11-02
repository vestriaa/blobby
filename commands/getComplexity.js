import * as CONFIG from '../config.js'
import * as UTILS from '../utils.js'

export async function getComplexity(json, env) {
    const message = json.data.resolved.messages[json.data.target_id];
    const matches = /\?level=([^\s>)&]+)/g.exec(message.content);
    let levelID = matches?.length > 1 ? matches[1] : '';
    if (levelID == '') {
        if (message.embeds?.length > 0) {
            const embedContent = JSON.stringify(message.embeds);
            const embedMatches = /\?level=([^\s>)&"\]]+)/g.exec(embedContent);
            levelID = embedMatches?.length > 1 ? embedMatches[1] : '';
        }
    }

    if (levelID == '') {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Couldn't identify level",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
    const detailsUrl = `${CONFIG.API_URL}details/${levelID.replace(":", "/")}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    const complexity = detailsData.complexity;

    const playerID = levelID.split(":")[0];

    const playerDetailsUrl = `${CONFIG.API_URL}get_user_info?user_id=${playerID}`;
    const playerDetailsResponse = await fetch(playerDetailsUrl);
    const playerDetailsData = await playerDetailsResponse.json();
    const is_creator = playerDetailsData.is_creator;
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: complexity + " / " + (is_creator ? "3000" : "1500") + " complexity",
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}