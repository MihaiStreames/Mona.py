import nextcord
from Mona_py.logger import log


async def help(message: nextcord.Message, client):
    log("command", f"!mona help in {message.guild.name}")

    embed = nextcord.Embed(
        title="Mona's Catalyst",
        color=nextcord.Color.blue(),
        description="Prefix: !mona"
    )
    embed.set_thumbnail(url="https://cdn.discordapp.com/attachments/1051774224005607494/1054491332040724602/category.png")
    embed.add_field(
        name="First Steps",
        value="You should do `!mona starcatch setup` to create a channel for the RPG game so mona can post bosses and stars for people to fight and collect!"
    )
    embed.add_field(
        name="Fun Commands",
        value="\n".join([
            "!mona image",
            "!mona chat",
            "!mona ascii",
            "!mona ask (sentence) `(WIP)`"
        ])
    )
    embed.add_field(
        name="Admin/Setup Commands",
        value="\n".join([
            "!mona reaction (star/emoji) (setup) `(WIP)`",
            "!mona starcatch `(WIP)`"
        ])
    )

    try:
        await message.channel.send(embed=embed)
    except nextcord.errors.Forbidden:
        log("warning", f"Permissions forbidden in {message.guild.name}")
        await message.channel.send(f"{message.author} I don't have permissions to do that!")
