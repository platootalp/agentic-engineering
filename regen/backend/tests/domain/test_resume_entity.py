"""Tests for Resume domain entity."""

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

import pytest

from app.domain.entities.resume import Resume


class TestResumeCreation:
    """Test Resume entity creation."""

    def test_resume_creation_with_defaults(self):
        """Test creating a resume with default values."""
        resume = Resume()

        assert isinstance(resume.id, UUID)
        assert isinstance(resume.user_id, UUID)
        assert resume.jd_id is None
        assert resume.title == ""
        assert resume.template_id == "modern"
        assert resume.content == {}
        assert resume.selected_experience_ids == []
        assert resume.generation_config is None
        assert resume.ai_suggestions is None
        assert resume.pdf_url is None
        assert resume.word_url is None
        assert resume.markdown_content is None
        assert resume.status == "draft"
        assert resume.is_default is False
        assert resume.view_count == 0
        assert resume.download_count == 0
        assert isinstance(resume.created_at, datetime)
        assert isinstance(resume.updated_at, datetime)

    def test_resume_create_classmethod(self):
        """Test the Resume.create classmethod."""
        user_id = uuid4()
        jd_id = uuid4()
        exp_id = uuid4()
        content = {"personal": {"name": "John"}}

        resume = Resume.create(
            user_id=user_id,
            title="  My Resume  ",
            template_id="  classic  ",
            jd_id=jd_id,
            content=content,
            selected_experience_ids=[exp_id],
            generation_config={"model": "gpt-4"},
        )

        assert isinstance(resume.id, UUID)
        assert resume.user_id == user_id
        assert resume.jd_id == jd_id
        assert resume.title == "My Resume"
        assert resume.template_id == "classic"
        assert resume.content == content
        assert resume.selected_experience_ids == [exp_id]
        assert resume.generation_config == {"model": "gpt-4"}
        assert resume.status == "draft"
        assert resume.is_default is False

    def test_resume_create_without_optional_fields(self):
        """Test creating a resume without optional fields."""
        user_id = uuid4()

        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        assert resume.jd_id is None
        assert resume.content == {}
        assert resume.selected_experience_ids == []


class TestResumeUpdate:
    """Test Resume entity update methods."""

    def test_update_title(self):
        """Test updating resume title."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Old Title",
        )
        original_updated_at = resume.updated_at

        resume.update(title="New Title")

        assert resume.title == "New Title"
        assert resume.updated_at > original_updated_at

    def test_update_strips_string_fields(self):
        """Test that string fields are stripped during update."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.update(
            title="  New Title  ",
            template_id="  creative  ",
        )

        assert resume.title == "New Title"
        assert resume.template_id == "creative"

    def test_update_ignores_none_values(self):
        """Test that None values are ignored during update."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Original Title",
        )

        resume.update(title=None)

        assert resume.title == "Original Title"


class TestResumeStatusMethods:
    """Test Resume status methods."""

    def test_publish(self):
        """Test publishing a resume."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.publish()

        assert resume.status == "published"

    def test_archive(self):
        """Test archiving a resume."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.archive()

        assert resume.status == "archived"

    def test_set_as_default(self):
        """Test setting resume as default."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.set_as_default()

        assert resume.is_default is True


class TestResumeCounters:
    """Test Resume counter methods."""

    def test_increment_view_count(self):
        """Test incrementing view count."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.increment_view_count()
        resume.increment_view_count()

        assert resume.view_count == 2

    def test_increment_download_count(self):
        """Test incrementing download count."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.increment_download_count()

        assert resume.download_count == 1


class TestResumeFileUrls:
    """Test Resume file URL methods."""

    def test_set_file_urls(self):
        """Test setting file URLs."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.set_file_urls(
            pdf_url="https://example.com/resume.pdf",
            word_url="https://example.com/resume.docx",
        )

        assert resume.pdf_url == "https://example.com/resume.pdf"
        assert resume.word_url == "https://example.com/resume.docx"


class TestResumeMarkdownGeneration:
    """Test Resume markdown generation."""

    def test_generate_markdown_basic(self):
        """Test basic markdown generation."""
        user_id = uuid4()
        content = {
            "personal": {
                "name": "John Doe",
                "email": "john@example.com",
            },
            "summary": "Experienced developer",
        }
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
            content=content,
        )

        markdown = resume.generate_markdown()

        assert "# My Resume" in markdown
        assert "John Doe" in markdown
        assert resume.markdown_content == markdown

    def test_generate_markdown_with_experiences(self):
        """Test markdown generation with experiences."""
        user_id = uuid4()
        content = {
            "personal": {"name": "John Doe"},
            "experiences": [
                {
                    "title": "Software Engineer",
                    "organization": "Tech Corp",
                    "period": "2020 - 2023",
                    "description": "Built scalable systems",
                }
            ],
        }
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
            content=content,
        )

        markdown = resume.generate_markdown()

        assert "## Experience" in markdown
        assert "Software Engineer" in markdown

    def test_generate_markdown_empty_content(self):
        """Test markdown generation with empty content."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
            content={},
        )

        markdown = resume.generate_markdown()

        assert "# My Resume" in markdown


class TestResumeEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_resume_timestamps_are_datetime_objects(self):
        """Test that timestamps are datetime objects."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        assert isinstance(resume.created_at, datetime)
        assert isinstance(resume.updated_at, datetime)

    def test_multiple_resumes_have_unique_ids(self):
        """Test that multiple resumes get unique IDs."""
        user_id = uuid4()
        resume1 = Resume.create(
            user_id=user_id,
            title="Resume 1",
        )
        resume2 = Resume.create(
            user_id=user_id,
            title="Resume 2",
        )

        assert resume1.id != resume2.id


class TestResumeAI:
    """Test Resume AI-related methods."""

    def test_set_ai_suggestions(self):
        """Test setting AI suggestions."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )
        original_updated_at = resume.updated_at

        suggestions = {
            "improvements": [
                "Add more quantifiable achievements",
                "Use stronger action verbs",
            ],
            "skills_to_highlight": ["Python", "Leadership"],
            "score": 85,
        }

        resume.set_ai_suggestions(suggestions)

        assert resume.ai_suggestions == suggestions
        assert resume.updated_at > original_updated_at

    def test_set_ai_suggestions_overwrites_existing(self):
        """Test that setting AI suggestions overwrites existing ones."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )
        old_suggestions = {"score": 70}
        resume.set_ai_suggestions(old_suggestions)

        new_suggestions = {"score": 90, "improvements": ["Better formatting"]}
        resume.set_ai_suggestions(new_suggestions)

        assert resume.ai_suggestions == new_suggestions

    def test_set_ai_suggestions_with_empty_dict(self):
        """Test setting empty AI suggestions."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.set_ai_suggestions({})

        assert resume.ai_suggestions == {}


class TestResumeUpdateExtended:
    """Extended tests for Resume update methods."""

    def test_update_multiple_fields_at_once(self):
        """Test updating multiple fields simultaneously."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Old Title",
            template_id="modern",
        )
        new_content = {"personal": {"name": "Jane Doe"}}
        new_exp_ids = [uuid4(), uuid4()]

        resume.update(
            title="New Title",
            template_id="classic",
            content=new_content,
            selected_experience_ids=new_exp_ids,
            generation_config={"model": "gpt-3.5"},
            markdown_content="# New Content",
        )

        assert resume.title == "New Title"
        assert resume.template_id == "classic"
        assert resume.content == new_content
        assert resume.selected_experience_ids == new_exp_ids
        assert resume.generation_config == {"model": "gpt-3.5"}
        assert resume.markdown_content == "# New Content"

    def test_update_with_empty_strings(self):
        """Test updating with empty strings."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Title",
        )

        resume.update(title="", template_id="")

        assert resume.title == ""
        assert resume.template_id == ""


class TestResumeStatusTransitions:
    """Test Resume status transition flows."""

    def test_full_status_lifecycle(self):
        """Test complete status lifecycle from draft to archived."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        # Initial state
        assert resume.status == "draft"

        # Publish
        resume.publish()
        assert resume.status == "published"

        # Archive
        resume.archive()
        assert resume.status == "archived"

    def test_archive_from_draft(self):
        """Test archiving directly from draft."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.archive()
        assert resume.status == "archived"

    def test_publish_already_published_updates_timestamp(self):
        """Test that publishing already published resume updates timestamp."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )
        resume.publish()
        original_updated_at = resume.updated_at

        resume.publish()

        assert resume.status == "published"
        assert resume.updated_at >= original_updated_at


class TestResumeCountersExtended:
    """Extended tests for Resume counters."""

    def test_counters_are_independent(self):
        """Test that view and download counters increment independently."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.increment_view_count()
        resume.increment_view_count()
        resume.increment_download_count()

        assert resume.view_count == 2
        assert resume.download_count == 1

    def test_multiple_view_increments(self):
        """Test multiple view count increments."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        for _ in range(100):
            resume.increment_view_count()

        assert resume.view_count == 100

    def test_multiple_download_increments(self):
        """Test multiple download count increments."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        for _ in range(50):
            resume.increment_download_count()

        assert resume.download_count == 50


class TestResumeFileUrlsExtended:
    """Extended tests for Resume file URLs."""

    def test_set_only_pdf_url(self):
        """Test setting only PDF URL."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )
        original_updated_at = resume.updated_at

        resume.set_file_urls(pdf_url="https://example.com/resume.pdf")

        assert resume.pdf_url == "https://example.com/resume.pdf"
        assert resume.word_url is None
        assert resume.updated_at > original_updated_at

    def test_set_only_word_url(self):
        """Test setting only Word URL."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )

        resume.set_file_urls(word_url="https://example.com/resume.docx")

        assert resume.pdf_url is None
        assert resume.word_url == "https://example.com/resume.docx"

    def test_update_existing_urls(self):
        """Test updating existing file URLs."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
        )
        resume.set_file_urls(
            pdf_url="https://old.com/resume.pdf",
            word_url="https://old.com/resume.docx",
        )

        resume.set_file_urls(
            pdf_url="https://new.com/resume.pdf",
            word_url="https://new.com/resume.docx",
        )

        assert resume.pdf_url == "https://new.com/resume.pdf"
        assert resume.word_url == "https://new.com/resume.docx"


class TestResumeMarkdownExtended:
    """Extended tests for Resume markdown generation."""

    def test_generate_markdown_with_education(self):
        """Test markdown generation with education section."""
        user_id = uuid4()
        content = {
            "education": [
                {
                    "degree": "Bachelor of Science",
                    "institution": "University",
                    "period": "2015-2019",
                }
            ],
        }
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
            content=content,
        )

        markdown = resume.generate_markdown()

        assert "## Education" in markdown
        assert "Bachelor of Science" in markdown
        assert "University" in markdown

    def test_generate_markdown_with_skills(self):
        """Test markdown generation with skills section."""
        user_id = uuid4()
        content = {
            "skills": ["Python", "JavaScript", "Go"],
        }
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
            content=content,
        )

        markdown = resume.generate_markdown()

        assert "## Skills" in markdown
        assert "Python, JavaScript, Go" in markdown

    def test_generate_markdown_multiple_experiences(self):
        """Test markdown with multiple experiences."""
        user_id = uuid4()
        content = {
            "experiences": [
                {
                    "title": "Senior Engineer",
                    "organization": "Company A",
                    "period": "2020-2024",
                    "description": "Led team",
                },
                {
                    "title": "Junior Developer",
                    "organization": "Company B",
                    "period": "2018-2020",
                    "description": "Built apps",
                },
            ],
        }
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
            content=content,
        )

        markdown = resume.generate_markdown()

        assert "### Senior Engineer" in markdown
        assert "### Junior Developer" in markdown
        assert "Company A" in markdown
        assert "Company B" in markdown

    def test_generate_markdown_experience_without_description(self):
        """Test markdown with experience missing description."""
        user_id = uuid4()
        content = {
            "experiences": [
                {
                    "title": "Engineer",
                    "organization": "Company",
                    "period": "2020-2024",
                }
            ],
        }
        resume = Resume.create(
            user_id=user_id,
            title="My Resume",
            content=content,
        )

        markdown = resume.generate_markdown()

        assert "### Engineer" in markdown
        assert "Company" in markdown


class TestResumeEdgeCasesExtended:
    """Extended edge case tests."""

    def test_resume_with_whitespace_title(self):
        """Test resume with whitespace-only title."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="   ",
        )

        assert resume.title == ""

    def test_resume_with_whitespace_template_id(self):
        """Test resume with whitespace-only template_id."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Resume",
            template_id="   ",
        )

        assert resume.template_id == ""

    def test_resume_with_very_long_title(self):
        """Test resume with very long title."""
        user_id = uuid4()
        long_title = "A" * 1000
        resume = Resume.create(
            user_id=user_id,
            title=long_title,
        )

        assert resume.title == long_title

    def test_resume_content_with_special_characters(self):
        """Test resume content with special characters."""
        user_id = uuid4()
        content = {
            "personal": {
                "name": "John <script>alert('xss')</script>",
                "email": "test@example.com",
            },
            "summary": "Developer with \"special\" skills & experience",
        }
        resume = Resume.create(
            user_id=user_id,
            title="Resume",
            content=content,
        )

        markdown = resume.generate_markdown()

        assert "<script>" in markdown  # Content is not escaped, just passed through
        assert "\"special\"" in markdown

    def test_resume_with_empty_experience_list(self):
        """Test resume with empty experience list."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Resume",
            content={"experiences": []},
        )

        markdown = resume.generate_markdown()

        assert "## Experience" not in markdown

    def test_resume_with_empty_skills_list(self):
        """Test resume with empty skills list."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Resume",
            content={"skills": []},
        )

        markdown = resume.generate_markdown()

        assert "## Skills" not in markdown

    def test_resume_with_none_jd_id(self):
        """Test resume creation with None jd_id."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Resume",
            jd_id=None,
        )

        assert resume.jd_id is None

    def test_resume_default_values_after_creation(self):
        """Test that default values are correctly set after creation."""
        user_id = uuid4()
        resume = Resume.create(
            user_id=user_id,
            title="Resume",
        )

        assert resume.status == "draft"
        assert resume.is_default is False
        assert resume.view_count == 0
        assert resume.download_count == 0
        assert resume.pdf_url is None
        assert resume.word_url is None
        assert resume.ai_suggestions is None
        assert resume.markdown_content is None
