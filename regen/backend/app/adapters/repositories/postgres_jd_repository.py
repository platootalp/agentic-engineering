"""PostgreSQL implementation of JDRepository."""

from typing import Optional, Any
from uuid import UUID

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.jd import JD
from app.domain.repositories.jd_repository import JDRepository


class PostgresJDRepository(JDRepository):
    """PostgreSQL implementation of JD repository using SQLAlchemy."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session.

        Args:
            session: SQLAlchemy async session.
        """
        self._session = session
        self._model = self._get_model()

    def _get_model(self):
        """Get or create the JD model class."""
        from app.database import Base
        from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
        from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
        import uuid

        class JDTable(Base):
            __tablename__ = "regen_job_descriptions"

            id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
            company_name = Column(String(255), nullable=False, index=True)
            position_title = Column(String(255), nullable=False, index=True)
            location = Column(String(255), nullable=True)
            salary_min = Column(Integer, nullable=True)
            salary_max = Column(Integer, nullable=True)
            raw_content = Column(Text, nullable=False)
            analysis = Column(JSONB, nullable=True)
            source = Column(String(255), nullable=True)
            is_analyzed = Column(Boolean, default=False, nullable=False, index=True)
            created_at = Column(DateTime, nullable=False)
            updated_at = Column(DateTime, nullable=False)

        return JDTable

    def _to_entity(self, model) -> JD:
        """Convert database model to domain entity.

        Args:
            model: SQLAlchemy model instance.

        Returns:
            JD domain entity.
        """
        return JD(
            id=model.id,
            company_name=model.company_name,
            position_title=model.position_title,
            location=model.location,
            salary_min=model.salary_min,
            salary_max=model.salary_max,
            raw_content=model.raw_content,
            analysis=model.analysis,
            source=model.source,
            is_analyzed=model.is_analyzed,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, jd: JD) -> Any:
        """Convert domain entity to database model.

        Args:
            jd: JD domain entity.

        Returns:
            SQLAlchemy model instance.
        """
        return self._model(
            id=jd.id,
            company_name=jd.company_name,
            position_title=jd.position_title,
            location=jd.location,
            salary_min=jd.salary_min,
            salary_max=jd.salary_max,
            raw_content=jd.raw_content,
            analysis=jd.analysis,
            source=jd.source,
            is_analyzed=jd.is_analyzed,
            created_at=jd.created_at,
            updated_at=jd.updated_at,
        )

    async def get_by_id(self, jd_id: UUID) -> Optional[JD]:
        """Get JD by ID."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == jd_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_all(
        self,
        search: Optional[str] = None,
        company_name: Optional[str] = None,
        position_title: Optional[str] = None,
        is_analyzed: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[JD], int]:
        """List JDs with optional filtering and pagination."""
        # Build base query
        query = select(self._model)
        count_query = select(func.count()).select_from(self._model)

        # Apply filters
        filters = []
        if search:
            search_term = f"%{search}%"
            filters.append(
                or_(
                    self._model.company_name.ilike(search_term),
                    self._model.position_title.ilike(search_term),
                )
            )
        if company_name:
            filters.append(self._model.company_name.ilike(f"%{company_name}%"))
        if position_title:
            filters.append(self._model.position_title.ilike(f"%{position_title}%"))
        if is_analyzed is not None:
            filters.append(self._model.is_analyzed == is_analyzed)

        # Apply filters to queries
        if filters:
            filter_condition = filters[0] if len(filters) == 1 else or_(*filters)
            query = query.where(filter_condition)
            count_query = count_query.where(filter_condition)

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

    async def create(self, jd: JD) -> JD:
        """Create a new JD."""
        model = self._to_model(jd)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, jd: JD) -> JD:
        """Update an existing JD."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == jd.id)
        )
        model = result.scalar_one_or_none()
        if not model:
            raise ValueError(f"JD with id {jd.id} not found")

        model.company_name = jd.company_name
        model.position_title = jd.position_title
        model.location = jd.location
        model.salary_min = jd.salary_min
        model.salary_max = jd.salary_max
        model.raw_content = jd.raw_content
        model.analysis = jd.analysis
        model.source = jd.source
        model.is_analyzed = jd.is_analyzed
        model.updated_at = jd.updated_at

        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def delete(self, jd_id: UUID) -> bool:
        """Delete a JD by ID."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == jd_id)
        )
        model = result.scalar_one_or_none()
        if not model:
            return False

        await self._session.delete(model)
        await self._session.flush()
        return True

    async def exists_by_id(self, jd_id: UUID) -> bool:
        """Check if a JD with the given ID exists."""
        result = await self._session.execute(
            select(self._model).where(self._model.id == jd_id)
        )
        return result.scalar_one_or_none() is not None
