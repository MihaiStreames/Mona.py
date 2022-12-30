import nextcord
import textwrap
from Mona_py.logger import log
from PIL import Image
from io import BytesIO


def image_to_ascii(image_file, width, height):
    image = Image.open(BytesIO(image_file)).convert("L")
    image = image.resize((width, height))

    pixels = image.getdata()

    ascii_art = ""
    for pixel in pixels:
        ascii_art += '.' if pixel < 140 else '1'

    ascii_art = textwrap.fill(ascii_art, width=width)

    return ascii_art


async def ascii(message: nextcord.Message, client):
    log("command", f"!mona ascii in {message.guild.name}")
    if len(message.attachments) == 0:
        await message.channel.send("You need to attach an image -.-")
        return

    attachment = message.attachments[0]

    image_data = await attachment.read()
    ascii_art = image_to_ascii(image_data, 60, 25)

    embed = nextcord.Embed(
        color=nextcord.Color.blue(),
        description=f"```\n{ascii_art}\n```"
    )

    await message.channel.send(embed=embed)
