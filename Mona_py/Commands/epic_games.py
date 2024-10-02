import requests
from Mona_py.utils import log

# API URL for fetching the free games from Epic Games Store
api_url = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?country=BE"


def check_epic_games():
    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Ensure we raise an error for bad status codes
        data = response.json()

        # Access the store games data
        store_games = data.get('data', {}).get('Catalog', {}).get('searchStore', {}).get('elements', [])

        free_games = []

        for game in store_games:
            try:
                # Check if game is currently free
                promotion = game.get('promotions', {})
                if not promotion:
                    continue

                current_promotion = promotion.get('promotionalOffers', [])
                if not current_promotion:
                    continue

                current_offer = current_promotion[0].get('promotionalOffers', [])
                if not current_offer:
                    continue

                start_date = current_offer[0].get('startDate')
                end_date = current_offer[0].get('endDate')

                #print(f"Start date: {start_date}")
                #print(f"End date: {end_date}")

                # Checking price change
                price_info = game.get('price', {}).get('totalPrice', {})
                if not price_info:
                    continue

                original_price = price_info.get('originalPrice')
                discount_price = price_info.get('discountPrice')

                if original_price is None or discount_price is None:
                    continue

                discount_percentage = current_offer[0].get('discountSetting', {}).get('discountPercentage')

                # Ensure the game is fully discounted (free)
                if original_price > 0 and discount_price == 0 and discount_percentage in [0, 100]:
                    # Extract productSlug from catalogNs mappings
                    catalog_ns_mappings = game.get('catalogNs', {}).get('mappings', [])
                    product_slug = next(
                        (m.get('pageSlug') for m in catalog_ns_mappings if m.get('pageType') == 'productHome'),
                        None) if catalog_ns_mappings else None

                    key_images = game.get('keyImages', [])
                    image_url = next((img.get('url') for img in key_images if img.get('type') == 'OfferImageWide'),
                                     None) if key_images else None

                    free_games.append({
                        'id': game.get('id'),
                        'slug': product_slug,
                        'title': game.get('title'),
                        'description': game.get('description'),
                        'image_url': image_url,
                        'free_from': start_date,
                        'free_until': end_date
                    })
            except Exception as game_err:
                log("error", f"Error processing game data: {game_err}. Game data: {game}")
                continue

        log("info", f"Checked Epic Games Store, found {len(free_games)} free game(s)!")
        return free_games

    except requests.RequestException as req_err:
        log("error", f"HTTP error occurred while checking Epic Games Store: {req_err}")
        return []
    except Exception as e:
        log("error", f"Error checking Epic Games Store: {e}")
        return []


# Function call for testing
if __name__ == "__main__":
    free_games_list = check_epic_games()
    for game in free_games_list:
        print(game)