import json

with open("../voicelines.json") as f:
    voicelinesJSON = json.load(f)

with open("../channels.json") as e:
    channelsJSON = json.load(e)