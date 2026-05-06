"""Resume repository interface."""

from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.resume import Resume


class ResumeRepository(ABC):
    """Abstract repository for Resume entity operations."""

    @abstractmethod
    async def get_by_id(self, resume_id: UUID) -> Optional[Resume]:
        """Get resume by ID.

        Args:
            resume_id: The resume's UUID.

        Returns:
            Resume if found, None otherwise.
        """
        pass

    @abstractmethod
    async def list_by_user(
        self,
        user_id: UUID,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Resume], int]:
        """List resumes for a user with optional filtering and pagination.

        Args:
            user_id: The user's UUID.
            status: Filter by status (draft, published, archived).
            page: Page number (1-based).
            page_size: Number of items per page.

        Returns:
            Tuple of (list of Resumes, total count).
        """
        pass

    @abstractmethod
    async def create(self, resume: Resume) -> Resume:
        """Create a new resume.

        Args:
            resume: The Resume entity to create.

        Returns:
            The created Resume with assigned ID.
        """
        pass

    @abstractmethod
    async def update(self, resume: Resume) -> Resume:
        """Update an existing resume.

        Args:
            resume: The Resume entity to update.

        Returns:
            The updated Resume.
        """
        pass

    @abstractmethod
    async def delete(self, resume_id: UUID) -> bool:
        """Delete a resume by ID.

        Args:
            resume_id: The resume's UUID.

        Returns:
            True if deleted, False if not found.
        """
        pass

    @abstractmethod
    async def exists_by_id(self, resume_id: UUID) -> bool:
        """Check if a resume with the given ID exists.

        Args:
            resume_id: The resume ID to check.

        Returns:
            True if exists, False otherwise.
        """
        pass

    @abstractmethod
    async def get_default_by_user(self, user_id: UUID) -> Optional[Resume]:
        """Get the default resume for a user.

        Args:
            user_id: The user's UUID.

        Returns:
            Default resume if found, None otherwise.
        """
        pass

    @abstractmethod
    async def clear_default_for_user(self, user_id: UUID) -> None:
        """Clear the default flag for all resumes of a user.

        Args:
            user_id: The user's UUID.
        """
        pass
