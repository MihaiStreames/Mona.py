import requests

from Mona_py.utils import log

# Maybe consider encrypting it (since it's not something public AND the country is plainly there)
api_url = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=BE"


def check_epic_games():
    try:
        response = requests.get(api_url)
        data = response.json()
        store_games = data['data']['Catalog']['searchStore']['elements']

        free_games = []

        for game in store_games:
            # Check if game is currently free
            promotion = game.get('promotions', {})
            current_promotion = promotion.get('promotionalOffers', [])

            if current_promotion:
                current_offer = current_promotion[0].get('promotionalOffers', [])

                if current_offer:
                    start_date = current_offer[0]['startDate']
                    end_date = current_offer[0]['endDate']

                    print(f"Start date: {start_date}")
                    print(f"End date: {end_date}")

                    # Checking price change
                    price_info = game['price']['totalPrice']
                    original_price = price_info['originalPrice']
                    discount_price = price_info['discountPrice']

                    #print(f"Original price: {original_price}")
                    #print(f"Discount price: {discount_price}")

                    if original_price > 0 and discount_price == 0:
                        #print(f"{game['title']} is free!")

                        # Extract productSlug from catalogNs mappings
                        catalog_ns_mappings = game.get('catalogNs', {}).get('mappings', [])
                        product_slug = next((m['pageSlug'] for m in catalog_ns_mappings if m.get('pageType') == 'productHome'), None)

                        image_url = next((img['url'] for img in game['keyImages'] if img['type'] == 'OfferImageWide'), None)

                        free_games.append({
                            'id': game['id'],
                            'slug': product_slug,
                            'title': game['title'],
                            'description': game['description'],
                            'image_url': image_url,
                            'free_from': start_date,
                            'free_until': end_date
                        })

        log("info", f"Checked Epic Games Store, found {len(free_games)} free game(s)!")
        return free_games

    except Exception as e:
        log("error", f"Error checking Epic Games Store: {e}")
        return []