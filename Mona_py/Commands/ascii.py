import nextcord
import textwrap
from Mona_py.logger import log
from PIL import Image
from io import BytesIO


def image_to_ascii(image_file, width, height):
    image = Image.open(BytesIO(image_file)).convert("L")  # grayscale
    image = image.resize((width, height))

    pixels = image.getdata()

    ascii_art = ""
    for pixel in pixels:
        if pixel < 128:
            ascii_art += '·'
        else:
            ascii_art += '●'

    ascii_art = textwrap.fill(ascii_art, width=width)

    return ascii_art


async def ascii(message: nextcord.Message, client):
    log("command", f"!mona ascii in {message.guild.name}")
    # check if text is added
    if len(message.content) > len("!mona ascii "):
        await message.channel.send("Text support hasn't been added yet </3")
        return
    # check if image is added
    elif len(message.attachments) == 0:
        await message.channel.send("You need to attach an image -.-")
        return

    attachment = message.attachments[0]
    image_data = await attachment.read()

    try:
        ascii_art = image_to_ascii(image_data, 60, 25)
    except ValueError as e:  # wrong image format
        await log("warning", f"Error: {e}")
        return

    embed = nextcord.Embed(
        color=nextcord.Color.blue(),
        description=f"```\n{ascii_art}\n```"
    )

    await message.channel.send(embed=embed)
