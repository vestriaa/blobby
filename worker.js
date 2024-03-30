const nacl = require("tweetnacl");
import { Buffer } from 'node:buffer';

export default {
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
                let embeds = [];
                for (let i = 0; i < 10; i++) {
                    const level = levelData[i];
                    const embed = {
                        "type": "rich",
                        "title": `${level.title}`,
                        "description": `${level.description}`,
                        "color": 0x618dc3,
                        "fields": [
                            {
                                "name": `Todays Plays`,
                                "value": `${level.change}`,
                                "inline": true
                            }, {
                                "name": `Total Plays`,
                                "value": `${level.statistics.total_played}`,
                                "inline": true
                            }
                        ],
                        "thumbnail": {
                            "url": `https://grab-images.slin.dev/${level?.images?.thumb?.key}`,
                            "height": 288,
                            "width": 512
                        },
                        "author": {
                            "name": `${level.creator}`,
                            "url": `https://grabvr.quest/levels?tab=tab_other_user&user_id=${level.identifier.split(":")[0]}`,
                        },
                        "url": `https://grab-tools.live/stats?tab=Trending`
                    };
                    embeds.push(embed);
                }
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
        }

        return new Response("invalid request type", {status: 400});

    },
};