import discord
import os
from Mona_py.Commands import hello, chat
from dotenv import load_dotenv


load_dotenv()

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

# create the bot
intents = discord.Intents.all()
client = discord.Client(intents=intents)


@client.event
async def on_ready():
    print(f"{client.user.name} is ready!")


@client.event
async def on_message(message):
    # we do not want the bot to reply to itself
    if message.author == client.user:
        return

    if message.content.startswith('!'):
        command_words = message.content.split()
        command = command_words[0][1:]

        if command == "hello":
            await hello.hello(message)
        elif command == "chat":
            await chat.chat(message)
        else:
            await message.channel.send(f"Unknown command: {command}")


@client.event
async def on_member_join(member):
    welcome_channel = client.get_channel(1041162913529995267)
    await send_welcome_message(welcome_channel, member)


async def send_welcome_message(channel, member):
    message = member.mention
    message += "\nhttps://media.tenor.com/4WvbjPe0B_wAAAAC/heres-pipe.gif"
    await channel.send(message)


# run the bot
client.run(DISCORD_TOKEN)

'''
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
'''