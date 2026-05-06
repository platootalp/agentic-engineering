"""Unit tests for JD use cases."""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

import pytest

from app.domain.entities.jd import JD
from app.use_cases.jd.create_jd import (
    CreateJDInput,
    CreateJDOutput,
    CreateJDUseCase,
)
from app.use_cases.jd.get_jd_list import (
    GetJDListInput,
    GetJDListOutput,
    GetJDListUseCase,
)
from app.use_cases.jd.get_jd_detail import (
    GetJDDetailInput,
    GetJDDetailOutput,
    GetJDDetailUseCase,
)
from app.use_cases.jd.delete_jd import (
    DeleteJDInput,
    DeleteJDOutput,
    DeleteJDUseCase,
)


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def mock_jd_repository():
    """Create a mock JD repository."""
    repo = MagicMock()
    repo.get_by_id = AsyncMock()
    repo.list_all = AsyncMock()
    repo.create = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    repo.exists_by_id = AsyncMock()
    return repo


@pytest.fixture
def sample_jd():
    """Create a sample JD entity."""
    return JD(
        id=uuid4(),
        company_name="Test Company",
        position_title="Senior Software Engineer",
        location="Beijing",
        salary_min=30000,
        salary_max=50000,
        raw_content="Looking for an experienced Python developer...",
        analysis={
            "required_skills": ["Python", "FastAPI", "PostgreSQL"],
            "responsibilities": ["Build APIs", "Design systems"],
        },
        source="manual",
        is_analyzed=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_jd_unanalyzed():
    """Create a sample unanalyzed JD entity."""
    return JD(
        id=uuid4(),
        company_name="Another Company",
        position_title="Junior Developer",
        location="Shanghai",
        salary_min=None,
        salary_max=None,
        raw_content="Entry level position...",
        analysis=None,
        source="linkedin",
        is_analyzed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def multiple_jds():
    """Create multiple JD entities for list testing."""
    return [
        JD(
            id=uuid4(),
            company_name=f"Company {i}",
            position_title=f"Position {i}",
            location="Beijing" if i % 2 == 0 else "Shanghai",
            salary_min=20000 + i * 5000,
            salary_max=40000 + i * 5000,
            raw_content=f"Job description {i}",
            analysis={"skills": ["Python"]} if i % 2 == 0 else None,
            source="manual" if i % 2 == 0 else "linkedin",
            is_analyzed=i % 2 == 0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        for i in range(5)
    ]


# =============================================================================
# CreateJDUseCase Tests
# =============================================================================


class TestCreateJDUseCase:
    """Tests for CreateJDUseCase."""

    @pytest.mark.asyncio
    async def test_create_jd_success(self, mock_jd_repository, sample_jd):
        """Test successful JD creation."""
        # Arrange
        mock_jd_repository.create.return_value = sample_jd

        use_case = CreateJDUseCase(mock_jd_repository)
        input_data = CreateJDInput(
            company_name="Test Company",
            position_title="Senior Software Engineer",
            raw_content="Looking for an experienced Python developer...",
            location="Beijing",
            salary_min=30000,
            salary_max=50000,
            source="manual",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.jd is not None
        assert result.jd.company_name == "Test Company"
        assert result.jd.position_title == "Senior Software Engineer"
        assert result.jd.location == "Beijing"
        assert result.jd.salary_min == 30000
        assert result.jd.salary_max == 50000
        assert result.jd.raw_content == "Looking for an experienced Python developer..."
        assert result.jd.source == "manual"
        assert result.error is None
        mock_jd_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_jd_minimal_data(self, mock_jd_repository):
        """Test JD creation with minimal required data."""
        # Arrange
        jd = JD(
            id=uuid4(),
            company_name="Minimal Company",
            position_title="Developer",
            raw_content="Simple job description",
        )
        mock_jd_repository.create.return_value = jd

        use_case = CreateJDUseCase(mock_jd_repository)
        input_data = CreateJDInput(
            company_name="Minimal Company",
            position_title="Developer",
            raw_content="Simple job description",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.jd is not None
        assert result.jd.company_name == "Minimal Company"
        assert result.jd.position_title == "Developer"
        assert result.jd.location is None
        assert result.jd.salary_min is None
        assert result.jd.salary_max is None

    @pytest.mark.asyncio
    async def test_create_jd_missing_company_name(self, mock_jd_repository):
        """Test JD creation with missing company name."""
        # Arrange
        use_case = CreateJDUseCase(mock_jd_repository)
        input_data = CreateJDInput(
            company_name="",
            position_title="Developer",
            raw_content="Job description",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "Company name is required" in result.message
        assert result.jd is None
        mock_jd_repository.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_create_jd_missing_position_title(self, mock_jd_repository):
        """Test JD creation with missing position title."""
        # Arrange
        use_case = CreateJDUseCase(mock_jd_repository)
        input_data = CreateJDInput(
            company_name="Company",
            position_title="",
            raw_content="Job description",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "Position title is required" in result.message

    @pytest.mark.asyncio
    async def test_create_jd_missing_raw_content(self, mock_jd_repository):
        """Test JD creation with missing raw content."""
        # Arrange
        use_case = CreateJDUseCase(mock_jd_repository)
        input_data = CreateJDInput(
            company_name="Company",
            position_title="Developer",
            raw_content="",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "Raw content is required" in result.message

    @pytest.mark.asyncio
    async def test_create_jd_whitespace_only_company_name(self, mock_jd_repository):
        """Test JD creation with whitespace-only company name."""
        # Arrange
        use_case = CreateJDUseCase(mock_jd_repository)
        input_data = CreateJDInput(
            company_name="   ",
            position_title="Developer",
            raw_content="Job description",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"

    @pytest.mark.asyncio
    async def test_create_jd_invalid_salary_range(self, mock_jd_repository):
        """Test JD creation with min salary greater than max."""
        # Arrange
        use_case = CreateJDUseCase(mock_jd_repository)
        input_data = CreateJDInput(
            company_name="Company",
            position_title="Developer",
            raw_content="Job description",
            salary_min=50000,
            salary_max=30000,
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "Minimum salary cannot be greater" in result.message

    @pytest.mark.asyncio
    async def test_create_jd_valid_salary_range_with_none(self, mock_jd_repository, sample_jd):
        """Test JD creation with only min or max salary set."""
        # Arrange
        mock_jd_repository.create.return_value = sample_jd

        use_case = CreateJDUseCase(mock_jd_repository)

        # Only min salary
        input_data = CreateJDInput(
            company_name="Company",
            position_title="Developer",
            raw_content="Job description",
            salary_min=30000,
            salary_max=None,
        )
        result = await use_case.execute(input_data)
        assert result.success is True

        # Only max salary
        input_data = CreateJDInput(
            company_name="Company",
            position_title="Developer",
            raw_content="Job description",
            salary_min=None,
            salary_max=50000,
        )
        result = await use_case.execute(input_data)
        assert result.success is True

    @pytest.mark.asyncio
    async def test_create_jd_repository_exception(self, mock_jd_repository):
        """Test JD creation when repository raises exception."""
        # Arrange
        mock_jd_repository.create.side_effect = Exception("Database connection failed")

        use_case = CreateJDUseCase(mock_jd_repository)
        input_data = CreateJDInput(
            company_name="Company",
            position_title="Developer",
            raw_content="Job description",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "INTERNAL_ERROR"
        assert "Failed to create JD" in result.message


# =============================================================================
# GetJDListUseCase Tests
# =============================================================================


class TestGetJDListUseCase:
    """Tests for GetJDListUseCase."""

    @pytest.mark.asyncio
    async def test_get_jd_list_success(self, mock_jd_repository, multiple_jds):
        """Test successful JD list retrieval."""
        # Arrange
        mock_jd_repository.list_all.return_value = (multiple_jds, len(multiple_jds))

        use_case = GetJDListUseCase(mock_jd_repository)
        input_data = GetJDListInput(page=1, page_size=20)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert len(result.items) == 5
        assert result.pagination.page == 1
        assert result.pagination.page_size == 20
        assert result.pagination.total == 5
        assert result.pagination.total_pages == 1
        assert result.pagination.has_next is False
        assert result.pagination.has_prev is False
        assert result.error is None
        mock_jd_repository.list_all.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_jd_list_empty(self, mock_jd_repository):
        """Test JD list retrieval with no results."""
        # Arrange
        mock_jd_repository.list_all.return_value = ([], 0)

        use_case = GetJDListUseCase(mock_jd_repository)
        input_data = GetJDListInput(page=1, page_size=20)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert len(result.items) == 0
        assert result.pagination.total == 0
        assert result.pagination.total_pages == 1

    @pytest.mark.asyncio
    async def test_get_jd_list_with_pagination(self, mock_jd_repository, multiple_jds):
        """Test JD list with pagination."""
        # Arrange
        mock_jd_repository.list_all.return_value = (multiple_jds[:2], 5)

        use_case = GetJDListUseCase(mock_jd_repository)
        input_data = GetJDListInput(page=1, page_size=2)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert len(result.items) == 2
        assert result.pagination.page == 1
        assert result.pagination.page_size == 2
        assert result.pagination.total == 5
        assert result.pagination.total_pages == 3
        assert result.pagination.has_next is True
        assert result.pagination.has_prev is False

    @pytest.mark.asyncio
    async def test_get_jd_list_with_filters(self, mock_jd_repository, multiple_jds):
        """Test JD list with search filters."""
        # Arrange
        filtered_jds = [jd for jd in multiple_jds if jd.is_analyzed]
        mock_jd_repository.list_all.return_value = (filtered_jds, len(filtered_jds))

        use_case = GetJDListUseCase(mock_jd_repository)
        input_data = GetJDListInput(
            search="Company",
            company_name="Company",
            position_title="Position",
            is_analyzed=True,
            page=1,
            page_size=20,
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        mock_jd_repository.list_all.assert_called_once_with(
            search="Company",
            company_name="Company",
            position_title="Position",
            is_analyzed=True,
            page=1,
            page_size=20,
        )

    @pytest.mark.asyncio
    async def test_get_jd_list_invalid_page_number(self, mock_jd_repository, multiple_jds):
        """Test JD list with invalid page number (should normalize to 1)."""
        # Arrange
        mock_jd_repository.list_all.return_value = (multiple_jds, len(multiple_jds))

        use_case = GetJDListUseCase(mock_jd_repository)
        input_data = GetJDListInput(page=0, page_size=20)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.pagination.page == 1  # Normalized to 1

    @pytest.mark.asyncio
    async def test_get_jd_list_invalid_page_size(self, mock_jd_repository, multiple_jds):
        """Test JD list with invalid page size (should normalize)."""
        # Arrange
        mock_jd_repository.list_all.return_value = (multiple_jds, len(multiple_jds))

        use_case = GetJDListUseCase(mock_jd_repository)
        input_data = GetJDListInput(page=1, page_size=200)  # Too large

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.pagination.page_size == 100  # Capped at 100

    @pytest.mark.asyncio
    async def test_get_jd_list_repository_exception(self, mock_jd_repository):
        """Test JD list when repository raises exception."""
        # Arrange
        mock_jd_repository.list_all.side_effect = Exception("Database connection failed")

        use_case = GetJDListUseCase(mock_jd_repository)
        input_data = GetJDListInput(page=1, page_size=20)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "INTERNAL_ERROR"
        assert len(result.items) == 0
        assert result.pagination.total == 0


# =============================================================================
# GetJDDetailUseCase Tests
# =============================================================================


class TestGetJDDetailUseCase:
    """Tests for GetJDDetailUseCase."""

    @pytest.mark.asyncio
    async def test_get_jd_detail_success(self, mock_jd_repository, sample_jd):
        """Test successful JD detail retrieval."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = sample_jd

        use_case = GetJDDetailUseCase(mock_jd_repository)
        input_data = GetJDDetailInput(jd_id=sample_jd.id)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.jd is not None
        assert result.jd.id == str(sample_jd.id)
        assert result.jd.company_name == sample_jd.company_name
        assert result.jd.position_title == sample_jd.position_title
        assert result.jd.location == sample_jd.location
        assert result.jd.salary_min == sample_jd.salary_min
        assert result.jd.salary_max == sample_jd.salary_max
        assert result.jd.salary_range == sample_jd.salary_range
        assert result.jd.raw_content == sample_jd.raw_content
        assert result.jd.analysis == sample_jd.analysis
        assert result.jd.is_analyzed == sample_jd.is_analyzed
        assert result.error is None
        mock_jd_repository.get_by_id.assert_called_once_with(sample_jd.id)

    @pytest.mark.asyncio
    async def test_get_jd_detail_not_found(self, mock_jd_repository):
        """Test JD detail retrieval when JD not found."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = None

        use_case = GetJDDetailUseCase(mock_jd_repository)
        jd_id = uuid4()
        input_data = GetJDDetailInput(jd_id=jd_id)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "NOT_FOUND"
        assert result.jd is None
        assert "not found" in result.message

    @pytest.mark.asyncio
    async def test_get_jd_detail_unanalyzed(self, mock_jd_repository, sample_jd_unanalyzed):
        """Test JD detail retrieval for unanalyzed JD."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = sample_jd_unanalyzed

        use_case = GetJDDetailUseCase(mock_jd_repository)
        input_data = GetJDDetailInput(jd_id=sample_jd_unanalyzed.id)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.jd is not None
        assert result.jd.is_analyzed is False
        assert result.jd.analysis is None

    @pytest.mark.asyncio
    async def test_get_jd_detail_repository_exception(self, mock_jd_repository):
        """Test JD detail retrieval when repository raises exception."""
        # Arrange
        mock_jd_repository.get_by_id.side_effect = Exception("Database connection failed")

        use_case = GetJDDetailUseCase(mock_jd_repository)
        jd_id = uuid4()
        input_data = GetJDDetailInput(jd_id=jd_id)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "INTERNAL_ERROR"
        assert result.jd is None


# =============================================================================
# DeleteJDUseCase Tests
# =============================================================================


class TestDeleteJDUseCase:
    """Tests for DeleteJDUseCase."""

    @pytest.mark.asyncio
    async def test_delete_jd_success(self, mock_jd_repository):
        """Test successful JD deletion."""
        # Arrange
        mock_jd_repository.exists_by_id.return_value = True
        mock_jd_repository.delete.return_value = True

        use_case = DeleteJDUseCase(mock_jd_repository)
        jd_id = uuid4()
        input_data = DeleteJDInput(jd_id=jd_id)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.error is None
        assert "deleted successfully" in result.message
        mock_jd_repository.exists_by_id.assert_called_once_with(jd_id)
        mock_jd_repository.delete.assert_called_once_with(jd_id)

    @pytest.mark.asyncio
    async def test_delete_jd_not_found(self, mock_jd_repository):
        """Test JD deletion when JD not found."""
        # Arrange
        mock_jd_repository.exists_by_id.return_value = False

        use_case = DeleteJDUseCase(mock_jd_repository)
        jd_id = uuid4()
        input_data = DeleteJDInput(jd_id=jd_id)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "NOT_FOUND"
        assert "not found" in result.message
        mock_jd_repository.exists_by_id.assert_called_once_with(jd_id)
        mock_jd_repository.delete.assert_not_called()

    @pytest.mark.asyncio
    async def test_delete_jd_delete_failed(self, mock_jd_repository):
        """Test JD deletion when delete operation fails."""
        # Arrange
        mock_jd_repository.exists_by_id.return_value = True
        mock_jd_repository.delete.return_value = False

        use_case = DeleteJDUseCase(mock_jd_repository)
        jd_id = uuid4()
        input_data = DeleteJDInput(jd_id=jd_id)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "DELETE_FAILED"
        assert "Failed to delete" in result.message

    @pytest.mark.asyncio
    async def test_delete_jd_repository_exception(self, mock_jd_repository):
        """Test JD deletion when repository raises exception."""
        # Arrange
        mock_jd_repository.exists_by_id.side_effect = Exception("Database connection failed")

        use_case = DeleteJDUseCase(mock_jd_repository)
        jd_id = uuid4()
        input_data = DeleteJDInput(jd_id=jd_id)

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "INTERNAL_ERROR"
        assert "Failed to delete JD" in result.message
