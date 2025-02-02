import CONFIG from '../config.js'
import UTILS from '../utils.js'

export async function whoIs(json, env) {
    const queryUsername = json.data.options[0].value;
    const userData = await UTILS.getPlayerDetails(queryUsername);
    if (!userData) {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Could not find a player with that username",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
    const userID = userData.user_id;
    if ([
        // blacklist of ids
    ].includes(userID)) {
        return Response.json({
            type: 4,
            data: {
                tts: false,
                content: "Currently unavailable",
                embeds: [],
                allowed_mentions: { parse: [] }
            }
        });
    }
    const userName = userData.user_name;
    let details = {
        primary: [0,0,0],
        secondary: [0,0,0],

        hat: "none",
        face: "none",
        head: "default",
        neck: "none",

        grappleRight: "default",
        grappleLeft: "default",
        hands: "claw",

        body: "default",
        backpack: "none",
        badgeRight: "none",
        badgeLeft: "none",

        checkpoint: "default",

        roles: {
            creator: false,
            verifier: false,
            moderator: false,
            super_mod: false,
            admin: false,
            owner: false,
        }
    };
    const player = userData;

    if (player.is_verifier) { details.roles.verifier = true; }
    if (player.is_creator) { details.roles.creator = true; }
    if (player.is_moderator) { details.roles.moderator = true; }
    if (player.is_supermoderator) { details.roles.super_mod = true; }
    if (player.is_admin) { details.roles.admin = true; }
    if (UTILS.isOwner(player.user_id)) { details.roles.owner = true; }

    if (player.active_customizations) {
        if (player.active_customizations?.player_color_primary?.color) {
            details.primary = player.active_customizations.player_color_primary.color;
        }
        if (player.active_customizations?.player_color_secondary?.color) {
            details.secondary = player.active_customizations.player_color_secondary.color;
        }
        if (player.active_customizations.items) {
            const items = player.active_customizations.items;
            if (items["head/hat"]) {details.hat = items["head/hat"].replace("_basic", "").replace("head_hat_", "").replaceAll("_", " ")}
            if (items["head/glasses"]) {details.face = items["head/glasses"].replace("_basic", "").replace("head_glasses_", "").replaceAll("_", " ")}
            if (items["head"]) {details.head = items["head"].replace("_basic", "").replace("head_", "").replaceAll("_", " ")}
            if (items["body/neck"]) {details.neck = items["body/neck"].replace("_basic", "").replace("body_neck_", "").replaceAll("_", " ")}

            if (items["grapple/hook/right"]) {details.grappleRight = items["grapple/hook/right"].replace("_basic", "").replace("grapple_hook_", "").replaceAll("_", " ")}
            if (items["grapple/hook/left"]) {details.grappleLeft = items["grapple/hook/left"].replace("_basic", "").replace("grapple_hook_", "").replaceAll("_", " ")}
            if (items["hand"]) {details.hands = items["hand"].replace("_basic", "").replace("hand_", "").replaceAll("_", " ")}

            if (items["body"]) {details.body = items["body"].replace("_basic", "").replace("body_", "").replaceAll("_", " ")}
            if (items["body/backpack"]) {details.backpack = items["body/backpack"].replace("_basic", "").replace("body_backpack_", "").replaceAll("_", " ")}
            if (items["body/badge/right"]) {details.badgeRight = items["body/badge/right"].replace("_basic", "").replace("body_badge_", "").replaceAll("_", " ")}
            if (items["body/badge/left"]) {details.badgeLeft = items["body/badge/left"].replace("_basic", "").replace("body_badge_", "").replaceAll("_", " ")}

            if (items["checkpoint"]) {details.checkpoint = items["checkpoint"].replace("_basic", "").replace("checkpoint_", "").replaceAll("_", " ")}
        }
    }
    const primaryColorAsHex = `${UTILS.colorComponentToHex(details.primary[0])}${UTILS.colorComponentToHex(details.primary[1])}${UTILS.colorComponentToHex(details.primary[2])}`;
    const secondaryColorAsHex = `${UTILS.colorComponentToHex(details.secondary[0])}${UTILS.colorComponentToHex(details.secondary[1])}${UTILS.colorComponentToHex(details.secondary[2])}`;
    
    const roleKeys = Object.keys(details.roles);
    const roles = roleKeys.map((role, index) => 
        details.roles[role] ? roleKeys[index].replace("_", " ").replace(/(?:^|\s)\S/g, match => match.toUpperCase()) : null
    ).filter(role => role !== null);
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "",
            embeds: [{
                "type": "rich",
                "title": `${userName}'s details`,
                "description": 
                    `**Primary:** #${primaryColorAsHex}\n`+
                    `**Secondary:** #${secondaryColorAsHex}\n`+

                    `**Hat:** ${details.hat}\n`+
                    `**Face:** ${details.face}\n`+
                    `**Head:** ${details.head}\n`+
                    `**Neck:** ${details.neck}\n`+

                    `**Grapples:** ${details.grappleLeft} & ${details.grappleRight}\n`+
                    `**Hands:** ${details.hands}\n`+

                    `**Body:** ${details.body}\n`+
                    `**Backpack:** ${details.backpack}\n`+
                    `**Badges:** ${details.badgeLeft} & ${details.badgeRight}\n`+

                    `**Checkpoint:** ${details.checkpoint}`,
                "color": parseInt(primaryColorAsHex, 16),
                "fields": [],
                "url": CONFIG.PLAYER_URL + userID,
                "footer": {
                    "text": roles.join(" | ")
                }
            }],
            allowed_mentions: { parse: [] }
        }
    });
}