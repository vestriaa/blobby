export async function ask(json, env) {
    if (!json.member.user.id == "649165311257608192")  {
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
    const query = json.data.options[0].value;
    let endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
    endpoint += env.GEMINI_KEY;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: "You are known as idnex. respond to the following chat with a short sentence:\n" + query
                }]
            }]
        })
    });
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: response?.candidates[0]?.content?.parts[0]?.text || ":3",
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}