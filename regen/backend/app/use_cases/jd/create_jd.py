"""Create JD use case."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from app.domain.entities.jd import JD
from app.domain.repositories.jd_repository import JDRepository


@dataclass
class CreateJDInput:
    """Input data for creating a JD."""

    company_name: str
    position_title: str
    raw_content: str
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    source: Optional[str] = None


@dataclass
class JDDTO:
    """JD data transfer object for response."""

    id: str
    company_name: str
    position_title: str
    location: Optional[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    raw_content: str
    analysis: Optional[dict]
    source: Optional[str]
    is_analyzed: bool
    created_at: datetime
    updated_at: datetime


@dataclass
class CreateJDOutput:
    """Output data for creating a JD."""

    success: bool
    jd: Optional[JDDTO] = None
    message: str = ""
    error: Optional[str] = None


class CreateJDUseCase:
    """Use case for creating a new JD."""

    def __init__(self, jd_repository: JDRepository):
        """Initialize use case with repository.

        Args:
            jd_repository: Repository for JD operations.
        """
        self._jd_repository = jd_repository

    async def execute(self, input_data: CreateJDInput) -> CreateJDOutput:
        """Execute JD creation.

        Args:
            input_data: Creation input data.

        Returns:
            Creation result with JD data.
        """
        # Validate input
        if not input_data.company_name or not input_data.company_name.strip():
            return CreateJDOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="Company name is required",
            )

        if not input_data.position_title or not input_data.position_title.strip():
            return CreateJDOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="Position title is required",
            )

        if not input_data.raw_content or not input_data.raw_content.strip():
            return CreateJDOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="Raw content is required",
            )

        # Validate salary range
        if input_data.salary_min is not None and input_data.salary_max is not None:
            if input_data.salary_min > input_data.salary_max:
                return CreateJDOutput(
                    success=False,
                    error="VALIDATION_ERROR",
                    message="Minimum salary cannot be greater than maximum salary",
                )

        try:
            # Create JD entity
            jd = JD.create(
                company_name=input_data.company_name,
                position_title=input_data.position_title,
                raw_content=input_data.raw_content,
                location=input_data.location,
                salary_min=input_data.salary_min,
                salary_max=input_data.salary_max,
                source=input_data.source,
            )

            # Save to database
            created_jd = await self._jd_repository.create(jd)

            # Build response
            jd_dto = JDDTO(
                id=str(created_jd.id),
                company_name=created_jd.company_name,
                position_title=created_jd.position_title,
                location=created_jd.location,
                salary_min=created_jd.salary_min,
                salary_max=created_jd.salary_max,
                raw_content=created_jd.raw_content,
                analysis=created_jd.analysis,
                source=created_jd.source,
                is_analyzed=created_jd.is_analyzed,
                created_at=created_jd.created_at,
                updated_at=created_jd.updated_at,
            )

            return CreateJDOutput(
                success=True,
                jd=jd_dto,
                message="JD created successfully",
            )

        except Exception as e:
            return CreateJDOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Failed to create JD: {str(e)}",
            )
