import json


class ServerInstance:
    def __init__(self, id, database_ref):
        self.id = id
        self.database_ref = database_ref.setdefault(id)

    def star_channel(self): return self.database_ref.get("star_channel")

    def emoji_channels(self): return self.database_ref.setdefault("emoji_channels")


class JSONDB:

    def load_from(self, file):
        with open(file) as f:
            self.database = json.load(f)

    def __init__(self, database_file):
        self.database_file = database_file
        self.load_from(self.database_file)

    def get_server(self, id): return ServerInstance(id, self.database)

    def save(self): self.save_in(self.database_file)

    def save_in(self, file):
        with open(file, 'w') as f:
            json.dump(f, self.database, indent=2)


DBInstance = JSONDB("database.json")
