import nextcord

from Mona_py.utils import log
from PIL import Image
from io import BytesIO


async def autocrop(interaction: nextcord.Interaction, attachment: nextcord.Attachment):
    log("command", f"Slash command /autocrop used in {interaction.guild.name}")

    if not attachment:
        await interaction.response.send_message("Please attach an image alongside the command!")
        return

    image_data = await attachment.read()

    try:
        with Image.open(BytesIO(image_data)) as img:
            img = img.convert("RGBA")           # Ensure image is in RGBA format
            img = img.crop(img.getbbox())       # Crop the image

            output = BytesIO()
            img.save(output, format='PNG')
            output.seek(0)

            file = nextcord.File(output, f'autocropped_{interaction.id}.png')
            await interaction.response.send_message(file=file)

    except Exception as e:
        await interaction.response.send_message(f"Error processing the image: {str(e)}")