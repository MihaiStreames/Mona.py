import math
import random
import nextcord
import json

with open("../voicelines.json") as f:
    voicelinesJSON = json.load(f)
chatbox = nextcord.File("./Images/Icon_Dialogue_Talk.png", filename="chat.png")

async def chat(message: nextcord.Message, client):
    print(f"!mona chat in {message.guild.name}")

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
    embed.set_thumbnail(url="attachment://chat.png")
    embed.add_field(name="Topics", inline=True, value=value_string)

    await message.channel.send(embed=embed, files=[chatbox])

    response = await client.wait_for("message", check=lambda m: m.author == message.author, timeout=10000)

    # checks if response is in dict, if yes sends random response between the different available ones
    if response.content.lower() in voicelinesJSON["chat"]:
        lines = voicelinesJSON["chat"][response.content.lower()][math.floor(random.random() * len(voicelinesJSON["chat"][response.content]))].split("$")
        message = ' '.join(lines)
    else:
        return

    await response.channel.send(message)
