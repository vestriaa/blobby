import * as CONFIG from './config.js'
import * as UTILS from '../utils.js'

export async function level(json, env) {
    const queryTitle = json.data.options[0].value;
    const queryCreator = json.data.options.length > 1 ? json.data.options[1].value : '';
    const levelData = await UTILS.getLevel(queryTitle, queryCreator);
    
    if(levelData) {
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
    } else {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Could not find a level with that title and creator",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
}