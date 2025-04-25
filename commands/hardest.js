import CONFIG from '../config.js'
import UTILS from '../utils.js'

async function addChange(change, env) {
    let changes = await env.NAMESPACE.get("list_changes");
    if (!changes) changes = "[]";
    let changesData = JSON.parse(changes);

    let changeIndex = changesData.findIndex(item => item.id == change.id);
    if (changeIndex == -1) {
        changesData.push(change);
    } else {
        if (change.description == "added to position") {
            if (changesData[changeIndex].i == change.i) {
                changesData.splice(changeIndex, 1);
            } else {
                changesData[changeIndex].description = "moved to position";
                changesData[changeIndex].i = change.i;
            }
        } else if (change.description == "moved to position") {
            changesData[changeIndex].description = "moved to position";
            changesData[changeIndex].i = change.i;
        } else if (change.description == "removed from position") {
            changesData[changeIndex].description = "removed from position";
        }
    }

    await env.NAMESPACE.put("list_changes", JSON.stringify(changesData));
}

export async function hardest(json, env) {
    const hardestRoleId = "1224307852248612986";
    const func = json.data.options[0].value;
    if (func == "list") {
        let list = await env.NAMESPACE.get("list");
        if (list) {
            const listData = JSON.parse(list);
            const description = [];
            for (let i = 0; i < 10; i++) {
                const item = listData[i];
                description.push(`**${i+1}**. ${item.title}`);
            }
            const embeds = [{
                title: "Hardest Maps List",
                description: description.join("\n"),
                color: 0xff0000
            }];
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: "",
                    embeds: embeds,
                    allowed_mentions: { parse: [] }
                }
            });
        }
    } else if (func == "page") {
        let list = await env.NAMESPACE.get("list");
        if (list) {
            const page = json.data.options[1].value - 1;
            const listData = JSON.parse(list);
            const description = [];
            for (let i = Math.max(50 * page, 0); i < Math.min(50 * page + 50, listData.length); i++) {
                const item = listData[i];
                description.push(`${i+1} ${item.title}`);
            }
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: "",
                    embeds: [{
                        title: "Hardest Maps List",
                        description: description.join("\n"),
                        color: 0xff0000
                    }],
                    allowed_mentions: { parse: [] }
                }
            });
        }
    } else if (func == "add") {
        let canEditHardest = false;
        if (json?.member?.roles) {
            json.member.roles.forEach(role => {
                if (role == hardestRoleId) {
                    canEditHardest = true;
                }
            });
        }
        if (!canEditHardest) {
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: `You don't have permission to do that`,
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }
        let list = await env.NAMESPACE.get("list");
        if (list) {
            let listData = JSON.parse(list);
            let levelLink = json.data.options[1].value;
            let position = json.data.options[2].value;
            if (typeof levelLink != "string") {
                levelLink = json.data.options[2].value;
                position = json.data.options[1].value;
            }
            const levelId = levelLink.split("level=")[1];
            const levelUrl = `${CONFIG.API_URL}details/${levelId.replace(":", "/")}`;
            const levelResponse = await fetch(levelUrl);
            const levelData = await levelResponse.json();
            const listItem = {
                "title": levelData.title,
                "id": levelId,
                "creator": (levelData.creators || []).length > 0 ? levelData.creators[0] : "",
            };
            let extra = "";
            if (position) {
                listData.splice(position - 1, 0, listItem);
                extra = `at position ${position}`;
            } else {
                position = listData.length + 1;
                listData.push(listItem);
            }

            let change = {
                ...listItem,
                "description": "added to position",
                "i": position - 1
            }
            await addChange(change, env);

            await env.NAMESPACE.put("list", JSON.stringify(listData));
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: `Added ${levelData.title} to list ${extra}`,
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }
    } else if (func == "remove") {
        let canEditHardest = false;
        if (json?.member?.roles) {
            json.member.roles.forEach(role => {
                if (role == hardestRoleId) {
                    canEditHardest = true;
                }
            });
        }
        if (!canEditHardest) {
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: `You don't have permission to do that`,
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }
        let list = await env.NAMESPACE.get("list");
        if (list) {
            let listData = JSON.parse(list);
            const levelPosition = json.data.options[1].value;
            const index = levelPosition - 1;
            const change = {
                "title": listData[index].title,
                "id": listData[index].id,
                "creator": listData[index].creator,
                "description": "removed from position",
                "i": index
            };
            await addChange(change, env);
            listData.splice(index, 1);
            await env.NAMESPACE.put("list", JSON.stringify(listData));
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: `Removed ${change.title} from list`,
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }
    } else if (func == "move") {
        let canEditHardest = false;
        if (json?.member?.roles) {
            json.member.roles.forEach(role => {
                if (role == hardestRoleId) {
                    canEditHardest = true;
                }
            });
        }
        if (!canEditHardest) {
            return Response.json({
                type: 4,
                data: {
                    tts: false,
                    content: `You don't have permission to do that`,
                    embeds: [],
                    allowed_mentions: { parse: [] }
                }
            });
        }
        let list = await env.NAMESPACE.get("list");
        if (list) {
            let listData = JSON.parse(list);
            const levelLink = json.data.options[1].value;
            const newIndex = json.data.options[2].value;
            const levelId = levelLink.split("?level=")[1];
            const oldIndex = listData.findIndex(item => item.id == levelId);
            if (oldIndex > -1) {
                const oldItem = {
                    "title": listData[oldIndex].title,
                    "id": listData[oldIndex].id,
                    "creator": listData[oldIndex].creator,
                }
                listData.splice(oldIndex, 1);
                listData.splice(newIndex - 1, 0, oldItem);

                const change = {
                    ...oldItem,
                    "description": "moved to position",
                    "i": newIndex - 1
                };
                await addChange(change, env);

                await env.NAMESPACE.put("list", JSON.stringify(listData));
                return Response.json({
                    type: 4,
                    data: {
                        tts: false,
                        content: `Moved ${oldItem.title} from ${oldIndex + 1} to ${newIndex}`,
                        embeds: [],
                        allowed_mentions: { parse: [] }
                    }
                });
            }
        }
    }
    return Response.json({
        type: 4,
        data: {
            tts: false,
            content: "invalid command",
            embeds: [],
            allowed_mentions: { parse: [] }
        }
    });
}