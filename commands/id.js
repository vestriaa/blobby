import CONFIG from '../config.js'
import UTILS from '../utils.js'

export async function id(json, env) {
    const queryUsername = json.data.options[0].value;
    const userData = await UTILS.getPlayerDetails(queryUsername);
    if (!userData) {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Could not find a player with that username",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "```"+userData.user_id+"```",
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}