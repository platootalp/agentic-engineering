"""User repository interface."""

from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.user import User


class UserRepository(ABC):
    """Abstract repository for User entity operations."""

    @abstractmethod
    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID.

        Args:
            user_id: The user's UUID.

        Returns:
            User if found, None otherwise.
        """
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address.

        Args:
            email: The user's email address.

        Returns:
            User if found, None otherwise.
        """
        pass

    @abstractmethod
    async def create(self, user: User) -> User:
        """Create a new user.

        Args:
            user: The user entity to create.

        Returns:
            The created user with assigned ID.
        """
        pass

    @abstractmethod
    async def update(self, user: User) -> User:
        """Update an existing user.

        Args:
            user: The user entity to update.

        Returns:
            The updated user.
        """
        pass

    @abstractmethod
    async def delete(self, user_id: UUID) -> bool:
        """Delete a user by ID.

        Args:
            user_id: The user's UUID.

        Returns:
            True if deleted, False if not found.
        """
        pass

    @abstractmethod
    async def exists_by_email(self, email: str) -> bool:
        """Check if a user with the given email exists.

        Args:
            email: The email address to check.

        Returns:
            True if exists, False otherwise.
        """
        pass
