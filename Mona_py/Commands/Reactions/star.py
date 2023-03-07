import nextcord
from Mona_py.logger import log
from DB.main import JSONDB


async def star(message: nextcord.Message, client):
    await message.channel.send("Which channel do you want me to use for the star reaction system? (Enter the "
                               "channel ID or 'new' to create a new channel)")
    channel_response = await client.wait_for("message")

    if channel_response.content.lower() == "new":
        channel = await message.guild.create_text_channel('⭐')

        log("command", f"New star channel {channel.id} in {message.guild.name}")

    else:
        channel = client.get_channel(int(channel_response.content))
        log("command", f"Logged star channel {channel.id} in {message.guild.name}")

    @client.event
    async def on_raw_reaction_add(payload):
        if payload.emoji.name == '⭐':
            message = await client.get_channel(payload.channel_id).fetch_message(payload.message_id)
            target_channel = client.get_channel(channel.id)

            embed = nextcord.Embed(
                color=nextcord.Color.blue(),
                description=f"{message.content}\n\n [**Click to jump to message!**]({message.jump_url})"
            )
            embed.set_author(name=message.author.name + "#" + str(message.author.discriminator),
                             icon_url=message.author.avatar)

            if message.content.startswith('https://') or message.attachments:
                attachment = message.content
                embed.set_image(url=attachment)

            embed.add_field(name="Sent at:", value=message.created_at.date(), inline=False)

            await target_channel.send(embed=embed)
            log("command", f"New starred message {target_channel.id} in {message.guild.name}")
