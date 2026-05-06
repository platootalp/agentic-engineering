"""
App Store Service — fetches top charts / ranking data.
Currently a stub that returns mock data.
In production, integrate with App Store Connect API or a scraping service.
"""
import asyncio
from typing import Any


class AppStoreService:
    """Async App Store data fetcher."""

    def __init__(self, api_key: str | None = None):
        self._api_key = api_key

    async def get_top_charts(self, category: str, country: str = "us", limit: int = 20) -> list[dict[str, Any]]:
        """
        Fetch top free/paid games from App Store charts.
        Returns a list of dicts with keys: name, developer, price, rating, reviews, category.
        """
        # Stub: simulate API latency
        await asyncio.sleep(0.1)

        # Return structured mock data — replace with real App Store Connect API
        return [
            {
                "name": f"{category.title()} Game {i}",
                "developer": f"DevStudio {i}",
                "price": 0.0,
                "rating": round(3.5 + (i % 7) * 0.2, 1),
                "reviews": (1000 + i * 300),
                "category": category,
                "source": "appstore",
            }
            for i in range(1, limit + 1)
        ]

    async def search_games(self, query: str, limit: int = 20) -> list[dict[str, Any]]:
        """Search for games by keyword."""
        await asyncio.sleep(0.05)
        return [
            {
                "name": f"Result for '{query}' #{i}",
                "developer": f"Studio {i}",
                "rating": 4.0,
                "source": "appstore",
            }
            for i in range(1, min(limit, 6) + 1)
        ]
