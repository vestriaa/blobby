import CONFIG from '../config.js'
import UTILS from '../utils.js'

export async function script(json, env) {
    const filterer = json.data.options[0].value; // "level.change > 1000" // props op value // multiple with &&
    const limiter = json.data.options[1].value; // 20 // integer
    const returner = json.data.options[2].value; // "level.title" // props // multiple with &&

    const response = await fetch(CONFIG.STATS_API_URL + "all_verified.json");
    const data = await response.json();

    const filtered = [];
    for (let level of data) {
        let valid = true;

        filterer.split("&&").forEach(c => {
            const value = c.trim()
            const parts = value.split(" ");
            const properties = parts[0].replace("level.", "").split(".");
            
            let operator = parts[1];
            let compare = parts[2];

            for (let i = 3; i < parts.length; i++) {
                compare += ' ' + parts[i];
            }

            let anyCase = false;
            if (operator.charAt(0) == "~") {
                operator = operator.replace("~", "");
                compare = compare.toLowerCase();
                anyCase = true;
            }

            if (!compare?.includes("\"")) {
                if (compare?.includes(".")) {
                    compare = parseFloat(compare)
                } else {
                    compare = parseInt(compare, 10);
                }
            } else {
                compare = compare.replaceAll("\"", "");
            }

            let prop = level;
            for (let key of properties) {
                prop = prop[key];
                if (prop === undefined) {
                    valid = false;
                    break;
                }
            }

            if (anyCase && typeof prop == "string") {
                prop = prop.toLowerCase();
            }

            switch (operator) {
                case ">":
                    if (prop <= compare) {
                        valid = false;
                    }
                    break;
                case "<":
                    if (prop >= compare) {
                        valid = false;
                    }
                    break;
                case ">=":
                    if (prop < compare) {
                        valid = false;
                    }
                    break;
                case "<=":
                    if (prop > compare) {
                        valid = false;
                    }
                    break;
                case "==":
                    if (prop != compare) {
                        valid = false;
                    }
                    break;
                case "!=":
                    if (prop == compare) {
                        valid = false;
                    }
                    break;
                case "in":
                    if (!compare?.includes(prop)) {
                        valid = false;
                    }
                    break;
                case "!in":
                    if (compare?.includes(prop)) {
                        valid = false;
                    }
                    break;
                case "includes":
                    if (!prop?.includes(compare)) {
                        valid = false;
                    }
                    break;
                case "!includes":
                    if (prop?.includes(compare)) {
                        valid = false;
                    }
                    break;
                default:
                    break;
            }
        });
        
        if (valid) {
            level.link = CONFIG.LEVEL_URL + level.identifier;
            level.creator = level.creators && level.creators.length > 0 ? level.creators[0] : '';
            level.creator_link = CONFIG.PLAYER_URL + level.identifier.split(":")[0];
            level.date = new Date(1000 * (level.update_timestamp || level.creation_timestamp || 0)).toDateString();
            filtered.push(level);
            if (filtered.length >= limiter) {
                break;
            }
        }
    }
    let result = "";
    filtered.forEach(level => { 
        let returnValue = "";
        returner.split("&&").forEach(c => {
            if (c.includes("\"")) {
                returnValue += c.trim().replaceAll("\"", "").replaceAll("\\n", "\n");
            } else {
                const properties = c.trim().replace("level.", "").split(".");
                let prop = level;
                for (let key of properties) {
                    prop = prop[key];
                    if (prop == undefined) {
                        break;
                    }
                }
                if (prop != undefined) {
                    returnValue += prop + " ";
                }
            }
        });
        result += returnValue + "\n";
    });

    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "```\n" + result + "```",
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}