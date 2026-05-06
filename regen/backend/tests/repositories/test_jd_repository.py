"""Integration tests for PostgresJDRepository."""

import pytest
from datetime import datetime
from uuid import uuid4

from app.adapters.repositories.postgres_jd_repository import PostgresJDRepository
from app.domain.entities.jd import JD


@pytest.mark.asyncio
async def test_create_jd(db_session):
    """Test creating a new JD."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    jd = JD.create(
        company_name="Test Company",
        position_title="Software Engineer",
        raw_content="Looking for an experienced Python developer",
        location="Beijing",
        salary_min=30000,
        salary_max=50000,
        source="manual",
    )

    # Act
    created_jd = await repo.create(jd)

    # Assert
    assert created_jd.company_name == "Test Company"
    assert created_jd.position_title == "Software Engineer"
    assert created_jd.id is not None
    assert created_jd.location == "Beijing"
    assert created_jd.salary_min == 30000
    assert created_jd.salary_max == 50000
    assert created_jd.is_analyzed is False
    assert created_jd.created_at is not None


@pytest.mark.asyncio
async def test_get_jd_by_id(db_session):
    """Test retrieving a JD by ID."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    jd = JD.create(
        company_name="Test Company",
        position_title="Software Engineer",
        raw_content="Looking for an experienced Python developer",
    )
    created_jd = await repo.create(jd)

    # Act
    found_jd = await repo.get_by_id(created_jd.id)

    # Assert
    assert found_jd is not None
    assert found_jd.id == created_jd.id
    assert found_jd.company_name == "Test Company"
    assert found_jd.position_title == "Software Engineer"


@pytest.mark.asyncio
async def test_get_jd_by_id_not_found(db_session):
    """Test retrieving a non-existent JD by ID."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    non_existent_id = uuid4()

    # Act
    result = await repo.get_by_id(non_existent_id)

    # Assert
    assert result is None


@pytest.mark.asyncio
async def test_update_jd(db_session):
    """Test updating an existing JD."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    jd = JD.create(
        company_name="Test Company",
        position_title="Software Engineer",
        raw_content="Looking for an experienced Python developer",
    )
    created_jd = await repo.create(jd)

    # Modify JD
    created_jd.company_name = "Updated Company"
    created_jd.position_title = "Senior Software Engineer"
    created_jd.salary_min = 40000
    created_jd.salary_max = 60000
    created_jd.updated_at = datetime.utcnow()

    # Act
    updated_jd = await repo.update(created_jd)

    # Assert
    assert updated_jd.company_name == "Updated Company"
    assert updated_jd.position_title == "Senior Software Engineer"
    assert updated_jd.salary_min == 40000
    assert updated_jd.salary_max == 60000

    # Verify in database
    found_jd = await repo.get_by_id(created_jd.id)
    assert found_jd.company_name == "Updated Company"


@pytest.mark.asyncio
async def test_update_jd_not_found(db_session):
    """Test updating a non-existent JD raises error."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    non_existent_jd = JD.create(
        company_name="Test Company",
        position_title="Software Engineer",
        raw_content="Test content",
    )
    non_existent_jd.id = uuid4()

    # Act & Assert
    with pytest.raises(ValueError, match="JD with id .* not found"):
        await repo.update(non_existent_jd)


@pytest.mark.asyncio
async def test_delete_jd(db_session):
    """Test deleting a JD."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    jd = JD.create(
        company_name="Test Company",
        position_title="Software Engineer",
        raw_content="Test content",
    )
    created_jd = await repo.create(jd)

    # Act
    result = await repo.delete(created_jd.id)

    # Assert
    assert result is True

    # Verify JD is deleted
    found_jd = await repo.get_by_id(created_jd.id)
    assert found_jd is None


@pytest.mark.asyncio
async def test_delete_jd_not_found(db_session):
    """Test deleting a non-existent JD."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    non_existent_id = uuid4()

    # Act
    result = await repo.delete(non_existent_id)

    # Assert
    assert result is False


@pytest.mark.asyncio
async def test_exists_by_id(db_session):
    """Test checking if JD exists by ID."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    jd = JD.create(
        company_name="Test Company",
        position_title="Software Engineer",
        raw_content="Test content",
    )
    created_jd = await repo.create(jd)

    # Act & Assert
    assert await repo.exists_by_id(created_jd.id) is True
    assert await repo.exists_by_id(uuid4()) is False


@pytest.mark.asyncio
async def test_list_all_jds(db_session):
    """Test listing all JDs with pagination."""
    # Arrange
    repo = PostgresJDRepository(db_session)

    # Create multiple JDs
    for i in range(5):
        jd = JD.create(
            company_name=f"Company {i}",
            position_title=f"Position {i}",
            raw_content=f"Content {i}",
        )
        await repo.create(jd)

    # Act
    jds, total = await repo.list_all(page=1, page_size=10)

    # Assert
    assert total == 5
    assert len(jds) == 5


@pytest.mark.asyncio
async def test_list_all_jds_pagination(db_session):
    """Test JD pagination."""
    # Arrange
    repo = PostgresJDRepository(db_session)

    # Create multiple JDs
    for i in range(10):
        jd = JD.create(
            company_name=f"Company {i}",
            position_title=f"Position {i}",
            raw_content=f"Content {i}",
        )
        await repo.create(jd)

    # Act - Get first page
    jds_page1, total = await repo.list_all(page=1, page_size=5)

    # Assert
    assert total == 10
    assert len(jds_page1) == 5

    # Act - Get second page
    jds_page2, _ = await repo.list_all(page=2, page_size=5)
    assert len(jds_page2) == 5


@pytest.mark.asyncio
async def test_list_all_jds_search_by_company(db_session):
    """Test searching JDs by company name."""
    # Arrange
    repo = PostgresJDRepository(db_session)

    jd1 = JD.create(
        company_name="Google",
        position_title="Software Engineer",
        raw_content="Test content",
    )
    jd2 = JD.create(
        company_name="Microsoft",
        position_title="Senior Engineer",
        raw_content="Test content",
    )
    await repo.create(jd1)
    await repo.create(jd2)

    # Act
    jds, total = await repo.list_all(company_name="Google")

    # Assert
    assert total == 1
    assert len(jds) == 1
    assert jds[0].company_name == "Google"


@pytest.mark.asyncio
async def test_list_all_jds_search_by_position(db_session):
    """Test searching JDs by position title."""
    # Arrange
    repo = PostgresJDRepository(db_session)

    jd1 = JD.create(
        company_name="Company A",
        position_title="Software Engineer",
        raw_content="Test content",
    )
    jd2 = JD.create(
        company_name="Company B",
        position_title="Product Manager",
        raw_content="Test content",
    )
    await repo.create(jd1)
    await repo.create(jd2)

    # Act
    jds, total = await repo.list_all(position_title="Engineer")

    # Assert
    assert total == 1
    assert len(jds) == 1
    assert jds[0].position_title == "Software Engineer"


@pytest.mark.asyncio
async def test_list_all_jds_filter_by_analyzed(db_session):
    """Test filtering JDs by analyzed status."""
    # Arrange
    repo = PostgresJDRepository(db_session)

    jd1 = JD.create(
        company_name="Company A",
        position_title="Engineer",
        raw_content="Test content",
    )
    jd2 = JD.create(
        company_name="Company B",
        position_title="Manager",
        raw_content="Test content",
    )
    created1 = await repo.create(jd1)
    created2 = await repo.create(jd2)

    # Mark one as analyzed
    created1.set_analysis({"skills": ["Python"]})
    await repo.update(created1)

    # Act
    analyzed_jds, total_analyzed = await repo.list_all(is_analyzed=True)
    not_analyzed_jds, total_not_analyzed = await repo.list_all(is_analyzed=False)

    # Assert
    assert total_analyzed == 1
    assert total_not_analyzed == 1
    assert analyzed_jds[0].is_analyzed is True
    assert not_analyzed_jds[0].is_analyzed is False


@pytest.mark.asyncio
async def test_list_all_jds_general_search(db_session):
    """Test general search across company and position."""
    # Arrange
    repo = PostgresJDRepository(db_session)

    jd1 = JD.create(
        company_name="Google",
        position_title="Software Engineer",
        raw_content="Test content",
    )
    jd2 = JD.create(
        company_name="Microsoft",
        position_title="Senior Engineer",
        raw_content="Test content",
    )
    jd3 = JD.create(
        company_name="Apple",
        position_title="Product Manager",
        raw_content="Test content",
    )
    await repo.create(jd1)
    await repo.create(jd2)
    await repo.create(jd3)

    # Act - Search for "Engineer"
    jds, total = await repo.list_all(search="Engineer")

    # Assert
    assert total == 2
    assert all("Engineer" in jd.position_title for jd in jds)


@pytest.mark.asyncio
async def test_jd_set_analysis(db_session):
    """Test setting analysis on a JD."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    jd = JD.create(
        company_name="Test Company",
        position_title="Software Engineer",
        raw_content="Test content",
    )
    created_jd = await repo.create(jd)

    # Act
    analysis = {
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "requirements": ["5+ years experience"],
        "responsibilities": ["Build APIs"],
    }
    created_jd.set_analysis(analysis)
    updated_jd = await repo.update(created_jd)

    # Assert
    assert updated_jd.is_analyzed is True
    assert updated_jd.analysis == analysis


@pytest.mark.asyncio
async def test_jd_clear_analysis(db_session):
    """Test clearing analysis from a JD."""
    # Arrange
    repo = PostgresJDRepository(db_session)
    jd = JD.create(
        company_name="Test Company",
        position_title="Software Engineer",
        raw_content="Test content",
    )
    created_jd = await repo.create(jd)

    # Set analysis first
    created_jd.set_analysis({"skills": ["Python"]})
    updated = await repo.update(created_jd)
    assert updated.is_analyzed is True

    # Act - Clear analysis
    updated.clear_analysis()
    cleared = await repo.update(updated)

    # Assert
    assert cleared.is_analyzed is False
    assert cleared.analysis is None


@pytest.mark.asyncio
async def test_jd_salary_range_property(db_session):
    """Test the salary_range property of JD entity."""
    # Arrange
    repo = PostgresJDRepository(db_session)

    # Test with both min and max
    jd1 = JD.create(
        company_name="Company A",
        position_title="Engineer",
        raw_content="Test",
        salary_min=30000,
        salary_max=50000,
    )
    created1 = await repo.create(jd1)

    # Test with only min
    jd2 = JD.create(
        company_name="Company B",
        position_title="Engineer",
        raw_content="Test",
        salary_min=40000,
    )
    created2 = await repo.create(jd2)

    # Test with only max
    jd3 = JD.create(
        company_name="Company C",
        position_title="Engineer",
        raw_content="Test",
        salary_max=60000,
    )
    created3 = await repo.create(jd3)

    # Test with neither
    jd4 = JD.create(
        company_name="Company D",
        position_title="Engineer",
        raw_content="Test",
    )
    created4 = await repo.create(jd4)

    # Assert
    assert created1.salary_range == "30,000 - 50,000"
    assert created2.salary_range == "30,000+"
    assert created3.salary_range == "Up to 60,000"
    assert created4.salary_range is None
