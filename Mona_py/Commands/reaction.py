import nextcord
from Mona_py.json_opener import channelsJSON


async def reaction(message: nextcord.Message, client):
    # TODO: setup
    channel = await message.guild.create_text_channel('reply')

    channelsJSON.update(channel.id)

    '''async def handle_reaction_add(payload, client):
        if payload.emoji.name == '⭐':
            message = await client.get_channel(payload.channel_id).fetch_message(payload.message_id)
            target_channel = client.get_channel(1050924693626036334)

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

            await target_channel.send(embed=embed)'''

    await channel.send('Funny moments go here')
