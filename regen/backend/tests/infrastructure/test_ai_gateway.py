"""Tests for AI Gateway base classes and exceptions."""

import pytest
from abc import ABC

from app.infrastructure.ai.gateway import (
    AIAPIError,
    AIAuthenticationError,
    AIGateway,
    AIInvalidRequestError,
    AIModel,
    AIRateLimitError,
    AIResponse,
    TokenUsage,
)


class TestAIModel:
    """Tests for AIModel enum."""

    def test_model_values(self):
        """Test that all models have correct values."""
        assert AIModel.KIMI.value == "kimi"
        assert AIModel.DEEPSEEK.value == "deepseek"
        assert AIModel.QWEN.value == "qwen"
        assert AIModel.GLM.value == "glm"

    def test_model_enum_comparison(self):
        """Test model enum comparison."""
        assert AIModel.KIMI == AIModel("kimi")
        assert AIModel.DEEPSEEK == AIModel("deepseek")


class TestTokenUsage:
    """Tests for TokenUsage dataclass."""

    def test_default_values(self):
        """Test default token usage values."""
        usage = TokenUsage()
        assert usage.prompt_tokens == 0
        assert usage.completion_tokens == 0
        assert usage.total_tokens == 0

    def test_custom_values(self):
        """Test custom token usage values."""
        usage = TokenUsage(
            prompt_tokens=100,
            completion_tokens=200,
            total_tokens=300,
        )
        assert usage.prompt_tokens == 100
        assert usage.completion_tokens == 200
        assert usage.total_tokens == 300


class TestAIResponse:
    """Tests for AIResponse dataclass."""

    def test_response_creation(self):
        """Test creating AI response."""
        token_usage = TokenUsage(prompt_tokens=10, completion_tokens=20, total_tokens=30)
        response = AIResponse(
            content="Test content",
            model=AIModel.KIMI,
            token_usage=token_usage,
            finish_reason="stop",
            raw_response={"id": "test-123"},
        )
        assert response.content == "Test content"
        assert response.model == AIModel.KIMI
        assert response.token_usage.total_tokens == 30
        assert response.finish_reason == "stop"
        assert response.raw_response == {"id": "test-123"}

    def test_response_optional_fields(self):
        """Test AI response with optional fields as None."""
        token_usage = TokenUsage()
        response = AIResponse(
            content="Test",
            model=AIModel.DEEPSEEK,
            token_usage=token_usage,
        )
        assert response.finish_reason is None
        assert response.raw_response is None


class TestAIGatewayAbstract:
    """Tests for AIGateway abstract base class."""

    def test_is_abstract(self):
        """Test that AIGateway is abstract."""
        assert issubclass(AIGateway, ABC)

    def test_cannot_instantiate_directly(self):
        """Test that AIGateway cannot be instantiated directly."""
        with pytest.raises(TypeError):
            AIGateway(api_key="test", base_url="http://test", model="test-model")


class ConcreteAIGateway(AIGateway):
    """Concrete implementation for testing abstract methods."""

    async def chat_completion(self, messages, temperature=0.7, max_tokens=None, **kwargs):
        return AIResponse(
            content="Test",
            model=self.model_enum,
            token_usage=TokenUsage(),
        )

    async def health_check(self):
        return True

    @property
    def model_enum(self):
        return AIModel.KIMI


class TestConcreteAIGateway:
    """Tests for concrete AI gateway implementation."""

    @pytest.fixture
    def gateway(self):
        """Create a concrete gateway instance."""
        return ConcreteAIGateway(
            api_key="test-key",
            base_url="https://api.test.com",
            model="test-model",
        )

    def test_initialization(self, gateway):
        """Test gateway initialization."""
        assert gateway.api_key == "test-key"
        assert gateway.base_url == "https://api.test.com"
        assert gateway.model == "test-model"

    @pytest.mark.asyncio
    async def test_chat_completion(self, gateway):
        """Test chat completion method."""
        messages = [{"role": "user", "content": "Hello"}]
        response = await gateway.chat_completion(messages)
        assert isinstance(response, AIResponse)
        assert response.content == "Test"

    @pytest.mark.asyncio
    async def test_health_check(self, gateway):
        """Test health check method."""
        result = await gateway.health_check()
        assert result is True

    def test_model_enum_property(self, gateway):
        """Test model enum property."""
        assert gateway.model_enum == AIModel.KIMI


class TestAIAPIError:
    """Tests for AIAPIError exception."""

    def test_basic_error(self):
        """Test basic error creation."""
        error = AIAPIError("Something went wrong")
        assert str(error) == "Something went wrong"
        assert error.message == "Something went wrong"
        assert error.model is None
        assert error.status_code is None
        assert error.raw_error is None

    def test_error_with_details(self):
        """Test error with all details."""
        error = AIAPIError(
            message="API failed",
            model=AIModel.KIMI,
            status_code=500,
            raw_error={"detail": "Internal error"},
        )
        assert error.message == "API failed"
        assert error.model == AIModel.KIMI
        assert error.status_code == 500
        assert error.raw_error == {"detail": "Internal error"}


class TestAIRateLimitError:
    """Tests for AIRateLimitError exception."""

    def test_default_message(self):
        """Test default error message."""
        error = AIRateLimitError()
        assert error.message == "Rate limit exceeded"
        assert error.status_code == 429
        assert error.retry_after is None

    def test_custom_retry_after(self):
        """Test error with retry after."""
        error = AIRateLimitError(
            message="Too many requests",
            model=AIModel.DEEPSEEK,
            retry_after=60,
        )
        assert error.message == "Too many requests"
        assert error.model == AIModel.DEEPSEEK
        assert error.status_code == 429
        assert error.retry_after == 60


class TestAIAuthenticationError:
    """Tests for AIAuthenticationError exception."""

    def test_default_message(self):
        """Test default error message."""
        error = AIAuthenticationError()
        assert error.message == "Authentication failed"
        assert error.status_code == 401

    def test_custom_message(self):
        """Test custom error message."""
        error = AIAuthenticationError(
            message="Invalid API key",
            model=AIModel.KIMI,
        )
        assert error.message == "Invalid API key"
        assert error.model == AIModel.KIMI
        assert error.status_code == 401


class TestAIInvalidRequestError:
    """Tests for AIInvalidRequestError exception."""

    def test_default_message(self):
        """Test default error message."""
        error = AIInvalidRequestError()
        assert error.message == "Invalid request"
        assert error.status_code == 400

    def test_custom_message(self):
        """Test custom error message."""
        error = AIInvalidRequestError(
            message="Missing required field",
            model=AIModel.DEEPSEEK,
        )
        assert error.message == "Missing required field"
        assert error.model == AIModel.DEEPSEEK
        assert error.status_code == 400


class TestErrorInheritance:
    """Tests for error class inheritance."""

    def test_rate_limit_inheritance(self):
        """Test AIRateLimitError inherits from AIAPIError."""
        error = AIRateLimitError()
        assert isinstance(error, AIAPIError)
        assert isinstance(error, Exception)

    def test_authentication_inheritance(self):
        """Test AIAuthenticationError inherits from AIAPIError."""
        error = AIAuthenticationError()
        assert isinstance(error, AIAPIError)
        assert isinstance(error, Exception)

    def test_invalid_request_inheritance(self):
        """Test AIInvalidRequestError inherits from AIAPIError."""
        error = AIInvalidRequestError()
        assert isinstance(error, AIAPIError)
        assert isinstance(error, Exception)
