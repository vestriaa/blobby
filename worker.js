import UTILS from './utils.js';
import { commands } from './commands/commands.js';

export default {
    async fetch(request, env, ctx) {

        // validate
        const body = await request.text();
        const isVerified = await UTILS.validate(body, request, env);
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

        // commands
        if (json.type == 2) {
            const command = json.data.name;
            if (command in commands) {
                const response =  await commands[command](json, env);
                return response;
            }

            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: "Invalid command",
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }

        // failure
        return new Response("invalid request type", {status: 400});
    },
};
