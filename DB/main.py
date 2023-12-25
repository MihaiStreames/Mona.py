import json


class ServerInstance:
    def __init__(self, id, database_ref):
        self.id = id
        self.database_ref = database_ref.setdefault(id, {})

    def star_channel(self): return self.database_ref.get("star_channel")

    def autorole_channel(self): return self.database_ref.setdefault("autorole_channel", {})


class JSONDB:

    def load_from(self, file):
        with open(file) as f:
            self.database = json.load(f)

    def __init__(self, database_file):
        self.database_file = database_file
        self.load_from(self.database_file)

    def get_server(self, id): return ServerInstance(id, self.database)

    def get_announced_games(self): return self.database.setdefault('announced_games', [])

    def add_announced_game(self, game_id):
        if game_id not in self.get_announced_games():
            self.database['announced_games'].append(game_id)
            self.save()

    def save(self): self.save_in(self.database_file)

    def save_in(self, file):
        with open(file, 'w') as f:
            json.dump(self.database, f, indent=2)