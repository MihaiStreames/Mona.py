import nextcord
import textwrap

from Mona_py.logger import log
from PIL import Image
from io import BytesIO


def image_to_ascii(image_file, width, height):
    try:
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
    except Exception as e:
        log("error", f"Error in image_to_ascii function: {str(e)}")
        raise  # Re-raise the exception to handle it in the calling function


async def ascii(interaction: nextcord.Interaction, attachment: nextcord.Attachment):
    log("command", f"Slash command /ascii used in {interaction.guild.name}")

    if not attachment:
        await interaction.response.send_message("You need to attach an image.")
        return

    try:
        image_data = await attachment.read()
        ascii_art = image_to_ascii(image_data, 60, 25)

        embed = nextcord.Embed(
            color=nextcord.Color.blue(),
            description=f"```\n{ascii_art}\n```"
        )
        await interaction.response.send_message(embed=embed)

    except Exception as e:  # Catching any errors that occur during processing
        log("error", f"Error in /ascii command: {str(e)}")
        await interaction.response.send_message("An error occurred while processing the image.")