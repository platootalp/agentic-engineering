"""FastAPI dependency injection configuration."""

from typing import Annotated, AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.database import AsyncSessionLocal, get_db
from app.infrastructure.logging import get_logger
from app.infrastructure.security import verify_token

logger = get_logger()

# Security scheme for JWT
token_scheme = HTTPBearer(auto_error=False)


# Type aliases for common dependencies
SettingsDep = Annotated[Settings, Depends(get_settings)]
DBSessionDep = Annotated[AsyncSession, Depends(get_db)]
TokenDep = Annotated[HTTPAuthorizationCredentials | None, Depends(token_scheme)]


async def get_current_user(token: TokenDep) -> dict:
    """Dependency to get current authenticated user from JWT token.

    Args:
        token: The JWT token from Authorization header.

    Returns:
        User data from token payload.

    Raises:
        HTTPException: If token is invalid or missing.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token(token.credentials, token_type="access")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "id": user_id,
        "email": payload.get("email"),
        "roles": payload.get("roles", []),
    }


# Type alias for current user dependency
CurrentUserDep = Annotated[dict, Depends(get_current_user)]


async def get_current_active_user(current_user: CurrentUserDep) -> dict:
    """Dependency to ensure user is active.

    Args:
        current_user: The current authenticated user.

    Returns:
        User data if active.

    Raises:
        HTTPException: If user is inactive.
    """
    # Add active check logic here when user model is implemented
    # if not current_user.get("is_active"):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="User account is inactive",
    #     )
    return current_user


# Type alias for active user dependency
ActiveUserDep = Annotated[dict, Depends(get_current_active_user)]


def require_roles(required_roles: list[str]):
    """Factory for role-based access control dependency.

    Args:
        required_roles: List of required role names.

    Returns:
        Dependency function that checks user roles.
    """

    async def role_checker(current_user: CurrentUserDep) -> dict:
        user_roles = current_user.get("roles", [])

        if not any(role in user_roles for role in required_roles):
            logger.warning(
                f"Access denied for user {current_user.get('id')}. "
                f"Required roles: {required_roles}, User roles: {user_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return current_user

    return role_checker


class PaginationParams:
    """Common pagination parameters."""

    def __init__(
        self,
        page: int = 1,
        page_size: int = 20,
    ):
        self.page = max(1, page)
        self.page_size = min(max(1, page_size), 100)
        self.offset = (self.page - 1) * self.page_size


# Type alias for pagination dependency
PaginationDep = Annotated[PaginationParams, Depends()]


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session for dependency injection.

    Yields:
        AsyncSession: Database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
