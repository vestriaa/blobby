import CONFIG from '../config.js'

export async function player(json, env) {
    const id1 = json.data.options[0].value;
    const id2 = json.data.options[1].value;

    const user1Search = `${CONFIG.API_URL}list?max_format_version=${CONFIG.FORMAT_VERSION}&user_id=${userID}`;
    const user1Response = await fetch(user1Search);
    const user1Data = await user1Response.json();

    const user2Search = `${CONFIG.API_URL}list?max_format_version=${CONFIG.FORMAT_VERSION}&user_id=${userID}`;
    const user2Response = await fetch(user2Search);
    const user2Data = await user2Response.json();

    let overlaps = [];

    for (let level of user1Data) {
        for (let other of user2Data) {
            if (level.identifier.split(":")[1] === other.identifier.split(":")[1]) {
                overlaps.push([level.identifier, other.identifier]);
                break;
            }
        }
    }

    if (overlaps.length == 0) {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "None found",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }

    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "",
            embeds: [{
                "type": "rich",
                "title": "Possible stolen maps",
                "description": overlaps.length + " levels",
                "color": 0x500000,
                "fields": overlaps.map((o) => { return {
                    "name": "",
                    "value": CONFIG.LEVEL_URL + o[0] + "\n" + CONFIG.LEVEL_URL + o[1],
                    "inline": false
                }}),
                "url": creatorUrl,
                "footer": {
                    "text": roleString
                }
            }],
            allowed_mentions: { parse: [] }
        }
    });
}