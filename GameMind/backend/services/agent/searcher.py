"""
Searcher — Step 2 of the Agentic Engine.
Executes searches across all configured data sources in parallel.
"""
import asyncio
import logging
from typing import Any

from services.data_sources import AppStoreService, ExaSearchService, GooglePlayService

from .types import ExecutionPlan, SearchResults

logger = logging.getLogger(__name__)


class Searcher:
    """Step 2: Execute searches across all data sources."""

    def __init__(
        self,
        exa_api_key: str,
        appstore_api_key: str | None = None,
        gp_api_key: str | None = None,
    ):
        self.exa = ExaSearchService(exa_api_key)
        self.appstore = AppStoreService(appstore_api_key)
        self.gp = GooglePlayService(gp_api_key)

    async def search(self, plan: ExecutionPlan) -> SearchResults:
        """
        Execute all searches in the plan concurrently.

        For each search query:
          - exa    → web search via ExaSearchService
          - appstore → App Store charts / search
          - google_play → Google Play charts / search
        """
        results = SearchResults()
        tasks = []

        for sq in plan.search_queries:
            tasks.append(self._search_query(sq, results))

        await asyncio.gather(*tasks, return_exceptions=True)
        return results

    async def _search_query(self, sq: Any, results: SearchResults) -> None:
        """Execute a single SearchQuery and populate results."""
        try:
            if sq.data_source == "exa":
                exa_results = await self.exa.search(
                    keywords=sq.queries,
                    num_results=15,
                )
                results.exa_results.extend(exa_results)
                logger.info(
                    "Exa search for %s: %d results",
                    sq.category,
                    len(exa_results),
                )
            elif sq.data_source == "appstore":
                appstore_results = await self.appstore.get_top_charts(
                    category=sq.category,
                    limit=20,
                )
                results.appstore_results.extend(appstore_results)
                logger.info(
                    "AppStore search for %s: %d results",
                    sq.category,
                    len(appstore_results),
                )
            elif sq.data_source == "google_play":
                gp_results = await self.gp.get_top_charts(
                    category=sq.category,
                    limit=20,
                )
                results.gp_results.extend(gp_results)
                logger.info(
                    "GooglePlay search for %s: %d results",
                    sq.category,
                    len(gp_results),
                )
            else:
                logger.warning("Unknown data source: %s", sq.data_source)
        except Exception as e:
            logger.error("Search failed for %s (%s): %s", sq.category, sq.data_source, e)

    async def enrich_with_all_sources(self, plan: ExecutionPlan) -> SearchResults:
        """
        Augment results by hitting all sources for each category,
        not just the primary one in the plan.
        """
        results = SearchResults()
        tasks = []

        for sq in plan.search_queries:
            # Always try Exa
            tasks.append(
                _run_optional(
                    self.exa.search(keywords=sq.queries, num_results=15),
                    on_success=lambda r: results.exa_results.extend(r),
                    tag=f"exa:{sq.category}",
                )
            )
            # Try App Store if relevant
            tasks.append(
                _run_optional(
                    self.appstore.get_top_charts(category=sq.category, limit=20),
                    on_success=lambda r: results.appstore_results.extend(r),
                    tag=f"appstore:{sq.category}",
                )
            )
            # Try Google Play if relevant
            tasks.append(
                _run_optional(
                    self.gp.get_top_charts(category=sq.category, limit=20),
                    on_success=lambda r: results.gp_results.extend(r),
                    tag=f"gp:{sq.category}",
                )
            )

        await asyncio.gather(*tasks, return_exceptions=True)
        return results


async def _run_optional(
    coro,
    on_success,
    tag: str,
):
    """Run a coroutine, log errors but don't propagate."""
    try:
        result = await coro
        on_success(result)
    except Exception as e:
        logger.warning("[%s] skipped: %s", tag, e)
