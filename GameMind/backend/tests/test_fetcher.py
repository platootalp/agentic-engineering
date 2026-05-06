import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import patch, MagicMock


def test_exa_fetcher_search_returns_list():
    """Test that search returns a list of result dicts."""
    from backend.services.fetcher import ExaFetcher

    item1 = MagicMock(
        title="Top Casual Games April 2026",
        text="Casual games continue to dominate the market...",
        url="https://example.com/article1",
        published_date="2026-04-01",
    )
    item2 = MagicMock(
        title="Mobile Game Trends",
        text="Hypercasual games see growth...",
        url="https://example.com/article2",
        published_date="2026-04-02",
    )
    mock_response = MagicMock(results=[item1, item2])

    with patch("backend.services.fetcher.Exa") as MockExa:
        mock_client = MagicMock()
        MockExa.return_value = mock_client
        mock_client.search_and_contents.return_value = mock_response

        fetcher = ExaFetcher(api_key="test-key")
        results = fetcher.search(["casual games"], num_results=20)

        assert isinstance(results, list)
        assert len(results) == 2
        assert results[0]["title"] == "Top Casual Games April 2026"
        assert results[0]["text"] == "Casual games continue to dominate the market..."
        assert results[0]["url"] == "https://example.com/article1"
        assert results[0]["date"] == "2026-04-01"


def test_exa_fetcher_result_format():
    """Test that each result has the required fields."""
    from backend.services.fetcher import ExaFetcher

    mock_item = MagicMock(
        title="Test Article",
        text="Test content text",
        url="https://example.com/test",
        published_date="2026-04-10",
    )
    mock_response = MagicMock(results=[mock_item])

    with patch("backend.services.fetcher.Exa") as MockExa:
        mock_client = MagicMock()
        MockExa.return_value = mock_client
        mock_client.search_and_contents.return_value = mock_response

        fetcher = ExaFetcher(api_key="test-key")
        results = fetcher.search(["test"], num_results=5)

        r = results[0]
        assert "title" in r
        assert "text" in r
        assert "url" in r
        assert "date" in r


def test_exa_fetcher_calls_exa_with_correct_args():
    """Test that Exa API is called with correct parameters."""
    from backend.services.fetcher import ExaFetcher

    mock_response = MagicMock(results=[])

    with patch("backend.services.fetcher.Exa") as MockExa:
        mock_client = MagicMock()
        MockExa.return_value = mock_client
        mock_client.search_and_contents.return_value = mock_response

        fetcher = ExaFetcher(api_key="my-secret-key")
        fetcher.search(["puzzle games"], num_results=10)

        mock_client.search_and_contents.assert_called_once()
        call_kwargs = mock_client.search_and_contents.call_args.kwargs
        assert call_kwargs["query"] == "puzzle games"
        assert call_kwargs["num_results"] == 10
        assert call_kwargs["type"] == "auto"
