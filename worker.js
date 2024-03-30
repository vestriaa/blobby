const nacl = require("tweetnacl");

export default {
    async fetch(request, env, ctx) {

        const signature = request.headers.get("x-signature-ed25519");
        const timestamp = request.headers.get("x-signature-timestamp");
        const body = await request.text();
        console.log(signature, timestamp, body);

        const isVerified = signature && timestamp && nacl.sign.detached.verify(
            new TextEncoder().encode(timestamp + body),
            Array.prototype.map.call(new TextEncoder().encode(signature),byte => ('0' + byte.toString(16)).slice(-2)).join(''),
            Array.prototype.map.call(new TextEncoder().encode(env.PUBLIC_KEY),byte => ('0' + byte.toString(16)).slice(-2)).join('')
        );

        Array.prototype.map.call(bytes,byte => ('0' + byte.toString(16)).slice(-2)).join('');

        if (!isVerified) {
            console.log("invalid request signature");
            return new Response("invalid request signature", {status: 401});
        }

        if (request.json?.type == 1) {
            console.log("PONG");
            return Response.json({
                type: 1
            });
        }

        console.log("Command")
        return new Response('Hello World!');

    },
};