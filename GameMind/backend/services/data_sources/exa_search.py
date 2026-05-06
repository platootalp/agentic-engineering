"""
Exa Search Service — async wrapper around ExaFetcher.
"""
import asyncio
from typing import Any

from services.fetcher import ExaFetcher


class ExaSearchService:
    """Async Exa search wrapper for the agentic workflow."""

    def __init__(self, api_key: str):
        self._api_key = api_key
        self._fetcher: ExaFetcher | None = None

    def _get_fetcher(self) -> ExaFetcher:
        if self._fetcher is None:
            self._fetcher = ExaFetcher(api_key=self._api_key)
        return self._fetcher

    async def search(
        self,
        keywords: list[str],
        num_results: int = 10,
    ) -> list[dict[str, Any]]:
        """
        Perform Exa web search (runs in thread pool to avoid blocking).
        """
        def _sync_search() -> list[dict[str, Any]]:
            fetcher = self._get_fetcher()
            return fetcher.search(keywords=keywords, num_results=num_results)

        return await asyncio.to_thread(_sync_search)

    async def search_single(
        self,
        query: str,
        num_results: int = 10,
    ) -> list[dict[str, Any]]:
        """Search with a single query string."""
        return await self.search(keywords=[query], num_results=num_results)
