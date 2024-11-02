import * as CONFIG from './config.js'
import * as UTILS from '../utils.js'

export async function actualTrending(json, env) {
    const levelData = await UTILS.getTrendingLevels();
    const top5 = levelData.filter((level) => level.identifier !== "29t798uon2urbra1f8w2q:1693775768" && level.title.toLowerCase().indexOf("yoohoo") == -1 && level.title.toLowerCase().indexOf("diff") == -1).slice(0, 5);
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