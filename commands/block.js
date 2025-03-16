export async function block(json, env) {
    if (json.member.user.id != "649165311257608192")  {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: ":3",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
    const id = json.data.options[0].value;

    let list = await env.NAMESPACE.get("blocked");
    if (list) {
        let listData = JSON.parse(list);
        listData.push(id);

        await env.NAMESPACE.put("blocked", JSON.stringify(listData));
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: `Blocked ${id}`,
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }

    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "an error occurred",
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}