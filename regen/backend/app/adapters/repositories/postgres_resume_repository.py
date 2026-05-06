"""PostgreSQL implementation of ResumeRepository."""

from typing import Optional, Any
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.resume import Resume
from app.domain.repositories.resume_repository import ResumeRepository


class PostgresResumeRepository(ResumeRepository):
    """PostgreSQL implementation of Resume repository using SQLAlchemy."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session.

        Args:
            session: SQLAlchemy async session.
        """
        self._session = session
        self._model = self._get_model()

    def _get_model(self):
        """Get or create the Resume model class."""
        from app.database import Base
        from sqlalchemy import (
            Column,
            String,
            Integer,
            Boolean,
            DateTime,
            Text,
            ForeignKey,
        )
        from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB, ARRAY
        import uuid

        class ResumeTable(Base):
            __tablename__ = "regen_resumes"

            id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
            user_id = Column(
                PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
            )
            jd_id = Column(
                PGUUID(as_uuid=True),
                ForeignKey("job_descriptions.id"),
                nullable=True,
                index=True,
            )
            title = Column(String(200), nullable=False)
            template_id = Column(String(100), nullable=False, default="modern")
            content = Column(JSONB, nullable=False, default=dict)
            selected_experience_ids = Column(ARRAY(PGUUID(as_uuid=True)), default=list)
            generation_config = Column(JSONB, nullable=True)
            ai_suggestions = Column(JSONB, nullable=True)
            pdf_url = Column(Text, nullable=True)
            word_url = Column(Text, nullable=True)
            markdown_content = Column(Text, nullable=True)
            status = Column(String(20), nullable=False, default="draft", index=True)
            is_default = Column(Boolean, default=False, nullable=False)
            view_count = Column(Integer, default=0, nullable=False)
            download_count = Column(Integer, default=0, nullable=False)
            created_at = Column(DateTime, nullable=False)
            updated_at = Column(DateTime, nullable=False)

        return ResumeTable

    def _to_entity(self, model) -> Resume:
        """Convert database model to domain entity.

        Args:
            model: SQLAlchemy model instance.

        Returns:
            Resume domain entity.
        """
        return Resume(
            id=model.id,
            user_id=model.user_id,
            jd_id=model.jd_id,
            title=model.title,
            template_id=model.template_id,
            content=model.content or {},
            selected_experience_ids=model.selected_experience_ids or [],
            generation_config=model.generation_config,
            ai_suggestions=model.ai_suggestions,
            pdf_url=model.pdf_url,
            word_url=model.word_url,
            markdown_content=model.markdown_content,
            status=model.status,
            is_default=model.is_default,
            view_count=model.view_count,
            download_count=model.download_count,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, resume: Resume) -> Any:
        """Convert domain entity to database model.

        Args:
            resume: Resume domain entity.

        Returns:
            SQLAlchemy model instance.
        """
        return self._model(
            id=resume.id,
            user_id=resume.user_id,
            jd_id=resume.jd_id,
            title=resume.title,
            template_id=resume.template_id,
            content=resume.content,
            selected_experience_ids=resume.selected_experience_ids,
            generation_config=resume.generation_config,
            ai_suggestions=resume.ai_suggestions,
            pdf_url=resume.pdf_url,
            word_url=resume.word_url,
            markdown_content=resume.markdown_content,
            status=resume.status,
            is_default=resume.is_default,
            view_count=resume.view_count,
            download_count=resume.download_count,
            created_at=resume.created_at,
            updated_at=resume.updated_at,
        )

    async def get_by_id(self, resume_id: UUID) -> Optional[Resume]:
        """Get resume by ID."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == resume_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_by_user(
        self,
        user_id: UUID,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Resume], int]:
        """List resumes for a user with optional filtering and pagination."""
        # Build base query
        query = select(self._model).where(self._model.user_id == user_id)
        count_query = (
            select(func.count())
            .select_from(self._model)
            .where(self._model.user_id == user_id)
        )

        # Apply status filter
        if status:
            query = query.where(self._model.status == status)
            count_query = count_query.where(self._model.status == status)

        # Get total count
        count_result = await self._session.execute(count_query)
        total = count_result.scalar() or 0

        # Apply pagination
        offset = (page - 1) * page_size
        query = (
            query.order_by(self._model.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )

        # Execute query
        result = await self._session.execute(query)
        models = result.scalars().all()

        return [self._to_entity(model) for model in models], total

    async def create(self, resume: Resume) -> Resume:
        """Create a new resume."""
        model = self._to_model(resume)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, resume: Resume) -> Resume:
        """Update an existing resume."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == resume.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Resume with id {resume.id} not found")

        model.user_id = resume.user_id
        model.jd_id = resume.jd_id
        model.title = resume.title
        model.template_id = resume.template_id
        model.content = resume.content
        model.selected_experience_ids = resume.selected_experience_ids
        model.generation_config = resume.generation_config
        model.ai_suggestions = resume.ai_suggestions
        model.pdf_url = resume.pdf_url
        model.word_url = resume.word_url
        model.markdown_content = resume.markdown_content
        model.status = resume.status
        model.is_default = resume.is_default
        model.view_count = resume.view_count
        model.download_count = resume.download_count
        model.updated_at = resume.updated_at

        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, resume_id: UUID) -> bool:
        """Delete a resume by ID."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == resume_id)
        )
        model = result.scalar_one_or_none()
        if not model:
            return False

        await self._session.delete(model)
        await self._session.flush()
        return True

    async def exists_by_id(self, resume_id: UUID) -> bool:
        """Check if a resume with the given ID exists."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == resume_id)
        )
        return result.scalar_one_or_none() is not None

    async def get_default_by_user(self, user_id: UUID) -> Optional[Resume]:
        """Get the default resume for a user."""
        result = await self._session.execute(
            select(self._model)
            .where(self._model.user_id == user_id)
            .where(self._model.is_default == True)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def clear_default_for_user(self, user_id: UUID) -> None:
        """Clear the default flag for all resumes of a user."""
        await self._session.execute(
            select(self._model)
            .where(self._model.user_id == user_id)
            .where(self._model.is_default == True)
        )
        # Note: This would need an update statement in real implementation
        # For now, this is a placeholder that would be implemented with proper SQLAlchemy update
