import discord
import json
import time
from typing import List
from discord import app_commands

intents = discord.Intents.default()
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

log_channel_id = 1115066642741870662

@client.event
async def on_ready():
    await tree.sync(guild=discord.Object(id=1023949212670509076))
    print("Ready!")

@tree.command(
    name='test',
    description='Clear level submission',
    guild=discord.Object(id=1023949212670509076)
)
async def test(interaction: discord.Interaction):
    user_id = interaction.user.id

    await interaction.response.send_message(user_id)

client.run(os.environ.get("bot"))
