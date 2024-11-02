import CONFIG from '../config.js'
import UTILS from '../utils.js'

export async function random(json, env) {
    const isVerified = json.data.options[0].value;
    let levelUrl = CONFIG.API_URL + "get_random_level";
    if (isVerified) {levelUrl += "?type=ok"}
    const levelResponse = await fetch(levelUrl);
    const levelData = await levelResponse.json();
    const url = CONFIG.LEVEL_URL + levelData.identifier;
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: url,
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}