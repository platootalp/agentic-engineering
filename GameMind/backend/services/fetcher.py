from exa_py import Exa


class ExaFetcher:
    """Service for searching the web via Exa API."""

    def __init__(self, api_key: str):
        self.client = Exa(api_key=api_key)

    def search(self, keywords: list[str], num_results: int = 10) -> list[dict]:
        """
        Search for results based on keywords.

        Args:
            keywords: List of search query strings.
            num_results: Number of results to return per keyword.

        Returns:
            List of result dicts with keys: title, text, url, date.
        """
        results = []
        for keyword in keywords:
            response = self.client.search_and_contents(
                query=keyword,
                num_results=num_results,
                type="auto",
            )
            # response is a SearchResponse object with .results attribute
            for item in response.results:
                results.append(
                    {
                        "title": getattr(item, 'title', '') or '',
                        "text": getattr(item, 'text', '') or '',
                        "url": getattr(item, 'url', '') or '',
                        "date": getattr(item, 'published_date', '') or '',
                    }
                )
        return results



