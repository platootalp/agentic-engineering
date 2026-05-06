"""Tests for AI Router with circuit breaker and fallback logic."""

import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.infrastructure.ai.gateway import (
    AIAPIError,
    AIGateway,
    AIModel,
    AIRateLimitError,
    AIResponse,
    TokenUsage,
)
from app.infrastructure.ai.router import (
    CircuitBreakerState,
    RouterMetrics,
    AIRequestRouter,
    create_router_from_config,
)


class TestCircuitBreakerState:
    """Tests for CircuitBreakerState class."""

    @pytest.fixture
    def circuit(self):
        """Create a fresh circuit breaker state."""
        return CircuitBreakerState()

    def test_initial_state(self, circuit):
        """Test initial circuit breaker state."""
        assert circuit.failures == 0
        assert circuit.last_failure_time is None
        assert circuit.is_open is False

    def test_record_failure(self, circuit):
        """Test recording failures."""
        circuit.record_failure()
        assert circuit.failures == 1
        assert circuit.last_failure_time is not None
        assert circuit.is_open is False

    def test_circuit_opens_after_threshold(self, circuit):
        """Test circuit opens after failure threshold."""
        threshold = circuit.FAILURE_THRESHOLD

        for _ in range(threshold):
            circuit.record_failure()

        assert circuit.is_open is True
        assert circuit.failures == threshold

    def test_record_success_resets_circuit(self, circuit):
        """Test success resets circuit breaker."""
        for _ in range(circuit.FAILURE_THRESHOLD):
            circuit.record_failure()
        assert circuit.is_open is True

        circuit.record_success()
        assert circuit.failures == 0
        assert circuit.is_open is False
        assert circuit.last_failure_time is None

    def test_can_attempt_when_closed(self, circuit):
        """Test can_attempt returns True when circuit is closed."""
        assert circuit.can_attempt() is True

    def test_can_attempt_when_open(self, circuit):
        """Test can_attempt returns False when circuit is open."""
        for _ in range(circuit.FAILURE_THRESHOLD):
            circuit.record_failure()
        assert circuit.can_attempt() is False

    def test_can_attempt_after_recovery_timeout(self, circuit):
        """Test can_attempt returns True after recovery timeout."""
        for _ in range(circuit.FAILURE_THRESHOLD):
            circuit.record_failure()
        assert circuit.can_attempt() is False

        circuit.last_failure_time = time.time() - circuit.RECOVERY_TIMEOUT - 1
        assert circuit.can_attempt() is True
        assert circuit.is_open is False


class TestRouterMetrics:
    """Tests for RouterMetrics class."""

    @pytest.fixture
    def metrics(self):
        """Create fresh metrics instance."""
        return RouterMetrics()

    def test_initial_state(self, metrics):
        """Test initial metrics state."""
        assert metrics.total_requests == 0
        assert metrics.successful_requests == 0
        assert metrics.failed_requests == 0
        assert metrics.fallback_count == 0
        assert metrics.token_usage == {}
        assert metrics.response_times == []

    def test_record_successful_request(self, metrics):
        """Test recording a successful request."""
        metrics.record_request(
            success=True,
            model=AIModel.KIMI,
            tokens=100,
            response_time=0.5,
            is_fallback=False,
        )

        assert metrics.total_requests == 1
        assert metrics.successful_requests == 1
        assert metrics.token_usage[AIModel.KIMI] == 100

    def test_record_failed_request(self, metrics):
        """Test recording a failed request."""
        metrics.record_request(
            success=False,
            model=AIModel.DEEPSEEK,
            tokens=0,
            response_time=1.0,
            is_fallback=False,
        )

        assert metrics.total_requests == 1
        assert metrics.failed_requests == 1

    def test_record_fallback_request(self, metrics):
        """Test recording a fallback request."""
        metrics.record_request(
            success=True,
            model=AIModel.DEEPSEEK,
            tokens=50,
            response_time=0.3,
            is_fallback=True,
        )

        assert metrics.fallback_count == 1

    def test_success_rate_calculation(self, metrics):
        """Test success rate calculation."""
        assert metrics.success_rate == 1.0

        metrics.record_request(True, AIModel.KIMI, 10, 0.1)
        metrics.record_request(True, AIModel.KIMI, 10, 0.1)
        assert metrics.success_rate == 1.0

        metrics.record_request(False, AIModel.KIMI, 0, 0.1)
        assert metrics.success_rate == 2 / 3

    def test_avg_response_time(self, metrics):
        """Test average response time calculation."""
        assert metrics.avg_response_time == 0.0

        metrics.record_request(True, AIModel.KIMI, 10, 0.5)
        metrics.record_request(True, AIModel.KIMI, 10, 1.5)
        assert metrics.avg_response_time == 1.0

    def test_response_time_limit(self, metrics):
        """Test that response times list is limited to 100 entries."""
        for i in range(150):
            metrics.record_request(True, AIModel.KIMI, 10, float(i))

        assert len(metrics.response_times) == 100
        assert metrics.response_times[0] == 50.0
        assert metrics.response_times[-1] == 149.0


class MockAdapter(AIGateway):
    """Mock adapter for testing."""

    def __init__(self, model_enum_val, should_fail=False, fail_with_rate_limit=False):
        super().__init__("test-key", "https://api.test.com", "test-model")
        self._model_enum = model_enum_val
        self.should_fail = should_fail
        self.fail_with_rate_limit = fail_with_rate_limit
        self.call_count = 0

    async def chat_completion(self, messages, temperature=0.7, max_tokens=None, **kwargs):
        self.call_count += 1
        if self.should_fail:
            if self.fail_with_rate_limit:
                raise AIRateLimitError("Rate limited", model=self._model_enum)
            raise AIAPIError("API Error", model=self._model_enum)
        return AIResponse(
            content="Test response",
            model=self._model_enum,
            token_usage=TokenUsage(prompt_tokens=10, completion_tokens=20, total_tokens=30),
        )

    async def health_check(self):
        return not self.should_fail

    @property
    def model_enum(self):
        return self._model_enum


class TestAIRequestRouter:
    """Tests for AIRequestRouter class."""

    @pytest.fixture
    def mock_adapters(self):
        """Create mock adapters."""
        return {
            AIModel.KIMI: MockAdapter(AIModel.KIMI),
            AIModel.DEEPSEEK: MockAdapter(AIModel.DEEPSEEK),
        }

    @pytest.fixture
    def router(self, mock_adapters):
        """Create router with mock adapters."""
        return AIRequestRouter(adapters=mock_adapters)

    @pytest.mark.asyncio
    async def test_route_request_success(self, router, mock_adapters):
        """Test successful request routing."""
        messages = [{"role": "user", "content": "Hello"}]
        response = await router.route_request(messages)

        assert isinstance(response, AIResponse)
        assert response.content == "Test response"
        assert mock_adapters[AIModel.KIMI].call_count == 1

    @pytest.mark.asyncio
    async def test_route_request_with_preferred_model(self, router, mock_adapters):
        """Test routing with preferred model."""
        messages = [{"role": "user", "content": "Hello"}]
        response = await router.route_request(messages, preferred_model=AIModel.DEEPSEEK)

        assert response.model == AIModel.DEEPSEEK
        assert mock_adapters[AIModel.DEEPSEEK].call_count == 1
        assert mock_adapters[AIModel.KIMI].call_count == 0

    @pytest.mark.asyncio
    async def test_route_request_fallback(self, mock_adapters):
        """Test fallback to next model on failure."""
        mock_adapters[AIModel.KIMI].should_fail = True
        router = AIRequestRouter(adapters=mock_adapters)

        messages = [{"role": "user", "content": "Hello"}]
        response = await router.route_request(messages)

        assert response.model == AIModel.DEEPSEEK
        assert mock_adapters[AIModel.KIMI].call_count == 1
        assert mock_adapters[AIModel.DEEPSEEK].call_count == 1

    @pytest.mark.asyncio
    async def test_route_request_all_fail(self, mock_adapters):
        """Test exception when all models fail."""
        mock_adapters[AIModel.KIMI].should_fail = True
        mock_adapters[AIModel.DEEPSEEK].should_fail = True
        router = AIRequestRouter(adapters=mock_adapters)

        messages = [{"role": "user", "content": "Hello"}]
        with pytest.raises(AIAPIError):
            await router.route_request(messages)

    @pytest.mark.asyncio
    async def test_circuit_breaker_opens_after_failures(self, router, mock_adapters):
        """Test circuit breaker opens after threshold failures."""
        mock_adapters[AIModel.KIMI].should_fail = True

        messages = [{"role": "user", "content": "Hello"}]

        # Trigger failures to open circuit
        for _ in range(5):
            try:
                await router.route_request(messages)
            except AIAPIError:
                pass

        # Circuit should be open now
        assert router.circuit_breakers[AIModel.KIMI].is_open is True

    @pytest.mark.asyncio
    async def test_skips_open_circuit(self, mock_adapters):
        """Test that open circuits are skipped."""
        # Open Kimi circuit
        mock_adapters[AIModel.KIMI].should_fail = True
        router = AIRequestRouter(adapters=mock_adapters)
        router.circuit_breakers[AIModel.KIMI].is_open = True

        messages = [{"role": "user", "content": "Hello"}]
        response = await router.route_request(messages)

        # Should use DeepSeek directly
        assert response.model == AIModel.DEEPSEEK
        assert mock_adapters[AIModel.KIMI].call_count == 0

    @pytest.mark.asyncio
    async def test_health_check(self, router, mock_adapters):
        """Test health check functionality."""
        results = await router.health_check()

        assert results[AIModel.KIMI] is True
        assert results[AIModel.DEEPSEEK] is True

    @pytest.mark.asyncio
    async def test_health_check_with_unhealthy(self, mock_adapters):
        """Test health check with unhealthy adapter."""
        mock_adapters[AIModel.KIMI].should_fail = True
        router = AIRequestRouter(adapters=mock_adapters)

        results = await router.health_check()

        assert results[AIModel.KIMI] is False
        assert results[AIModel.DEEPSEEK] is True

    def test_get_metrics(self, router):
        """Test getting router metrics."""
        metrics = router.get_metrics()

        assert "total_requests" in metrics
        assert "successful_requests" in metrics
        assert "failed_requests" in metrics
        assert "success_rate" in metrics
        assert "circuit_breakers" in metrics

    def test_get_model_order_with_preferred(self, router):
        """Test model ordering with preferred model."""
        order = router._get_model_order(AIModel.DEEPSEEK)

        assert order[0] == AIModel.DEEPSEEK
        assert AIModel.KIMI in order

    def test_get_model_order_without_preferred(self, router):
        """Test model ordering without preferred model."""
        order = router._get_model_order(None)

        assert AIModel.KIMI in order
        assert AIModel.DEEPSEEK in order

    @pytest.mark.asyncio
    async def test_close(self, mock_adapters):
        """Test closing all adapters."""
        router = AIRequestRouter(adapters=mock_adapters)
        await router.close()


class TestCreateRouterFromConfig:
    """Tests for create_router_from_config function."""

    def test_create_with_kimi_only(self):
        """Test creating router with only Kimi."""
        router = create_router_from_config(kimi_api_key="test-kimi-key")

        assert AIModel.KIMI in router.adapters
        assert len(router.adapters) == 1

    def test_create_with_deepseek_only(self):
        """Test creating router with only DeepSeek."""
        router = create_router_from_config(deepseek_api_key="test-deepseek-key")

        assert AIModel.DEEPSEEK in router.adapters
        assert len(router.adapters) == 1

    def test_create_with_both(self):
        """Test creating router with both adapters."""
        router = create_router_from_config(
            kimi_api_key="test-kimi-key",
            deepseek_api_key="test-deepseek-key",
        )

        assert AIModel.KIMI in router.adapters
        assert AIModel.DEEPSEEK in router.adapters
        assert len(router.adapters) == 2

    def test_create_with_custom_priority(self):
        """Test creating router with custom priority order."""
        router = create_router_from_config(
            kimi_api_key="test-kimi-key",
            deepseek_api_key="test-deepseek-key",
            priority_order=[AIModel.DEEPSEEK, AIModel.KIMI],
        )

        assert router.priority_order[0] == AIModel.DEEPSEEK

    def test_create_with_no_keys_raises_error(self):
        """Test that error is raised when no API keys provided."""
        with pytest.raises(ValueError, match="At least one AI adapter"):
            create_router_from_config()

    def test_create_with_empty_keys_raises_error(self):
        """Test that error is raised with empty string keys."""
        with pytest.raises(ValueError, match="At least one AI adapter"):
            create_router_from_config(kimi_api_key="", deepseek_api_key="")
