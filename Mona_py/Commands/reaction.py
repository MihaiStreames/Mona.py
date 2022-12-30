import nextcord
from Mona_py.json_opener import channelsJSON
from Mona_py.logger import log


async def reaction(message: nextcord.Message, client):
    log("command", f"!mona reaction {message.guild.name}")
    reaction_type = message.content.split()[3]

    if reaction_type == "emoji":
        await message.channel.send("Which channel do you want me to use for the emoji reaction system? (Enter the "
                                   "channel ID or 'new' to create a new channel)")
        channel_response = await client.wait_for("message")

        if channel_response.content.lower() == "new":
            channel = await message.guild.create_text_channel('emoji')
            log("command", f"New emoji channel {channel.id} in {message.guild.name}")

        else:
            channel = client.get_channel(int(channel_response.content))
            log("command", f"Logged emoji channel {channel.id} in {message.guild.name}")

        await channel.send(f"{message.author.mention} Which emojis do you want me to associate with which roles? ("
                           f"Enter each association in the format 'emoji: role', or 'done' when finished)")

        associations = {}

        while True:
            association_response = await client.wait_for("message")
            if association_response.content.lower() == "done":
                break

            emoji, role = association_response.content.split(":")

            emoji = emoji.strip()
            role = role.strip()
            associations[emoji] = role

        await channel.send('Please send the message you want me to react to with the corresponding emojis:')

        user_message = await client.wait_for("message")

        for emoji in associations:
            await user_message.add_reaction(emoji)

        @client.event
        async def emoji_handler(payload, client):
            if payload.member == client.user:
                return

            if payload.emoji.name in associations:
                user = payload.member
                role = nextcord.utils.get(message.guild.roles, name=associations[payload.emoji.name])

                await user.add_roles(role)

    elif reaction_type == "star":
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
        async def star_handler(payload, client):
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
