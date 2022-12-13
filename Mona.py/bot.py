import discord
import os
from PIL import Image, ImageDraw, ImageFont
from dotenv import load_dotenv

load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# Create a new Discord client
intents = discord.Intents.all()
client = discord.Client(command_prefix='!', intents=intents)


@client.event
async def on_message(message):
    if message.content.startswith("!gif"):
        # Check if message has an image
        if message.attachments:
            # Open the image file
            image = Image.open(message.attachments[0])
            # Convert to GIF
            image = image.convert("RGB").convert("P", palette=Image.ADAPTIVE)
            # Add overlay
            draw = ImageDraw.Draw(image)
            font = ImageFont.truetype("arial.ttf", 36)
            draw.text((10, 10), "lol", font=font, fill=(255, 0, 0))
            image.save("converted.gif")
            # Send the converted GIF back
            await message.channel.send(file=discord.File("converted.gif"))

@client.event
async def on_member_join(member):
    target_channel = client.get_channel(1041162913529995267)
    await target_channel.send(member.mention)
    await target_channel.send("https://media.tenor.com/4WvbjPe0B_wAAAAC/heres-pipe.gif")

@client.event
async def on_raw_reaction_add(payload):
    # Check if the reaction is the star emoji
    if payload.emoji.name == '⭐':
        # Fetch the message and channel objects from the payload
        message = await client.get_channel(payload.channel_id).fetch_message(payload.message_id)
        target_channel = client.get_channel(1050924693626036334)

        # Create an embed object with the message content and link to message
        embed = discord.Embed(description=message.content)
        embed.set_author(name=message.author.name, icon_url=message.author.avatar)
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
