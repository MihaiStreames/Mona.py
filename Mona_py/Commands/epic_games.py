import requests

from Mona_py.logger import log

# Maybe consider encrypting it (since it's not something public AND the country is plainly there)
api_url = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=BE"

def check_epic_games(db):
    try:
        response = requests.get(api_url)
        data = response.json()
        store_games = data['data']['Catalog']['searchStore']['elements']

        free_games = []
        announced_games = db.get_announced_games()

        for game in store_games:
            # Extract productSlug from catalogNs mappings
            catalog_ns_mappings = game.get('catalogNs', {}).get('mappings', [])
            product_slug = next((m['pageSlug'] for m in catalog_ns_mappings if m.get('pageType') == 'productHome'), None)

            if not product_slug or product_slug in announced_games:
                continue  # Skip null or already announced games

            price_info = game['price']['totalPrice']

            if price_info['discountPrice'] == 0:
                image_url = next((img['url'] for img in game['keyImages'] if img['type'] == 'OfferImageWide'), None)
                free_games.append({
                    'slug': product_slug,
                    'title': game['title'],
                    'description': game['description'],
                    'image_url': image_url
                })

        log("info", f"Checked Epic Games Store, found {len(free_games)} free game(s).")
        return free_games

    except Exception as e:
        log("error", f"Error checking Epic Games Store: {e}")
        return []