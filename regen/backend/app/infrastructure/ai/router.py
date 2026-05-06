"""AI Request Router with fallback and circuit breaker pattern."""

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from app.infrastructure.ai.deepseek_adapter import DeepSeekAdapter
from app.infrastructure.ai.gateway import (
    AIAPIError,
    AIGateway,
    AIModel,
    AIRateLimitError,
    AIResponse,
)
from app.infrastructure.ai.kimi_adapter import KimiAdapter
from app.infrastructure.logging import get_logger

logger = get_logger()


@dataclass
class CircuitBreakerState:
    """Circuit breaker state for a model."""

    failures: int = 0
    last_failure_time: Optional[float] = None
    is_open: bool = False

    # Circuit breaker thresholds
    FAILURE_THRESHOLD: int = 5
    RECOVERY_TIMEOUT: float = 60.0  # seconds

    def record_failure(self) -> None:
        """Record a failure and check if circuit should open."""
        self.failures += 1
        self.last_failure_time = time.time()

        if self.failures >= self.FAILURE_THRESHOLD:
            self.is_open = True
            logger.warning(
                "Circuit breaker opened",
                extra={"failures": self.failures},
            )

    def record_success(self) -> None:
        """Record a success and reset circuit."""
        if self.failures > 0:
            logger.info(
                "Circuit breaker reset after success",
                extra={"previous_failures": self.failures},
            )
        self.failures = 0
        self.last_failure_time = None
        self.is_open = False

    def can_attempt(self) -> bool:
        """Check if request can be attempted.

        Returns:
            True if circuit is closed or recovery timeout has passed.
        """
        if not self.is_open:
            return True

        # Check if recovery timeout has passed
        if self.last_failure_time and (
            time.time() - self.last_failure_time > self.RECOVERY_TIMEOUT
        ):
            logger.info("Circuit breaker entering half-open state")
            self.is_open = False
            self.failures = 0
            return True

        return False


@dataclass
class RouterMetrics:
    """Metrics for AI request routing."""

    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    fallback_count: int = 0
    token_usage: Dict[AIModel, int] = field(default_factory=dict)
    response_times: List[float] = field(default_factory=list)

    def record_request(
        self,
        success: bool,
        model: AIModel,
        tokens: int,
        response_time: float,
        is_fallback: bool = False,
    ) -> None:
        """Record request metrics."""
        self.total_requests += 1

        if success:
            self.successful_requests += 1
        else:
            self.failed_requests += 1

        if is_fallback:
            self.fallback_count += 1

        # Track token usage per model
        self.token_usage[model] = self.token_usage.get(model, 0) + tokens

        # Track response times (keep last 100)
        self.response_times.append(response_time)
        if len(self.response_times) > 100:
            self.response_times.pop(0)

    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        if self.total_requests == 0:
            return 1.0
        return self.successful_requests / self.total_requests

    @property
    def avg_response_time(self) -> float:
        """Calculate average response time."""
        if not self.response_times:
            return 0.0
        return sum(self.response_times) / len(self.response_times)


class AIRequestRouter:
    """Router for AI requests with fallback and circuit breaker support.

    This class manages multiple AI model adapters and routes requests
    to available models with automatic fallback on failure.
    """

    # Default priority order for models
    DEFAULT_PRIORITY = [AIModel.KIMI, AIModel.DEEPSEEK, AIModel.QWEN, AIModel.GLM]

    def __init__(
        self,
        adapters: Dict[AIModel, AIGateway],
        priority_order: Optional[List[AIModel]] = None,
    ):
        """Initialize AI request router.

        Args:
            adapters: Dictionary mapping AIModel to adapter instances.
            priority_order: Optional custom priority order for fallback.
        """
        self.adapters = adapters
        self.priority_order = priority_order or self.DEFAULT_PRIORITY

        # Circuit breaker states for each model
        self.circuit_breakers: Dict[AIModel, CircuitBreakerState] = {
            model: CircuitBreakerState() for model in self.adapters.keys()
        }

        # Metrics tracking
        self.metrics = RouterMetrics()

        logger.info(
            "AI Request Router initialized",
            extra={
                "models": [m.value for m in self.adapters.keys()],
                "priority": [m.value for m in self.priority_order],
            },
        )

    async def route_request(
        self,
        messages: List[Dict[str, str]],
        preferred_model: Optional[AIModel] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> AIResponse:
        """Route request to AI model with automatic fallback.

        Args:
            messages: List of message dictionaries.
            preferred_model: Preferred model to use (optional).
            temperature: Sampling temperature.
            max_tokens: Maximum tokens to generate.
            **kwargs: Additional parameters for the adapter.

        Returns:
            AIResponse from successful model.

        Raises:
            AIAPIError: If all models fail.
        """
        start_time = time.time()

        # Determine model order
        models_to_try = self._get_model_order(preferred_model)

        last_error: Optional[AIAPIError] = None

        for idx, model in enumerate(models_to_try):
            is_fallback = idx > 0

            # Check circuit breaker
            if not self.circuit_breakers[model].can_attempt():
                logger.warning(
                    "Circuit breaker open, skipping model",
                    extra={"model": model.value},
                )
                continue

            # Check if adapter exists
            if model not in self.adapters:
                logger.warning(
                    "Adapter not configured for model",
                    extra={"model": model.value},
                )
                continue

            adapter = self.adapters[model]

            try:
                logger.debug(
                    "Attempting request",
                    extra={
                        "model": model.value,
                        "is_fallback": is_fallback,
                    },
                )

                response = await adapter.chat_completion(
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    **kwargs,
                )

                # Record success
                self.circuit_breakers[model].record_success()

                response_time = time.time() - start_time
                self.metrics.record_request(
                    success=True,
                    model=model,
                    tokens=response.token_usage.total_tokens,
                    response_time=response_time,
                    is_fallback=is_fallback,
                )

                logger.info(
                    "Request successful",
                    extra={
                        "model": model.value,
                        "is_fallback": is_fallback,
                        "response_time_ms": round(response_time * 1000, 2),
                        "tokens": response.token_usage.total_tokens,
                    },
                )

                return response

            except AIRateLimitError as e:
                # Rate limit - record failure but try next model
                logger.warning(
                    "Rate limit hit, trying next model",
                    extra={
                        "model": model.value,
                        "retry_after": e.retry_after,
                    },
                )
                self.circuit_breakers[model].record_failure()
                last_error = e

            except AIAPIError as e:
                # API error - record failure and try next model
                logger.warning(
                    "Request failed, trying next model",
                    extra={
                        "model": model.value,
                        "error": e.message,
                        "status_code": e.status_code,
                    },
                )
                self.circuit_breakers[model].record_failure()
                last_error = e

            except Exception as e:
                # Unexpected error
                logger.error(
                    "Unexpected error during request",
                    extra={
                        "model": model.value,
                        "error": str(e),
                    },
                )
                self.circuit_breakers[model].record_failure()
                last_error = AIAPIError(
                    message=f"Unexpected error: {str(e)}",
                    model=model,
                )

        # All models failed
        response_time = time.time() - start_time
        self.metrics.record_request(
            success=False,
            model=preferred_model or AIModel.KIMI,
            tokens=0,
            response_time=response_time,
            is_fallback=False,
        )

        logger.error(
            "All models failed",
            extra={
                "models_tried": [m.value for m in models_to_try],
                "response_time_ms": round(response_time * 1000, 2),
            },
        )

        raise last_error or AIAPIError(
            message="All AI models failed to respond",
            model=preferred_model,
        )

    def _get_model_order(self, preferred_model: Optional[AIModel]) -> List[AIModel]:
        """Determine the order of models to try.

        Args:
            preferred_model: Optional preferred model.

        Returns:
            List of models in priority order.
        """
        if preferred_model and preferred_model in self.adapters:
            # Put preferred model first, then others in priority order
            order = [preferred_model]
            for model in self.priority_order:
                if model != preferred_model and model in self.adapters:
                    order.append(model)
            return order

        # Use default priority order, filtering to available adapters
        return [m for m in self.priority_order if m in self.adapters]

    async def health_check(self) -> Dict[AIModel, bool]:
        """Check health of all configured adapters.

        Returns:
            Dictionary mapping models to health status.
        """
        results: Dict[AIModel, bool] = {}

        for model, adapter in self.adapters.items():
            try:
                healthy = await adapter.health_check()
                results[model] = healthy

                # Reset circuit breaker if healthy
                if healthy and self.circuit_breakers[model].is_open:
                    self.circuit_breakers[model].record_success()

            except Exception as e:
                logger.warning(
                    "Health check failed",
                    extra={"model": model.value, "error": str(e)},
                )
                results[model] = False

        return results

    def get_metrics(self) -> Dict[str, Any]:
        """Get current router metrics.

        Returns:
            Dictionary with metrics data.
        """
        circuit_states = {
            model.value: {
                "is_open": cb.is_open,
                "failures": cb.failures,
            }
            for model, cb in self.circuit_breakers.items()
        }

        return {
            "total_requests": self.metrics.total_requests,
            "successful_requests": self.metrics.successful_requests,
            "failed_requests": self.metrics.failed_requests,
            "success_rate": round(self.metrics.success_rate * 100, 2),
            "fallback_count": self.metrics.fallback_count,
            "avg_response_time_ms": round(self.metrics.avg_response_time * 1000, 2),
            "token_usage": {
                model.value: tokens
                for model, tokens in self.metrics.token_usage.items()
            },
            "circuit_breakers": circuit_states,
        }

    async def close(self) -> None:
        """Close all adapter connections."""
        close_tasks = []

        for adapter in self.adapters.values():
            if hasattr(adapter, "close"):
                close_tasks.append(adapter.close())

        if close_tasks:
            await asyncio.gather(*close_tasks, return_exceptions=True)


def create_router_from_config(
    kimi_api_key: Optional[str] = None,
    deepseek_api_key: Optional[str] = None,
    qwen_api_key: Optional[str] = None,
    glm_api_key: Optional[str] = None,
    priority_order: Optional[List[AIModel]] = None,
) -> AIRequestRouter:
    """Create AI request router from configuration.

    Args:
        kimi_api_key: API key for Kimi/Moonshot.
        deepseek_api_key: API key for DeepSeek.
        qwen_api_key: API key for Qwen (optional).
        glm_api_key: API key for GLM (optional).
        priority_order: Optional custom priority order.

    Returns:
        Configured AIRequestRouter instance.

    Raises:
        ValueError: If no adapters are configured.
    """
    adapters: Dict[AIModel, AIGateway] = {}

    if kimi_api_key:
        adapters[AIModel.KIMI] = KimiAdapter(api_key=kimi_api_key)

    if deepseek_api_key:
        adapters[AIModel.DEEPSEEK] = DeepSeekAdapter(api_key=deepseek_api_key)

    # TODO: Add Qwen and GLM adapters when implemented
    # if qwen_api_key:
    #     adapters[AIModel.QWEN] = QwenAdapter(api_key=qwen_api_key)
    # if glm_api_key:
    #     adapters[AIModel.GLM] = GLMAdapter(api_key=glm_api_key)

    if not adapters:
        raise ValueError(
            "At least one AI adapter must be configured. "
            "Provide API keys via environment variables."
        )

    return AIRequestRouter(adapters=adapters, priority_order=priority_order)
