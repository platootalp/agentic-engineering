"""AI Gateway abstract base class and model definitions."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional


class AIModel(Enum):
    """Supported AI models."""

    KIMI = "kimi"
    DEEPSEEK = "deepseek"
    QWEN = "qwen"
    GLM = "glm"


@dataclass
class TokenUsage:
    """Token usage information from AI response."""

    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


@dataclass
class AIResponse:
    """Standardized AI response structure."""

    content: str
    model: AIModel
    token_usage: TokenUsage
    finish_reason: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None


class AIGateway(ABC):
    """Abstract base class for AI model adapters.

    This class defines the interface that all AI model adapters must implement.
    It follows the Port/Adapter pattern from Hexagonal Architecture.
    """

    def __init__(self, api_key: str, base_url: str, model: str):
        """Initialize the AI gateway.

        Args:
            api_key: API key for authentication.
            base_url: Base URL for the API endpoint.
            model: Model identifier string.
        """
        self.api_key = api_key
        self.base_url = base_url
        self.model = model

    @abstractmethod
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> AIResponse:
        """Execute a chat completion request.

        Args:
            messages: List of message dictionaries with 'role' and 'content' keys.
            temperature: Sampling temperature (0.0 to 2.0).
            max_tokens: Maximum tokens to generate.
            **kwargs: Additional provider-specific parameters.

        Returns:
            Standardized AIResponse object.

        Raises:
            AIAPIError: If the API request fails.
            AIRateLimitError: If rate limit is exceeded.
        """
        pass

    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the AI service is healthy and accessible.

        Returns:
            True if the service is healthy, False otherwise.
        """
        pass

    @property
    @abstractmethod
    def model_enum(self) -> AIModel:
        """Return the AIModel enum value for this adapter."""
        pass


class AIAPIError(Exception):
    """Base exception for AI API errors."""

    def __init__(
        self,
        message: str,
        model: Optional[AIModel] = None,
        status_code: Optional[int] = None,
        raw_error: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.model = model
        self.status_code = status_code
        self.raw_error = raw_error


class AIRateLimitError(AIAPIError):
    """Exception raised when rate limit is exceeded."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        model: Optional[AIModel] = None,
        retry_after: Optional[int] = None,
    ):
        super().__init__(message, model, status_code=429)
        self.retry_after = retry_after


class AIAuthenticationError(AIAPIError):
    """Exception raised when authentication fails."""

    def __init__(
        self,
        message: str = "Authentication failed",
        model: Optional[AIModel] = None,
    ):
        super().__init__(message, model, status_code=401)


class AIInvalidRequestError(AIAPIError):
    """Exception raised when request is invalid."""

    def __init__(
        self,
        message: str = "Invalid request",
        model: Optional[AIModel] = None,
    ):
        super().__init__(message, model, status_code=400)
