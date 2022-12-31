import json
from DB.main import JSONDB, ServerInstance

db = JSONDB("database.json")

server = db.get_server("1041162912779219035")
server.database_ref["star_channel"] = "1050924693626036334"
server.database_ref["autorole_channel"] = {
    "1058486627330166844": {
        "fire": "1055869317717172295"
    }
}

db.save()
