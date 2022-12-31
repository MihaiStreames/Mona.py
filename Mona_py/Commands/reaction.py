import nextcord

from Mona_py.logger import log
from Mona_py.Commands.Reactions import emoji, star  # not halal

commands = {
    "emoji": emoji.emoji,
    "star": star.star,
}


async def reaction(message: nextcord.Message, client):
    log("command", f"!mona reaction {message.guild.name}")
    reaction_type = message.content.split()[3]

    if reaction_type in commands:
        await commands[reaction_type](message, client)
