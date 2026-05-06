"""Tests for Experience domain entity."""

from datetime import date, datetime
from typing import Any
from uuid import UUID, uuid4

import pytest

from app.domain.entities.experience import Experience


class TestExperienceCreation:
    """Test Experience entity creation."""

    def test_experience_creation_with_defaults(self):
        """Test creating an experience with default values."""
        exp = Experience()

        assert isinstance(exp.id, UUID)
        assert isinstance(exp.user_id, UUID)
        assert exp.type == "work"
        assert exp.title == ""
        assert exp.organization is None
        assert exp.location is None
        assert isinstance(exp.start_date, date)
        assert exp.end_date is None
        assert exp.is_current is False
        assert exp.description is None
        assert exp.description_ai is None
        assert exp.skills == []
        assert exp.achievements == []
        assert exp.metadata == {}
        assert exp.order_index == 0
        assert exp.is_highlighted is False
        assert isinstance(exp.created_at, datetime)
        assert isinstance(exp.updated_at, datetime)

    def test_experience_creation_with_custom_values(self):
        """Test creating an experience with custom values."""
        exp_id = uuid4()
        user_id = uuid4()
        start_date = date(2020, 1, 1)
        end_date = date(2023, 12, 31)
        created_at = datetime(2024, 1, 1, 12, 0, 0)
        updated_at = datetime(2024, 1, 1, 12, 0, 0)

        exp = Experience(
            id=exp_id,
            user_id=user_id,
            type="education",
            title="Bachelor's Degree",
            organization="University",
            location="Beijing",
            start_date=start_date,
            end_date=end_date,
            is_current=False,
            description="Studied computer science",
            description_ai="AI-optimized description",
            skills=["Python", "Algorithms"],
            achievements=["Dean's List", "GPA 3.9"],
            metadata={"degree": "BS", "major": "CS"},
            order_index=1,
            is_highlighted=True,
            created_at=created_at,
            updated_at=updated_at,
        )

        assert exp.id == exp_id
        assert exp.user_id == user_id
        assert exp.type == "education"
        assert exp.title == "Bachelor's Degree"
        assert exp.organization == "University"
        assert exp.location == "Beijing"
        assert exp.start_date == start_date
        assert exp.end_date == end_date
        assert exp.is_current is False
        assert exp.description == "Studied computer science"
        assert exp.description_ai == "AI-optimized description"
        assert exp.skills == ["Python", "Algorithms"]
        assert exp.achievements == ["Dean's List", "GPA 3.9"]
        assert exp.metadata == {"degree": "BS", "major": "CS"}
        assert exp.order_index == 1
        assert exp.is_highlighted is True

    def test_experience_create_classmethod(self):
        """Test the Experience.create classmethod."""
        user_id = uuid4()
        start_date = date(2020, 1, 1)

        exp = Experience.create(
            user_id=user_id,
            type="  WORK  ",
            title="  Software Engineer  ",
            organization="  Tech Corp  ",
            location="  Shanghai  ",
            start_date=start_date,
            description="  Developed apps  ",
            skills=["Python", "FastAPI"],
            achievements=["Led team"],
            metadata={"team_size": 5},
            order_index=2,
            is_highlighted=True,
        )

        assert isinstance(exp.id, UUID)
        assert exp.user_id == user_id
        assert exp.type == "work"
        assert exp.title == "Software Engineer"
        assert exp.organization == "Tech Corp"
        assert exp.location == "Shanghai"
        assert exp.start_date == start_date
        assert exp.description == "Developed apps"
        assert exp.skills == ["Python", "FastAPI"]
        assert exp.achievements == ["Led team"]
        assert exp.metadata == {"team_size": 5}
        assert exp.order_index == 2
        assert exp.is_highlighted is True
        assert exp.description_ai is None

    def test_experience_create_without_optional_fields(self):
        """Test creating an experience without optional fields."""
        user_id = uuid4()

        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Engineer",
        )

        assert exp.organization is None
        assert exp.location is None
        assert exp.start_date == date.today()
        assert exp.end_date is None
        assert exp.description is None
        assert exp.skills == []
        assert exp.achievements == []
        assert exp.metadata == {}
        assert exp.order_index == 0
        assert exp.is_highlighted is False


class TestExperienceProperties:
    """Test Experience entity properties."""

    def test_duration_property_with_years_and_months(self):
        """Test duration property with years and months."""
        start_date = date(2020, 1, 1)
        end_date = date(2023, 6, 15)

        exp = Experience(start_date=start_date, end_date=end_date)

        assert "3 years" in exp.duration
        assert "6 months" in exp.duration

    def test_duration_property_current_position(self):
        """Test duration property for current position."""
        start_date = date(2020, 1, 1)
        today = date.today()
        expected_years = (today - start_date).days // 365

        exp = Experience(start_date=start_date, is_current=True)

        assert exp.duration is not None
        assert f"{expected_years} year" in exp.duration

    def test_duration_property_less_than_month(self):
        """Test duration property for short duration."""
        start_date = date(2024, 1, 1)
        end_date = date(2024, 1, 15)

        exp = Experience(start_date=start_date, end_date=end_date)

        assert exp.duration == "Less than a month"

    def test_duration_property_no_start_date(self):
        """Test duration property when no start date."""
        exp = Experience()
        exp.start_date = None

        assert exp.duration is None

    def test_duration_property_exact_year(self):
        """Test duration property for exactly one year."""
        start_date = date(2020, 1, 1)
        end_date = date(2021, 1, 1)

        exp = Experience(start_date=start_date, end_date=end_date)

        assert exp.duration == "1 year"

    def test_duration_property_plural_years(self):
        """Test duration property pluralizes years correctly."""
        start_date = date(2020, 1, 1)
        end_date = date(2022, 1, 1)

        exp = Experience(start_date=start_date, end_date=end_date)

        assert exp.duration == "2 years"

    def test_display_period_with_end_date(self):
        """Test display_period property with end date."""
        start_date = date(2020, 1, 15)
        end_date = date(2023, 12, 31)

        exp = Experience(start_date=start_date, end_date=end_date)

        assert exp.display_period == "Jan 2020 - Dec 2023"

    def test_display_period_current_position(self):
        """Test display_period property for current position."""
        start_date = date(2020, 1, 15)

        exp = Experience(start_date=start_date, is_current=True)

        assert exp.display_period == "Jan 2020 - Present"


class TestExperienceUpdate:
    """Test Experience entity update methods."""

    def test_update_single_field(self):
        """Test updating a single field."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Old Title",
        )
        original_updated_at = exp.updated_at

        exp.update(title="New Title")

        assert exp.title == "New Title"
        assert exp.updated_at > original_updated_at

    def test_update_strips_string_fields(self):
        """Test that string fields are stripped during update."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.update(
            title="  New Title  ",
            type="  EDUCATION  ",
            organization="  New Org  ",
        )

        assert exp.title == "New Title"
        assert exp.type == "education"
        assert exp.organization == "New Org"

    def test_update_ignores_none_values(self):
        """Test that None values are ignored during update."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Original Title",
        )

        exp.update(title=None)

        assert exp.title == "Original Title"


class TestExperienceToggleMethods:
    """Test Experience toggle methods."""

    def test_toggle_current_from_false_to_true(self):
        """Test toggling is_current from False to True."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            is_current=False,
            end_date=date(2023, 12, 31),
        )

        exp.toggle_current()

        assert exp.is_current is True
        assert exp.end_date is None

    def test_toggle_highlighted(self):
        """Test toggling is_highlighted."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            is_highlighted=False,
        )

        exp.toggle_highlighted()

        assert exp.is_highlighted is True

        exp.toggle_highlighted()

        assert exp.is_highlighted is False


class TestExperienceSkills:
    """Test Experience skills management."""

    def test_add_skill(self):
        """Test adding a skill."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.add_skill("Python")

        assert "Python" in exp.skills

    def test_add_duplicate_skill_ignored(self):
        """Test that adding a duplicate skill is ignored."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            skills=["Python"],
        )

        exp.add_skill("Python")

        assert exp.skills.count("Python") == 1

    def test_remove_skill(self):
        """Test removing a skill."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            skills=["Python", "FastAPI"],
        )

        exp.remove_skill("Python")

        assert "Python" not in exp.skills
        assert "FastAPI" in exp.skills


class TestExperienceAchievements:
    """Test Experience achievements management."""

    def test_add_achievement(self):
        """Test adding an achievement."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.add_achievement("Led team of 5")

        assert "Led team of 5" in exp.achievements

    def test_remove_achievement(self):
        """Test removing an achievement."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            achievements=["Achievement 1", "Achievement 2"],
        )

        exp.remove_achievement("Achievement 1")

        assert "Achievement 1" not in exp.achievements
        assert "Achievement 2" in exp.achievements


class TestExperienceEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_experience_with_empty_strings(self):
        """Test experience with empty string values."""
        exp = Experience(
            type="",
            title="",
        )

        assert exp.type == ""
        assert exp.title == ""

    def test_experience_timestamps_are_datetime_objects(self):
        """Test that timestamps are datetime objects."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        assert isinstance(exp.created_at, datetime)
        assert isinstance(exp.updated_at, datetime)

    def test_multiple_experiences_have_unique_ids(self):
        """Test that multiple experiences get unique IDs."""
        user_id = uuid4()
        exp1 = Experience.create(
            user_id=user_id,
            type="work",
            title="Title1",
        )
        exp2 = Experience.create(
            user_id=user_id,
            type="work",
            title="Title2",
        )

        assert exp1.id != exp2.id



class TestExperienceAI:
    """Test Experience AI description methods."""

    def test_set_ai_description(self):
        """Test setting AI description."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        original_updated_at = exp.updated_at

        exp.set_ai_description("  AI-optimized description  ")

        assert exp.description_ai == "AI-optimized description"  # Stripped
        assert exp.updated_at > original_updated_at

    def test_set_ai_description_overwrites_existing(self):
        """Test that set_ai_description overwrites existing value."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        exp.set_ai_description("Original AI description")

        exp.set_ai_description("New AI description")

        assert exp.description_ai == "New AI description"

    def test_clear_ai_description(self):
        """Test clearing AI description."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        exp.set_ai_description("AI description")
        original_updated_at = exp.updated_at

        exp.clear_ai_description()

        assert exp.description_ai is None
        assert exp.updated_at > original_updated_at

    def test_clear_ai_description_when_already_cleared(self):
        """Test clearing AI description when already cleared."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        original_updated_at = exp.updated_at

        exp.clear_ai_description()

        assert exp.description_ai is None
        assert exp.updated_at >= original_updated_at


class TestExperienceUpdateExtended:
    """Extended tests for Experience update methods."""

    def test_update_multiple_fields(self):
        """Test updating multiple fields at once."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Original Title",
            organization="Original Org",
        )

        exp.update(
            title="New Title",
            organization="New Org",
            location="New Location",
            is_current=True,
            order_index=5,
            is_highlighted=True,
        )

        assert exp.title == "New Title"
        assert exp.organization == "New Org"
        assert exp.location == "New Location"
        assert exp.is_current is True
        assert exp.order_index == 5
        assert exp.is_highlighted is True

    def test_update_ignores_disallowed_fields(self):
        """Test that disallowed fields are ignored during update."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        original_id = exp.id
        original_user_id = exp.user_id

        exp.update(
            id=uuid4(),
            user_id=uuid4(),
            title="New Title",
        )

        assert exp.id == original_id
        assert exp.user_id == original_user_id
        assert exp.title == "New Title"

    def test_update_date_fields(self):
        """Test updating date fields."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        new_start = date(2021, 6, 1)
        new_end = date(2023, 6, 1)

        exp.update(start_date=new_start, end_date=new_end)

        assert exp.start_date == new_start
        assert exp.end_date == new_end

    def test_update_lists_and_dicts(self):
        """Test updating list and dict fields."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        new_skills = ["Python", "JavaScript", "Go"]
        new_achievements = ["Award 1", "Award 2"]
        new_metadata = {"level": "senior", "department": "engineering"}

        exp.update(
            skills=new_skills,
            achievements=new_achievements,
            metadata=new_metadata,
        )

        assert exp.skills == new_skills
        assert exp.achievements == new_achievements
        assert exp.metadata == new_metadata


class TestExperienceToggleExtended:
    """Extended tests for Experience toggle methods."""

    def test_toggle_current_from_true_to_false(self):
        """Test toggling is_current from True to False."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            is_current=True,
        )

        exp.toggle_current()

        assert exp.is_current is False

    def test_toggle_current_multiple_times(self):
        """Test toggling is_current multiple times."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            is_current=False,
        )

        exp.toggle_current()
        assert exp.is_current is True

        exp.toggle_current()
        assert exp.is_current is False

        exp.toggle_current()
        assert exp.is_current is True

    def test_toggle_highlighted_multiple_times(self):
        """Test toggling is_highlighted multiple times."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            is_highlighted=False,
        )

        exp.toggle_highlighted()
        assert exp.is_highlighted is True

        exp.toggle_highlighted()
        assert exp.is_highlighted is False

        exp.toggle_highlighted()
        assert exp.is_highlighted is True

    def test_toggle_highlighted_updates_timestamp(self):
        """Test that toggle_highlighted updates timestamp."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            is_highlighted=False,
        )
        original_updated_at = exp.updated_at

        exp.toggle_highlighted()

        assert exp.updated_at > original_updated_at


class TestExperienceSkillsExtended:
    """Extended tests for Experience skills management."""

    def test_add_skill_strips_whitespace(self):
        """Test that add_skill strips whitespace."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.add_skill("  Python  ")

        assert "Python" in exp.skills
        assert "  Python  " not in exp.skills

    def test_add_skill_does_not_add_empty_string(self):
        """Test that add_skill does not add empty strings."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.add_skill("")
        exp.add_skill("   ")

        assert "" not in exp.skills
        assert "   " not in exp.skills

    def test_add_skill_updates_timestamp(self):
        """Test that add_skill updates timestamp."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        original_updated_at = exp.updated_at

        exp.add_skill("Python")

        assert exp.updated_at > original_updated_at

    def test_remove_skill_strips_whitespace(self):
        """Test that remove_skill strips whitespace."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            skills=["Python", "FastAPI"],
        )

        exp.remove_skill("  Python  ")

        assert "Python" not in exp.skills
        assert "FastAPI" in exp.skills

    def test_remove_skill_not_in_list(self):
        """Test removing a skill that is not in the list."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            skills=["Python"],
        )
        original_updated_at = exp.updated_at

        exp.remove_skill("JavaScript")  # Not in list

        assert "Python" in exp.skills
        assert "JavaScript" not in exp.skills
        # Timestamp should not update when nothing changes
        assert exp.updated_at == original_updated_at

    def test_remove_skill_updates_timestamp(self):
        """Test that remove_skill updates timestamp when skill is removed."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            skills=["Python"],
        )
        original_updated_at = exp.updated_at

        exp.remove_skill("Python")

        assert exp.updated_at > original_updated_at


class TestExperienceAchievementsExtended:
    """Extended tests for Experience achievements management."""

    def test_add_achievement_strips_whitespace(self):
        """Test that add_achievement strips whitespace."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.add_achievement("  Led team  ")

        assert "Led team" in exp.achievements
        assert "  Led team  " not in exp.achievements

    def test_add_achievement_does_not_add_duplicates(self):
        """Test that add_achievement does not add duplicates."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        exp.add_achievement("Achievement 1")

        exp.add_achievement("Achievement 1")

        assert exp.achievements.count("Achievement 1") == 1

    def test_add_achievement_does_not_add_empty_string(self):
        """Test that add_achievement does not add empty strings."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.add_achievement("")
        exp.add_achievement("   ")

        assert "" not in exp.achievements
        assert "   " not in exp.achievements

    def test_add_achievement_updates_timestamp(self):
        """Test that add_achievement updates timestamp."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )
        original_updated_at = exp.updated_at

        exp.add_achievement("Achievement")

        assert exp.updated_at > original_updated_at

    def test_remove_achievement_strips_whitespace(self):
        """Test that remove_achievement strips whitespace."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            achievements=["Achievement 1", "Achievement 2"],
        )

        exp.remove_achievement("  Achievement 1  ")

        assert "Achievement 1" not in exp.achievements
        assert "Achievement 2" in exp.achievements

    def test_remove_achievement_not_in_list(self):
        """Test removing an achievement that is not in the list."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            achievements=["Achievement 1"],
        )
        original_updated_at = exp.updated_at

        exp.remove_achievement("Non-existent")  # Not in list

        assert "Achievement 1" in exp.achievements
        assert "Non-existent" not in exp.achievements
        # Timestamp should not update when nothing changes
        assert exp.updated_at == original_updated_at

    def test_remove_achievement_updates_timestamp(self):
        """Test that remove_achievement updates timestamp when achievement is removed."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            achievements=["Achievement 1"],
        )
        original_updated_at = exp.updated_at

        exp.remove_achievement("Achievement 1")

        assert exp.updated_at > original_updated_at


class TestExperiencePropertiesExtended:
    """Extended tests for Experience properties."""

    def test_duration_property_only_months(self):
        """Test duration property with only months."""
        start_date = date(2024, 1, 1)
        end_date = date(2024, 6, 1)

        exp = Experience(start_date=start_date, end_date=end_date)

        assert "6 months" in exp.duration
        assert "year" not in exp.duration

    def test_duration_property_only_years(self):
        """Test duration property with only years."""
        start_date = date(2020, 1, 1)
        end_date = date(2023, 1, 1)

        exp = Experience(start_date=start_date, end_date=end_date)

        assert "3 years" in exp.duration

    def test_duration_property_one_month(self):
        """Test duration property with exactly one month."""
        start_date = date(2024, 1, 1)
        end_date = date(2024, 2, 1)

        exp = Experience(start_date=start_date, end_date=end_date)

        assert "1 month" in exp.duration

    def test_display_period_no_start_date(self):
        """Test display_period property when no start date."""
        exp = Experience()
        exp.start_date = None

        assert exp.display_period == " - Present"

    def test_display_period_with_end_date_not_current(self):
        """Test display_period with end date when not current."""
        start_date = date(2020, 6, 15)
        end_date = date(2023, 3, 20)

        exp = Experience(start_date=start_date, end_date=end_date, is_current=False)

        assert exp.display_period == "Jun 2020 - Mar 2023"

    def test_display_period_no_end_date_not_current(self):
        """Test display_period with no end date when not current."""
        start_date = date(2020, 6, 15)

        exp = Experience(start_date=start_date, end_date=None, is_current=False)

        assert exp.display_period == "Jun 2020 - Present"


class TestExperienceEdgeCasesExtended:
    """Extended tests for edge cases and boundary conditions."""

    def test_experience_create_with_whitespace_only_strings(self):
        """Test creating an experience with whitespace-only strings."""
        user_id = uuid4()

        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="   ",
            organization="   ",
            location="   ",
            description="   ",
        )

        assert exp.title == ""
        assert exp.organization == ""
        assert exp.location == ""
        assert exp.description == ""

    def test_experience_create_with_none_organization_and_location(self):
        """Test creating an experience with None organization and location."""
        user_id = uuid4()

        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            organization=None,
            location=None,
        )

        assert exp.organization is None
        assert exp.location is None

    def test_experience_create_with_is_current_clears_end_date(self):
        """Test that creating with is_current=True doesn't set end_date."""
        user_id = uuid4()
        end_date = date(2023, 12, 31)

        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            end_date=end_date,
            is_current=True,
        )

        # When is_current=True, end_date should be None
        assert exp.end_date is None
        assert exp.is_current is True

    def test_experience_id_is_uuid(self):
        """Test that experience id is a valid UUID."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        assert isinstance(exp.id, UUID)
        assert len(str(exp.id)) == 36  # Standard UUID string length

    def test_experience_timestamps_are_naive_datetime(self):
        """Test that timestamps are naive datetime objects (no timezone)."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        assert isinstance(exp.created_at, datetime)
        assert isinstance(exp.updated_at, datetime)
        assert exp.created_at.tzinfo is None
        assert exp.updated_at.tzinfo is None

    def test_update_with_empty_string_clears_field(self):
        """Test that update with empty string clears the field."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
            organization="Org",
        )

        exp.update(organization="")

        assert exp.organization == ""

    def test_add_skill_case_sensitive(self):
        """Test that add_skill is case sensitive."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.add_skill("Python")
        exp.add_skill("python")  # Different case

        assert "Python" in exp.skills
        assert "python" in exp.skills
        assert len(exp.skills) == 2

    def test_add_achievement_case_sensitive(self):
        """Test that add_achievement is case sensitive."""
        user_id = uuid4()
        exp = Experience.create(
            user_id=user_id,
            type="work",
            title="Title",
        )

        exp.add_achievement("Led Team")
        exp.add_achievement("led team")  # Different case

        assert "Led Team" in exp.achievements
        assert "led team" in exp.achievements
        assert len(exp.achievements) == 2

    def test_skills_list_independence(self):
        """Test that skills list is independent between instances."""
        user_id = uuid4()

        exp1 = Experience.create(
            user_id=user_id,
            type="work",
            title="Title1",
            skills=["Python"],
        )
        exp2 = Experience.create(
            user_id=user_id,
            type="work",
            title="Title2",
            skills=["JavaScript"],
        )

        exp1.add_skill("FastAPI")

        assert "FastAPI" in exp1.skills
        assert "FastAPI" not in exp2.skills

    def test_achievements_list_independence(self):
        """Test that achievements list is independent between instances."""
        user_id = uuid4()

        exp1 = Experience.create(
            user_id=user_id,
            type="work",
            title="Title1",
            achievements=["Award 1"],
        )
        exp2 = Experience.create(
            user_id=user_id,
            type="work",
            title="Title2",
            achievements=["Award 2"],
        )

        exp1.add_achievement("Award 3")

        assert "Award 3" in exp1.achievements
        assert "Award 3" not in exp2.achievements