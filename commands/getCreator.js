import * as CONFIG from './config.js'
import * as UTILS from '../utils.js'

export async function getCreator(json, env) {
    const message = json.data.resolved.messages[json.data.target_id];
    const matches = /\?level=([^\s>)&]+)/g.exec(message.content);
    let levelID = matches?.length > 1 ? matches[1] : '';
    if (levelID == '') {
        if (message.embeds?.length > 0) {
            const embedContent = JSON.stringify(message.embeds);
            const embedMatches = /\?level=([^\s>)&"\]]+)/g.exec(embedContent);
            levelID = embedMatches?.length > 1 ? embedMatches[1] : '';
        }
    }

    if (levelID == '') {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Couldn't identify level",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
    let userID = levelID.split(":")[0];
    const creatorUrl = CONFIG.PLAYER_URL + userID;
    let userIDInt = [...userID.toString()].reduce((r,v) => r * BigInt(36) + BigInt(parseInt(v,36)), 0n);
    userIDInt >>= BigInt(32);
    userIDInt >>= BigInt(32);
    const joinDate = new Date(Number(userIDInt));
    const unixTime = Math.floor(joinDate.getTime() / 1000);
    const joinString = `<t:${unixTime}>`;

    const playerDetailsUrl = `${CONFIG.API_URL}get_user_info?user_id=${userID}`;
    const playerDetailsResponse = await fetch(playerDetailsUrl);
    const playerDetailsData = await playerDetailsResponse.json();
    const playerName = playerDetailsData.user_name;
    const levelCount = playerDetailsData.user_level_count;
    const is_creator = playerDetailsData.is_creator;
    const is_admin = playerDetailsData.is_admin;
    const is_moderator = playerDetailsData.is_moderator;
    const is_verifier = playerDetailsData.is_verifier;
    const is_super = UTILS.isSuperMod(userID);
    const is_owner = UTILS.isOwner(userID);
    const roleString = [
        is_super ? "Super Mod" : "",
        is_creator ? "Creator" : "",
        is_admin ? "Admin" : "",
        is_moderator ? "Moderator" : "",
        is_verifier ? "Verifier" : "",
        is_owner ? "Owner" : ""
    ].filter(
        role => role.length > 0
    )
    .join(" | ")

    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "",
            embeds: [{
                "type": "rich",
                "title": playerName,
                "description": levelCount + " levels",
                "color": 0x333333,
                "fields": [
                    {
                        "name": "Playing since",
                        "value": joinString,
                        "inline": false
                    },
                    {
                        "name": "identifier",
                        "value": userID,
                        "inline": false
                    }
                ],
                "url": creatorUrl,
                "footer": {
                    "text": roleString
                }
            }],
            allowed_mentions: { parse: [] }
        }
    });
}