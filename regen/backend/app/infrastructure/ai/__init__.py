"""AI infrastructure layer - Multi-model AI gateway for resume generation."""

from typing import Optional

from app.infrastructure.ai.deepseek_adapter import DeepSeekAdapter
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
from app.infrastructure.ai.kimi_adapter import KimiAdapter
from app.infrastructure.ai.router import (
    AIRequestRouter,
    CircuitBreakerState,
    RouterMetrics,
    create_router_from_config,
)

# Router singleton instance
_router_instance: Optional[AIRequestRouter] = None


def get_ai_router() -> AIRequestRouter:
    """Get or create AI router instance.

    This function creates a singleton AIRequestRouter instance
    using configuration from environment variables.

    Returns:
        Configured AIRequestRouter instance.

    Raises:
        ValueError: If AI router is not properly configured.
    """
    global _router_instance

    if _router_instance is None:
        from app.config import get_settings

        settings = get_settings()

        # Get API keys from settings (will be added to config.py)
        kimi_key = getattr(settings, "kimi_api_key", None)
        deepseek_key = getattr(settings, "deepseek_api_key", None)
        qwen_key = getattr(settings, "qwen_api_key", None)
        glm_key = getattr(settings, "glm_api_key", None)

        _router_instance = create_router_from_config(
            kimi_api_key=kimi_key,
            deepseek_api_key=deepseek_key,
            qwen_api_key=qwen_key,
            glm_api_key=glm_key,
        )

    return _router_instance


def reset_ai_router() -> None:
    """Reset the AI router singleton (useful for testing)."""
    global _router_instance
    _router_instance = None


__all__ = [
    # Gateway
    "AIGateway",
    "AIModel",
    "AIResponse",
    "TokenUsage",
    # Exceptions
    "AIAPIError",
    "AIRateLimitError",
    "AIAuthenticationError",
    "AIInvalidRequestError",
    # Adapters
    "KimiAdapter",
    "DeepSeekAdapter",
    # Router
    "AIRequestRouter",
    "CircuitBreakerState",
    "RouterMetrics",
    "create_router_from_config",
    # Factory
    "get_ai_router",
    "reset_ai_router",
]
