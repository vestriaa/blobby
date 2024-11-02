import * as CONFIG from '../config.js'
import * as UTILS from '../utils.js'

export async function oldest(json, env) {
    const queryCreator = json.data.options[0].value;
    const userSearch = `${CONFIG.API_URL}list?max_format_version=${CONFIG.FORMAT_VERSION}&type=user_name&search_term=${queryCreator}`;
    const searchResponse = await fetch(userSearch);
    const searchData = await searchResponse.json();
    if(searchData.length >= 1) {
        const user = searchData[0];
        const userId = user.user_id;
        const levelSearch = `${CONFIG.API_URL}list?max_format_version=${CONFIG.FORMAT_VERSION}&user_id=${userId}`;
        const levelResponse = await fetch(levelSearch);
        const levelData = await levelResponse.json();
        if (levelData.length >= 1) {
            const level = levelData[levelData.length - 1];
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: CONFIG.LEVEL_URL + level.identifier,
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        } else {
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: "Could not find a level for that creator",
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }
    } else {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Could not find a creator with that username",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
}