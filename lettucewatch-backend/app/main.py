# In lettucewatch-backend/app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# 👇 UPDATED: Import the fast function instead of the slow one
from .logic import compare_watchlists, build_movie_data_list_fast

app = FastAPI()

# This is crucial for allowing your frontend (running on http://localhost:3000)
# to communicate with your backend (running on http://localhost:8000).
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/compare")
async def get_common_movies(username1: str, username2: str):
    """
    Compares two Letterboxd users' watchlists and returns a list of
    common movies with their details, formatted for the frontend.
    """
    if not username1 or not username2:
        raise HTTPException(status_code=400, detail="Both usernames are required.")
    
    try:
        # 1. Get slugs of common movies from your existing logic
        common_slugs = compare_watchlists(username1, username2)
        
        if not common_slugs:
            return []  # Return an empty list if there are no matches
            
        # 2. Get the full movie data for each slug
        # 👇 UPDATED: Call the fast function
        movie_data_list = build_movie_data_list_fast(common_slugs)
        
        # 3. Format the data to match the frontend's nested list structure:
        # [[title, description, poster, url], ...]
        formatted_movie_list = [
            [
                movie.get("title", ""),
                movie.get("description", ""),
                movie.get("poster", ""),
                movie.get("url", "")
            ]
            for movie in movie_data_list
        ]
        
        return formatted_movie_list
    except Exception as e:
        # Handle potential errors from the Letterboxd scraper or other issues
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred while fetching movie data.")