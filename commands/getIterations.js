import * as CONFIG from './config.js'
import * as UTILS from '../utils.js'

export async function getIterations(json, env) {
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
    const iterations = detailsData.iteration;

    let iterationList = [];
    let length = 0;
    let lastString = `...\n[Iteration ${1}](<${CONFIG.LEVEL_URL}${levelID}:${1}>)`;
    let endString = `... (XXX of XXX iterations shown)`;
    for (let i = iterations; i > 0; i--) {
        let str = `[Iteration ${i}](<${CONFIG.LEVEL_URL}${levelID}:${i}>)`;
        if (length == 0) {
            str += " (current)";
        }
        length += str.length;
        if (i > 1 && length > 2000 - lastString.length - 1 - endString.length - 1) {
            if (iterationList.length < iterations) {
                iterationList.push(lastString);
                iterationList.push(`-# (${iterationList.length} of ${iterations} iterations shown)`);
                break;
            }
        }
        iterationList.push(str);
    }

    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: iterationList.join("\n"),
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}