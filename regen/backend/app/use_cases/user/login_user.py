"""User login use case."""

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
)


@dataclass
class LoginUserInput:
    """Input data for user login."""

    email: str
    password: str


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
class TokensDTO:
    """Tokens data transfer object."""

    access_token: str
    refresh_token: str
    expires_in: int


@dataclass
class LoginUserOutput:
    """Output data for user login."""

    success: bool
    user: Optional[UserDTO] = None
    tokens: Optional[TokensDTO] = None
    message: str = ""
    error: Optional[str] = None


class LoginUserUseCase:
    """Use case for user authentication."""

    def __init__(self, user_repository: UserRepository):
        """Initialize use case with repository.

        Args:
            user_repository: Repository for user operations.
        """
        self._user_repository = user_repository

    async def execute(self, input_data: LoginUserInput) -> LoginUserOutput:
        """Execute user login.

        Args:
            input_data: Login input data.

        Returns:
            Login result with user and tokens.
        """
        # Validate input
        if not input_data.email or not input_data.password:
            return LoginUserOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="Email and password are required",
            )

        try:
            # Find user by email
            user = await self._user_repository.get_by_email(input_data.email)

            # Check if user exists and password is correct
            if not user or not verify_password(
                input_data.password, user.hashed_password
            ):
                return LoginUserOutput(
                    success=False,
                    error="INVALID_CREDENTIALS",
                    message="Invalid email or password",
                )

            # Check if user is active
            if not user.is_active:
                return LoginUserOutput(
                    success=False,
                    error="ACCOUNT_INACTIVE",
                    message="Account is deactivated",
                )

            # Generate tokens
            token_data = {"sub": str(user.id), "email": user.email}

            access_token = create_access_token(
                token_data, expires_delta=timedelta(hours=2)
            )
            refresh_token = create_refresh_token(
                token_data, expires_delta=timedelta(days=7)
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

            tokens_dto = TokensDTO(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=7200,  # 2 hours in seconds
            )

            return LoginUserOutput(
                success=True,
                user=user_dto,
                tokens=tokens_dto,
                message="Login successful",
            )

        except Exception as e:
            return LoginUserOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Login failed: {str(e)}",
            )
