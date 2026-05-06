import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import patch, MagicMock


def test_analyze_returns_correct_structure():
    """Test that analyze() returns dict with summary, insights, sources."""
    from backend.services.analyzer import ClaudeAnalyzer

    mock_message_response = MagicMock()
    mock_message_response.content = [
        MagicMock(text='{"summary": "Casual games market is growing", "insights": ["Insight A", "Insight B", "Insight C"], "sources": ["source1.com", "source2.com"]}')
    ]

    with patch("backend.services.analyzer.anthropic.Anthropic") as MockAnthropic:
        mock_client = MagicMock()
        MockAnthropic.return_value = mock_client
        mock_client.messages.create.return_value = mock_message_response

        analyzer = ClaudeAnalyzer(api_key="test-key")
        raw_results = [
            {"title": "Game A", "snippet": "desc A", "url": "http://a.com", "date": "2026-04-01"},
            {"title": "Game B", "snippet": "desc B", "url": "http://b.com", "date": "2026-04-02"},
        ]
        result = analyzer.analyze(raw_results)

        assert "summary" in result
        assert "insights" in result
        assert "sources" in result
        assert isinstance(result["insights"], list)
        assert isinstance(result["sources"], list)
        assert result["summary"] == "Casual games market is growing"
        assert len(result["insights"]) == 3
        assert len(result["sources"]) == 2


def test_analyze_sends_correct_payload():
    """Test that analyze() sends correct prompt to Claude API."""
    from backend.services.analyzer import ClaudeAnalyzer

    mock_message_response = MagicMock()
    mock_message_response.content = [
        MagicMock(text='{"summary": "x", "insights": [], "sources": []}')
    ]

    with patch("backend.services.analyzer.anthropic.Anthropic") as MockAnthropic:
        mock_client = MagicMock()
        MockAnthropic.return_value = mock_client
        mock_client.messages.create.return_value = mock_message_response

        analyzer = ClaudeAnalyzer(api_key="sk-ant-test")
        analyzer.analyze([{"title": "Test", "snippet": "desc", "url": "http://x.com", "date": "2026-04-01"}])

        mock_client.messages.create.assert_called_once()
        call_kwargs = mock_client.messages.create.call_args.kwargs
        assert call_kwargs["model"] == "claude-sonnet-4-6"
        assert call_kwargs["max_tokens"] == 4096
        assert "JSON" in call_kwargs["system"]
        assert len(call_kwargs["messages"]) == 1
        assert call_kwargs["messages"][0]["role"] == "user"


def test_analyze_returns_fallback_on_error():
    """Test that analyze() returns fallback analysis on exception."""
    from backend.services.analyzer import ClaudeAnalyzer

    with patch("backend.services.analyzer.anthropic.Anthropic") as MockAnthropic:
        mock_client = MagicMock()
        MockAnthropic.return_value = mock_client
        mock_client.messages.create.side_effect = Exception("API error")

        analyzer = ClaudeAnalyzer(api_key="bad-key")
        result = analyzer.analyze([{"title": "Test", "url": "http://test.com"}])

        assert "summary" in result
        assert "insights" in result
        assert "sources" in result
        assert isinstance(result["summary"], str)
        assert len(result["summary"]) > 0, "Fallback summary should not be empty"
        assert isinstance(result["insights"], list)
        assert len(result["insights"]) > 0, "Fallback insights should not be empty"
