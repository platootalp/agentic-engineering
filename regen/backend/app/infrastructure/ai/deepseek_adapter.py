"""DeepSeek AI adapter implementation."""

from typing import Any, Dict, List, Optional

import httpx

from app.infrastructure.ai.gateway import (
    AIAPIError,
    AIAuthenticationError,
    AIGateway,
    AIModel,
    AIInvalidRequestError,
    AIRateLimitError,
    AIResponse,
    TokenUsage,
)
from app.infrastructure.logging import get_logger

logger = get_logger()


class DeepSeekAdapter(AIGateway):
    """Adapter for DeepSeek AI API.

    Uses the DeepSeek API for chat completions.
    Documentation: https://platform.deepseek.com/docs
    """

    DEFAULT_BASE_URL = "https://api.deepseek.com/v1"
    DEFAULT_MODEL = "deepseek-chat"

    def __init__(
        self,
        api_key: str,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = 60.0,
    ):
        """Initialize DeepSeek adapter.

        Args:
            api_key: DeepSeek API key.
            base_url: Optional custom base URL.
            model: Optional model identifier (default: deepseek-chat).
            timeout: Request timeout in seconds.
        """
        super().__init__(
            api_key=api_key,
            base_url=base_url or self.DEFAULT_BASE_URL,
            model=model or self.DEFAULT_MODEL,
        )
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                timeout=self.timeout,
            )
        return self._client

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> AIResponse:
        """Execute chat completion via DeepSeek API.

        Args:
            messages: List of message dicts with 'role' and 'content'.
            temperature: Sampling temperature (0.0 to 2.0).
            max_tokens: Maximum tokens to generate.
            **kwargs: Additional parameters like 'top_p', 'presence_penalty', etc.

        Returns:
            Standardized AIResponse.

        Raises:
            AIAPIError: If API request fails.
            AIRateLimitError: If rate limit exceeded.
        """
        client = await self._get_client()

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
        }

        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        # Add optional parameters
        for key in ["top_p", "presence_penalty", "frequency_penalty", "stream"]:
            if key in kwargs:
                payload[key] = kwargs[key]

        try:
            logger.debug(
                "Sending request to DeepSeek API",
                extra={
                    "model": self.model,
                    "message_count": len(messages),
                    "temperature": temperature,
                },
            )

            response = await client.post("/chat/completions", json=payload)
            response.raise_for_status()

            data = response.json()

            # Extract response content
            choice = data["choices"][0]
            content = choice["message"]["content"]
            finish_reason = choice.get("finish_reason")

            # Extract token usage
            usage_data = data.get("usage", {})
            token_usage = TokenUsage(
                prompt_tokens=usage_data.get("prompt_tokens", 0),
                completion_tokens=usage_data.get("completion_tokens", 0),
                total_tokens=usage_data.get("total_tokens", 0),
            )

            logger.debug(
                "Received response from DeepSeek API",
                extra={
                    "model": self.model,
                    "total_tokens": token_usage.total_tokens,
                    "finish_reason": finish_reason,
                },
            )

            return AIResponse(
                content=content,
                model=AIModel.DEEPSEEK,
                token_usage=token_usage,
                finish_reason=finish_reason,
                raw_response=data,
            )

        except httpx.HTTPStatusError as e:
            await self._handle_http_error(e)
        except httpx.RequestError as e:
            logger.error(
                "DeepSeek API request failed",
                extra={"error": str(e), "model": self.model},
            )
            raise AIAPIError(
                message=f"Request failed: {str(e)}",
                model=AIModel.DEEPSEEK,
            )

    async def _handle_http_error(self, error: httpx.HTTPStatusError) -> None:
        """Handle HTTP errors from DeepSeek API.

        Args:
            error: HTTP status error from httpx.

        Raises:
            Appropriate AIAPIError subclass based on status code.
        """
        status_code = error.response.status_code

        try:
            error_data = error.response.json()
            error_message = error_data.get("error", {}).get("message", "Unknown error")
        except Exception:
            error_message = error.response.text or "Unknown error"

        logger.error(
            "DeepSeek API error",
            extra={
                "status_code": status_code,
                "error": error_message,
                "model": self.model,
            },
        )

        if status_code == 429:
            retry_after = None
            try:
                retry_after = int(error.response.headers.get("retry-after", 0))
            except (ValueError, TypeError):
                pass

            raise AIRateLimitError(
                message=f"Rate limit exceeded: {error_message}",
                model=AIModel.DEEPSEEK,
                retry_after=retry_after,
            )
        elif status_code == 401:
            raise AIAuthenticationError(
                message=f"Authentication failed: {error_message}",
                model=AIModel.DEEPSEEK,
            )
        elif status_code == 400:
            raise AIInvalidRequestError(
                message=f"Invalid request: {error_message}",
                model=AIModel.DEEPSEEK,
            )
        else:
            raise AIAPIError(
                message=f"API error ({status_code}): {error_message}",
                model=AIModel.DEEPSEEK,
                status_code=status_code,
                raw_error={"response": error_message},
            )

    async def health_check(self) -> bool:
        """Check if DeepSeek API is accessible.

        Returns:
            True if API is healthy, False otherwise.
        """
        try:
            client = await self._get_client()
            # Use models endpoint as health check
            response = await client.get("/models", timeout=10.0)
            return response.status_code == 200
        except Exception as e:
            logger.warning(
                "DeepSeek health check failed",
                extra={"error": str(e)},
            )
            return False

    @property
    def model_enum(self) -> AIModel:
        """Return AIModel enum for DeepSeek."""
        return AIModel.DEEPSEEK

    async def close(self) -> None:
        """Close HTTP client connection."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
