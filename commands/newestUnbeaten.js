import CONFIG from '../config.js'
import UTILS from '../utils.js'

export async function newestUnbeaten(json, env) {
    const levelResponse = await fetch(CONFIG.STATS_API + "unbeaten_levels.json");
    const levelData = await levelResponse.json();
    const level = levelData[levelData.length - 1];
    const fields = [
        {
            "name": `Days Unbeaten`,
            "value": `${Math.floor((Date.now() - level?.update_timestamp) / 1000 / 60 / 60 / 24)}`,
            "inline": false
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