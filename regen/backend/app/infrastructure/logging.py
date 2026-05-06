"""Loguru logging configuration."""

import sys
from typing import Any, Dict

from loguru import logger

from app.config import Settings, get_settings


class InterceptHandler:
    """Intercept standard logging and redirect to loguru."""

    def write(self, message: str) -> None:
        """Write message to loguru."""
        if message.strip():
            logger.info(message.strip())

    def flush(self) -> None:
        """Flush handler."""
        pass


def setup_logging(settings: Settings | None = None) -> None:
    """Configure loguru logging.

    Args:
        settings: Application settings. If None, loads from environment.
    """
    if settings is None:
        settings = get_settings()

    # Remove default handler
    logger.remove()

    # Determine log format
    if settings.log_format.lower() == "json":
        log_format = (
            '{{"timestamp": "{time:YYYY-MM-DD HH:mm:ss.SSS}", '
            '"level": "{level}", "message": "{message}", '
            '"file": "{file}", "line": {line}}}'
        )
    else:
        log_format = (
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        )

    # Add console handler
    logger.add(
        sys.stdout,
        format=log_format,
        level=settings.log_level.upper(),
        colorize=True,
        serialize=settings.log_format.lower() == "json",
    )

    # Add file handler in production
    if settings.is_production:
        logger.add(
            "logs/app.log",
            rotation="10 MB",
            retention="30 days",
            compression="zip",
            format=log_format,
            level=settings.log_level.upper(),
            serialize=True,
        )

    logger.info(
        "Logging configured",
        extra={"level": settings.log_level, "format": settings.log_format},
    )


def get_logger() -> Any:
    """Get configured logger instance."""
    return logger


def log_request(
    method: str,
    path: str,
    status_code: int,
    duration_ms: float,
    client_ip: str | None = None,
    user_agent: str | None = None,
) -> None:
    """Log HTTP request details."""
    log_data: Dict[str, Any] = {
        "method": method,
        "path": path,
        "status_code": status_code,
        "duration_ms": round(duration_ms, 2),
    }

    if client_ip:
        log_data["client_ip"] = client_ip
    if user_agent:
        log_data["user_agent"] = user_agent

    if status_code >= 500:
        logger.error("HTTP Request", **log_data)
    elif status_code >= 400:
        logger.warning("HTTP Request", **log_data)
    else:
        logger.info("HTTP Request", **log_data)
