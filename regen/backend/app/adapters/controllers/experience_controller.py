"""Experience controller with experience management endpoints."""

from datetime import date
from typing import Optional, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.domain.entities.experience import Experience
from app.domain.repositories.experience_repository import ExperienceRepository
from app.adapters.repositories.postgres_experience_repository import PostgresExperienceRepository
from app.infrastructure.deps import get_current_active_user
from app.use_cases.user.get_current_user import GetCurrentUserOutput

router = APIRouter(prefix="/api/v1/experiences", tags=["Experiences"])


# Request/Response Schemas
class ExperienceCreateRequest(BaseModel):
    """Experience creation request."""

    type: str = Field(
        ..., pattern="^(work|education|project)$", description="Experience type (work, education, project)"
    )
    title: str = Field(
        ..., min_length=1, max_length=200, description="Job title/degree/project name"
    )
    organization: Optional[str] = Field(
        None, max_length=200, description="Company/school name"
    )
    location: Optional[str] = Field(None, max_length=200, description="Location")
    start_date: date = Field(..., description="Start date")
    end_date: Optional[date] = Field(None, description="End date (null if current)")
    is_current: bool = Field(False, description="Whether this is the current position")
    description: Optional[str] = Field(None, description="Raw description")
    skills: Optional[list[str]] = Field(None, description="List of skills")
    achievements: Optional[list[str]] = Field(None, description="List of achievements")
    metadata: Optional[dict[str, Any]] = Field(None, description="Additional metadata")
    order_index: int = Field(0, ge=0, description="Display order index")
    is_highlighted: bool = Field(False, description="Whether to highlight this experience")


class ExperienceUpdateRequest(BaseModel):
    """Experience update request."""

    type: Optional[str] = Field(
        None, pattern="^(work|education|project)$", description="Experience type"
    )
    title: Optional[str] = Field(
        None, min_length=1, max_length=200, description="Job title/degree/project name"
    )
    organization: Optional[str] = Field(
        None, max_length=200, description="Company/school name"
    )
    location: Optional[str] = Field(None, max_length=200, description="Location")
    start_date: Optional[date] = Field(None, description="Start date")
    end_date: Optional[date] = Field(None, description="End date (null if current)")
    is_current: Optional[bool] = Field(None, description="Whether this is the current position")
    description: Optional[str] = Field(None, description="Raw description")
    skills: Optional[list[str]] = Field(None, description="List of skills")
    achievements: Optional[list[str]] = Field(None, description="List of achievements")
    metadata: Optional[dict[str, Any]] = Field(None, description="Additional metadata")
    order_index: Optional[int] = Field(None, ge=0, description="Display order index")
    is_highlighted: Optional[bool] = Field(None, description="Whether to highlight this experience")


class ExperienceResponseData(BaseModel):
    """Experience data in response."""

    id: str
    user_id: str
    type: str
    title: str
    organization: Optional[str]
    location: Optional[str]
    start_date: str
    end_date: Optional[str]
    is_current: bool
    description: Optional[str]
    description_ai: Optional[str]
    skills: list[str]
    achievements: list[str]
    metadata: dict[str, Any]
    order_index: int
    is_highlighted: bool
    created_at: str
    updated_at: str


class ExperienceListResponse(BaseModel):
    """Experience list response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ExperienceDetailResponse(BaseModel):
    """Experience detail response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ExperienceCreateResponse(BaseModel):
    """Experience create response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ExperienceUpdateResponse(BaseModel):
    """Experience update response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ExperienceDeleteResponse(BaseModel):
    """Experience delete response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ExperienceOptimizeResponse(BaseModel):
    """Experience optimize response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


def get_experience_repository(db: AsyncSession = Depends(get_db)) -> ExperienceRepository:
    """Get experience repository instance."""
    return PostgresExperienceRepository(db)


def _experience_to_dict(experience: Experience) -> dict:
    """Convert Experience entity to dictionary."""
    return {
        "id": str(experience.id),
        "user_id": str(experience.user_id),
        "type": experience.type,
        "title": experience.title,
        "organization": experience.organization,
        "location": experience.location,
        "start_date": experience.start_date.isoformat() if experience.start_date else None,
        "end_date": experience.end_date.isoformat() if experience.end_date else None,
        "is_current": experience.is_current,
        "description": experience.description,
        "description_ai": experience.description_ai,
        "skills": experience.skills,
        "achievements": experience.achievements,
        "metadata": experience.metadata,
        "order_index": experience.order_index,
        "is_highlighted": experience.is_highlighted,
        "created_at": experience.created_at.isoformat(),
        "updated_at": experience.updated_at.isoformat(),
    }


@router.get(
    "",
    response_model=ExperienceListResponse,
    summary="List experiences",
    description="List all experiences for the current user with optional type filtering.",
)
async def list_experiences(
    type: Optional[str] = Query(
        None, pattern="^(work|education|project)$", description="Filter by experience type"
    ),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    experience_repository: ExperienceRepository = Depends(get_experience_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ExperienceListResponse:
    """List all experiences for the current user with pagination and filtering."""
    experiences, total = await experience_repository.get_by_user(
        user_id=current_user.user.id,
        type=type,
        page=page,
        page_size=page_size,
    )

    return ExperienceListResponse(
        success=True,
        data={
            "items": [_experience_to_dict(exp) for exp in experiences],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size,
            },
        },
        message="Experiences retrieved successfully",
        error=None,
    )


@router.get(
    "/{experience_id}",
    response_model=ExperienceDetailResponse,
    summary="Get experience details",
    description="Get a single experience by ID.",
)
async def get_experience(
    experience_id: UUID,
    experience_repository: ExperienceRepository = Depends(get_experience_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ExperienceDetailResponse:
    """Get a single experience by ID."""
    experience = await experience_repository.get_by_id(experience_id)

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Experience not found",
                "error": "EXPERIENCE_NOT_FOUND",
            },
        )

    # Check ownership
    if experience.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    return ExperienceDetailResponse(
        success=True,
        data={"experience": _experience_to_dict(experience)},
        message="Experience retrieved successfully",
        error=None,
    )


@router.post(
    "",
    response_model=ExperienceCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create experience",
    description="Create a new experience entry.",
)
async def create_experience(
    request: ExperienceCreateRequest,
    experience_repository: ExperienceRepository = Depends(get_experience_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ExperienceCreateResponse:
    """Create a new experience."""
    experience = Experience.create(
        user_id=current_user.user.id,
        type=request.type,
        title=request.title,
        organization=request.organization,
        location=request.location,
        start_date=request.start_date,
        end_date=request.end_date,
        is_current=request.is_current,
        description=request.description,
        skills=request.skills,
        achievements=request.achievements,
        metadata=request.metadata,
        order_index=request.order_index,
        is_highlighted=request.is_highlighted,
    )

    created_experience = await experience_repository.create(experience)

    return ExperienceCreateResponse(
        success=True,
        data={"experience": _experience_to_dict(created_experience)},
        message="Experience created successfully",
        error=None,
    )


@router.put(
    "/{experience_id}",
    response_model=ExperienceUpdateResponse,
    summary="Update experience",
    description="Update an existing experience entry.",
)
async def update_experience(
    experience_id: UUID,
    request: ExperienceUpdateRequest,
    experience_repository: ExperienceRepository = Depends(get_experience_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ExperienceUpdateResponse:
    """Update an existing experience."""
    experience = await experience_repository.get_by_id(experience_id)

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Experience not found",
                "error": "EXPERIENCE_NOT_FOUND",
            },
        )

    # Check ownership
    if experience.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    # Update fields
    update_data = request.model_dump(exclude_unset=True)
    experience.update(**update_data)

    updated_experience = await experience_repository.update(experience)

    return ExperienceUpdateResponse(
        success=True,
        data={"experience": _experience_to_dict(updated_experience)},
        message="Experience updated successfully",
        error=None,
    )


@router.delete(
    "/{experience_id}",
    response_model=ExperienceDeleteResponse,
    summary="Delete experience",
    description="Delete an experience by ID.",
)
async def delete_experience(
    experience_id: UUID,
    experience_repository: ExperienceRepository = Depends(get_experience_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ExperienceDeleteResponse:
    """Delete an experience by ID."""
    experience = await experience_repository.get_by_id(experience_id)

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Experience not found",
                "error": "EXPERIENCE_NOT_FOUND",
            },
        )

    # Check ownership
    if experience.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    deleted = await experience_repository.delete(experience_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Experience not found",
                "error": "EXPERIENCE_NOT_FOUND",
            },
        )

    return ExperienceDeleteResponse(
        success=True,
        data=None,
        message="Experience deleted successfully",
        error=None,
    )


@router.post(
    "/{experience_id}/optimize",
    response_model=ExperienceOptimizeResponse,
    summary="Optimize experience description",
    description="Trigger AI optimization for an experience description (placeholder).",
)
async def optimize_experience(
    experience_id: UUID,
    experience_repository: ExperienceRepository = Depends(get_experience_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ExperienceOptimizeResponse:
    """Trigger AI optimization for an experience description."""
    experience = await experience_repository.get_by_id(experience_id)

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Experience not found",
                "error": "EXPERIENCE_NOT_FOUND",
            },
        )

    # Check ownership
    if experience.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    # Placeholder for AI optimization logic
    # TODO: Implement actual AI optimization
    placeholder_optimized = (
        f"[AI Optimized] {experience.description or 'No description provided'}\n\n"
        "Key highlights:\n"
        "- Led cross-functional teams to deliver high-impact projects\n"
        "- Improved system performance by 40% through optimization\n"
        "- Collaborated with stakeholders to define technical requirements"
    )

    experience.set_ai_description(placeholder_optimized)
    await experience_repository.update(experience)

    return ExperienceOptimizeResponse(
        success=True,
        data={
            "experience_id": str(experience_id),
            "optimization_status": "completed",
            "description_ai": experience.description_ai,
        },
        message="Experience description optimized successfully",
        error=None,
    )
