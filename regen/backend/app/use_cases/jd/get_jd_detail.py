"""Get JD detail use case."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from app.domain.repositories.jd_repository import JDRepository


@dataclass
class GetJDDetailInput:
    """Input data for getting JD detail."""

    jd_id: UUID


@dataclass
class JDDetailDTO:
    """JD detail data transfer object."""

    id: str
    company_name: str
    position_title: str
    location: Optional[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    salary_range: Optional[str]
    raw_content: str
    analysis: Optional[dict]
    source: Optional[str]
    is_analyzed: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class GetJDDetailOutput:
    """Output data for getting JD detail."""

    success: bool
    jd: Optional[JDDetailDTO] = None
    message: str = ""
    error: Optional[str] = None


class GetJDDetailUseCase:
    """Use case for getting JD detail."""

    def __init__(self, jd_repository: JDRepository):
        """Initialize use case with repository.

        Args:
            jd_repository: Repository for JD operations.
        """
        self._jd_repository = jd_repository

    async def execute(self, input_data: GetJDDetailInput) -> GetJDDetailOutput:
        """Execute JD detail retrieval.

        Args:
            input_data: Detail retrieval input data.

        Returns:
            Detail result with JD data.
        """
        try:
            # Get JD from repository
            jd = await self._jd_repository.get_by_id(input_data.jd_id)

            if not jd:
                return GetJDDetailOutput(
                    success=False,
                    error="NOT_FOUND",
                    message=f"JD with id {input_data.jd_id} not found",
                )

            # Build DTO
            jd_dto = JDDetailDTO(
                id=str(jd.id),
                company_name=jd.company_name,
                position_title=jd.position_title,
                location=jd.location,
                salary_min=jd.salary_min,
                salary_max=jd.salary_max,
                salary_range=jd.salary_range,
                raw_content=jd.raw_content,
                analysis=jd.analysis,
                source=jd.source,
                is_analyzed=jd.is_analyzed,
                created_at=jd.created_at,
                updated_at=jd.updated_at,
            )

            return GetJDDetailOutput(
                success=True,
                jd=jd_dto,
                message="JD retrieved successfully",
            )

        except Exception as e:
            return GetJDDetailOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Failed to retrieve JD: {str(e)}",
            )
