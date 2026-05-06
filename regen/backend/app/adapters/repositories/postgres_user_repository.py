"""PostgreSQL implementation of UserRepository."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository


class UserModel:
    """SQLAlchemy User model for database operations."""

    def __init__(self):
        # Import here to avoid circular imports
        from app.database import Base
        from sqlalchemy import Column, String, Boolean, DateTime
        from sqlalchemy.dialects.postgresql import UUID as PGUUID

        self.Base = Base


class PostgresUserRepository(UserRepository):
    """PostgreSQL implementation of user repository using SQLAlchemy."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session.

        Args:
            session: SQLAlchemy async session.
        """
        self._session = session
        self._model = self._get_model()

    def _get_model(self):
        """Get or create the User model class."""
        from app.database import Base
        from sqlalchemy import Column, String, Boolean, DateTime
        from sqlalchemy.dialects.postgresql import UUID as PGUUID
        import uuid

        class UserTable(Base):
            __tablename__ = "regen_users"
            __table_args__ = {'extend_existing': True}
            __tablename__ = "regen_users"

            id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
            email = Column(String(255), unique=True, nullable=False, index=True)
            hashed_password = Column(String(255), nullable=False)
            first_name = Column(String(100), nullable=True)
            last_name = Column(String(100), nullable=True)
            is_active = Column(Boolean, default=True, nullable=False)
            is_verified = Column(Boolean, default=False, nullable=False)
            created_at = Column(DateTime, nullable=False)
            updated_at = Column(DateTime, nullable=False)

        return UserTable

    def _to_entity(self, model) -> User:
        """Convert database model to domain entity.

        Args:
            model: SQLAlchemy model instance.

        Returns:
            User domain entity.
        """
        return User(
            id=model.id,
            email=model.email,
            hashed_password=model.hashed_password,
            first_name=model.first_name,
            last_name=model.last_name,
            is_active=model.is_active,
            is_verified=model.is_verified,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, user: User) -> "UserModel":
        """Convert domain entity to database model.

        Args:
            user: User domain entity.

        Returns:
            SQLAlchemy model instance.
        """
        return self._model(
            id=user.id,
            email=user.email,
            hashed_password=user.hashed_password,
            first_name=user.first_name,
            last_name=user.last_name,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        result = await self._session.execute(
            select(self._model).where(self._model.email == email.lower().strip())
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def create(self, user: User) -> User:
        """Create a new user."""
        model = self._to_model(user)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, user: User) -> User:
        """Update an existing user."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == user.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"User with id {user.id} not found")

        model.email = user.email
        model.hashed_password = user.hashed_password
        model.first_name = user.first_name
        model.last_name = user.last_name
        model.is_active = user.is_active
        model.is_verified = user.is_verified
        model.updated_at = user.updated_at

        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, user_id: UUID) -> bool:
        """Delete a user by ID."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == user_id)
        )
        model = result.scalar_one_or_none()
        if not model:
            return False

        await self._session.delete(model)
        await self._session.flush()
        return True

    async def exists_by_email(self, email: str) -> bool:
        """Check if a user with the given email exists."""
        result = await self._session.execute(
            select(self._model).where(self._model.email == email.lower().strip())
        )
        return result.scalar_one_or_none() is not None
