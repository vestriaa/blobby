import * as CONFIG from '../config.js'
import * as UTILS from '../utils.js'

export async function topTrending(json, env) {
    const levelData = await UTILS.getTrendingLevels();
    const level = levelData[0];
    const fields = [
        {
            "name": `Todays Plays`,
            "value": `${level.change}`,
            "inline": true
        }, {
            "name": `Total Plays`,
            "value": `${level.statistics.total_played}`,
            "inline": true
        }
    ];
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "",
            embeds: [await UTILS.generateLevelEmbed(level, fields)],
            allowed_mentions: { parse: [] }
        }
    });
}