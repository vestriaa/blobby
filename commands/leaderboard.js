import * as CONFIG from './config.js'
import * as UTILS from '../utils.js'

export async function leaderboard(json, env) {
    const queryTitle = json.data.options[0].value;
    const queryCreator = json.data.options.length > 1 ? json.data.options[1].value : '';
    const levelData = await UTILS.getLevel(queryTitle, queryCreator);
    
    if(levelData) {
        const levelID = levelData.identifier;
        const leaderboardUrl = `${CONFIG.API_URL}statistics_top_leaderboard/${levelID.replace(":", "/")}`;
        const leaderboardResponse = await fetch(leaderboardUrl);
        const leaderboardData = await leaderboardResponse.json();
        let description = [];
        let maxDecimals = 0;
        leaderboardData.forEach((entry) => {
            let decimals = entry.best_time.toString().split(".")[1];
            if (decimals) {
                maxDecimals = Math.max(maxDecimals, decimals.length);
            }
        });
        for(let i = 0; i < Math.min(10, leaderboardData.length); i++) {
            description.push(`**${i+1}**. ${leaderboardData[i].user_name} - ${UTILS.formatTime(leaderboardData[i].best_time, maxDecimals)}`);
        }
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "",
                embeds: [{
                    "type": "rich",
                    "title": `Leaderboard for ${levelData.title}`,
                    "description": description.join("\n"),
                    "color": 0x618dc3,
                    "fields": [],
                    "url": CONFIG.LEVEL_URL + levelID
                }],
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