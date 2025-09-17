from letterboxdpy.user import User
from letterboxdpy.movie import Movie
from letterboxdpy import user as user_api  # needed for user_watchlist

def get_watchlist_titles(username):
    """Return a set of movie names in the user's Letterboxd watchlist."""
    user_instance = User(username)
    watchlist_obj = user_instance.get_watchlist()
    if not watchlist_obj or not watchlist_obj.get("available", False):
        return set()
    movie_data = watchlist_obj.get("data", {})
    return set(movie_info["slug"] for movie_info in movie_data.values() if "name" in movie_info)

def compare_watchlists(username1, username2):
    """Return the set of overlapping movie names in both users' watchlists."""
    watchlist1 = get_watchlist_titles(username1)
    watchlist2 = get_watchlist_titles(username2)
    return watchlist1 & watchlist2

from letterboxdpy.movie import Movie

def get_movie_description(movie_slug):
    """Return the description of a movie given its slug."""
    try:
        movie_instance = Movie(movie_slug)
        return movie_instance.description if hasattr(movie_instance, 'description') else ""
    except Exception as e:
        print(f"Error getting description for {movie_slug}: {e}")
        return ""

def get_movie_poster(movie_slug):
    """Return the poster URL of a movie given its slug."""
    try:
        movie_instance = Movie(movie_slug)
        return movie_instance.poster if hasattr(movie_instance, 'poster') else ""
    except Exception as e:
        print(f"Error getting poster for {movie_slug}: {e}")
        return ""

def get_movie_url(movie_slug):
    """Return the Letterboxd URL of a movie given its slug."""
    try:
        movie_instance = Movie(movie_slug)
        return movie_instance.url if hasattr(movie_instance, 'url') else ""
    except Exception as e:
        print(f"Error getting URL for {movie_slug}: {e}")
        return ""

def build_movie_data_list(movie_slugs):
    """Build a list of movie data dictionaries from a list of slugs."""
    movie_list = []
    for slug in movie_slugs:
        try:
            movie_instance = Movie(slug)
            movie_data = {
                "title": getattr(movie_instance, 'title', slug),
                "description": getattr(movie_instance, 'description', ''),
                "poster": getattr(movie_instance, 'poster', ''),
                "url": getattr(movie_instance, 'url', '')
            }
            movie_list.append(movie_data)
        except Exception as e:
            print(f"Error processing movie {slug}: {e}")
            continue
    return movie_list

if __name__ == "__main__":
    user1 = User("collinpt")
    print(compare_watchlists("collinpt", "s4trn1"))
    #print(get_watchlist_titles(user1))