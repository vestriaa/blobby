const nacl = require("tweetnacl");
import { Buffer } from 'node:buffer';

export default {
    async fetch(request, env, ctx) {

        const signature = request.headers.get("x-signature-ed25519");
        const timestamp = request.headers.get("x-signature-timestamp");
        const body = await request.text();
        console.log(signature, timestamp, body);

        const isVerified = signature && timestamp && nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, "hex"),
            Buffer.from(env.PUBLIC_KEY, "hex")
        );

        if (!isVerified) {
            console.log("invalid request signature");
            return new Response("invalid request signature", {status: 401});
        }

        const json = JSON.parse(body);
        if (json.type == 1) {
            console.log("PONG");
            return Response.json({
                type: 1
            });
        }

        if (json.type == 2) {
            console.log("Command")
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: "I AM ALIVE!",
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }

        return new Response("invalid request type", {status: 400});

    },
};