"""Application configuration loaded from environment variables."""

import os
from functools import lru_cache
from pathlib import Path

from pydantic import ConfigDict, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    All sensitive values (API keys, secrets) must be provided via
    environment variables or a .env file. They are never stored in
    the database or returned in API responses.
    """

    # API Keys
    ANTHROPIC_API_KEY: str = Field(default="")
    EXA_API_KEY: str = Field(default="")

    # JWT
    JWT_SECRET_KEY: str = Field(default="")
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_EXPIRATION_HOURS: int = Field(default=24)

    # Database
    DATABASE_URL: str = Field(default="sqlite:///data/game_market.db")

    # CORS
    ALLOWED_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    # Scheduler
    SCHEDULER_ENABLED: bool = Field(default=True)
    SCHEDULER_HOUR: int = Field(default=9)
    SCHEDULER_TIMEZONE: str = Field(default="Asia/Shanghai")

    # Logging
    LOG_LEVEL: str = Field(default="INFO")

    # Rate Limits
    RATE_LIMIT_GENERATE: str = Field(default="5/minute")
    RATE_LIMIT_CATEGORIES: str = Field(default="20/minute")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def validate(self) -> None:
        """Validate critical configuration values at startup.

        Raises:
            ValueError: If required settings are missing or invalid.
        """
        if self.JWT_SECRET_KEY and len(self.JWT_SECRET_KEY) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters")


def get_settings() -> Settings:
    """Get cached settings instance.

    Loads settings once and returns the same instance on subsequent calls.
    """
    return Settings()


@lru_cache(maxsize=1)
def get_cached_settings() -> Settings:
    """Get settings with caching for high-frequency access.

    Use this in hot paths where get_settings() might be called repeatedly.
    """
    return Settings()


def load_dotenv() -> None:
    """Load .env file before other imports.

    Must be called at module load time (main.py) before any other
    application modules are imported.
    """
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        from dotenv import load_dotenv

        load_dotenv(env_path, override=True)
