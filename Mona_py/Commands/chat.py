import math
import random
import asyncio.exceptions
import nextcord

from Mona_py.utils import log
from Mona_py.json_opener import voicelinesJSON


async def chat(interaction: nextcord.Interaction, client):
    log("command", f"Slash command /chat used in {interaction.guild.name}")

    await interaction.response.send_message(f"{interaction.user.mention} What do you want to chat about?")

    # Gets the topics
    value_string = ""
    for keys in voicelinesJSON:
        if keys == "chat":
            for elem in voicelinesJSON[keys]:
                value_string += elem + "\n"

    # Embeds the topics
    embed = nextcord.Embed(
        title="Available Topics (so far)",
        color=nextcord.Color.blue(),
        description=""
    )

    embed.set_thumbnail(url="https://cdn.discordapp.com/attachments/1051774224005607494/1054492121106751598/chat.png")
    embed.add_field(name="Topics", inline=True, value=value_string)

    await interaction.followup.send(embed=embed)

    try:
        response = await client.wait_for("message", check=lambda m: m.author == interaction.user, timeout=10000)
    except asyncio.exceptions.TimeoutError:
        log("warning", f"Timeout in {interaction.guild.name}")
        return

    # Checks if response is in dict, if yes sends random response
    if response.content.lower() in voicelinesJSON["chat"]:
        lines = voicelinesJSON["chat"][response.content.lower()][math.floor(random.random() * len(voicelinesJSON["chat"][response.content.lower()]))].split("$")
        message = ' '.join(lines)
    else:
        return

    await response.channel.send(message)