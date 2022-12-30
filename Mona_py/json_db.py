import json

JSONDatabase = None

class JSONDB:
    def __init__(self):

        with open("../voicelines.json") as f: self.voicelinesJSON = json.load(f)
        with open("../channels.json")   as f: self.channelsJSON   = json.load(f)
