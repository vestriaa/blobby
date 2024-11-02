import * as CONFIG from '../config.js'
import * as UTILS from '../utils.js'

export async function player(json, env) {
    const queryUsername = json.data.options[0].value;
    const userData = await UTILS.getPlayerDetails(queryUsername);
    if (!userData) {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Could not find a player with that username",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
    const userID = userData.user_id;
    const userName = userData.user_name;
    const levelCount = userData.user_level_count || 0;
    const primaryColor = userData?.active_customizations?.player_color_primary?.color || [0, 0, 0];
    
    const levelSearch = `${CONFIG.API_URL}list?max_format_version=${CONFIG.FORMAT_VERSION}&user_id=${userID}`;
    const levelResponse = await fetch(levelSearch);
    const levelData = await levelResponse.json();

    let statistics = {
        "plays": 0,
        "verified_plays": 0,
        "maps": 0,
        "time_maps": 0,
        "verified_maps": 0,
        "average_difficulty": 0,
        "average_plays": 0,
        "average_likes": 0,
        "average_time": 0,
        "complexity": 0,
    }
    let userIDInt = [...userID.toString()].reduce((r,v) => r * BigInt(36) + BigInt(parseInt(v,36)), 0n);
    userIDInt >>= BigInt(32);
    userIDInt >>= BigInt(32);
    const joinDate = new Date(Number(userIDInt));
    const unixTime = Math.floor(joinDate.getTime() / 1000);

    for (let level of levelData) {
        if (level?.tags?.includes("ok")) {
            statistics.verified_maps += 1;
            statistics.verified_plays += level?.statistics?.total_played || 0;
        }
        if ("statistics" in level) {
            statistics.plays += level?.statistics?.total_played || 0;
            statistics.average_difficulty += level?.statistics?.difficulty || 0;
            statistics.average_likes += level?.statistics?.liked || 0;
            statistics.average_time += level?.statistics?.time || 0;
        }
        statistics.maps += 1;
        level?.statistics?.time != undefined ? statistics.time_maps += 1 : null;
        statistics.complexity += level.complexity;
    }
    if (levelData.length > 0) {
        statistics.average_difficulty /= statistics.maps;
        statistics.average_likes /= statistics.maps;
        statistics.average_time /= statistics.time_maps;
        statistics.average_plays = statistics.plays / statistics.maps;
    }

    const primaryColorAsHex = `${UTILS.colorComponentToHex(primaryColor[0])}${UTILS.colorComponentToHex(primaryColor[1])}${UTILS.colorComponentToHex(primaryColor[2])}`;

    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "",
            embeds: [{
                "type": "rich",
                "title": `${userName}'s stats`,
                "description": `**Level Count:** ${UTILS.numberWithCommas(levelCount)}\n**Join Date:** <t:${unixTime}>\n**Verified maps:** ${UTILS.numberWithCommas(statistics.verified_maps)}\n**Total plays:** ${UTILS.numberWithCommas(statistics.plays)}\n**Verified plays:** ${UTILS.numberWithCommas(statistics.verified_plays)}\n**Total complexity:** ${UTILS.numberWithCommas(statistics.complexity)}\n**Average difficulty:** ${Math.round(statistics.average_difficulty*100)}%\n**Average plays:** ${UTILS.numberWithCommas(Math.round(statistics.average_plays*100)/100)}\n**Average likes:** ${Math.round(statistics.average_likes*100)}%\n**Average time:** ${Math.round(statistics.average_time*100)/100}s`,
                "color": parseInt(primaryColorAsHex, 16),
                "fields": [],
                "url": CONFIG.PLAYER_URL + userID
            }],
            allowed_mentions: { parse: [] }
        }
    });
}