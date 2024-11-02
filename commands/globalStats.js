import CONFIG from '../config.js'
import UTILS from '../utils.js'

export async function globalStats(json, env) {
    const levelResponse = await fetch(CONFIG.STATS_API + "all_verified.json");
    const levelData = await levelResponse.json();
    let globalStats = {
        "plays": 0,
        "verified_maps": 0,
        "todays_plays": 0,
        "average_difficulty": 0,
        "average_plays": 0,
        "average_likes": 0,
        "average_time": 0,
        "complexity": 0,
        "iterations": 0,
        "average_complexity": 0,
    };
    levelData.forEach(level => {
        globalStats.verified_maps += 1;
        globalStats.todays_plays += level.change;
        if ("statistics" in level) {
            globalStats.plays += level.statistics.total_played;
            globalStats.average_difficulty += level.statistics.difficulty;
            globalStats.average_likes += level.statistics.liked;
            globalStats.average_time += level.statistics.time;
        }
        globalStats.complexity += level.complexity;
        globalStats.iterations += level.iteration || 1;
    });
    globalStats.average_difficulty /= globalStats.verified_maps;
    globalStats.average_likes /= globalStats.verified_maps;
    globalStats.average_time /= globalStats.verified_maps;
    globalStats.average_plays = globalStats.plays / globalStats.verified_maps;
    globalStats.average_complexity = globalStats.complexity / globalStats.verified_maps;
    const embeds = [{
        "type": "rich",
        "title": `Global Stats`,
        "description": `**Total plays:** ${UTILS.numberWithCommas(globalStats.plays)}\n**Verified maps:** ${UTILS.numberWithCommas(globalStats.verified_maps)}\n**Todays plays:** ${UTILS.numberWithCommas(globalStats.todays_plays)}\n**Total complexity:** ${UTILS.numberWithCommas(globalStats.complexity)}\n**Iterations:** ${UTILS.numberWithCommas(globalStats.iterations)}\n**Average difficulty:** ${Math.round(globalStats.average_difficulty*100)}%\n**Average plays:** ${UTILS.numberWithCommas(Math.round(globalStats.average_plays*100)/100)}\n**Average likes:** ${Math.round(globalStats.average_likes*100)}%\n**Average time:** ${Math.round(globalStats.average_time*100)/100}s\n**Average complexity:** ${UTILS.numberWithCommas(Math.round(globalStats.average_complexity*100)/100)}`,
        "color": 0x618dc3,
        "fields": [],
        "url": CONFIG.STATS_URL + "/stats?tab=Global"
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