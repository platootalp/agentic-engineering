"""
Google Play Service — fetches top charts / ranking data.
Currently a stub that returns mock data.
In production, integrate with Google Play Scraper or GP Publishing API.
"""
import asyncio
from typing import Any


class GooglePlayService:
    """Async Google Play data fetcher."""

    def __init__(self, api_key: str | None = None):
        self._api_key = api_key

    async def get_top_charts(self, category: str, country: str = "us", limit: int = 20) -> list[dict[str, Any]]:
        """
        Fetch top free/paid games from Google Play charts.
        Returns a list of dicts with keys: name, developer, price, rating, reviews, category.
        """
        # Stub: simulate API latency
        await asyncio.sleep(0.1)

        return [
            {
                "name": f"{category.title()} Game {i}",
                "developer": f"DevCompany {i}",
                "price": 0.0,
                "rating": round(3.8 + (i % 5) * 0.15, 1),
                "reviews": (2000 + i * 500),
                "category": category,
                "source": "google_play",
            }
            for i in range(1, limit + 1)
        ]

    async def search_games(self, query: str, limit: int = 20) -> list[dict[str, Any]]:
        """Search for games by keyword on Google Play."""
        await asyncio.sleep(0.05)
        return [
            {
                "name": f"GP: Result for '{query}' #{i}",
                "developer": f"GP Studio {i}",
                "rating": 4.1,
                "source": "google_play",
            }
            for i in range(1, min(limit, 6) + 1)
        ]
