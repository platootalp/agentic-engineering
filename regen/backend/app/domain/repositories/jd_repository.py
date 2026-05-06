"""JD repository interface."""

from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.jd import JD


class JDRepository(ABC):
    """Abstract repository for JD entity operations."""

    @abstractmethod
    async def get_by_id(self, jd_id: UUID) -> Optional[JD]:
        """Get JD by ID.

        Args:
            jd_id: The JD's UUID.

        Returns:
            JD if found, None otherwise.
        """
        pass

    @abstractmethod
    async def list_all(
        self,
        search: Optional[str] = None,
        company_name: Optional[str] = None,
        position_title: Optional[str] = None,
        is_analyzed: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[JD], int]:
        """List JDs with optional filtering and pagination.

        Args:
            search: Search term for company_name or position_title.
            company_name: Filter by company name.
            position_title: Filter by position title.
            is_analyzed: Filter by analysis status.
            page: Page number (1-based).
            page_size: Number of items per page.

        Returns:
            Tuple of (list of JDs, total count).
        """
        pass

    @abstractmethod
    async def create(self, jd: JD) -> JD:
        """Create a new JD.

        Args:
            jd: The JD entity to create.

        Returns:
            The created JD with assigned ID.
        """
        pass

    @abstractmethod
    async def update(self, jd: JD) -> JD:
        """Update an existing JD.

        Args:
            jd: The JD entity to update.

        Returns:
            The updated JD.
        """
        pass

    @abstractmethod
    async def delete(self, jd_id: UUID) -> bool:
        """Delete a JD by ID.

        Args:
            jd_id: The JD's UUID.

        Returns:
            True if deleted, False if not found.
        """
        pass

    @abstractmethod
    async def exists_by_id(self, jd_id: UUID) -> bool:
        """Check if a JD with the given ID exists.

        Args:
            jd_id: The JD ID to check.

        Returns:
            True if exists, False otherwise.
        """
        pass
