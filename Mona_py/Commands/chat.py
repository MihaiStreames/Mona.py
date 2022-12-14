import discord
import json

with open("voicelines.json") as f:
    voicelinesJSON = json.load(f)

async def chat(message):
    print(f"!chat in {message.guild.name}")

    embed = discord.Embed(description=message.content)