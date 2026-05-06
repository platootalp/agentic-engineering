"""Get JD list use case."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from app.domain.repositories.jd_repository import JDRepository


@dataclass
class GetJDListInput:
    """Input data for getting JD list."""

    search: Optional[str] = None
    company_name: Optional[str] = None
    position_title: Optional[str] = None
    is_analyzed: Optional[bool] = None
    page: int = 1
    page_size: int = 20


@dataclass
class JDListItemDTO:
    """JD list item data transfer object."""

    id: str
    company_name: str
    position_title: str
    location: Optional[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    source: Optional[str]
    is_analyzed: bool
    created_at: datetime


@dataclass
class PaginationDTO:
    """Pagination data transfer object."""

    page: int
    page_size: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


@dataclass
class GetJDListOutput:
    """Output data for getting JD list."""

    success: bool
    items: list[JDListItemDTO]
    pagination: PaginationDTO
    message: str = ""
    error: Optional[str] = None


class GetJDListUseCase:
    """Use case for getting JD list."""

    def __init__(self, jd_repository: JDRepository):
        """Initialize use case with repository.

        Args:
            jd_repository: Repository for JD operations.
        """
        self._jd_repository = jd_repository

    async def execute(self, input_data: GetJDListInput) -> GetJDListOutput:
        """Execute JD list retrieval.

        Args:
            input_data: List retrieval input data.

        Returns:
            List result with JD items and pagination.
        """
        try:
            # Validate pagination
            page = max(1, input_data.page)
            page_size = min(max(1, input_data.page_size), 100)

            # Get JDs from repository
            jds, total = await self._jd_repository.list_all(
                search=input_data.search,
                company_name=input_data.company_name,
                position_title=input_data.position_title,
                is_analyzed=input_data.is_analyzed,
                page=page,
                page_size=page_size,
            )

            # Build DTOs
            items = [
                JDListItemDTO(
                    id=str(jd.id),
                    company_name=jd.company_name,
                    position_title=jd.position_title,
                    location=jd.location,
                    salary_min=jd.salary_min,
                    salary_max=jd.salary_max,
                    source=jd.source,
                    is_analyzed=jd.is_analyzed,
                    created_at=jd.created_at,
                )
                for jd in jds
            ]

            # Calculate pagination
            total_pages = (total + page_size - 1) // page_size if total > 0 else 1

            pagination = PaginationDTO(
                page=page,
                page_size=page_size,
                total=total,
                total_pages=total_pages,
                has_next=page < total_pages,
                has_prev=page > 1,
            )

            return GetJDListOutput(
                success=True,
                items=items,
                pagination=pagination,
                message="JD list retrieved successfully",
            )

        except Exception as e:
            return GetJDListOutput(
                success=False,
                items=[],
                pagination=PaginationDTO(
                    page=input_data.page,
                    page_size=input_data.page_size,
                    total=0,
                    total_pages=0,
                    has_next=False,
                    has_prev=False,
                ),
                error="INTERNAL_ERROR",
                message=f"Failed to retrieve JD list: {str(e)}",
            )
