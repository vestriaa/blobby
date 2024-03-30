const fetch = require('node-fetch');
const COMMANDS = require('./commands.json');
const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

async function registerCommands() {
    const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${token}`
        },
        method: 'PUT',
        body: JSON.stringify(COMMANDS)
    });

    if (response.ok) {
        console.log('Registered commands');
    } else {
        console.error('Error registering commands');
        const text = await response.text();
        console.error(text);
    }
    return response;
}

registerCommands();