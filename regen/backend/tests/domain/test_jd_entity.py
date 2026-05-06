"""Tests for JD (Job Description) domain entity."""

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

import pytest

from app.domain.entities.jd import JD


class TestJDCreation:
    """Test JD entity creation."""

    def test_jd_creation_with_defaults(self):
        """Test creating a JD with default values."""
        jd = JD()

        assert isinstance(jd.id, UUID)
        assert jd.company_name == ""
        assert jd.position_title == ""
        assert jd.location is None
        assert jd.salary_min is None
        assert jd.salary_max is None
        assert jd.raw_content == ""
        assert jd.analysis is None
        assert jd.source is None
        assert jd.is_analyzed is False
        assert isinstance(jd.created_at, datetime)
        assert isinstance(jd.updated_at, datetime)

    def test_jd_creation_with_custom_values(self):
        """Test creating a JD with custom values."""
        jd_id = uuid4()
        created_at = datetime(2024, 1, 1, 12, 0, 0)
        updated_at = datetime(2024, 1, 1, 12, 0, 0)
        analysis = {"skills": ["Python", "FastAPI"], "level": "senior"}

        jd = JD(
            id=jd_id,
            company_name="Tech Corp",
            position_title="Senior Engineer",
            location="Beijing",
            salary_min=30000,
            salary_max=50000,
            raw_content="We are looking for a senior engineer...",
            analysis=analysis,
            source="LinkedIn",
            is_analyzed=True,
            created_at=created_at,
            updated_at=updated_at,
        )

        assert jd.id == jd_id
        assert jd.company_name == "Tech Corp"
        assert jd.position_title == "Senior Engineer"
        assert jd.location == "Beijing"
        assert jd.salary_min == 30000
        assert jd.salary_max == 50000
        assert jd.raw_content == "We are looking for a senior engineer..."
        assert jd.analysis == analysis
        assert jd.source == "LinkedIn"
        assert jd.is_analyzed is True
        assert jd.created_at == created_at
        assert jd.updated_at == updated_at

    def test_jd_create_classmethod(self):
        """Test the JD.create classmethod."""
        jd = JD.create(
            company_name="  Tech Corp  ",
            position_title="  Senior Engineer  ",
            raw_content="  Job description content  ",
            location="  Beijing  ",
            salary_min=30000,
            salary_max=50000,
            source="  LinkedIn  ",
        )

        assert isinstance(jd.id, UUID)
        assert jd.company_name == "Tech Corp"  # Stripped
        assert jd.position_title == "Senior Engineer"  # Stripped
        assert jd.raw_content == "Job description content"  # Stripped
        assert jd.location == "Beijing"  # Stripped
        assert jd.salary_min == 30000
        assert jd.salary_max == 50000
        assert jd.source == "LinkedIn"  # Stripped
        assert jd.is_analyzed is False
        assert jd.analysis is None

    def test_jd_create_without_optional_fields(self):
        """Test creating a JD without optional fields."""
        jd = JD.create(
            company_name="Tech Corp",
            position_title="Engineer",
            raw_content="Job description",
        )

        assert jd.location is None
        assert jd.salary_min is None
        assert jd.salary_max is None
        assert jd.source is None

    def test_jd_create_with_none_location_and_source(self):
        """Test creating a JD with None location and source."""
        jd = JD.create(
            company_name="Tech Corp",
            position_title="Engineer",
            raw_content="Job description",
            location=None,
            source=None,
        )

        assert jd.location is None
        assert jd.source is None


class TestJDSalaryRangeProperty:
    """Test JD salary_range property."""

    @pytest.mark.parametrize(
        "salary_min,salary_max,expected",
        [
            (30000, 50000, "30,000 - 50,000"),
            (30000, None, "30,000+"),
            (None, 50000, "Up to 50,000"),
            (None, None, None),
            (0, 50000, "Up to 50,000"),
            (30000, 0, "30,000+"),
        ],
    )
    def test_salary_range_property(self, salary_min, salary_max, expected):
        """Test the salary_range property with various combinations."""
        jd = JD(salary_min=salary_min, salary_max=salary_max)
        assert jd.salary_range == expected

    def test_salary_range_with_large_numbers(self):
        """Test salary_range with large numbers."""
        jd = JD(salary_min=1000000, salary_max=2000000)
        assert jd.salary_range == "1,000,000 - 2,000,000"

    def test_salary_range_formatting(self):
        """Test that salary_range properly formats with commas."""
        jd = JD(salary_min=5000, salary_max=15000)
        assert jd.salary_range == "5,000 - 15,000"


class TestJDUpdate:
    """Test JD entity update methods."""

    def test_update_single_field(self):
        """Test updating a single field."""
        jd = JD.create(
            company_name="Old Corp",
            position_title="Old Title",
            raw_content="Old content",
        )
        original_updated_at = jd.updated_at

        jd.update(company_name="New Corp")

        assert jd.company_name == "New Corp"
        assert jd.updated_at > original_updated_at

    def test_update_multiple_fields(self):
        """Test updating multiple fields at once."""
        jd = JD.create(
            company_name="Old Corp",
            position_title="Old Title",
            raw_content="Old content",
        )

        jd.update(
            company_name="New Corp",
            position_title="New Title",
            salary_min=40000,
            salary_max=60000,
        )

        assert jd.company_name == "New Corp"
        assert jd.position_title == "New Title"
        assert jd.salary_min == 40000
        assert jd.salary_max == 60000

    def test_update_strips_string_fields(self):
        """Test that string fields are stripped during update."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )

        jd.update(
            company_name="  New Corp  ",
            position_title="  New Title  ",
            raw_content="  New Content  ",
            location="  New Location  ",
            source="  New Source  ",
        )

        assert jd.company_name == "New Corp"
        assert jd.position_title == "New Title"
        assert jd.raw_content == "New Content"
        assert jd.location == "New Location"
        assert jd.source == "New Source"

    def test_update_ignores_none_values(self):
        """Test that None values are ignored during update."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )

        jd.update(company_name=None, position_title="New Title")

        assert jd.company_name == "Corp"
        assert jd.position_title == "New Title"

    def test_update_ignores_disallowed_fields(self):
        """Test that disallowed fields are ignored during update."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )
        original_id = jd.id

        jd.update(id=uuid4(), analysis={"test": "value"}, company_name="New Corp")

        assert jd.id == original_id
        assert jd.analysis is None
        assert jd.company_name == "New Corp"


class TestJDAnalysisMethods:
    """Test JD analysis methods."""

    def test_set_analysis(self):
        """Test setting analysis results."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )
        original_updated_at = jd.updated_at
        analysis = {"skills": ["Python", "FastAPI"], "level": "senior"}

        jd.set_analysis(analysis)

        assert jd.analysis == analysis
        assert jd.is_analyzed is True
        assert jd.updated_at > original_updated_at

    def test_set_analysis_with_complex_data(self):
        """Test setting analysis with complex nested data."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )
        analysis: dict[str, Any] = {
            "skills": ["Python", "FastAPI", "PostgreSQL"],
            "requirements": ["5+ years", "Bachelor's degree"],
            "responsibilities": ["Build APIs", "Mentor juniors"],
            "match_score": 85.5,
            "metadata": {"analyzed_at": datetime.now().isoformat()},
        }

        jd.set_analysis(analysis)

        assert jd.analysis == analysis
        assert jd.is_analyzed is True

    def test_clear_analysis(self):
        """Test clearing analysis results."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )
        jd.set_analysis({"skills": ["Python"]})
        original_updated_at = jd.updated_at

        jd.clear_analysis()

        assert jd.analysis is None
        assert jd.is_analyzed is False
        assert jd.updated_at > original_updated_at

    def test_clear_analysis_when_already_cleared(self):
        """Test clearing analysis when already cleared."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )
        original_updated_at = jd.updated_at

        jd.clear_analysis()

        assert jd.analysis is None
        assert jd.is_analyzed is False
        assert jd.updated_at >= original_updated_at


class TestJDEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_jd_with_empty_strings(self):
        """Test JD with empty string values."""
        jd = JD(
            company_name="",
            position_title="",
            raw_content="",
        )

        assert jd.company_name == ""
        assert jd.position_title == ""
        assert jd.raw_content == ""

    def test_jd_with_whitespace_only_strings(self):
        """Test JD with whitespace-only strings that get stripped."""
        jd = JD.create(
            company_name="   ",
            position_title="   ",
            raw_content="   ",
            location="   ",
            source="   ",
        )

        assert jd.company_name == ""
        assert jd.position_title == ""
        assert jd.raw_content == ""
        assert jd.location == ""
        assert jd.source == ""

    def test_jd_salary_with_zero_values(self):
        """Test JD salary with zero values."""
        jd = JD(salary_min=0, salary_max=0)
        # 0 is falsy, so both should be treated as not set
        assert jd.salary_range is None

    def test_jd_salary_with_negative_values(self):
        """Test JD salary with negative values."""
        jd = JD(salary_min=-1000, salary_max=-500)
        # Negative values are truthy but should probably not be used
        assert jd.salary_range == "-1,000 - -500"

    def test_jd_timestamps_are_datetime_objects(self):
        """Test that timestamps are datetime objects."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )

        assert isinstance(jd.created_at, datetime)
        assert isinstance(jd.updated_at, datetime)
        assert jd.created_at.tzinfo is None
        assert jd.updated_at.tzinfo is None

    def test_jd_id_is_uuid(self):
        """Test that JD id is a valid UUID."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )

        assert isinstance(jd.id, UUID)
        assert len(str(jd.id)) == 36

    def test_multiple_jds_have_unique_ids(self):
        """Test that multiple JDs get unique IDs."""
        jd1 = JD.create(
            company_name="Corp1",
            position_title="Title1",
            raw_content="Content1",
        )
        jd2 = JD.create(
            company_name="Corp2",
            position_title="Title2",
            raw_content="Content2",
        )

        assert jd1.id != jd2.id

    def test_jd_analysis_with_empty_dict(self):
        """Test setting empty analysis dict."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
        )

        jd.set_analysis({})

        assert jd.analysis == {}
        assert jd.is_analyzed is True

    def test_jd_update_preserves_non_string_fields(self):
        """Test that update preserves non-string fields correctly."""
        jd = JD.create(
            company_name="Corp",
            position_title="Title",
            raw_content="Content",
            salary_min=30000,
            salary_max=50000,
        )

        jd.update(salary_min=40000, salary_max=60000)

        assert jd.salary_min == 40000
        assert jd.salary_max == 60000
