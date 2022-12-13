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
        if message.attachments:
            image = Image.open(message.attachments[0])
            image = image.convert("RGB").convert("P", palette=Image.ADAPTIVE)
            
            # Add overlay
            draw = ImageDraw.Draw(image)
            font = ImageFont.truetype("arial.ttf", 36)
            draw.text((10, 10), "lol", font=font, fill=(255, 0, 0))
            image.save("converted.gif")
            
            await message.channel.send(file=discord.File("converted.gif"))

@client.event
async def on_member_join(member):
    target_channel = client.get_channel(1041162913529995267)
    await target_channel.send(member.mention)
    await target_channel.send("https://media.tenor.com/4WvbjPe0B_wAAAAC/heres-pipe.gif")

@client.event
async def on_raw_reaction_add(payload):
    if payload.emoji.name == '⭐':
        message = await client.get_channel(payload.channel_id).fetch_message(payload.message_id)
        target_channel = client.get_channel(1050924693626036334)

        embed = discord.Embed(description=message.content)
        embed.set_author(name=message.author.name, icon_url=message.author.avatar)
        embed.description = f"{message.content}\n {message.jump_url}"

        if message.attachments:
            attachment = message.attachments[0]

            if attachment.height: #Image
                embed.set_image(url=attachment.url)

            elif attachment.size: #Video
                embed.add_field(name="Video", value=f"[Click here]({attachment.url}) to view the video.")

        await target_channel.send(embed=embed)

@client.event
async def on_message(message):
    if message.content == "!reaction":
        await message.add_reaction("🔒")
        role = discord.utils.get(message.guild.roles, name="ba1")

        # Wait for a user to react to the message
        def check(reaction, user):
            return user != client.user and str(reaction.emoji) == "🔒"
        
        reaction, user = await client.wait_for("reaction_add", check=check)

        if role not in user.roles:
            await user.add_roles(role)

@client.event
async def on_raw_reaction_remove(payload):
    message = await client.get_channel(payload.channel_id).fetch_message(payload.message_id)

    if payload.emoji.name == "🔒":
        role = discord.utils.get(message.guild.roles, name="ba1")
        user = message.guild.get_member(payload.user_id)

        await user.remove_roles(role)

# Start the Discord client
client.run(DISCORD_TOKEN)
