import requests
from Mona_py.logger import log

api_url = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=AR"


def check_epic_games(db):
    try:
        response = requests.get(api_url)
        data = response.json()
        store_games = data['data']['Catalog']['searchStore']['elements']

        free_games = []
        announced_games = db.get_announced_games()

        for game in store_games:
            game_id = game['id']
            if game_id in announced_games:
                continue  # Skip already announced games

            price_info = game['price']['totalPrice']
            if price_info['discountPrice'] == 0:
                free_games.append({
                    'id': game_id,
                    'title': game['title'],
                    'description': game['description'],
                    'image_url': game['keyImages'][0]['url'] if game['keyImages'][0]['type'] == 'VaultClosed' else game['keyImages'][1]['url']
                })

        log("info", f"Checked Epic Games Store, found {len(free_games)} free games.")
        return free_games

    except Exception as e:
        log("error", f"Error checking Epic Games Store: {e}")
        return []