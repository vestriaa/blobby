import * as CONFIG from '../config.js'
import * as UTILS from '../utils.js'

export async function getHardest(json, env) {
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
                    url: CONFIG.LEVEL_URL + (level.id || ""),
                    color: 0xff0000
                }],
                allowed_mentions: { parse: [] }
            }
        });
    }
}