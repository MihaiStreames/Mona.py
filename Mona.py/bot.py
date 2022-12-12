import discord
import os
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# Create a new Discord client
intents = discord.Intents.all()
client = discord.Client(command_prefix='!', intents=intents)
TARGET_CHANNEL_ID = 1050924693626036334

# Listen for messages that contain an image attachment


@client.event
async def on_message(message):
    if message.content.startswith("!gif"):
        if message.attachments:
            # Open the image file and convert it to a GIF
            image = Image.open(message.attachments[0])
            image = image.convert("RGB").convert("P", palette=Image.ADAPTIVE)
            image.save("converted.gif", "GIF")

            # Send the converted GIF back
            await message.channel.send(file=discord.File("converted.gif"))


@client.event
async def on_raw_reaction_add(payload):
    # Check if the reaction is the star emoji
    if payload.emoji.name == '⭐':
        # Fetch the message and channel objects from the payload
        message = await client.get_channel(payload.channel_id).fetch_message(payload.message_id)
        reaction = client.get(message.reactions)
        target_channel = client.get_channel(TARGET_CHANNEL_ID)

        if reaction.count > 1:
            # Create an embed object with the message content and link to message
            embed = discord.Embed(description=message.content)
            embed.set_author(name=message.author.display_name, icon_url=message.author.avatar)
            embed.description = f"{message.content}\n {message.jump_url}"

            # Check if the message has any attached images or videos
            if message.attachments:
                # If there are multiple attachments, use the first one
                attachment = message.attachments[0]
                # Check if the attachment is an image or video
                if attachment.height:
                    # If it is an image, set it as the embed image
                    embed.set_image(url=attachment.url)
                elif attachment.size:
                    # If it is a video, set it as the embed video
                    embed.add_field(name="Video", value=f"[Click here]({attachment.url}) to view the video.")

            # Send the embed in the target channel
            await target_channel.send(embed=embed)


# Start the Discord client
client.run(DISCORD_TOKEN)
