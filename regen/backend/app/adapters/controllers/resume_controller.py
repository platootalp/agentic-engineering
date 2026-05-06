"""Resume controller with resume management endpoints."""

from typing import Optional, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.domain.entities.resume import Resume
from app.domain.repositories.resume_repository import ResumeRepository
from app.adapters.repositories.postgres_resume_repository import (
    PostgresResumeRepository,
)
from app.infrastructure.deps import get_current_active_user
from app.use_cases.user.get_current_user import GetCurrentUserOutput

router = APIRouter(prefix="/api/v1/resumes", tags=["Resumes"])


# Request/Response Schemas
class ResumeCreateRequest(BaseModel):
    """Resume creation request."""

    title: str = Field(..., min_length=1, max_length=200, description="Resume title")
    template_id: str = Field(
        "modern", min_length=1, max_length=100, description="Template identifier"
    )
    jd_id: Optional[UUID] = Field(None, description="Associated JD ID")
    content: Optional[dict[str, Any]] = Field(
        None, description="Resume content as JSON"
    )
    selected_experience_ids: Optional[list[UUID]] = Field(
        None, description="List of selected experience IDs"
    )
    generation_config: Optional[dict[str, Any]] = Field(
        None, description="AI generation configuration"
    )


class ResumeUpdateRequest(BaseModel):
    """Resume update request."""

    title: Optional[str] = Field(
        None, min_length=1, max_length=200, description="Resume title"
    )
    template_id: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Template identifier"
    )
    content: Optional[dict[str, Any]] = Field(
        None, description="Resume content as JSON"
    )
    selected_experience_ids: Optional[list[UUID]] = Field(
        None, description="List of selected experience IDs"
    )
    generation_config: Optional[dict[str, Any]] = Field(
        None, description="AI generation configuration"
    )
    ai_suggestions: Optional[dict[str, Any]] = Field(None, description="AI suggestions")
    markdown_content: Optional[str] = Field(None, description="Markdown content")


class ResumeListResponse(BaseModel):
    """Resume list response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ResumeDetailResponse(BaseModel):
    """Resume detail response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ResumeCreateResponse(BaseModel):
    """Resume create response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ResumeUpdateResponse(BaseModel):
    """Resume update response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ResumeDeleteResponse(BaseModel):
    """Resume delete response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ResumeGenerateResponse(BaseModel):
    """Resume generate response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ResumeExportResponse(BaseModel):
    """Resume export response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ResumePublishResponse(BaseModel):
    """Resume publish response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


class ResumeDownloadResponse(BaseModel):
    """Resume download response wrapper."""

    success: bool
    data: Optional[dict] = None
    message: str
    error: Optional[str] = None


def get_resume_repository(db: AsyncSession = Depends(get_db)) -> ResumeRepository:
    """Get resume repository instance."""
    return PostgresResumeRepository(db)


def _resume_to_dict(resume: Resume) -> dict:
    """Convert Resume entity to dictionary."""
    return {
        "id": str(resume.id),
        "user_id": str(resume.user_id),
        "jd_id": str(resume.jd_id) if resume.jd_id else None,
        "title": resume.title,
        "template_id": resume.template_id,
        "content": resume.content,
        "selected_experience_ids": [str(eid) for eid in resume.selected_experience_ids],
        "generation_config": resume.generation_config,
        "ai_suggestions": resume.ai_suggestions,
        "pdf_url": resume.pdf_url,
        "word_url": resume.word_url,
        "markdown_content": resume.markdown_content,
        "status": resume.status,
        "is_default": resume.is_default,
        "view_count": resume.view_count,
        "download_count": resume.download_count,
        "created_at": resume.created_at.isoformat(),
        "updated_at": resume.updated_at.isoformat(),
    }



@router.get(
    "",
    response_model=ResumeListResponse,
    summary="List resumes",
    description="List all resumes for the current user with pagination and filtering.",
)
async def list_resumes(
    status: Optional[str] = Query(
        None, description="Filter by status (draft, published, archived)"
    ),
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumeListResponse:
    """List all resumes for the current user with pagination and filtering.

    Args:
        status: Filter by status (draft, published, archived).
        page: Page number (1-based).
        page_size: Number of items per page.
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        List of resumes with pagination info.
    """
    resumes, total = await resume_repository.list_by_user(
        user_id=current_user.user.id,
        status=status,
        page=page,
        page_size=page_size,
    )

    return ResumeListResponse(
        success=True,
        data={
            "items": [_resume_to_dict(resume) for resume in resumes],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size,
            },
        },
        message="Resumes retrieved successfully",
        error=None,
    )


@router.get(
    "/{resume_id}",
    response_model=ResumeDetailResponse,
    summary="Get resume details",
    description="Get a single resume by ID.",
)
async def get_resume(
    resume_id: UUID,
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumeDetailResponse:
    """Get a single resume by ID.

    Args:
        resume_id: The resume's UUID.
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Resume details.
    """
    resume = await resume_repository.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Resume not found",
                "error": "RESUME_NOT_FOUND",
            },
        )

    # Check ownership
    if resume.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    # Increment view count
    resume.increment_view_count()
    await resume_repository.update(resume)

    return ResumeDetailResponse(
        success=True,
        data={"resume": _resume_to_dict(resume)},
        message="Resume retrieved successfully",
        error=None,
    )


@router.post(
    "",
    response_model=ResumeCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create resume",
    description="Create a new resume (draft).",
)
async def create_resume(
    request: ResumeCreateRequest,
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumeCreateResponse:
    """Create a new resume.

    Args:
        request: Resume creation request data.
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Created resume details.
    """
    resume = Resume.create(
        user_id=current_user.user.id,
        title=request.title,
        template_id=request.template_id,
        jd_id=request.jd_id,
        content=request.content,
        selected_experience_ids=request.selected_experience_ids,
        generation_config=request.generation_config,
    )

    created_resume = await resume_repository.create(resume)

    return ResumeCreateResponse(
        success=True,
        data={"resume": _resume_to_dict(created_resume)},
        message="Resume created successfully",
        error=None,
    )


@router.put(
    "/{resume_id}",
    response_model=ResumeUpdateResponse,
    summary="Update resume",
    description="Update an existing resume.",
)
async def update_resume(
    resume_id: UUID,
    request: ResumeUpdateRequest,
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumeUpdateResponse:
    """Update an existing resume.

    Args:
        resume_id: The resume's UUID.
        request: Resume update request data.
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Updated resume details.
    """
    resume = await resume_repository.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Resume not found",
                "error": "RESUME_NOT_FOUND",
            },
        )

    # Check ownership
    if resume.user_id != current_user.user.id:
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
    resume.update(
        title=request.title,
        template_id=request.template_id,
        content=request.content,
        selected_experience_ids=request.selected_experience_ids,
        generation_config=request.generation_config,
        ai_suggestions=request.ai_suggestions,
        markdown_content=request.markdown_content,
    )

    updated_resume = await resume_repository.update(resume)

    return ResumeUpdateResponse(
        success=True,
        data={"resume": _resume_to_dict(updated_resume)},
        message="Resume updated successfully",
        error=None,
    )


@router.delete(
    "/{resume_id}",
    response_model=ResumeDeleteResponse,
    summary="Delete resume",
    description="Delete a resume by ID.",
)
async def delete_resume(
    resume_id: UUID,
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumeDeleteResponse:
    """Delete a resume by ID.

    Args:
        resume_id: The resume's UUID.
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Deletion result.
    """
    resume = await resume_repository.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Resume not found",
                "error": "RESUME_NOT_FOUND",
            },
        )

    # Check ownership
    if resume.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    deleted = await resume_repository.delete(resume_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Resume not found",
                "error": "RESUME_NOT_FOUND",
            },
        )

    return ResumeDeleteResponse(
        success=True,
        data=None,
        message="Resume deleted successfully",
        error=None,
    )



@router.post(
    "/{resume_id}/generate",
    response_model=ResumeGenerateResponse,
    summary="Generate resume content",
    description="Generate resume content using AI (placeholder).",
)
async def generate_resume(
    resume_id: UUID,
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumeGenerateResponse:
    """Generate resume content using AI.

    Args:
        resume_id: The resume's UUID.
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Generation result.
    """
    resume = await resume_repository.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Resume not found",
                "error": "RESUME_NOT_FOUND",
            },
        )

    # Check ownership
    if resume.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    # Placeholder for AI generation logic
    # TODO: Implement actual AI generation use case
    placeholder_content = {
        "personal": {
            "name": f"{current_user.user.first_name or ''} {current_user.user.last_name or ''}".strip(),
            "email": current_user.user.email,
        },
        "summary": "A dedicated professional with extensive experience...",
        "experiences": [],
        "education": [],
        "skills": ["Python", "FastAPI", "PostgreSQL"],
    }

    placeholder_suggestions = {
        "improvements": [
            "Add more quantifiable achievements",
            "Include relevant certifications",
        ],
        "keywords": ["Python", "FastAPI", "PostgreSQL", "AI"],
        "tailoring_tips": [
            "Emphasize backend development experience",
            "Highlight API design skills",
        ],
    }

    resume.content = placeholder_content
    resume.set_ai_suggestions(placeholder_suggestions)
    await resume_repository.update(resume)

    return ResumeGenerateResponse(
        success=True,
        data={
            "resume_id": str(resume_id),
            "generation_status": "completed",
            "content": placeholder_content,
            "suggestions": placeholder_suggestions,
        },
        message="Resume content generated successfully",
        error=None,
    )


@router.post(
    "/{resume_id}/export/pdf",
    response_model=ResumeExportResponse,
    summary="Export resume to PDF",
    description="Export resume to PDF format (placeholder).",
)
async def export_resume_pdf(
    resume_id: UUID,
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumeExportResponse:
    """Export resume to PDF format.

    Args:
        resume_id: The resume's UUID.
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Export result with download URL.
    """
    resume = await resume_repository.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Resume not found",
                "error": "RESUME_NOT_FOUND",
            },
        )

    # Check ownership
    if resume.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    # Placeholder for PDF generation
    # TODO: Implement actual PDF generation
    placeholder_pdf_url = f"/api/v1/resumes/{resume_id}/download?format=pdf"
    resume.set_file_urls(pdf_url=placeholder_pdf_url)
    await resume_repository.update(resume)

    return ResumeExportResponse(
        success=True,
        data={
            "resume_id": str(resume_id),
            "format": "pdf",
            "download_url": placeholder_pdf_url,
            "status": "ready",
        },
        message="Resume exported to PDF successfully",
        error=None,
    )


@router.post(
    "/{resume_id}/publish",
    response_model=ResumePublishResponse,
    summary="Publish resume",
    description="Publish a resume to make it publicly accessible.",
)
async def publish_resume(
    resume_id: UUID,
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumePublishResponse:
    """Publish a resume.

    Args:
        resume_id: The resume's UUID.
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Publish result.
    """
    resume = await resume_repository.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Resume not found",
                "error": "RESUME_NOT_FOUND",
            },
        )

    # Check ownership
    if resume.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    resume.publish()
    await resume_repository.update(resume)

    return ResumePublishResponse(
        success=True,
        data={
            "resume_id": str(resume_id),
            "status": "published",
            "published_at": resume.updated_at.isoformat(),
        },
        message="Resume published successfully",
        error=None,
    )


@router.get(
    "/{resume_id}/download",
    response_model=ResumeDownloadResponse,
    summary="Download resume",
    description="Get download URL for resume file.",
)
async def download_resume(
    resume_id: UUID,
    format: str = Query("pdf", description="File format (pdf or word)"),
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    current_user: GetCurrentUserOutput = Depends(get_current_active_user),
) -> ResumeDownloadResponse:
    """Get download URL for resume file.

    Args:
        resume_id: The resume's UUID.
        format: File format (pdf or word).
        resume_repository: Resume repository for database operations.
        current_user: Current authenticated user.

    Returns:
        Download URL and file info.
    """
    resume = await resume_repository.get_by_id(resume_id)

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "success": False,
                "data": None,
                "message": "Resume not found",
                "error": "RESUME_NOT_FOUND",
            },
        )

    # Check ownership
    if resume.user_id != current_user.user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "data": None,
                "message": "Access denied",
                "error": "ACCESS_DENIED",
            },
        )

    # Increment download count
    resume.increment_download_count()
    await resume_repository.update(resume)

    # Get appropriate URL based on format
    if format == "pdf":
        download_url = resume.pdf_url or f"/api/v1/resumes/{resume_id}/export/pdf"
        filename = f"{resume.title.replace(' ', '_')}.pdf"
    elif format == "word":
        download_url = resume.word_url or f"/api/v1/resumes/{resume_id}/export/word"
        filename = f"{resume.title.replace(' ', '_')}.docx"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "data": None,
                "message": "Invalid format. Supported formats: pdf, word",
                "error": "INVALID_FORMAT",
            },
        )

    return ResumeDownloadResponse(
        success=True,
        data={
            "resume_id": str(resume_id),
            "format": format,
            "filename": filename,
            "download_url": download_url,
            "download_count": resume.download_count,
        },
        message="Download URL generated successfully",
        error=None,
    )
