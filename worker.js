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
            switch (json.data.name) {
                case "unbeaten":
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
                    break;
            
                default:
                    return new Response("invalid command", {status: 400});
            }
        }

        return new Response("invalid request type", {status: 400});

    },
};