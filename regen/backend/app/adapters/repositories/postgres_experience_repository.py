"""PostgreSQL implementation of ExperienceRepository."""

from typing import Optional, Any
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.experience import Experience
from app.domain.repositories.experience_repository import ExperienceRepository


class PostgresExperienceRepository(ExperienceRepository):
    """PostgreSQL implementation of Experience repository using SQLAlchemy."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session.

        Args:
            session: SQLAlchemy async session.
        """
        self._session = session
        self._model = self._get_model()

    def _get_model(self):
        """Get or create the Experience model class."""
        from app.database import Base
        from sqlalchemy import (
            Column,
            String,
            Date,
            DateTime,
            Boolean,
            Integer,
            Text,
            ARRAY,
        )
        from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
        import uuid

        class ExperienceTable(Base):
            __tablename__ = "regen_experiences"

            id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
            user_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
            type = Column(String(20), nullable=False, index=True)
            title = Column(String(200), nullable=False)
            organization = Column(String(200), nullable=True)
            location = Column(String(200), nullable=True)
            start_date = Column(Date, nullable=False)
            end_date = Column(Date, nullable=True)
            is_current = Column(Boolean, default=False, nullable=False)
            description = Column(Text, nullable=True)
            description_ai = Column(Text, nullable=True)
            skills = Column(ARRAY(String), nullable=True, default=list)
            achievements = Column(ARRAY(String), nullable=True, default=list)
            metadata = Column(JSONB, nullable=True, default=dict)
            order_index = Column(Integer, default=0, nullable=False)
            is_highlighted = Column(Boolean, default=False, nullable=False)
            created_at = Column(DateTime, nullable=False)
            updated_at = Column(DateTime, nullable=False)

        return ExperienceTable

    def _to_entity(self, model) -> Experience:
        """Convert database model to domain entity.

        Args:
            model: SQLAlchemy model instance.

        Returns:
            Experience domain entity.
        """
        return Experience(
            id=model.id,
            user_id=model.user_id,
            type=model.type,
            title=model.title,
            organization=model.organization,
            location=model.location,
            start_date=model.start_date,
            end_date=model.end_date,
            is_current=model.is_current,
            description=model.description,
            description_ai=model.description_ai,
            skills=model.skills or [],
            achievements=model.achievements or [],
            metadata=model.metadata or {},
            order_index=model.order_index,
            is_highlighted=model.is_highlighted,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, experience: Experience) -> Any:
        """Convert domain entity to database model.

        Args:
            experience: Experience domain entity.

        Returns:
            SQLAlchemy model instance.
        """
        return self._model(
            id=experience.id,
            user_id=experience.user_id,
            type=experience.type,
            title=experience.title,
            organization=experience.organization,
            location=experience.location,
            start_date=experience.start_date,
            end_date=experience.end_date,
            is_current=experience.is_current,
            description=experience.description,
            description_ai=experience.description_ai,
            skills=experience.skills,
            achievements=experience.achievements,
            metadata=experience.metadata,
            order_index=experience.order_index,
            is_highlighted=experience.is_highlighted,
            created_at=experience.created_at,
            updated_at=experience.updated_at,
        )

    async def get_by_id(self, experience_id: UUID) -> Optional[Experience]:
        """Get experience by ID."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == experience_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_user(
        self,
        user_id: UUID,
        type: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Experience], int]:
        """Get experiences by user ID with optional type filter."""
        # Build base query
        query = select(self._model).where(self._model.user_id == user_id)
        count_query = (
            select(func.count())
            .select_from(self._model)
            .where(self._model.user_id == user_id)
        )

        # Apply type filter if provided
        if type:
            query = query.where(self._model.type == type)
            count_query = count_query.where(self._model.type == type)

        # Get total count
        count_result = await self._session.execute(count_query)
        total = count_result.scalar() or 0

        # Apply ordering and pagination
        offset = (page - 1) * page_size
        query = (
            query.order_by(self._model.order_index.asc(), self._model.start_date.desc())
            .offset(offset)
            .limit(page_size)
        )

        # Execute query
        result = await self._session.execute(query)
        models = result.scalars().all()

        return [self._to_entity(model) for model in models], total

    async def create(self, experience: Experience) -> Experience:
        """Create a new experience."""
        model = self._to_model(experience)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, experience: Experience) -> Experience:
        """Update an existing experience."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == experience.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"Experience with id {experience.id} not found")

        model.type = experience.type
        model.title = experience.title
        model.organization = experience.organization
        model.location = experience.location
        model.start_date = experience.start_date
        model.end_date = experience.end_date
        model.is_current = experience.is_current
        model.description = experience.description
        model.description_ai = experience.description_ai
        model.skills = experience.skills
        model.achievements = experience.achievements
        model.metadata = experience.metadata
        model.order_index = experience.order_index
        model.is_highlighted = experience.is_highlighted
        model.updated_at = experience.updated_at

        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, experience_id: UUID) -> bool:
        """Delete an experience by ID."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == experience_id)
        )
        model = result.scalar_one_or_none()
        if not model:
            return False

        await self._session.delete(model)
        await self._session.flush()
        return True

    async def exists_by_id(self, experience_id: UUID) -> bool:
        """Check if an experience with the given ID exists."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == experience_id)
        )
        return result.scalar_one_or_none() is not None
