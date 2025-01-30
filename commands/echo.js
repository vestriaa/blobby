export async function echo(json, env) {
    const text = json.data.options[0].value;
    if (text.includes('@')) {
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
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: text,
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}