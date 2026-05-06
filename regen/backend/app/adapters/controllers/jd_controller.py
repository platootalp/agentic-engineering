"""JD (Job Description) controller with job management endpoints."""

from typing import Optional, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.domain.entities.jd import JD
from app.domain.repositories.jd_repository import JDRepository
from app.adapters.repositories.postgres_jd_repository import PostgresJDRepository
from app.infrastructure.deps import get_current_active_user
from app.use_cases.user.get_current_user import GetCurrentUserOutput

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])


# Request/Response Schemas
class JDCreateRequest(BaseModel):
    """JD creation request."""

    company_name: str = Field(
        ..., min_length=1, max_length=255, description="Company name"
    )
    position_title: str = Field(
        ..., min_length=1, max_length=255, description="Position title"
    )
    raw_content: str = Field(..., min_length=1, description="Raw JD content/text")
    location: Optional[str] = Field(None, max_length=255, description="Job location")
    salary_min: Optional[int] = Field(None, ge=0, description="Minimum salary")
    salary_max: Optional[int] = Field(None, ge=0, description="Maximum salary")
    source: Optional[str] = Field(None, max_length=255, description="Source of the JD")


class JDUpdateRequest(BaseModel):
    """JD update request."""

    company_name: Optional[str] = Field(
        None, min_length=1, max_length=255, description="Company name"
    )
    position_title: Optional[str] = Field(
        None, min_length=1, max_length=255, description="Position title"
    )
    raw_content: Optional[str] = Field(
        None, min_length=1, description="Raw JD content/text"
    )
    location: Optional[str] = Field(None, max_length=255, description="Job location")
    salary_min: Optional[int] = Field(None, ge=0, description="Minimum salary")
    salary_max: Optional[int] = Field(None, ge=0, description="Maximum salary")
    source: Optional[str] = Field(None, max_length=255, description="Source of the JD")


class JDResponseData(BaseModel):
    """JD data in response."""

    id: str
    company_name: str
    position_title: str
    location: Optional[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    raw_content: str
    source: Optional[str]
    is_analyzed: bool
    created_at: str
    updated_at: str


class JDWithAnalysisResponseData(BaseModel):
    """JD data with analysis in response."""

    id: str
    company_name: str
    position_title: str
    location: Optional[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    raw_content: str
    source: Optional[str]
    is_analyzed: bool
    analysis: Optional[dict[str, Any]]
    created_at: str
    updated_at: str


class JDListResponse(BaseModel):
    """JD list response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class JDDetailResponse(BaseModel):
    """JD detail response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class JDCreateResponse(BaseModel):
    """JD create response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class JDUpdateResponse(BaseModel):
    """JD update response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class JDDeleteResponse(BaseModel):
    """JD delete response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class JDAnalyzeResponse(BaseModel):
    """JD analyze response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class JDAnalysisResultResponse(BaseModel):
    """JD analysis result response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


def get_jd_repository(db: AsyncSession = Depends(get_db)) -> JDRepository:
    """Get JD repository instance."""
    return PostgresJDRepository(db)


def _jd_to_dict(jd: JD, include_analysis: bool = False) -> dict:
    """Convert JD entity to dictionary."""
    data = {
        "id": str(jd.id),
        "company_name": jd.company_name,
        "position_title": jd.position_title,
        "location": jd.location,
        "salary_min": jd.salary_min,
        "salary_max": jd.salary_max,
        "raw_content": jd.raw_content,
        "source": jd.source,
        "is_analyzed": jd.is_analyzed,
        "created_at": jd.created_at.isoformat(),
        "updated_at": jd.updated_at.isoformat(),
    }
    if include_analysis:
        data["analysis"] = jd.analysis
    return data


@router.get(
    "",
    response_model=JDListResponse,
    summary="List jobs",
    description="List all jobs with pagination, search, and filtering.",
)
async def list_jobs(
    search: Optional[str] = Query(
        None, description="Search term for company or position"
    ),
    company_name: Optional[str] = Query(None, description="Filter by company name"),
    position_title: Optional[str] = Query(None, description="Filter by position title"),
    source: Optional[str] = Query(None, description="Filter by source"),
    is_analyzed: Optional[bool] = Query(None, description="Filter by analysis status"),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    jd_repository: JDRepository = Depends(get_jd_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> JDListResponse:
    """List all jobs with pagination and filtering.

    Args:
        search: Search term for company_name or position_title.
        company_name: Filter by company name.
        position_title: Filter by position title.
        source: Filter by source.
        is_analyzed: Filter by analysis status.
        page: Page number (1-based).
        page_size: Number of items per page.
        jd_repository: JD repository for database operations.
        current_user: Current authenticated user.

    Returns:
        List of jobs with pagination info.
    """
    jobs, total = await jd_repository.list_all(
        search=search,
        company_name=company_name,
        position_title=position_title,
        is_analyzed=is_analyzed,
        page=page,
        page_size=page_size,
    )

    return JDListResponse(
        success=True,
        data={
            "items": [_jd_to_dict(jd) for jd in jobs],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size,
            },
        },
        message="Jobs retrieved successfully",
        error=None,
    )


@router.get(
    "/{job_id}",
    response_model=JDDetailResponse,
    summary="Get job details",
    description="Get a single job by ID with analysis data.",
)
async def get_job(
    job_id: UUID,
    jd_repository: JDRepository = Depends(get_jd_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> JDDetailResponse:
    """Get a single job by ID with analysis.

    Args:
        job_id: The job's UUID.
        jd_repository: JD repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Job details with analysis.
    """
    jd = await jd_repository.get_by_id(job_id)

    if not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Job not found",
                "error": "JOB_NOT_FOUND",
            },
        )

    return JDDetailResponse(
        success=True,
        data={"job": _jd_to_dict(jd, include_analysis=True)},
        message="Job retrieved successfully",
        error=None,
    )


@router.post(
    "",
    response_model=JDCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create job",
    description="Create a new job description.",
)
async def create_job(
    request: JDCreateRequest,
    jd_repository: JDRepository = Depends(get_jd_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> JDCreateResponse:
    """Create a new job.

    Args:
        request: Job creation request data.
        jd_repository: JD repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Created job details.
    """
    jd = JD.create(
        company_name=request.company_name,
        position_title=request.position_title,
        raw_content=request.raw_content,
        location=request.location,
        salary_min=request.salary_min,
        salary_max=request.salary_max,
        source=request.source,
    )

    created_jd = await jd_repository.create(jd)

    return JDCreateResponse(
        success=True,
        data={"job": _jd_to_dict(created_jd)},
        message="Job created successfully",
        error=None,
    )


@router.put(
    "/{job_id}",
    response_model=JDUpdateResponse,
    summary="Update job",
    description="Update an existing job description.",
)
async def update_job(
    job_id: UUID,
    request: JDUpdateRequest,
    jd_repository: JDRepository = Depends(get_jd_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> JDUpdateResponse:
    """Update an existing job.

    Args:
        job_id: The job's UUID.
        request: Job update request data.
        jd_repository: JD repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Updated job details.
    """
    jd = await jd_repository.get_by_id(job_id)

    if not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Job not found",
                "error": "JOB_NOT_FOUND",
            },
        )

    # Update fields
    update_data = request.model_dump(exclude_unset=True)
    jd.update(**update_data)

    updated_jd = await jd_repository.update(jd)

    return JDUpdateResponse(
        success=True,
        data={"job": _jd_to_dict(updated_jd)},
        message="Job updated successfully",
        error=None,
    )


@router.delete(
    "/{job_id}",
    response_model=JDDeleteResponse,
    summary="Delete job",
    description="Delete a job by ID.",
)
async def delete_job(
    job_id: UUID,
    jd_repository: JDRepository = Depends(get_jd_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> JDDeleteResponse:
    """Delete a job by ID.

    Args:
        job_id: The job's UUID.
        jd_repository: JD repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Deletion result.
    """
    deleted = await jd_repository.delete(job_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Job not found",
                "error": "JOB_NOT_FOUND",
            },
        )

    return JDDeleteResponse(
        success=True,
        data=None,
        message="Job deleted successfully",
        error=None,
    )


@router.post(
    "/{job_id}/analyze",
    response_model=JDAnalyzeResponse,
    summary="Analyze job",
    description="Trigger AI analysis for a job (placeholder).",
)
async def analyze_job(
    job_id: UUID,
    jd_repository: JDRepository = Depends(get_jd_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> JDAnalyzeResponse:
    """Trigger AI analysis for a job.

    Args:
        job_id: The job's UUID.
        jd_repository: JD repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Analysis trigger result.
    """
    jd = await jd_repository.get_by_id(job_id)

    if not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Job not found",
                "error": "JOB_NOT_FOUND",
            },
        )

    # Placeholder for AI analysis logic
    # TODO: Implement actual AI analysis
    placeholder_analysis = {
        "skills_required": ["Python", "FastAPI", "PostgreSQL"],
        "experience_level": "Mid-level",
        "education_required": "Bachelor's degree",
        "key_responsibilities": [
            "Backend development",
            "API design",
            "Database optimization",
        ],
        "analysis_status": "completed",
        "analyzed_at": jd.updated_at.isoformat(),
    }

    jd.set_analysis(placeholder_analysis)
    await jd_repository.update(jd)

    return JDAnalyzeResponse(
        success=True,
        data={
            "job_id": str(job_id),
            "analysis_status": "completed",
            "analysis": placeholder_analysis,
        },
        message="Job analysis completed successfully",
        error=None,
    )


@router.get(
    "/{job_id}/analysis",
    response_model=JDAnalysisResultResponse,
    summary="Get job analysis",
    description="Get AI analysis result for a job.",
)
async def get_job_analysis(
    job_id: UUID,
    jd_repository: JDRepository = Depends(get_jd_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> JDAnalysisResultResponse:
    """Get AI analysis result for a job.

    Args:
        job_id: The job's UUID.
        jd_repository: JD repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Job analysis result.
    """
    jd = await jd_repository.get_by_id(job_id)

    if not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Job not found",
                "error": "JOB_NOT_FOUND",
            },
        )

    if not jd.is_analyzed:
        return JDAnalysisResultResponse(
            success=True,
            data={
                "job_id": str(job_id),
                "is_analyzed": False,
                "analysis": None,
            },
            message="Job has not been analyzed yet",
            error=None,
        )

    return JDAnalysisResultResponse(
        success=True,
        data={
            "job_id": str(job_id),
            "is_analyzed": True,
            "analysis": jd.analysis,
        },
        message="Job analysis retrieved successfully",
        error=None,
    )
