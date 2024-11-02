import * as CONFIG from '../config.js'
import * as UTILS from '../utils.js'

export async function trending(json, env) {
    const levelData = await UTILS.getTrendingLevels();
    const top5 = levelData.slice(0, 5);
    let description = [];
    top5.forEach((level, index) => {
        description.push(`**#${index + 1}** ${level.title} - ${level.change}`);
    });
    const embeds = [{
        title: `Trending Levels`,
        description: description.join("\n"),
        color: 0x00ffff
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