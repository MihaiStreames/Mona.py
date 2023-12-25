import asyncio.exceptions
import math
import random
import nextcord
from Mona_py.logger import log
from Mona_py.json_opener import voicelinesJSON


async def chat(message: nextcord.Message, client):
    log("command", f"!mona chat in {message.guild.name}")

    await message.channel.send(f"{message.author.mention} What do you want to chat about?")

    # gets the topics
    value_string = ""
    for keys in voicelinesJSON:
        if keys == "chat":
            for elem in voicelinesJSON[keys]:
                value_string += elem + "\n"

    # embeds the topics
    embed = nextcord.Embed(
        title="Available Topics (so far)",
        color=nextcord.Color.blue(),
        description=message.content
    )
    embed.set_thumbnail(url="https://cdn.discordapp.com/attachments/1051774224005607494/1054492121106751598/chat.png")
    embed.add_field(name="Topics", inline=True, value=value_string)

    await message.channel.send(embed=embed)

    try:
        response = await client.wait_for("message", check=lambda m: m.author == message.author, timeout=10000)
    except asyncio.exceptions.TimeoutError:
        log("warning", f"Timeout in {message.guild.name}")
        return

    # checks if response is in dict, if yes sends random response between the different available ones
    if response.content.lower() in voicelinesJSON["chat"]:
        lines = voicelinesJSON["chat"][response.content.lower()][math.floor(random.random() * len(voicelinesJSON["chat"][response.content]))].split("$")
        message = ' '.join(lines)
    else:
        return

    await response.channel.send(message)