import CONFIG from '../config.js'
import UTILS from '../utils.js'

export async function unbeaten(json, env) {
    const levelResponse = await fetch(CONFIG.STATS_API + "unbeaten_levels.json");
    const levelData = await levelResponse.json();
    const now = Date.now();
    const description = [];
    levelData.forEach(level => {
        const daysOld = (now - level?.update_timestamp) / 1000 / 60 / 60 / 24;
        if (daysOld > 100) {
            description.push(`**${Math.floor(daysOld)}d** ${level.title}`);
        }
    });
    const embeds = [{
        title: `Unbeaten Levels (${levelData.length})`,
        description: description.join("\n"),
        color: 0xff0000
    }];
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "",
            embeds: embeds,
            allowed_mentions: { parse: [] }
        }
    });
}