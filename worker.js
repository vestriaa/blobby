const nacl = require("tweetnacl");
import { Buffer } from 'node:buffer';

export default {
    async generateLevelEmbed(level, fields = []) {
        return {
            "type": "rich",
            "title": `${level.title}`,
            "description": `${level.description}`,
            "color": 0x618dc3,
            "fields": fields,
            "thumbnail": {
                "url": `https://grab-images.slin.dev/${level?.images?.thumb?.key}`,
                "height": 288,
                "width": 512
            },
            "author": {
                "name": `${level.creator}`,
                "url": `https://grabvr.quest/levels?tab=tab_other_user&user_id=${level.identifier.split(":")[0]}`,
            },
            "url": `https://grab-tools.live/stats`
        }
    },

    colorComponentToHex(component) {
        const hex = Math.round(component * 255).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

    numberWithCommas(x) {
        let parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },

    formatTime(seconds, maxDecimals) {
        let minutes = Math.floor(seconds / 60);
        seconds = (seconds % 60).toFixed(maxDecimals);
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return `${minutes}:${seconds}`;
    },

    async getPlayerDetails(query) {
        const searchUrl = `https://api.slin.dev/grab/v1/list?type=user_name&search_term=${query}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        if(searchData.length >= 1) {
            // exact matches
            for (let result of searchData) {
                if (result.user_name.toLowerCase() == query.toLowerCase()) {
                    return result;
                }
            }
            // is_moderator
            for (let result of searchData) {
                if (result.is_moderator) {
                    return result;
                }
            }
            // is_creator
            for (let result of searchData) {
                if (result.is_creator) {
                    return result;
                }
            }
            // first
            return searchData[0];
        } else {
            return false;
        }
    },

    async fetch(request, env, ctx) {

        const signature = request.headers.get("x-signature-ed25519");
        const timestamp = request.headers.get("x-signature-timestamp");
        const body = await request.text();
        const isVerified = signature && timestamp && nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, "hex"),
            Buffer.from(env.PUBLIC_KEY, "hex")
        );

        if (!isVerified) {
            return new Response("invalid request signature", {status: 401});
        }

        const json = JSON.parse(body);
        if (json.type == 1) {
            return Response.json({
                type: 1
            });
        }

        if (json.type == 2) {
            const hardestRoleId = "1224307852248612986";
            const command = json.data.name;
            if (command == "unbeaten") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/unbeaten_levels.json");
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
                const levelResponse = await fetch("https://grab-tools.live/stats_data/trending_levels.json");
                const levelData = await levelResponse.json();
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
                const levelResponse = await fetch("https://grab-tools.live/stats_data/trending_levels.json");
                const levelData = await levelResponse.json();
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
                const levelResponse = await fetch("https://grab-tools.live/stats_data/trending_levels.json");
                const levelData = await levelResponse.json();
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
                        embeds: [await this.generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "topunbeaten") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/unbeaten_levels.json");
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
                        embeds: [await this.generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "newestunbeaten") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/unbeaten_levels.json");
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
                        embeds: [await this.generateLevelEmbed(level, fields)],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "globalstats") {
                const levelResponse = await fetch("https://grab-tools.live/stats_data/all_verified.json");
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
                    globalStats.iterations += parseInt(level.data_key.split(':')[3]);
                });
                globalStats.average_difficulty /= globalStats.verified_maps;
                globalStats.average_likes /= globalStats.verified_maps;
                globalStats.average_time /= globalStats.verified_maps;
                globalStats.average_plays = globalStats.plays / globalStats.verified_maps;
                globalStats.average_complexity = globalStats.complexity / globalStats.verified_maps;
                const embeds = [{
                    "type": "rich",
                    "title": `Global Stats`,
                    "description": `**Total plays:** ${this.numberWithCommas(globalStats.plays)}\n**Verified maps:** ${this.numberWithCommas(globalStats.verified_maps)}\n**Todays plays:** ${this.numberWithCommas(globalStats.todays_plays)}\n**Total complexity:** ${this.numberWithCommas(globalStats.complexity)}\n**Iterations:** ${this.numberWithCommas(globalStats.iterations)}\n**Average difficulty:** ${Math.round(globalStats.average_difficulty*100)}%\n**Average plays:** ${this.numberWithCommas(Math.round(globalStats.average_plays*100)/100)}\n**Average likes:** ${Math.round(globalStats.average_likes*100)}%\n**Average time:** ${Math.round(globalStats.average_time*100)/100}s\n**Average complexity:** ${this.numberWithCommas(Math.round(globalStats.average_complexity*100)/100)}`,
                    "color": 0x618dc3,
                    "fields": [],
                    "url": `https://grab-tools.live/stats?tab=Global`
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
                const queryCreator = json.data.options[1].value;
                const levelSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9&type=search&search_term=${queryTitle}`;
                const levelResponse = await fetch(levelSearch);
                const levelData = await levelResponse.json();
                const foundLevels = []
                for(const level of levelData) {
                    if("creators" in level) {
                        for(const creator of level.creators) {
                            if(creator.toLowerCase().includes(queryCreator.toLowerCase())) {
                                foundLevels.push(level);
                                break;
                            }
                        }
                    }
                }
                foundLevels.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))
                if(foundLevels.length >= 1) {
                    const levelID = foundLevels[0].identifier;
                    const leaderboardUrl = `https://api.slin.dev/grab/v1/statistics_top_leaderboard/${levelID.replace(":", "/")}`;
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
                        description.push(`**${i+1}**. ${leaderboardData[i].user_name} - ${this.formatTime(leaderboardData[i].best_time, maxDecimals)}`);
                    }
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "",
                            embeds: [{
                                "type": "rich",
                                "title": `Leaderboard for ${foundLevels[0].title}`,
                                "description": description.join("\n"),
                                "color": 0x618dc3,
                                "fields": [],
                                "url": `https://grabvr.quest/levels/viewer/?level=${levelID}`
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
            } else if (command == "id") {
                const queryUsername = json.data.options[0].value;
                const userData = await this.getPlayerDetails(queryUsername);
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
                const userData = await this.getPlayerDetails(queryUsername);
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
                const levelCount = userData.user_level_count;
                const primaryColor = userData?.active_customizations?.player_color_primary?.color;
                
                const levelSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9&user_id=${userID}`;
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
                statistics.average_difficulty /= statistics.maps;
                statistics.average_likes /= statistics.maps;
                statistics.average_time /= statistics.time_maps;
                statistics.average_plays = statistics.plays / statistics.maps;

                const primaryColorAsHex = `${this.colorComponentToHex(primaryColor[0])}${this.colorComponentToHex(primaryColor[1])}${this.colorComponentToHex(primaryColor[2])}`;

                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [{
                            "type": "rich",
                            "title": `${userName}'s stats`,
                            "description": `**Level Count:** ${this.numberWithCommas(levelCount)}\n**Join Date:** <t:${unixTime}>\n**Verified maps:** ${this.numberWithCommas(statistics.verified_maps)}\n**Total plays:** ${this.numberWithCommas(statistics.plays)}\n**Verified plays:** ${this.numberWithCommas(statistics.verified_plays)}\n**Total complexity:** ${this.numberWithCommas(statistics.complexity)}\n**Average difficulty:** ${Math.round(statistics.average_difficulty*100)}%\n**Average plays:** ${this.numberWithCommas(Math.round(statistics.average_plays*100)/100)}\n**Average likes:** ${Math.round(statistics.average_likes*100)}%\n**Average time:** ${Math.round(statistics.average_time*100)/100}s`,
                            "color": parseInt(primaryColorAsHex, 16),
                            "fields": [],
                            "url": `https://grabvr.quest/levels?tab=tab_other_user&user_id=${userID}`
                        }],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "whois") {
                const queryUsername = json.data.options[0].value;
                const userData = await this.getPlayerDetails(queryUsername);
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
                let details = {
                    primary: [0,0,0],
                    secondary: [0,0,0],
                    hat: "none",
                    face: "none",
                    head: "default",
                    grapple: "default",
                    hands: "claw",
                    checkpoint: "default",
                    neck: "none",
                    creator: false,
                    moderator: false,
                    verifier: false
                };
                const player = userData;
                if (player.is_verifier) { details.verifier = true; }
                if (player.is_creator) { details.creator = true; }
                if (player.is_moderator) { details.moderator = true; }
                if (player.active_customizations) {
                    if (player.active_customizations?.player_color_primary?.color) {
                        details.primary = player.active_customizations.player_color_primary.color;
                    }
                    if (player.active_customizations?.player_color_secondary?.color) {
                        details.secondary = player.active_customizations.player_color_secondary.color;
                    }
                    if (player.active_customizations.items) {
                        const items = player.active_customizations.items;
                        if (items["head/glasses"]) {details.face = items["head/glasses"].replace("_basic", "").replace("head_glasses_", "").replaceAll("_", " ")}
                        if (items["grapple/hook"]) {details.grapple = items["grapple/hook"].replace("_basic", "").replace("grapple_hook_", "").replaceAll("_", " ")}
                        if (items["head/hat"]) {details.hat = items["head/hat"].replace("_basic", "").replace("head_hat_", "").replaceAll("_", " ")}
                        if (items["checkpoint"]) {details.checkpoint = items["checkpoint"].replace("_basic", "").replace("checkpoint_", "").replaceAll("_", " ")}
                        if (items["head"]) {details.head = items["head"].replace("_basic", "").replace("head_", "").replaceAll("_", " ")}
                        if (items["hand"]) {details.hands = items["hand"].replace("_basic", "").replace("hand_", "").replaceAll("_", " ")}
                        if (items["body/neck"]) {details.neck = items["body/neck"].replace("_basic", "").replace("body_neck_", "").replaceAll("_", " ")}
                    }
                }
                const primaryColorAsHex = `${this.colorComponentToHex(details.primary[0])}${this.colorComponentToHex(details.primary[1])}${this.colorComponentToHex(details.primary[2])}`;
                const secondaryColorAsHex = `${this.colorComponentToHex(details.secondary[0])}${this.colorComponentToHex(details.secondary[1])}${this.colorComponentToHex(details.secondary[2])}`;
                const roles = [details.moderator, details.creator, details.verifier].map((role, index) => role ? ["Moderator", "Creator", "Verifier"][index] : null).filter(role => role !== null);
                if (["29sgp24f1uorbc6vq8d2k", "2ak0ysv35egakgfilswpy"].includes(userID)) {
                    roles.push("Soopy");
                }
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: "",
                        embeds: [{
                            "type": "rich",
                            "title": `${userName}'s details`,
                            "description": `**Primary:** #${primaryColorAsHex}\n**Secondary:** #${secondaryColorAsHex}\n**Hat:** ${details.hat}\n**Face:** ${details.face}\n**Head:** ${details.head}\n**Grapple:** ${details.grapple}\n**Hands:** ${details.hands}\n**Checkpoint:** ${details.checkpoint}\n**Neck:** ${details.neck}`,
                            "color": parseInt(primaryColorAsHex, 16),
                            "fields": [],
                            "url": `https://grabvr.quest/levels?tab=tab_other_user&user_id=${userID}`,
                            "footer": {
                                "text": roles.join(" | ")
                            }
                        }],
                        allowed_mentions: { parse: [] }
                    }
                });
            } else if (command == "random") {
                const isVerified = json.data.options[0].value;
                let levelUrl = "https://api.slin.dev/grab/v1/get_random_level";
                if (isVerified) {levelUrl += "?type=ok"}
                const levelResponse = await fetch(levelUrl);
                const levelData = await levelResponse.json();
                const url = `https://grabvr.quest/levels/viewer?level=${levelData.identifier}`;
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
                    const userSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9&type=user_name&search_term=${queryCreator}`;
                    const searchResponse = await fetch(userSearch);
                    const searchData = await searchResponse.json();
                    if(searchData.length >= 1) {
                        const user = searchData[0];
                        const userId = user.user_id;
                        levelSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9&user_id=${userId}`;
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
                    levelSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9`;
                }
                const levelResponse = await fetch(levelSearch);
                const levelData = await levelResponse.json();
                if (levelData.length >= 1) {
                    const level = levelData[0];
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: `https://grabvr.quest/levels/viewer/?level=${level.identifier}`,
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
                const userSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9&type=user_name&search_term=${queryCreator}`;
                const searchResponse = await fetch(userSearch);
                const searchData = await searchResponse.json();
                if(searchData.length >= 1) {
                    const user = searchData[0];
                    const userId = user.user_id;
                    const levelSearch = `https://api.slin.dev/grab/v1/list?max_format_version=9&user_id=${userId}`;
                    const levelResponse = await fetch(levelSearch);
                    const levelData = await levelResponse.json();
                    if (levelData.length >= 1) {
                        const level = levelData[levelData.length - 1];
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: `https://grabvr.quest/levels/viewer/?level=${level.identifier}`,
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
                let position = json.data.options[0].value - 1;
                let list = await env.NAMESPACE.get("list");
                if (list) {
                    const listData = JSON.parse(list);
                    const level = listData[position];
                    return Response.json({
                        type: 4,
                        data: {
                            tts: false,
                            content: "",
                            embeds: [{
                                title: `#${position + 1} Hardest Level`,
                                description: `**${level.title}** by ${level.creator}`,
                                url: `https://grabvr.quest/levels/viewer/?level=${level.id || ""}`,
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
                } else if (func == "listall") {
                    let list = await env.NAMESPACE.get("list");
                    if (list) {
                        const listData = JSON.parse(list);
                        const description = [];
                        for (let i = 0; i < listData.length; i++) {
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
                        const levelLink = json.data.options[1].value;
                        const levelId = levelLink.split("level=")[1];
                        const levelUrl = `https://api.slin.dev/grab/v1/details/${levelId.replace(":", "/")}`;
                        const levelResponse = await fetch(levelUrl);
                        const levelData = await levelResponse.json();
                        const listItem = {
                            "title": levelData.title,
                            "id": levelId,
                            "creator": levelData.creators.length > 0 ? levelData.creators[0] : "",
                        };
                        listData.push(listItem);
                        await env.NAMESPACE.put("list", JSON.stringify(listData));
                        return Response.json({
                            type: 4,
                            data: {
                                tts: false,
                                content: `Added ${levelData.title} to list`,
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
            }
        }

        return new Response("invalid request type", {status: 400});

    },
};
