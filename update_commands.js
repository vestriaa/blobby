import fetch from 'node-fetch';
import fs from 'fs';

const commands = JSON.parse(fs.readFileSync('commands.json', 'utf8'));
const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = "1048213818775437394";

async function registerCommands() {
    const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${token}`
        },
        method: 'POST',
        body: JSON.stringify(commands)
    });

    if (response.ok) {
        console.log('Registered commands');
    } else {
        console.error('Error registering commands');
        const text = await response.text();
        console.error(text);
    }
}

await registerCommands();