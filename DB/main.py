import json

from datetime import datetime

class ServerInstance:
    def __init__(self, id, database_ref):
        self.id = id
        self.database_ref = database_ref.setdefault(id, {})

    def star_channel(self):
        return self.database_ref.get("star_channel")

    def autorole_channel(self):
        return self.database_ref.setdefault("autorole_channel", {})


class JSONDB:
    def __init__(self, database_file):
        self.database = None
        self.database_file = database_file
        self.load_from(self.database_file)

    def load_from(self, file):
        with open(file) as f:
            self.database = json.load(f)

    def get_server(self, id):
        return ServerInstance(id, self.database)

    def save(self):
        self.save_in(self.database_file)

    def save_in(self, file):
        with open(file, 'w') as f:
            json.dump(self.database, f, indent=2)

    def add(self, path, item):
        ref = self.database

        for key in path[:-1]:  # Navigate to the correct location
            ref = ref.setdefault(key, {})

        if item not in ref.setdefault(path[-1], []):  # Add item if not present
            ref[path[-1]].append(item)
            self.save()

    def remove(self, path, item):
        ref = self.database

        for key in path[:-1]:
            ref = ref.get(key, {})

            if ref is None:
                return

        # Extra check to avoid removing from non-list types
        if isinstance(ref.get(path[-1], None), list) and item in ref[path[-1]]:
            ref[path[-1]].remove(item)
            self.save()

    def get_announced_games(self):
        return self.database.setdefault('announced_games', [])

    def announced_check(self, game_id, current_time):
        announced_games = self.get_announced_games()
        is_announced = False
        games_to_remove = []

        for game in announced_games:
            if game['id'] == game_id:
                # Convert 'free_until' string to datetime for comparison
                free_until = datetime.fromisoformat(game['free_until'].replace('Z', '+00:00'))
                if free_until < current_time:
                    games_to_remove.append(game)
                else:
                    is_announced = True

        # Remove outdated games after the check to avoid modifying list during iteration
        for game in games_to_remove:
            self.remove(['announced_games'], game)

        return is_announced

    def get_global_commands(self):
        return self.database.setdefault('commands', {'fun': [], 'admin': []})