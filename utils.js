const nacl = require("tweetnacl");
import { Buffer } from 'node:buffer';
import CONFIG from './config.js'

function colorComponentToHex(component) {
    const hex = Math.round(component * 255).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function numberWithCommas(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function formatTime(seconds, maxDecimals) {
    let minutes = Math.floor(seconds / 60);
    seconds = (seconds % 60).toFixed(maxDecimals);
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return `${minutes}:${seconds}`;
}

async function generateLevelEmbed(level, fields = []) {
    return {
        "type": "rich",
        "title": level.title,
        "color": 0x618dc3,
        "fields": fields,
        "thumbnail": {
            "url": CONFIG.IMAGES_API_URL + level?.images?.thumb?.key,
            "height": 288,
            "width": 512
        },
        "author": {
            "name": getFeaturedName(level.identifier.split(":")[0]) || level.creators ? level.creators[0] : '',
            "url": CONFIG.PLAYER_URL + level.identifier.split(":")[0],
        },
        "url": CONFIG.STATS_URL + "/stats"
    }
}

async function getPlayerDetails(query) {
    const searchUrl = `${CONFIG.API_URL}list?type=user_name&search_term=${query}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    if(searchData.length >= 1) {
        // exact matches
        for (let result of searchData) {
            if (result.user_name == query) {
                return result;
            }
        }
        // lowercase
        for (let result of searchData) {
            if (result.user_name.toLowerCase() == query.toLowerCase()) {
                return result;
            }
        }
        // is_moderator
        for (let result of searchData) {
            if (result.is_moderator) {
                return result;
            }
        }
        // is_creator
        for (let result of searchData) {
            if (result.is_creator) {
                return result;
            }
        }
        // first
        return searchData[0];
    } else {
        return false;
    }
}

async function getLevel(queryTitle, queryCreator) {
    const levelSearch = `${CONFIG.API_URL}list?max_format_version=${CONFIG.FORMAT_VERSION}&type=search&search_term=${queryTitle}`;
    const levelResponse = await fetch(levelSearch);
    const levelData = await levelResponse.json();
    if (queryCreator == '') {
        return levelData[0];
    }
    const foundLevels = [];
    for(const level of levelData) {
        if("creators" in level) {
            for(const creator of level.creators) {
                if(creator.toLowerCase().includes(queryCreator.toLowerCase())) {
                    foundLevels.push(level);
                    break;
                }
            }
        }
    }
    foundLevels.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0))
    return foundLevels.length > 0? foundLevels[0] : false;
}

async function getTrendingLevels() {
    const response = await fetch(CONFIG.STATS_API_URL + "all_verified.json");
    const data = await response.json();
    const trending = data.sort((a, b) => b.change - a.change).slice(0, 200);
    return trending;
}

async function getFeaturedName(id) {
    const response = await fetch(CONFIG.STATS_API_URL + 'featured_creators.json');
    const data = await response.json();
    for (let featured_creator of data || []) {
        if (featured_creator.list_key.split(":")[1] == id) {
            return featured_creator.title;
        }
    }
    return undefined;
}

async function validate(body, request, env) {
    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");
    return signature && timestamp && nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, "hex"),
        Buffer.from(env.PUBLIC_KEY, "hex")
    );
}

function isSuperMod(id) {
    return [
        "29sgp24f1uorbc6vq8d2k", // dotindex
        "2ak0ysv35egakgfilswpy", // EBSpark
        "2awf62f0y60gptc9cbecf" // Eclipse
    ].includes(id);
}

function isOwner(id) {
    return id == "290oi9frh8eihrh1r5z0q"; // Slin
}

const UTILS = {
    generateLevelEmbed,
    colorComponentToHex,
    numberWithCommas,
    formatTime,
    getPlayerDetails,
    getLevel,
    getTrendingLevels,
    validate,
    isSuperMod,
    isOwner,
};

export default UTILS;