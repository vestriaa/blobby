import * as CONFIG from './config.js'
import * as UTILS from '../utils.js'

export async function getLeaderboard(json, env) {
    const message = json.data.resolved.messages[json.data.target_id];
    const matches = /\?level=([^\s>)&]+)/g.exec(message.content);
    let levelID = matches?.length > 1 ? matches[1] : '';
    if (levelID == '') {
        if (message.embeds?.length > 0) {
            const embedContent = JSON.stringify(message.embeds);
            const embedMatches = /\?level=([^\s>)&"\]]+)/g.exec(embedContent);
            levelID = embedMatches?.length > 1 ? embedMatches[1] : '';
        }
    }

    if (levelID == '') {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Couldn't identify level",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
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
                "title": `Leaderboard for level`,
                "description": description.join("\n"),
                "color": 0x618dc3,
                "fields": [],
                "url": CONFIG.LEVEL_URL + levelID
            }],
            allowed_mentions: { parse: [] }
        }
    });
}