import * as CONFIG from './config.js'
import * as UTILS from '../utils.js'

export async function getThumbnail(json, env) {
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
    const image_iteration = detailsData.iteration_image;
    const imageUrl = `${CONFIG.IMAGES_API_URL}level_${levelID.replace(":", "_")}_${image_iteration}.png`;

    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: `[${detailsData.title}'s thumbnail](${imageUrl})`,
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}