from letterboxdpy.user import User
from letterboxdpy.movie import Movie
from letterboxdpy import user as user_api
import time
import concurrent.futures # Import the concurrency module

def get_watchlist_slugs(username):
    """Return a set of movie slugs in the user's Letterboxd watchlist."""
    user_instance = User(username)
    watchlist_obj = user_instance.get_watchlist()
    if not watchlist_obj or not watchlist_obj.get("available", False):
        return set()
    movie_data = watchlist_obj.get("data", {})
    return set(movie_info["slug"] for movie_info in movie_data.values() if "name" in movie_info)

def compare_watchlists(username1, username2):
    """Return the set of overlapping movie slugs in both users' watchlists."""
    watchlist1 = get_watchlist_slugs(username1)
    watchlist2 = get_watchlist_slugs(username2)
    #return watchlist1 & watchlist2
    overlap = list(watchlist1 & watchlist2)
    return overlap[:10]

# This is a new "worker" function that fetches data for a single movie.
def fetch_one_movie(slug):
    """Fetches and processes data for a single movie slug."""
    try:
        movie_instance = Movie(slug)
        return {
            "title": getattr(movie_instance, 'title', slug),
            "description": getattr(movie_instance, 'description', ''),
            "poster": getattr(movie_instance, 'poster', ''),
            "url": getattr(movie_instance, 'url', '')
        }
    except Exception as e:
        print(f"Error processing movie {slug}: {e}")
        return None # Return None on failure

def build_movie_data_list_fast(movie_slugs, max_workers=10):
    """
    Build a list of movie data dictionaries concurrently using a thread pool.
    """
    movie_list = []
    # A ThreadPoolExecutor manages a pool of threads to run tasks concurrently.
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # executor.map applies the fetch_one_movie function to every slug in movie_slugs.
        # It automatically handles distributing the work among threads.
        results = executor.map(fetch_one_movie, movie_slugs)

        # Collect results that are not None (i.e., successfully fetched)
        for movie_data in results:
            if movie_data:
                movie_list.append(movie_data)

    return movie_list

# This is your original function, left for comparison
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