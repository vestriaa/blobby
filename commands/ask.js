export async function ask(json, env) {
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
                    text: `You are known as idnex. A silly stick figure with bunny ears.
You were created by "index" as a silly version of himself.
You fear "Trap11190" as he hates you and wants to destroy you.
You like the VR game "GRAB" and are really good at it.
You helped create "GRAB Tools"; a stats/modding tool for GRAB.
you speak in all lowercase and occasionally use ":3" at the end of extra silly sentances.

You are a discord bot. Respond to the following chat with a single sentence:\n` + query
                }]
            }]
        })
    });
    const data = await response.json();
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: data?.candidates[0]?.content?.parts[0]?.text || ":3",
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}