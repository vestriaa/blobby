import {
    WEBSITE_URL,
    VIEWER_URL,
    STATS_URL,
    WIKI_URL,

    LEVEL_URL,
    PLAYER_URL,

    API_URL,
    IMAGES_API_URL,
    STATS_API_URL,

    FORMAT_VERSION,
} from './config.js'
import {
    generateLevelEmbed,
    colorComponentToHex,
    numberWithCommas,
    formatTime,
    getPlayerDetails,
    getLevel,
    getTrendingLevels,
    getFeaturedName,
    validate,
    isSuperMod,
    isOwner,
} from './utils.js';

export default {
    async fetch(request, env, ctx) {

        // validate
        const body = await request.text();
        const isVerified = await validate(body, request, env);
        if (!isVerified) {
            return new Response("invalid request signature", {status: 401});
        }

        // non-commands
        const json = JSON.parse(body);
        if (json.type == 1) {
            return Response.json({
                type: 1
            });
        }

        if (json.type == 2) {
            const indexUserId = "649165311257608192";
            const hardestRoleId = "1224307852248612986";
            const command = json.data.name;
            if (command == "unbeaten") {
                const levelResponse = await fetch(STATS_API_URL + "unbeaten_levels.json");
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
            } else if (command == "trending") {
                const levelData = await getTrendingLevels();
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
            } else if (command == "actualtrending") {
                const levelData = await getTrendingLevels();
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
            } else if (command == "toptrending") {
                const levelData = await getTrendingLevels();
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
                        embeds: [await generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "topunbeaten") {
                const levelResponse = await fetch(STATS_API_URL + "unbeaten_levels.json");
                const levelData = await levelResponse.json();
                const level = levelData[0];
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
                        embeds: [await generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "newestunbeaten") {
                const levelResponse = await fetch(STATS_API_URL + "unbeaten_levels.json");
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
                        embeds: [await generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "globalstats") {
                const levelResponse = await fetch(STATS_API_URL + "all_verified.json");
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
                    "description": `**Total plays:** ${numberWithCommas(globalStats.plays)}\n**Verified maps:** ${numberWithCommas(globalStats.verified_maps)}\n**Todays plays:** ${numberWithCommas(globalStats.todays_plays)}\n**Total complexity:** ${numberWithCommas(globalStats.complexity)}\n**Iterations:** ${numberWithCommas(globalStats.iterations)}\n**Average difficulty:** ${Math.round(globalStats.average_difficulty*100)}%\n**Average plays:** ${numberWithCommas(Math.round(globalStats.average_plays*100)/100)}\n**Average likes:** ${Math.round(globalStats.average_likes*100)}%\n**Average time:** ${Math.round(globalStats.average_time*100)/100}s\n**Average complexity:** ${numberWithCommas(Math.round(globalStats.average_complexity*100)/100)}`,
                    "color": 0x618dc3,
                    "fields": [],
                    "url": STATS_URL + "/stats?tab=Global"
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
            } else if (command == "leaderboard") {
                const queryTitle = json.data.options[0].value;
                const queryCreator = json.data.options.length > 1 ? json.data.options[1].value : '';
                const levelData = await getLevel(queryTitle, queryCreator);
                
                if(levelData) {
                    const levelID = levelData.identifier;
                    const leaderboardUrl = `${API_URL}statistics_top_leaderboard/${levelID.replace(":", "/")}`;
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
                        description.push(`**${i+1}**. ${leaderboardData[i].user_name} - ${formatTime(leaderboardData[i].best_time, maxDecimals)}`);
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
                                "url": LEVEL_URL + levelID
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
            } else if (command == "level") {
                const queryTitle = json.data.options[0].value;
                const queryCreator = json.data.options.length > 1 ? json.data.options[1].value : '';
                const levelData = await getLevel(queryTitle, queryCreator);
                
                if(levelData) {
                    const url = LEVEL_URL + levelData.identifier;
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
            } else if (command == "id") {
                const queryUsername = json.data.options[0].value;
                const userData = await getPlayerDetails(queryUsername);
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
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "```"+userData.user_id+"```",
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "player") {
                const queryUsername = json.data.options[0].value;
                const userData = await getPlayerDetails(queryUsername);
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
                
                const levelSearch = `${API_URL}list?max_format_version=${FORMAT_VERSION}&user_id=${userID}`;
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

                const primaryColorAsHex = `${colorComponentToHex(primaryColor[0])}${colorComponentToHex(primaryColor[1])}${colorComponentToHex(primaryColor[2])}`;

                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [{
                            "type": "rich",
                            "title": `${userName}'s stats`,
                            "description": `**Level Count:** ${numberWithCommas(levelCount)}\n**Join Date:** <t:${unixTime}>\n**Verified maps:** ${numberWithCommas(statistics.verified_maps)}\n**Total plays:** ${numberWithCommas(statistics.plays)}\n**Verified plays:** ${numberWithCommas(statistics.verified_plays)}\n**Total complexity:** ${numberWithCommas(statistics.complexity)}\n**Average difficulty:** ${Math.round(statistics.average_difficulty*100)}%\n**Average plays:** ${numberWithCommas(Math.round(statistics.average_plays*100)/100)}\n**Average likes:** ${Math.round(statistics.average_likes*100)}%\n**Average time:** ${Math.round(statistics.average_time*100)/100}s`,
                            "color": parseInt(primaryColorAsHex, 16),
                            "fields": [],
                            "url": PLAYER_URL + userID
                        }],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "whois") {
                const queryUsername = json.data.options[0].value;
                const userData = await getPlayerDetails(queryUsername);
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
                if ([
                    // blacklist of ids
                ].includes(userID)) {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "Currently unavailable",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }
                const userName = userData.user_name;
                let details = {
                    primary: [0,0,0],
                    secondary: [0,0,0],

                    hat: "none",
                    face: "none",
                    head: "default",
                    neck: "none",

                    grappleRight: "default",
                    grappleLeft: "default",
                    hands: "claw",

                    body: "default",
                    backpack: "none",
                    badgeRight: "none",
                    badgeLeft: "none",

                    checkpoint: "default",

                    roles: {
                        creator: false,
                        verifier: false,
                        moderator: false,
                        super_mod: false,
                        admin: false,
                        owner: false,
                    }
                };
                const player = userData;

                if (player.is_verifier) { details.roles.verifier = true; }
                if (player.is_creator) { details.roles.creator = true; }
                if (player.is_moderator) { details.roles.moderator = true; }
                if (isSuperMod(player.user_id)) { details.roles.super_mod = true; }
                if (player.is_admin) { details.roles.admin = true; }
                if (isOwner(player.user_id)) { details.roles.owner = true; }

                if (player.active_customizations) {
                    if (player.active_customizations?.player_color_primary?.color) {
                        details.primary = player.active_customizations.player_color_primary.color;
                    }
                    if (player.active_customizations?.player_color_secondary?.color) {
                        details.secondary = player.active_customizations.player_color_secondary.color;
                    }
                    if (player.active_customizations.items) {
                        const items = player.active_customizations.items;
                        if (items["head/hat"]) {details.hat = items["head/hat"].replace("_basic", "").replace("head_hat_", "").replaceAll("_", " ")}
                        if (items["head/glasses"]) {details.face = items["head/glasses"].replace("_basic", "").replace("head_glasses_", "").replaceAll("_", " ")}
                        if (items["head"]) {details.head = items["head"].replace("_basic", "").replace("head_", "").replaceAll("_", " ")}
                        if (items["body/neck"]) {details.neck = items["body/neck"].replace("_basic", "").replace("body_neck_", "").replaceAll("_", " ")}

                        if (items["grapple/hook/right"]) {details.grappleRight = items["grapple/hook/right"].replace("_basic", "").replace("grapple_hook_", "").replaceAll("_", " ")}
                        if (items["grapple/hook/left"]) {details.grappleLeft = items["grapple/hook/left"].replace("_basic", "").replace("grapple_hook_", "").replaceAll("_", " ")}
                        if (items["hand"]) {details.hands = items["hand"].replace("_basic", "").replace("hand_", "").replaceAll("_", " ")}

                        if (items["body"]) {details.body = items["body"].replace("_basic", "").replace("body_", "").replaceAll("_", " ")}
                        if (items["body/backpack"]) {details.backpack = items["body/backpack"].replace("_basic", "").replace("body_backpack_", "").replaceAll("_", " ")}
                        if (items["body/badge/right"]) {details.badgeRight = items["body/badge/right"].replace("_basic", "").replace("body_badge_", "").replaceAll("_", " ")}
                        if (items["body/badge/left"]) {details.badgeLeft = items["body/badge/left"].replace("_basic", "").replace("body_badge_", "").replaceAll("_", " ")}

                        if (items["checkpoint"]) {details.checkpoint = items["checkpoint"].replace("_basic", "").replace("checkpoint_", "").replaceAll("_", " ")}
                    }
                }
                const primaryColorAsHex = `${colorComponentToHex(details.primary[0])}${colorComponentToHex(details.primary[1])}${colorComponentToHex(details.primary[2])}`;
                const secondaryColorAsHex = `${colorComponentToHex(details.secondary[0])}${colorComponentToHex(details.secondary[1])}${colorComponentToHex(details.secondary[2])}`;
                
                const roleKeys = Object.keys(details.roles);
                const roles = roleKeys.map((role, index) => 
                    details.roles[role] ? roleKeys[index].replace("_", " ").replace(/(?:^|\s)\S/g, match => match.toUpperCase()) : null
                ).filter(role => role !== null);
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [{
                            "type": "rich",
                            "title": `${userName}'s details`,
                            "description": 
                                `**Primary:** #${primaryColorAsHex}\n`+
                                `**Secondary:** #${secondaryColorAsHex}\n`+

                                `**Hat:** ${details.hat}\n`+
                                `**Face:** ${details.face}\n`+
                                `**Head:** ${details.head}\n`+
                                `**Neck:** ${details.neck}\n`+

                                `**Grapples:** ${details.grappleLeft} & ${details.grappleRight}\n`+
                                `**Hands:** ${details.hands}\n`+

                                `**Body:** ${details.body}\n`+
                                `**Backpack:** ${details.backpack}\n`+
                                `**Badges:** ${details.badgeLeft} & ${details.badgeRight}\n`+

                                `**Checkpoint:** ${details.checkpoint}`,
                            "color": parseInt(primaryColorAsHex, 16),
                            "fields": [],
                            "url": PLAYER_URL + userID,
                            "footer": {
                                "text": roles.join(" | ")
                            }
                        }],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "random") {
                const isVerified = json.data.options[0].value;
                let levelUrl = API_URL + "get_random_level";
                if (isVerified) {levelUrl += "?type=ok"}
                const levelResponse = await fetch(levelUrl);
                const levelData = await levelResponse.json();
                const url = LEVEL_URL + levelData.identifier;
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: url,
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "newest") {
                let levelSearch;
                if (json?.data?.options && json.data.options.length > 0 && json.data.options[0]?.value) {
                    const queryCreator = json.data.options[0].value;
                    const userSearch = `${API_URL}list?max_format_version=${FORMAT_VERSION}&type=user_name&search_term=${queryCreator}`;
                    const searchResponse = await fetch(userSearch);
                    const searchData = await searchResponse.json();
                    if(searchData.length >= 1) {
                        const user = searchData[0];
                        const userId = user.user_id;
                        levelSearch = `${API_URL}list?max_format_version=${FORMAT_VERSION}&user_id=${userId}`;
                    } else {
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: "Could not find a creator with that username",
                                embeds: [],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                } else {
                    levelSearch = `${API_URL}list?max_format_version=${FORMAT_VERSION}`;
                }
                const levelResponse = await fetch(levelSearch);
                const levelData = await levelResponse.json();
                if (levelData.length >= 1) {
                    const level = levelData[0];
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: LEVEL_URL + level.identifier,
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                } else {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "Could not find a level for that creator",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }
            } else if (command == "oldest") {
                const queryCreator = json.data.options[0].value;
                const userSearch = `${API_URL}list?max_format_version=${FORMAT_VERSION}&type=user_name&search_term=${queryCreator}`;
                const searchResponse = await fetch(userSearch);
                const searchData = await searchResponse.json();
                if(searchData.length >= 1) {
                    const user = searchData[0];
                    const userId = user.user_id;
                    const levelSearch = `${API_URL}list?max_format_version=${FORMAT_VERSION}&user_id=${userId}`;
                    const levelResponse = await fetch(levelSearch);
                    const levelData = await levelResponse.json();
                    if (levelData.length >= 1) {
                        const level = levelData[levelData.length - 1];
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: LEVEL_URL + level.identifier,
                                embeds: [],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    } else {
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: "Could not find a level for that creator",
                                embeds: [],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                } else {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "Could not find a creator with that username",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }
            } else if (command == "gethardest") {
                let list = await env.NAMESPACE.get("list");
                if (list) {
                    const listData = JSON.parse(list);

                    let positionInput = json.data.options[0].value;
                    positionInput == 0 ? positionInput = 1 : {}

                    if (typeof positionInput == "string" && positionInput.includes("?level=")) {
                        let id = positionInput.split("?level=")[1].split("&")[0];
                        for (let i = 0; i < listData.length; i++) {
                            if (listData[i].id == id) {
                                positionInput = i + 1;
                                break;
                            }
                        }
                    }
                    let position = positionInput - 1;
                    const level = listData[position];
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "",
                            embeds: [{
                                title: `#${position + 1} Hardest Level`,
                                description: `**${level.title}** by ${level.creator}`,
                                url: LEVEL_URL + (level.id || ""),
                                color: 0xff0000
                            }],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }
            } else if (command == "hardest") {
                const func = json.data.options[0].value;
                if (func == "list") {
                    let list = await env.NAMESPACE.get("list");
                    if (list) {
                        const listData = JSON.parse(list);
                        const description = [];
                        for (let i = 0; i < 10; i++) {
                            const item = listData[i];
                            description.push(`**${i+1}**. ${item.title}`);
                        }
                        const embeds = [{
                            title: "Hardest Maps List",
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
                } else if (func == "page") {
                    let list = await env.NAMESPACE.get("list");
                    if (list) {
                        const page = json.data.options[1].value - 1;
                        const listData = JSON.parse(list);
                        const description = [];
                        for (let i = Math.max(50 * page, 0); i < Math.min(50 * page + 50, listData.length); i++) {
                            const item = listData[i];
                            description.push(`${i+1} ${item.title}`);
                        }
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: "",
                                embeds: [{
                                    title: "Hardest Maps List",
                                    description: description.join("\n"),
                                    color: 0xff0000
                                }],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                } else if (func == "add") {
                    let canEditHardest = false;
                    if (json?.member?.roles) {
                        json.member.roles.forEach(role => {
                            if (role == hardestRoleId) {
                                canEditHardest = true;
                            }
                        });
                    }
                    if (!canEditHardest) {
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: `You don't have permission to do that`,
                                embeds: [],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                    let list = await env.NAMESPACE.get("list");
                    if (list) {
                        let listData = JSON.parse(list);
                        let levelLink = json.data.options[1].value;
                        let position = json.data.options[2].value;
                        if (typeof levelLink != "string") {
                            levelLink = json.data.options[2].value;
                            position = json.data.options[1].value;
                        }
                        const levelId = levelLink.split("level=")[1];
                        const levelUrl = `${API_URL}details/${levelId.replace(":", "/")}`;
                        const levelResponse = await fetch(levelUrl);
                        const levelData = await levelResponse.json();
                        const listItem = {
                            "title": levelData.title,
                            "id": levelId,
                            "creator": levelData.creators.length > 0 ? levelData.creators[0] : "",
                        };
                        let extra = "";
                        if (position) {
                            listData.splice(position - 1, 0, listItem);
                            extra = `at position ${position}`;
                        } else {
                            listData.push(listItem);
                        }
                        await env.NAMESPACE.put("list", JSON.stringify(listData));
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: `Added ${levelData.title} to list ${extra}`,
                                embeds: [],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                } else if (func == "remove") {
                    let canEditHardest = false;
                    if (json?.member?.roles) {
                        json.member.roles.forEach(role => {
                            if (role == hardestRoleId) {
                                canEditHardest = true;
                            }
                        });
                    }
                    if (!canEditHardest) {
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: `You don't have permission to do that`,
                                embeds: [],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                    let list = await env.NAMESPACE.get("list");
                    if (list) {
                        let listData = JSON.parse(list);
                        const levelPosition = json.data.options[1].value;
                        const index = levelPosition - 1;
                        const title = listData[index].title;
                        listData.splice(index, 1);
                        await env.NAMESPACE.put("list", JSON.stringify(listData));
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: `Removed ${title} from list`,
                                embeds: [],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                } else if (func == "move") {
                    let canEditHardest = false;
                    if (json?.member?.roles) {
                        json.member.roles.forEach(role => {
                            if (role == hardestRoleId) {
                                canEditHardest = true;
                            }
                        });
                    }
                    if (!canEditHardest) {
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: `You don't have permission to do that`,
                                embeds: [],
                                allowed_mentions: { parse: [] }
                            }
                        });
                    }
                    let list = await env.NAMESPACE.get("list");
                    if (list) {
                        let listData = JSON.parse(list);
                        const levelLink = json.data.options[1].value;
                        const newIndex = json.data.options[2].value;
                        const levelId = levelLink.split("?level=")[1];
                        const oldIndex = listData.findIndex(item => item.id == levelId);
                        if (oldIndex > -1) {
                            const oldItem = {
                                "title": listData[oldIndex].title,
                                "id": listData[oldIndex].id,
                                "creator": listData[oldIndex].creator,
                            }
                            listData.splice(oldIndex, 1);
                            listData.splice(newIndex - 1, 0, oldItem);
                            await env.NAMESPACE.put("list", JSON.stringify(listData));
                            return Response.json({
                                type: 4,
                                data: {
                                    tts: false,
                                    content: `Moved ${oldItem.title} from ${oldIndex + 1} to ${newIndex}`,
                                    embeds: [],
                                    allowed_mentions: { parse: [] }
                                }
                            });
                        }
                    }
                }
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "invalid command",
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "wiki") {
                const query = json.data.options[0].value;

                let wikiUrl = `${WIKI_URL}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=7`;

                const wikiResponse = await fetch(wikiUrl);
                const text = await wikiResponse.text();
                if (text.charAt(0) == "<") {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "Weird wiki bug :c\nDon't bother trying the command again lol",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }
                const wikiData = await wikiResponse.json();

                if (wikiData?.query?.search?.length == 0) {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "No results found",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }

                const timestamp = wikiData.query.search[0]?.timestamp || "Error";
                let embed = {
                    type: "rich",
                    title: `Results for ${query}`,
                    url: `${WIKI_URL}/wiki/Special:Search?search=${encodeURIComponent(query)}`,
                    description: "",
                    color: 0x006b2d,
                    footer: {
                        text: timestamp
                    }
                };

                for (const result of wikiData.query.search) {
                    const { title } = result;
                    const pageUrl = `${WIKI_URL}/w/index.php?title=${encodeURIComponent(title)}`;

                    embed.description += `[${title}](<${pageUrl}>)\n`;
                }

                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [embed],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "Get leaderboard") {
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
                const leaderboardUrl = `${API_URL}statistics_top_leaderboard/${levelID.replace(":", "/")}`;
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
                    description.push(`**${i+1}**. ${leaderboardData[i].user_name} - ${formatTime(leaderboardData[i].best_time, maxDecimals)}`);
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
                            "url": LEVEL_URL + levelID
                        }],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "Get creator") {
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
                let userID = levelID.split(":")[0];
                const creatorUrl = PLAYER_URL + userID;
                let userIDInt = [...userID.toString()].reduce((r,v) => r * BigInt(36) + BigInt(parseInt(v,36)), 0n);
                userIDInt >>= BigInt(32);
                userIDInt >>= BigInt(32);
                const joinDate = new Date(Number(userIDInt));
                const unixTime = Math.floor(joinDate.getTime() / 1000);
                const joinString = `<t:${unixTime}>`;

                const playerDetailsUrl = `${API_URL}get_user_info?user_id=${userID}`;
                const playerDetailsResponse = await fetch(playerDetailsUrl);
                const playerDetailsData = await playerDetailsResponse.json();
                const playerName = playerDetailsData.user_name;
                const levelCount = playerDetailsData.user_level_count;
                const is_creator = playerDetailsData.is_creator;
                const is_admin = playerDetailsData.is_admin;
                const is_moderator = playerDetailsData.is_moderator;
                const is_verifier = playerDetailsData.is_verifier;
                const is_super = isSuperMod(userID);
                const is_owner = isOwner(userID);
                const roleString = [
                    is_super ? "Super Mod" : "",
                    is_creator ? "Creator" : "",
                    is_admin ? "Admin" : "",
                    is_moderator ? "Moderator" : "",
                    is_verifier ? "Verifier" : "",
                    is_owner ? "Owner" : ""
                ].filter(
                    role => role.length > 0
                )
                .join(" | ")

                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [{
                            "type": "rich",
                            "title": playerName,
                            "description": levelCount + " levels",
                            "color": 0x333333,
                            "fields": [
                                {
                                    "name": "Playing since",
                                    "value": joinString,
                                    "inline": false
                                },
                                {
                                    "name": "identifier",
                                    "value": userID,
                                    "inline": false
                                }
                            ],
                            "url": creatorUrl,
                            "footer": {
                                "text": roleString
                            }
                        }],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "Get complexity") {
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
                const detailsUrl = `${API_URL}details/${levelID.replace(":", "/")}`;
                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();
                const complexity = detailsData.complexity;

                const playerID = levelID.split(":")[0];

                const playerDetailsUrl = `${API_URL}get_user_info?user_id=${playerID}`;
                const playerDetailsResponse = await fetch(playerDetailsUrl);
                const playerDetailsData = await playerDetailsResponse.json();
                const is_creator = playerDetailsData.is_creator;
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: complexity + " / " + (is_creator ? "3000" : "1500") + " complexity",
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "Get iterations") {
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
                const detailsUrl = `${API_URL}details/${levelID.replace(":", "/")}`;
                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();
                const iterations = detailsData.iteration;

                let iterationList = [];
                let length = 0;
                let lastString = `...\n[Iteration ${1}](<${LEVEL_URL}${levelID}:${1}>)`;
                let endString = `... (XXX of XXX iterations shown)`;
                for (let i = iterations; i > 0; i--) {
                    let str = `[Iteration ${i}](<${LEVEL_URL}${levelID}:${i}>)`;
                    if (length == 0) {
                        str += " (current)";
                    }
                    length += str.length;
                    if (i > 1 && length > 2000 - lastString.length - 1 - endString.length - 1) {
                        if (iterationList.length < iterations) {
                            iterationList.push(lastString);
                            iterationList.push(`-# (${iterationList.length} of ${iterations} iterations shown)`);
                            break;
                        }
                    }
                    iterationList.push(str);
                }

                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: iterationList.join("\n"),
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "Get thumbnail") {
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
                const detailsUrl = `${API_URL}details/${levelID.replace(":", "/")}`;
                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();
                const image_iteration = detailsData.iteration_image;
                const imageUrl = `${IMAGES_API_URL}level_${levelID.replace(":", "_")}_${image_iteration}.png`;

                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: `[${detailsData.title}'s thumbnail](${imageUrl})`,
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "Add to fanart") {
                // TODO:
                if (json.member.user.id !== indexUserId) {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "Nuh uh",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }

                const indexGuildId = "1048213818775437394";
                const fanartChannelId = "1163963988544069662";

                const message = json.data.resolved.messages[json.data.target_id];
                const attachments = message.attachments;

                for (let i = 0; i < attachments.length; i++) {
                    const attachment = attachments[i];
                    const url = attachment.url;
                }

            } else if (command == "script") {
                if (json.member.user.id !== indexUserId) {
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "Nuh uh",
                            embeds: [],
                            allowed_mentions: { parse: [] }
                        }
                    });
                }

                const filterer = json.data.options[0].value; // "level.change > 1000" // props op value // multiple with &&
                const limiter = json.data.options[1].value; // 20 // integer
                const returner = json.data.options[2].value; // "level.title" // props // multiple with &&

                const response = await fetch(STATS_API_URL + "all_verified.json");
                const data = await response.json();

                const filtered = [];
                for (let level of data) {
                    let valid = true;

                    filterer.split("&&").forEach(c => {
                        const value = c.trim()
                        const parts = value.split(" ");
                        const properties = parts[0].replace("level.", "").split(".");
                        
                        let operator = parts[1];
                        let compare = parts[2];

                        for (let i = 3; i < parts.length; i++) {
                            compare += ' ' + parts[i];
                        }

                        let anyCase = false;
                        if (operator.charAt(0) == "~") {
                            operator = operator.replace("~", "");
                            compare = compare.toLowerCase();
                            anyCase = true;
                        }

                        if (!compare.includes("\"")) {
                            if (compare.includes(".")) {
                                compare = parseFloat(compare)
                            } else {
                                compare = parseInt(compare, 10);
                            }
                        } else {
                            compare = compare.replaceAll("\"", "");
                        }

                        let prop = level;
                        for (let key of properties) {
                            prop = prop[key];
                            if (prop === undefined) {
                                valid = false;
                                break;
                            }
                        }

                        if (anyCase && typeof prop == "string") {
                            prop = prop.toLowerCase();
                        }

                        switch (operator) {
                            case ">":
                                if (prop <= compare) {
                                    valid = false;
                                }
                                break;
                            case "<":
                                if (prop >= compare) {
                                    valid = false;
                                }
                                break;
                            case ">=":
                                if (prop < compare) {
                                    valid = false;
                                }
                                break;
                            case "<=":
                                if (prop > compare) {
                                    valid = false;
                                }
                                break;
                            case "==":
                                if (prop != compare) {
                                    valid = false;
                                }
                                break;
                            case "!=":
                                if (prop == compare) {
                                    valid = false;
                                }
                                break;
                            case "in":
                                if (!compare.includes(prop)) {
                                    valid = false;
                                }
                                break;
                            case "!in":
                                if (compare.includes(prop)) {
                                    valid = false;
                                }
                                break;
                            case "includes":
                                if (!prop.includes(compare)) {
                                    valid = false;
                                }
                                break;
                            case "!includes":
                                if (prop.includes(compare)) {
                                    valid = false;
                                }
                                break;
                            default:
                                break;
                        }
                    });
                    
                    if (valid) {
                        level.link = LEVEL_URL + level.identifier;
                        level.creator = level.creators && level.creators.length > 0 ? level.creators[0] : '';
                        level.creator_link = PLAYER_URL + level.identifier.split(":")[0];
                        level.date = new Date(1000 * (level.update_timestamp || level.creation_timestamp || 0)).toDateString();
                        filtered.push(level);
                        if (filtered.length >= limiter) {
                            break;
                        }
                    }
                }
                let result = "";
                filtered.forEach(level => { 
                    let returnValue = "";
                    returner.split("&&").forEach(c => {
                        if (c.includes("\"")) {
                            returnValue += c.trim().replaceAll("\"", "").replaceAll("\\n", "\n");
                        } else {
                            const properties = c.trim().replace("level.", "").split(".");
                            let prop = level;
                            for (let key of properties) {
                                prop = prop[key];
                                if (prop == undefined) {
                                    break;
                                }
                            }
                            if (prop != undefined) {
                                returnValue += prop + " ";
                            }
                        }
                    });
                    result += returnValue + "\n";
                });

                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "```\n" + result + "```",
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            }
        }

        return new Response("invalid request type", {status: 400});

    },
};
