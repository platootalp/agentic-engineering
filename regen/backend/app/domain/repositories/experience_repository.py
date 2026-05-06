"""Experience repository interface."""

from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.experience import Experience


class ExperienceRepository(ABC):
    """Abstract repository for Experience entity operations."""

    @abstractmethod
    async def get_by_id(self, experience_id: UUID) -> Optional[Experience]:
        """Get experience by ID.

        Args:
            experience_id: The experience's UUID.

        Returns:
            Experience if found, None otherwise.
        """
        pass

    @abstractmethod
    async def get_by_user(
        self,
        user_id: UUID,
        type: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Experience], int]:
        """Get experiences by user ID with optional type filter.

        Args:
            user_id: The user's UUID.
            type: Filter by experience type (work, education, project).
            page: Page number (1-based).
            page_size: Number of items per page.

        Returns:
            Tuple of (list of experiences, total count).
        """
        pass

    @abstractmethod
    async def create(self, experience: Experience) -> Experience:
        """Create a new experience.

        Args:
            experience: The experience entity to create.

        Returns:
            The created experience with assigned ID.
        """
        pass

    @abstractmethod
    async def update(self, experience: Experience) -> Experience:
        """Update an existing experience.

        Args:
            experience: The experience entity to update.

        Returns:
            The updated experience.
        """
        pass

    @abstractmethod
    async def delete(self, experience_id: UUID) -> bool:
        """Delete an experience by ID.

        Args:
            experience_id: The experience's UUID.

        Returns:
            True if deleted, False if not found.
        """
        pass

    @abstractmethod
    async def exists_by_id(self, experience_id: UUID) -> bool:
        """Check if an experience with the given ID exists.

        Args:
            experience_id: The experience ID to check.

        Returns:
            True if exists, False otherwise.
        """
        pass
