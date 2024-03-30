import { verifyKey } from 'discord-interactions';

export default {
    async fetch(request, env, ctx) {

        const signature = request.get("X-Signature-Ed25519");
        const timestamp = request.get("X-Signature-Timestamp");
        const body = request.rawBody;

        const isVerified = verifyKey(body, signature, timestamp, env.PUBLIC_KEY);

        if (!isVerified) {
            return new Response("invalid request signature", {status: 401});
        }

        if (request.json?.type == 1) {
            return Response.json({
                type: 1
            });
        }
        
        return new Response('Hello World!');
        
    },
};