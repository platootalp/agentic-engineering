"""Dependency injection for FastAPI."""

from typing import AsyncGenerator, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.domain.repositories.user_repository import UserRepository
from app.adapters.repositories.postgres_user_repository import PostgresUserRepository
from app.infrastructure.security import verify_token
from app.use_cases.user.get_current_user import (
    GetCurrentUserUseCase,
    GetCurrentUserOutput,
)

# Security scheme for JWT token
security = HTTPBearer(auto_error=False)


async def get_user_repository(
    db: AsyncSession = Depends(get_db),
) -> UserRepository:
    """Get user repository instance.

    Args:
        db: Database session from dependency.

    Returns:
        User repository implementation.
    """
    return PostgresUserRepository(db)


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> UUID:
    """Extract and validate current user ID from JWT token.

    Args:
        credentials: HTTP Authorization credentials containing Bearer token.

    Returns:
        User UUID from token payload.

    Raises:
        HTTPException: If token is missing, invalid, or expired.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": "UNAUTHORIZED",
                "message": "Authentication required",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_token(token, token_type="access")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": "INVALID_TOKEN",
                "message": "Invalid or expired token",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": "INVALID_TOKEN",
                "message": "Token missing user identifier",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "error": "INVALID_TOKEN",
                "message": "Invalid user identifier in token",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id


async def get_current_active_user(
    user_id: UUID = Depends(get_current_user_id),
    user_repository: UserRepository = Depends(get_user_repository),
) -> GetCurrentUserOutput:
    """Get current active user information.

    Args:
        user_id: User ID from token.
        user_repository: User repository for database operations.

    Returns:
        Current user output data.

    Raises:
        HTTPException: If user not found or inactive.
    """
    use_case = GetCurrentUserUseCase(user_repository)
    result = await use_case.execute(user_id)

    if not result.success:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if result.error == "USER_NOT_FOUND"
            else status.HTTP_403_FORBIDDEN
        )
        raise HTTPException(
            status_code=status_code,
            detail={
                "success": False,
                "error": result.error,
                "message": result.message,
            },
        )

    return result


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    user_repository: UserRepository = Depends(get_user_repository),
) -> Optional[GetCurrentUserOutput]:
    """Get current user if authenticated, otherwise None.

    Args:
        credentials: Optional HTTP Authorization credentials.
        user_repository: User repository for database operations.

    Returns:
        Current user output data or None if not authenticated.
    """
    if not credentials:
        return None

    token = credentials.credentials
    payload = verify_token(token, token_type="access")

    if not payload:
        return None

    user_id_str = payload.get("sub")
    if not user_id_str:
        return None

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        return None

    use_case = GetCurrentUserUseCase(user_repository)
    result = await use_case.execute(user_id)

    if not result.success:
        return None

    return result
