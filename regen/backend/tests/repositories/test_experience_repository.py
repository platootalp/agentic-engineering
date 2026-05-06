"""Integration tests for PostgresExperienceRepository."""

import pytest
from datetime import date, datetime
from uuid import uuid4

from app.adapters.repositories.postgres_experience_repository import PostgresExperienceRepository
from app.domain.entities.experience import Experience


@pytest.mark.asyncio
async def test_create_experience(db_session):
    """Test creating a new experience."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        organization="Tech Corp",
        location="Beijing",
        start_date=date(2020, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=False,
        description="Developed scalable web applications",
        skills=["Python", "Django", "AWS"],
        achievements=["Led team of 5", "Improved performance"],
        order_index=1,
        is_highlighted=True,
    )
    created_exp = await repo.create(experience)
    assert created_exp.title == "Software Engineer"
    assert created_exp.organization == "Tech Corp"
    assert created_exp.id is not None
    assert created_exp.user_id == user_id
    assert created_exp.type == "work"
    assert created_exp.skills == ["Python", "Django", "AWS"]
    assert created_exp.achievements == ["Led team of 5", "Improved performance"]
    assert created_exp.is_highlighted is True


@pytest.mark.asyncio
async def test_create_experience_minimal(db_session):
    """Test creating an experience with minimal fields."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="education",
        title="Bachelor of Science",
    )
    created_exp = await repo.create(experience)
    assert created_exp.title == "Bachelor of Science"
    assert created_exp.type == "education"
    assert created_exp.organization is None
    assert created_exp.skills == []
    assert created_exp.achievements == []


@pytest.mark.asyncio
async def test_get_experience_by_id(db_session):
    """Test retrieving an experience by ID."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        organization="Tech Corp",
        start_date=date(2020, 1, 1),
    )
    created_exp = await repo.create(experience)
    found_exp = await repo.get_by_id(created_exp.id)
    assert found_exp is not None
    assert found_exp.id == created_exp.id
    assert found_exp.title == "Software Engineer"
    assert found_exp.organization == "Tech Corp"


@pytest.mark.asyncio
async def test_get_experience_by_id_not_found(db_session):
    """Test retrieving a non-existent experience by ID."""
    repo = PostgresExperienceRepository(db_session)
    non_existent_id = uuid4()
    result = await repo.get_by_id(non_existent_id)
    assert result is None


@pytest.mark.asyncio
async def test_update_experience(db_session):
    """Test updating an existing experience."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        organization="Tech Corp",
        start_date=date(2020, 1, 1),
    )
    created_exp = await repo.create(experience)
    created_exp.title = "Senior Software Engineer"
    created_exp.organization = "New Corp"
    created_exp.description = "Updated description"
    created_exp.skills = ["Python", "FastAPI"]
    created_exp.updated_at = datetime.utcnow()
    updated_exp = await repo.update(created_exp)
    assert updated_exp.title == "Senior Software Engineer"
    assert updated_exp.organization == "New Corp"
    assert updated_exp.description == "Updated description"
    assert updated_exp.skills == ["Python", "FastAPI"]
    found_exp = await repo.get_by_id(created_exp.id)
    assert found_exp.title == "Senior Software Engineer"


@pytest.mark.asyncio
async def test_update_experience_not_found(db_session):
    """Test updating a non-existent experience raises error."""
    repo = PostgresExperienceRepository(db_session)
    non_existent_exp = Experience.create(
        user_id=uuid4(),
        type="work",
        title="Test",
        start_date=date(2020, 1, 1),
    )
    non_existent_exp.id = uuid4()
    with pytest.raises(ValueError, match="Experience with id .* not found"):
        await repo.update(non_existent_exp)


@pytest.mark.asyncio
async def test_delete_experience(db_session):
    """Test deleting an experience."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        start_date=date(2020, 1, 1),
    )
    created_exp = await repo.create(experience)
    result = await repo.delete(created_exp.id)
    assert result is True
    found_exp = await repo.get_by_id(created_exp.id)
    assert found_exp is None


@pytest.mark.asyncio
async def test_delete_experience_not_found(db_session):
    """Test deleting a non-existent experience."""
    repo = PostgresExperienceRepository(db_session)
    non_existent_id = uuid4()
    result = await repo.delete(non_existent_id)
    assert result is False


@pytest.mark.asyncio
async def test_exists_by_id(db_session):
    """Test checking if experience exists by ID."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        start_date=date(2020, 1, 1),
    )
    created_exp = await repo.create(experience)
    assert await repo.exists_by_id(created_exp.id) is True
    assert await repo.exists_by_id(uuid4()) is False


@pytest.mark.asyncio
async def test_get_by_user(db_session):
    """Test retrieving experiences by user ID."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    for i in range(3):
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title=f"Position {i}",
            organization=f"Company {i}",
            start_date=date(2020 + i, 1, 1),
            order_index=i,
        )
        await repo.create(exp)
    experiences, total = await repo.get_by_user(user_id)
    assert total == 3
    assert len(experiences) == 3
    assert all(exp.user_id == user_id for exp in experiences)


@pytest.mark.asyncio
async def test_get_by_user_with_type_filter(db_session):
    """Test retrieving experiences by user ID with type filter."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    work_exp = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        start_date=date(2020, 1, 1),
    )
    await repo.create(work_exp)
    edu_exp = Experience.create(
        user_id=user_id,
        type="education",
        title="Bachelor Degree",
        start_date=date(2016, 1, 1),
    )
    await repo.create(edu_exp)
    proj_exp = Experience.create(
        user_id=user_id,
        type="project",
        title="Open Source Project",
        start_date=date(2021, 1, 1),
    )
    await repo.create(proj_exp)
    work_exps, work_total = await repo.get_by_user(user_id, type="work")
    edu_exps, edu_total = await repo.get_by_user(user_id, type="education")
    assert work_total == 1
    assert len(work_exps) == 1
    assert work_exps[0].type == "work"
    assert edu_total == 1
    assert len(edu_exps) == 1
    assert edu_exps[0].type == "education"


@pytest.mark.asyncio
async def test_get_by_user_pagination(db_session):
    """Test pagination when retrieving experiences by user."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    for i in range(10):
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title=f"Position {i}",
            start_date=date(2020, 1, 1),
            order_index=i,
        )
        await repo.create(exp)
    exps_page1, total = await repo.get_by_user(user_id, page=1, page_size=5)
    assert total == 10
    assert len(exps_page1) == 5
    exps_page2, _ = await repo.get_by_user(user_id, page=2, page_size=5)
    assert len(exps_page2) == 5


@pytest.mark.asyncio
async def test_get_by_user_different_users(db_session):
    """Test that experiences are isolated by user."""
    repo = PostgresExperienceRepository(db_session)
    user1_id = uuid4()
    user2_id = uuid4()
    for i in range(3):
        exp = Experience.create(
            user_id=user1_id,
            type="work",
            title=f"User1 Position {i}",
            start_date=date(2020, 1, 1),
        )
        await repo.create(exp)
    for i in range(2):
        exp = Experience.create(
            user_id=user2_id,
            type="work",
            title=f"User2 Position {i}",
            start_date=date(2020, 1, 1),
        )
        await repo.create(exp)
    user1_exps, user1_total = await repo.get_by_user(user1_id)
    user2_exps, user2_total = await repo.get_by_user(user2_id)
    assert user1_total == 3
    assert user2_total == 2
    assert all(exp.user_id == user1_id for exp in user1_exps)
    assert all(exp.user_id == user2_id for exp in user2_exps)


@pytest.mark.asyncio
async def test_experience_skills_management(db_session):
    """Test adding and removing skills from experience."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        start_date=date(2020, 1, 1),
        skills=["Python"],
    )
    created_exp = await repo.create(experience)
    created_exp.add_skill("FastAPI")
    updated = await repo.update(created_exp)
    assert "FastAPI" in updated.skills
    assert "Python" in updated.skills
    updated.remove_skill("Python")
    updated2 = await repo.update(updated)
    assert "Python" not in updated2.skills
    assert "FastAPI" in updated2.skills


@pytest.mark.asyncio
async def test_experience_achievements_management(db_session):
    """Test adding and removing achievements from experience."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        start_date=date(2020, 1, 1),
        achievements=["Initial achievement"],
    )
    created_exp = await repo.create(experience)
    created_exp.add_achievement("New achievement")
    updated = await repo.update(created_exp)
    assert "New achievement" in updated.achievements
    assert "Initial achievement" in updated.achievements
    updated.remove_achievement("Initial achievement")
    updated2 = await repo.update(updated)
    assert "Initial achievement" not in updated2.achievements
    assert "New achievement" in updated2.achievements


@pytest.mark.asyncio
async def test_experience_toggle_current(db_session):
    """Test toggling is_current status."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        start_date=date(2020, 1, 1),
        end_date=date(2023, 12, 31),
        is_current=False,
    )
    created_exp = await repo.create(experience)
    assert created_exp.is_current is False
    created_exp.toggle_current()
    updated = await repo.update(created_exp)
    assert updated.is_current is True
    assert updated.end_date is None


@pytest.mark.asyncio
async def test_experience_toggle_highlighted(db_session):
    """Test toggling is_highlighted status."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        start_date=date(2020, 1, 1),
        is_highlighted=False,
    )
    created_exp = await repo.create(experience)
    assert created_exp.is_highlighted is False
    created_exp.toggle_highlighted()
    updated = await repo.update(created_exp)
    assert updated.is_highlighted is True


@pytest.mark.asyncio
async def test_experience_ai_description(db_session):
    """Test setting and clearing AI description."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    experience = Experience.create(
        user_id=user_id,
        type="work",
        title="Software Engineer",
        start_date=date(2020, 1, 1),
    )
    created_exp = await repo.create(experience)
    created_exp.set_ai_description("AI optimized description")
    updated = await repo.update(created_exp)
    assert updated.description_ai == "AI optimized description"
    updated.clear_ai_description()
    updated2 = await repo.update(updated)
    assert updated2.description_ai is None


@pytest.mark.asyncio
async def test_experience_duration_property(db_session):
    """Test the duration property of Experience entity."""
    repo = PostgresExperienceRepository(db_session)
    user_id = uuid4()
    exp1 = Experience.create(
        user_id=user_id,
        type="work",
        title="Position 1",
        start_date=date(2020, 1, 1),
        end_date=date(2023, 1, 1),
    )
    created1 = await repo.create(exp1)
    exp2 = Experience.create(
        user_id=user_id,
        type="work",
        title="Position 2",
        start_date=date(2020, 1, 1),
        is_current=True,
    )
    created2 = await repo.create(exp2)
    assert "3 year" in created1.duration
    assert created2.duration is not None
