"""Get current user use case."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from app.domain.repositories.user_repository import UserRepository


@dataclass
class UserDTO:
    """User data transfer object for response."""

    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    full_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime


@dataclass
class GetCurrentUserOutput:
    """Output data for getting current user."""

    success: bool
    user: Optional[UserDTO] = None
    message: str = ""
    error: Optional[str] = None


class GetCurrentUserUseCase:
    """Use case for retrieving current user information."""

    def __init__(self, user_repository: UserRepository):
        """Initialize use case with repository.

        Args:
            user_repository: Repository for user operations.
        """
        self._user_repository = user_repository

    async def execute(self, user_id: UUID) -> GetCurrentUserOutput:
        """Execute get current user.

        Args:
            user_id: The user's UUID.

        Returns:
            Current user information.
        """
        try:
            # Find user by ID
            user = await self._user_repository.get_by_id(user_id)

            if not user:
                return GetCurrentUserOutput(
                    success=False,
                    error="USER_NOT_FOUND",
                    message="User not found",
                )

            # Check if user is active
            if not user.is_active:
                return GetCurrentUserOutput(
                    success=False,
                    error="ACCOUNT_INACTIVE",
                    message="Account is deactivated",
                )

            # Build response
            user_dto = UserDTO(
                id=str(user.id),
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                full_name=user.full_name,
                is_active=user.is_active,
                is_verified=user.is_verified,
                created_at=user.created_at,
            )

            return GetCurrentUserOutput(
                success=True,
                user=user_dto,
                message="User retrieved successfully",
            )

        except Exception as e:
            return GetCurrentUserOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Failed to retrieve user: {str(e)}",
            )
