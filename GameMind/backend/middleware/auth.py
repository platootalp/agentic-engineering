"""JWT authentication middleware for API endpoints."""

import os
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config import get_settings

security = HTTPBearer(auto_error=False)  # auto_error=False allows optional auth

# Lazy-loaded settings to avoid import-time side effects
_settings = None


def _get_settings():
    global _settings
    if _settings is None:
        _settings = get_settings()
    return _settings


def _is_dev_mode() -> bool:
    """Return True if auth bypass is enabled (development mode)."""
    return os.getenv("DEV_AUTH_BYPASS", "false").lower() == "true"


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Security(security)] = None,
) -> dict:
    """Validate JWT token and return the current user.

    In dev mode (DEV_AUTH_BYPASS=true), returns a dev user without token validation.
    """
    # Dev mode bypass — no auth required
    if _is_dev_mode():
        return {"id": "dev_user", "role": "admin"}

    # No credentials provided
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    settings = _get_settings()
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        role = payload.get("role", "user")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_id, "role": role}
    except jwt.exceptions.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.exceptions.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(required_role: str):
    """Role-based access control dependency factory.

    Args:
        required_role: The role required to access the endpoint.

    Returns:
        Dependency function that checks user role.
    """

    async def wrapper(user: dict = Depends(get_current_user)) -> dict:
        # Dev mode always grants admin
        if not _is_dev_mode() and required_role == "admin" and user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user

    return wrapper
