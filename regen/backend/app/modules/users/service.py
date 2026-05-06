"""User service: business logic for registration, login, refresh, and current-user."""

from datetime import timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.modules.users.model import User
from app.modules.users.schema import UserRegister


class UserService:
    """Static-method service following the domain-modular template pattern."""

    @staticmethod
    async def register(db: AsyncSession, data: UserRegister) -> User:
        """Register a new user.

        Validates input, checks for duplicate email, hashes password, persists
        the user, and returns the created User model.

        Raises:
            ValueError: On validation or duplicate-email errors.
        """
        # Validate input
        if not data.email or not data.password:
            raise ValueError("Email and password are required")

        # Validate email format (basic check, EmailStr already validates format)
        if "@" not in data.email or "." not in data.email.split("@")[-1]:
            raise ValueError("Invalid email format")

        # Validate password strength
        if len(data.password) < 8:
            raise ValueError("Password must be at least 8 characters long")

        # Check if email already exists
        result = await db.execute(
            select(User).where(User.email == data.email.lower().strip())
        )
        if result.scalar_one_or_none():
            raise ValueError("User with this email already exists")

        # Hash password and create user
        hashed_password = get_password_hash(data.password)
        user = User(
            email=data.email.lower().strip(),
            hashed_password=hashed_password,
            first_name=data.first_name,
            last_name=data.last_name,
            is_active=True,
            is_verified=False,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def login(
        db: AsyncSession, email: str, password: str
    ) -> tuple[User, str, str, int]:
        """Authenticate user by email and password.

        Returns:
            Tuple of (user, access_token, refresh_token, expires_in).

        Raises:
            ValueError: On invalid credentials or inactive account.
        """
        # Validate input
        if not email or not password:
            raise ValueError("Email and password are required")

        # Find user by email
        result = await db.execute(
            select(User).where(User.email == email.lower().strip())
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("Account is deactivated")

        # Generate tokens
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_data, expires_delta=timedelta(hours=2))
        refresh_token = create_refresh_token(
            token_data, expires_delta=timedelta(days=7)
        )
        expires_in = 7200  # 2 hours in seconds

        return user, access_token, refresh_token, expires_in

    @staticmethod
    def refresh_access_token(refresh_token: str) -> tuple[str, int]:
        """Exchange a valid refresh token for a new access token.

        Returns:
            Tuple of (new_access_token, expires_in).

        Raises:
            ValueError: On invalid or expired refresh token.
        """
        payload = verify_token(refresh_token, token_type="refresh")
        if not payload:
            raise ValueError("Invalid or expired refresh token")

        user_id = payload.get("sub")
        email = payload.get("email")
        if not user_id or not email:
            raise ValueError("Invalid token payload")

        token_data = {"sub": user_id, "email": email}
        new_access_token = create_access_token(
            token_data, expires_delta=timedelta(hours=2)
        )
        expires_in = 7200

        return new_access_token, expires_in

    @staticmethod
    async def get_current_user(db: AsyncSession, user_id: UUID) -> User:
        """Retrieve the current active user by ID.

        Raises:
            ValueError: If user not found or account is inactive.
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise ValueError("User not found")

        if not user.is_active:
            raise ValueError("Account is deactivated")

        return user
