"""Tests for AI adapters (Kimi and DeepSeek)."""

from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.infrastructure.ai.gateway import (
    AIAPIError,
    AIAuthenticationError,
    AIModel,
    AIInvalidRequestError,
    AIRateLimitError,
    AIResponse,
)
from app.infrastructure.ai.kimi_adapter import KimiAdapter
from app.infrastructure.ai.deepseek_adapter import DeepSeekAdapter


class TestKimiAdapter:
    """Tests for KimiAdapter class."""

    @pytest.fixture
    def adapter(self):
        """Create a Kimi adapter instance."""
        return KimiAdapter(api_key="test-api-key")

    @pytest.fixture
    def mock_response_data(self):
        """Create mock API response data."""
        return {
            "id": "chatcmpl-test123",
            "object": "chat.completion",
            "created": 1234567890,
            "model": "moonshot-v1-128k",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "This is a test response from Kimi.",
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 20,
                "total_tokens": 30,
            },
        }

    def test_initialization(self, adapter):
        """Test adapter initialization."""
        assert adapter.api_key == "test-api-key"
        assert adapter.base_url == "https://api.moonshot.cn/v1"
        assert adapter.model == "moonshot-v1-128k"
        assert adapter.timeout == 60.0

    def test_initialization_with_custom_params(self):
        """Test adapter initialization with custom parameters."""
        adapter = KimiAdapter(
            api_key="custom-key",
            base_url="https://custom.api.com",
            model="custom-model",
            timeout=30.0,
        )
        assert adapter.api_key == "custom-key"
        assert adapter.base_url == "https://custom.api.com"
        assert adapter.model == "custom-model"
        assert adapter.timeout == 30.0

    def test_model_enum(self, adapter):
        """Test model enum property."""
        assert adapter.model_enum == AIModel.KIMI

    @pytest.mark.asyncio
    async def test_chat_completion_success(self, adapter, mock_response_data):
        """Test successful chat completion."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response
        mock_client.is_closed = False

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            response = await adapter.chat_completion(messages)

        assert isinstance(response, AIResponse)
        assert response.content == "This is a test response from Kimi."
        assert response.model == AIModel.KIMI
        assert response.token_usage.total_tokens == 30
        assert response.finish_reason == "stop"

    @pytest.mark.asyncio
    async def test_chat_completion_with_parameters(self, adapter, mock_response_data):
        """Test chat completion with custom parameters."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            response = await adapter.chat_completion(
                messages=messages,
                temperature=0.5,
                max_tokens=100,
                top_p=0.9,
                presence_penalty=0.5,
                frequency_penalty=0.3,
            )

        assert isinstance(response, AIResponse)
        call_args = mock_client.post.call_args
        payload = call_args[1]["json"]
        assert payload["temperature"] == 0.5
        assert payload["max_tokens"] == 100
        assert payload["top_p"] == 0.9
        assert payload["presence_penalty"] == 0.5
        assert payload["frequency_penalty"] == 0.3

    @pytest.mark.asyncio
    async def test_chat_completion_rate_limit_error(self, adapter):
        """Test handling of rate limit error."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.json.return_value = {"error": {"message": "Rate limit exceeded"}}
        mock_response.headers = {"retry-after": "60"}
        mock_response.text = "Rate limit exceeded"

        mock_error = httpx.HTTPStatusError(
            "Rate limit",
            request=MagicMock(),
            response=mock_response,
        )

        mock_client = AsyncMock()
        mock_client.post.side_effect = mock_error

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            with pytest.raises(AIRateLimitError) as exc_info:
                await adapter.chat_completion(messages)

        assert exc_info.value.status_code == 429
        assert exc_info.value.retry_after == 60

    @pytest.mark.asyncio
    async def test_chat_completion_auth_error(self, adapter):
        """Test handling of authentication error."""
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {"error": {"message": "Invalid API key"}}
        mock_response.text = "Invalid API key"

        mock_error = httpx.HTTPStatusError(
            "Auth error",
            request=MagicMock(),
            response=mock_response,
        )

        mock_client = AsyncMock()
        mock_client.post.side_effect = mock_error

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            with pytest.raises(AIAuthenticationError) as exc_info:
                await adapter.chat_completion(messages)

        assert exc_info.value.status_code == 401

    @pytest.mark.asyncio
    async def test_chat_completion_invalid_request_error(self, adapter):
        """Test handling of invalid request error."""
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {"error": {"message": "Invalid request"}}
        mock_response.text = "Invalid request"

        mock_error = httpx.HTTPStatusError(
            "Bad request",
            request=MagicMock(),
            response=mock_response,
        )

        mock_client = AsyncMock()
        mock_client.post.side_effect = mock_error

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            with pytest.raises(AIInvalidRequestError) as exc_info:
                await adapter.chat_completion(messages)

        assert exc_info.value.status_code == 400

    @pytest.mark.asyncio
    async def test_chat_completion_request_error(self, adapter):
        """Test handling of request error (network issues)."""
        mock_client = AsyncMock()
        mock_client.post.side_effect = httpx.RequestError("Connection failed")

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            with pytest.raises(AIAPIError) as exc_info:
                await adapter.chat_completion(messages)

        assert "Request failed" in exc_info.value.message

    @pytest.mark.asyncio
    async def test_health_check_success(self, adapter):
        """Test successful health check."""
        mock_response = MagicMock()
        mock_response.status_code = 200

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch.object(adapter, "_get_client", return_value=mock_client):
            result = await adapter.health_check()

        assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self, adapter):
        """Test failed health check."""
        mock_client = AsyncMock()
        mock_client.get.side_effect = Exception("Connection failed")

        with patch.object(adapter, "_get_client", return_value=mock_client):
            result = await adapter.health_check()

        assert result is False

    @pytest.mark.asyncio
    async def test_close(self, adapter):
        """Test closing the adapter."""
        mock_client = AsyncMock()
        mock_client.is_closed = False
        adapter._client = mock_client

        await adapter.close()

        mock_client.aclose.assert_called_once()


class TestDeepSeekAdapter:
    """Tests for DeepSeekAdapter class."""

    @pytest.fixture
    def adapter(self):
        """Create a DeepSeek adapter instance."""
        return DeepSeekAdapter(api_key="test-api-key")

    @pytest.fixture
    def mock_response_data(self):
        """Create mock API response data."""
        return {
            "id": "chatcmpl-test456",
            "object": "chat.completion",
            "created": 1234567890,
            "model": "deepseek-chat",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": "This is a test response from DeepSeek.",
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": 15,
                "completion_tokens": 25,
                "total_tokens": 40,
            },
        }

    def test_initialization(self, adapter):
        """Test adapter initialization."""
        assert adapter.api_key == "test-api-key"
        assert adapter.base_url == "https://api.deepseek.com/v1"
        assert adapter.model == "deepseek-chat"
        assert adapter.timeout == 60.0

    def test_initialization_with_custom_params(self):
        """Test adapter initialization with custom parameters."""
        adapter = DeepSeekAdapter(
            api_key="custom-key",
            base_url="https://custom.api.com",
            model="custom-model",
            timeout=45.0,
        )
        assert adapter.api_key == "custom-key"
        assert adapter.base_url == "https://custom.api.com"
        assert adapter.model == "custom-model"
        assert adapter.timeout == 45.0

    def test_model_enum(self, adapter):
        """Test model enum property."""
        assert adapter.model_enum == AIModel.DEEPSEEK

    @pytest.mark.asyncio
    async def test_chat_completion_success(self, adapter, mock_response_data):
        """Test successful chat completion."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response
        mock_client.is_closed = False

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            response = await adapter.chat_completion(messages)

        assert isinstance(response, AIResponse)
        assert response.content == "This is a test response from DeepSeek."
        assert response.model == AIModel.DEEPSEEK
        assert response.token_usage.total_tokens == 40
        assert response.finish_reason == "stop"

    @pytest.mark.asyncio
    async def test_chat_completion_with_stream_param(self, adapter, mock_response_data):
        """Test chat completion with stream parameter."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            response = await adapter.chat_completion(
                messages=messages,
                stream=True,
            )

        call_args = mock_client.post.call_args
        payload = call_args[1]["json"]
        assert payload["stream"] is True

    @pytest.mark.asyncio
    async def test_chat_completion_rate_limit_error(self, adapter):
        """Test handling of rate limit error."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.json.return_value = {"error": {"message": "Too many requests"}}
        mock_response.headers = {}
        mock_response.text = "Too many requests"

        mock_error = httpx.HTTPStatusError(
            "Rate limit",
            request=MagicMock(),
            response=mock_response,
        )

        mock_client = AsyncMock()
        mock_client.post.side_effect = mock_error

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            with pytest.raises(AIRateLimitError) as exc_info:
                await adapter.chat_completion(messages)

        assert exc_info.value.status_code == 429
        # When retry-after header is missing or empty, retry_after will be 0 or None
        assert exc_info.value.retry_after is None or exc_info.value.retry_after == 0

    @pytest.mark.asyncio
    async def test_chat_completion_server_error(self, adapter):
        """Test handling of server error (500)."""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json.return_value = {"error": {"message": "Internal server error"}}
        mock_response.text = "Internal server error"

        mock_error = httpx.HTTPStatusError(
            "Server error",
            request=MagicMock(),
            response=mock_response,
        )

        mock_client = AsyncMock()
        mock_client.post.side_effect = mock_error

        with patch.object(adapter, "_get_client", return_value=mock_client):
            messages = [{"role": "user", "content": "Hello"}]
            with pytest.raises(AIAPIError) as exc_info:
                await adapter.chat_completion(messages)

        assert exc_info.value.status_code == 500

    @pytest.mark.asyncio
    async def test_health_check_success(self, adapter):
        """Test successful health check."""
        mock_response = MagicMock()
        mock_response.status_code = 200

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch.object(adapter, "_get_client", return_value=mock_client):
            result = await adapter.health_check()

        assert result is True

    @pytest.mark.asyncio
    async def test_health_check_failure(self, adapter):
        """Test failed health check."""
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.RequestError("Connection failed")

        with patch.object(adapter, "_get_client", return_value=mock_client):
            result = await adapter.health_check()

        assert result is False

    @pytest.mark.asyncio
    async def test_close(self, adapter):
        """Test closing the adapter."""
        mock_client = AsyncMock()
        mock_client.is_closed = False
        adapter._client = mock_client

        await adapter.close()

        mock_client.aclose.assert_called_once()
