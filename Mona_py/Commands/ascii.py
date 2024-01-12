import nextcord
import textwrap
from Mona_py.logger import log
from PIL import Image
from io import BytesIO


def image_to_ascii(image_file, width, height):
    image = Image.open(BytesIO(image_file)).convert("L")  # Grayscale
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


async def ascii(interaction: nextcord.Interaction, attachment: nextcord.Attachment):
    log("command", f"Slash command /ascii used in {interaction.guild.name}")

    if not attachment:
        await interaction.response.send_message("You need to attach an image.")
        return

    image_data = await attachment.read()

    try:
        ascii_art = image_to_ascii(image_data, 60, 25)
    except ValueError as e:  # Wrong image format
        await log("warning", f"Error: {e}")
        return

    embed = nextcord.Embed(
        color=nextcord.Color.blue(),
        description=f"```\n{ascii_art}\n```"
    )

    await interaction.response.send_message(embed=embed)