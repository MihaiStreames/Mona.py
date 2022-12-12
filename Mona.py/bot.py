import discord
import os
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# Create a new Discord client
intents = discord.Intents.default()
intents.members = True

client = discord.Client(command_prefix='!', intents=intents)


# Listen for messages that contain an image attachment
@client.event
async def on_message(message):
    if message.attachments:
        # Open the image file and convert it to a GIF
        image = Image.open(message.attachments[0])
        image = image.convert("RGB").convert("P", palette=Image.ADAPTIVE)
        image.save("converted.gif", "GIF")

        # Send the converted GIF back to the user
        await message.channel.send(file=discord.File("converted.gif"))


# Start the Discord client
client.run(DISCORD_TOKEN)
