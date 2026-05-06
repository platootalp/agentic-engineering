"""User registration use case."""

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.security import (
    get_password_hash,
    create_access_token,
    create_refresh_token,
)


@dataclass
class RegisterUserInput:
    """Input data for user registration."""

    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


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
class RegisterUserOutput:
    """Output data for user registration."""

    success: bool
    user: Optional[UserDTO] = None
    tokens: Optional[TokensDTO] = None
    message: str = ""
    error: Optional[str] = None


class RegisterUserUseCase:
    """Use case for registering a new user."""

    def __init__(self, user_repository: UserRepository):
        """Initialize use case with repository.

        Args:
            user_repository: Repository for user operations.
        """
        self._user_repository = user_repository

    async def execute(self, input_data: RegisterUserInput) -> RegisterUserOutput:
        """Execute user registration.

        Args:
            input_data: Registration input data.

        Returns:
            Registration result with user and tokens.
        """
        # Validate input
        if not input_data.email or not input_data.password:
            return RegisterUserOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="Email and password are required",
            )

        # Validate email format (basic check)
        if "@" not in input_data.email or "." not in input_data.email.split("@")[-1]:
            return RegisterUserOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="Invalid email format",
            )

        # Validate password strength
        if len(input_data.password) < 8:
            return RegisterUserOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="Password must be at least 8 characters long",
            )

        # Check if email already exists
        exists = await self._user_repository.exists_by_email(input_data.email)
        if exists:
            return RegisterUserOutput(
                success=False,
                error="EMAIL_EXISTS",
                message="User with this email already exists",
            )

        try:
            # Hash password
            hashed_password = get_password_hash(input_data.password)

            # Create user entity
            user = User.create(
                email=input_data.email,
                hashed_password=hashed_password,
                first_name=input_data.first_name,
                last_name=input_data.last_name,
            )

            # Save to database
            created_user = await self._user_repository.create(user)

            # Generate tokens
            token_data = {"sub": str(created_user.id), "email": created_user.email}

            access_token = create_access_token(
                token_data, expires_delta=timedelta(hours=2)
            )
            refresh_token = create_refresh_token(
                token_data, expires_delta=timedelta(days=7)
            )

            # Build response
            user_dto = UserDTO(
                id=str(created_user.id),
                email=created_user.email,
                first_name=created_user.first_name,
                last_name=created_user.last_name,
                full_name=created_user.full_name,
                is_active=created_user.is_active,
                is_verified=created_user.is_verified,
                created_at=created_user.created_at,
            )

            tokens_dto = TokensDTO(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=7200,  # 2 hours in seconds
            )

            return RegisterUserOutput(
                success=True,
                user=user_dto,
                tokens=tokens_dto,
                message="User registered successfully",
            )

        except Exception as e:
            return RegisterUserOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Registration failed: {str(e)}",
            )
