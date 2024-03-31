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

    numberWithCommas(x) {
        let parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },

    formatTime(seconds) {
        let minutes = Math.floor(seconds / 60);
        let seconds = (seconds % 60).toFixed(maxDecimals);
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return `${minutes}:${seconds}`;
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
                    globalStats.plays += level.statistics.total_played;
                    globalStats.verified_maps += 1;
                    globalStats.todays_plays += level.change;
                    globalStats.average_difficulty += level.statistics.difficulty;
                    globalStats.average_likes += level.statistics.liked;
                    globalStats.average_time += level.statistics.time;
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
                    for(let i = 0; i < Math.min(10, leaderboardData.length); i++) {
                        description.push(`**${i+1}**. ${leaderboardData[i].user_name} - ${this.formatTime(leaderboardData[i].best_time)}`);
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
                }
                else{
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
        }

        return new Response("invalid request type", {status: 400});

    },
};