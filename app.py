import discord, json, time, os
from discord import app_commands

intents = discord.Intents.default()
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

@client.event
async def on_ready():
    await tree.sync(guild=discord.Object(id=1023949212670509076))
    
@client.event
async def on_message(message):
    if message.channel.id == 1023950794543878205 and "grabvr.quest" not in message.content:
        await message.delete()

client.run(os.environ.get("bot"))
