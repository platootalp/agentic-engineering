"""Resume repository tests."""

import pytest
from datetime import datetime
from uuid import uuid4, UUID

from app.adapters.repositories.postgres_resume_repository import (
    PostgresResumeRepository,
)
from app.domain.entities.resume import Resume


class TestResumeRepository:
    """Test suite for PostgresResumeRepository."""

    @pytest.fixture
    def repository(self, db_session):
        """Create a repository instance for testing."""
        return PostgresResumeRepository(db_session)

    @pytest.fixture
    def sample_user_id(self) -> UUID:
        """Return a sample user ID."""
        return uuid4()

    @pytest.fixture
    def sample_jd_id(self) -> UUID:
        """Return a sample JD ID."""
        return uuid4()

    @pytest.mark.asyncio
    async def test_create_resume(self, repository, sample_user_id):
        """Test creating a resume."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
            template_id="modern",
            content={"personal_info": {"name": "Test User"}},
            selected_experience_ids=[uuid4(), uuid4()],
            generation_config={"model": "kimi"},
        )

        # Act
        created_resume = await repository.create(resume)

        # Assert
        assert created_resume.title == "My Resume"
        assert created_resume.template_id == "modern"
        assert created_resume.id is not None
        assert created_resume.user_id == sample_user_id
        assert created_resume.status == "draft"
        assert created_resume.is_default is False
        assert created_resume.view_count == 0
        assert created_resume.download_count == 0

    @pytest.mark.asyncio
    async def test_create_resume_minimal(self, repository, sample_user_id):
        """Test creating a resume with minimal fields."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="Simple Resume",
        )

        # Act
        created_resume = await repository.create(resume)

        # Assert
        assert created_resume.title == "Simple Resume"
        assert created_resume.template_id == "modern"
        assert created_resume.content == {}
        assert created_resume.selected_experience_ids == []

    @pytest.mark.asyncio
    async def test_get_by_id(self, repository, sample_user_id):
        """Test retrieving by ID."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
            content={"summary": "Test"},
        )
        created_resume = await repository.create(resume)

        # Act
        found_resume = await repository.get_by_id(created_resume.id)

        # Assert
        assert found_resume is not None
        assert found_resume.id == created_resume.id
        assert found_resume.title == "My Resume"

    @pytest.mark.asyncio
    async def test_get_by_id_not_found(self, repository):
        """Test retrieving a non-existent resume by ID."""
        # Arrange
        non_existent_id = uuid4()

        # Act
        result = await repository.get_by_id(non_existent_id)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_user_id(self, repository, sample_user_id):
        """Test retrieving all resumes for a user."""
        # Arrange
        for i in range(3):
            resume = Resume.create(
                user_id=sample_user_id,
                title=f"Resume {i}",
            )
            await repository.create(resume)

        # Act
        resumes, total = await repository.list_by_user(sample_user_id)

        # Assert
        assert total == 3
        assert len(resumes) == 3
        assert all(r.user_id == sample_user_id for r in resumes)

    @pytest.mark.asyncio
    async def test_get_by_user_id_with_status_filter(self, repository, sample_user_id):
        """Test retrieving resumes for a user with status filter."""
        # Arrange
        draft_resume = Resume.create(
            user_id=sample_user_id,
            title="Draft Resume",
        )
        await repository.create(draft_resume)

        published_resume = Resume.create(
            user_id=sample_user_id,
            title="Published Resume",
        )
        published_resume.publish()
        await repository.create(published_resume)

        # Act
        draft_resumes, draft_total = await repository.list_by_user(
            sample_user_id, status="draft"
        )
        published_resumes, published_total = await repository.list_by_user(
            sample_user_id, status="published"
        )

        # Assert
        assert draft_total == 1
        assert draft_resumes[0].status == "draft"
        assert published_total == 1
        assert published_resumes[0].status == "published"

    @pytest.mark.asyncio
    async def test_get_by_jd_id(self, repository, sample_user_id, sample_jd_id):
        """Test retrieving resumes for a JD."""
        # Arrange - Create resumes with and without JD association
        resume_with_jd = Resume.create(
            user_id=sample_user_id,
            title="JD Targeted Resume",
            jd_id=sample_jd_id,
        )
        await repository.create(resume_with_jd)

        resume_without_jd = Resume.create(
            user_id=sample_user_id,
            title="General Resume",
        )
        await repository.create(resume_without_jd)

        # Act - Get all resumes for user and verify JD association is stored
        resumes, total = await repository.list_by_user(sample_user_id)

        # Assert
        assert total == 2
        jd_resumes = [r for r in resumes if r.jd_id == sample_jd_id]
        assert len(jd_resumes) == 1
        assert jd_resumes[0].title == "JD Targeted Resume"

    @pytest.mark.asyncio
    async def test_update_resume(self, repository, sample_user_id):
        """Test updating a resume."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
            template_id="modern",
        )
        created_resume = await repository.create(resume)

        # Modify
        created_resume.title = "Updated Resume"
        created_resume.template_id = "classic"
        created_resume.content = {"updated": True}
        created_resume.status = "published"
        created_resume.updated_at = datetime.utcnow()

        # Act
        updated_resume = await repository.update(created_resume)

        # Assert
        assert updated_resume.title == "Updated Resume"
        assert updated_resume.template_id == "classic"
        assert updated_resume.content == {"updated": True}
        assert updated_resume.status == "published"

        # Verify in database
        found_resume = await repository.get_by_id(created_resume.id)
        assert found_resume.title == "Updated Resume"

    @pytest.mark.asyncio
    async def test_update_resume_not_found(self, repository):
        """Test updating a non-existent resume raises error."""
        # Arrange
        non_existent_resume = Resume.create(
            user_id=uuid4(),
            title="Test",
        )
        non_existent_resume.id = uuid4()

        # Act & Assert
        with pytest.raises(ValueError, match="Resume with id .* not found"):
            await repository.update(non_existent_resume)

    @pytest.mark.asyncio
    async def test_delete_resume(self, repository, sample_user_id):
        """Test deleting a resume."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
        )
        created_resume = await repository.create(resume)

        # Act
        result = await repository.delete(created_resume.id)

        # Assert
        assert result is True
        found_resume = await repository.get_by_id(created_resume.id)
        assert found_resume is None

    @pytest.mark.asyncio
    async def test_delete_resume_not_found(self, repository):
        """Test deleting a non-existent resume."""
        # Arrange
        non_existent_id = uuid4()

        # Act
        result = await repository.delete(non_existent_id)

        # Assert
        assert result is False

    @pytest.mark.asyncio
    async def test_get_default_resume(self, repository, sample_user_id):
        """Test retrieving default resume for user."""
        # Arrange
        regular_resume = Resume.create(
            user_id=sample_user_id,
            title="Regular Resume",
        )
        await repository.create(regular_resume)

        default_resume = Resume.create(
            user_id=sample_user_id,
            title="Default Resume",
        )
        default_resume.set_as_default()
        created_default = await repository.create(default_resume)

        # Act
        found_default = await repository.get_default_by_user(sample_user_id)

        # Assert
        assert found_default is not None
        assert found_default.id == created_default.id
        assert found_default.is_default is True

    @pytest.mark.asyncio
    async def test_get_default_resume_not_found(self, repository, sample_user_id):
        """Test retrieving default resume when none exists."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="Regular Resume",
        )
        await repository.create(resume)

        # Act
        found_default = await repository.get_default_by_user(sample_user_id)

        # Assert
        assert found_default is None

    @pytest.mark.asyncio
    async def test_set_default_resume(self, repository, sample_user_id):
        """Test setting a resume as default."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
        )
        created_resume = await repository.create(resume)
        assert created_resume.is_default is False

        # Act
        created_resume.set_as_default()
        updated = await repository.update(created_resume)

        # Assert
        assert updated.is_default is True

        # Verify it can be retrieved as default
        found_default = await repository.get_default_by_user(sample_user_id)
        assert found_default is not None
        assert found_default.id == created_resume.id

    @pytest.mark.asyncio
    async def test_exists_by_id(self, repository, sample_user_id):
        """Test checking if resume exists by ID."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
        )
        created_resume = await repository.create(resume)

        # Act & Assert
        assert await repository.exists_by_id(created_resume.id) is True
        assert await repository.exists_by_id(uuid4()) is False

    @pytest.mark.asyncio
    async def test_list_by_user_pagination(self, repository, sample_user_id):
        """Test pagination when listing resumes by user."""
        # Arrange
        for i in range(10):
            resume = Resume.create(
                user_id=sample_user_id,
                title=f"Resume {i}",
            )
            await repository.create(resume)

        # Act
        resumes_page1, total = await repository.list_by_user(
            sample_user_id, page=1, page_size=5
        )
        resumes_page2, _ = await repository.list_by_user(
            sample_user_id, page=2, page_size=5
        )

        # Assert
        assert total == 10
        assert len(resumes_page1) == 5
        assert len(resumes_page2) == 5

    @pytest.mark.asyncio
    async def test_list_by_user_different_users(self, repository):
        """Test that resumes are isolated by user."""
        # Arrange
        user1_id = uuid4()
        user2_id = uuid4()

        for i in range(3):
            resume = Resume.create(
                user_id=user1_id,
                title=f"User1 Resume {i}",
            )
            await repository.create(resume)

        for i in range(2):
            resume = Resume.create(
                user_id=user2_id,
                title=f"User2 Resume {i}",
            )
            await repository.create(resume)

        # Act
        user1_resumes, user1_total = await repository.list_by_user(user1_id)
        user2_resumes, user2_total = await repository.list_by_user(user2_id)

        # Assert
        assert user1_total == 3
        assert user2_total == 2
        assert all(r.user_id == user1_id for r in user1_resumes)
        assert all(r.user_id == user2_id for r in user2_resumes)

    @pytest.mark.asyncio
    async def test_resume_publish_and_archive(self, repository, sample_user_id):
        """Test publishing and archiving a resume."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
        )
        created_resume = await repository.create(resume)
        assert created_resume.status == "draft"

        # Act - Publish
        created_resume.publish()
        published = await repository.update(created_resume)

        # Assert
        assert published.status == "published"

        # Act - Archive
        published.archive()
        archived = await repository.update(published)

        # Assert
        assert archived.status == "archived"

    @pytest.mark.asyncio
    async def test_resume_increment_counts(self, repository, sample_user_id):
        """Test incrementing view and download counts."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
        )
        created_resume = await repository.create(resume)
        assert created_resume.view_count == 0
        assert created_resume.download_count == 0

        # Act
        created_resume.increment_view_count()
        created_resume.increment_download_count()
        updated = await repository.update(created_resume)

        # Assert
        assert updated.view_count == 1
        assert updated.download_count == 1

    @pytest.mark.asyncio
    async def test_resume_set_file_urls(self, repository, sample_user_id):
        """Test setting PDF and Word URLs."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
        )
        created_resume = await repository.create(resume)

        # Act
        created_resume.set_file_urls(
            pdf_url="https://example.com/resume.pdf",
            word_url="https://example.com/resume.docx",
        )
        updated = await repository.update(created_resume)

        # Assert
        assert updated.pdf_url == "https://example.com/resume.pdf"
        assert updated.word_url == "https://example.com/resume.docx"

    @pytest.mark.asyncio
    async def test_resume_set_ai_suggestions(self, repository, sample_user_id):
        """Test setting AI suggestions."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
        )
        created_resume = await repository.create(resume)

        suggestions = {
            "improvements": ["Add more details"],
            "skills_to_highlight": ["Python", "Leadership"],
        }

        # Act
        created_resume.set_ai_suggestions(suggestions)
        updated = await repository.update(created_resume)

        # Assert
        assert updated.ai_suggestions == suggestions

    @pytest.mark.asyncio
    async def test_resume_update_content(self, repository, sample_user_id):
        """Test updating resume content."""
        # Arrange
        resume = Resume.create(
            user_id=sample_user_id,
            title="My Resume",
            content={"old": "data"},
        )
        created_resume = await repository.create(resume)

        new_content = {
            "personal_info": {"name": "Test User", "email": "test@example.com"},
            "summary": "Experienced developer",
            "skills": ["Python", "FastAPI"],
        }

        # Act
        created_resume.update(content=new_content)
        updated = await repository.update(created_resume)

        # Assert
        assert updated.content == new_content
