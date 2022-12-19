import nextcord

catalyst = nextcord.File("./Images/Items/catalyst.png", filename="category.png")


async def help(message: nextcord.Message, client):
    print(f"!mona help in {message.guild.name}")

    embed = nextcord.Embed(
        title="Mona's Catalyst",
        color=nextcord.Color.blue(),
        description="Prefix: !mona"
    )
    embed.set_thumbnail(url="attachment://category.png")
    embed.add_field(
        name="First Steps",
        value="You should do `!mona starcatch setup` to create a channel for the RPG game so mona can post bosses and stars for people to fight and collect!"
    )
    embed.add_field(
        name="Fun Commands",
        value="\n".join([
            "!mona image",
            "!mona chat",
            "!mona ask (sentence) (WIP)"
        ])
    )
    embed.add_field(
        name="Admin/Setup Commands",
        value="\n".join([
            "!mona reaction (WIP)",
            "!mona starcatch (WIP)"
        ])
    )

    try:
        await message.channel.send(embed=embed, files=[catalyst])
    except nextcord.errors.Forbidden:
        await message.channel.send(f"{message.author} I don't have permissions to do that!")
