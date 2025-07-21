from letterboxdpy.user import User
from letterboxdpy import user as user_api  # needed for user_watchlist

def get_watchlist_titles(username):
    """Return a set of movie names in the user's Letterboxd watchlist."""
    user_instance = User(username)
    watchlist_obj = user_instance.get_watchlist()
    if not watchlist_obj or not watchlist_obj.get("available", False):
        return set()
    movie_data = watchlist_obj.get("data", {})
    return set(movie_info["name"] for movie_info in movie_data.values() if "name" in movie_info)

def compare_watchlists(username1, username2):
    """Return the set of overlapping movie names in both users' watchlists."""
    watchlist1 = get_watchlist_titles(username1)
    watchlist2 = get_watchlist_titles(username2)
    return watchlist1 & watchlist2
