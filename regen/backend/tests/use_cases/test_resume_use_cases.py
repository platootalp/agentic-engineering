"""Unit tests for resume use cases."""

from datetime import date, datetime
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID, uuid4

import pytest

from app.domain.entities.experience import Experience
from app.domain.entities.jd import JD
from app.domain.entities.resume import Resume
from app.use_cases.resume.generate_resume import (
    GenerateResumeInput,
    GenerateResumeOutput,
    GenerateResumeUseCase,
)
from app.use_cases.resume.match_experiences import (
    MatchExperiencesInput,
    MatchExperiencesOutput,
    MatchExperiencesUseCase,
)
from app.use_cases.resume.optimize_experience import (
    OptimizeExperienceInput,
    OptimizeExperienceOutput,
    OptimizeExperienceUseCase,
)


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def mock_resume_repository():
    """Create a mock resume repository."""
    repo = MagicMock()
    repo.get_by_id = AsyncMock()
    repo.list_by_user = AsyncMock()
    repo.create = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    repo.exists_by_id = AsyncMock()
    return repo


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
def mock_experience_repository():
    """Create a mock experience repository."""
    repo = MagicMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_user = AsyncMock()
    repo.create = AsyncMock()
    repo.update = AsyncMock()
    repo.delete = AsyncMock()
    repo.exists_by_id = AsyncMock()
    return repo


@pytest.fixture
def mock_ai_router():
    """Create a mock AI router."""
    router = MagicMock()
    router.route_request = AsyncMock()
    return router


@pytest.fixture
def sample_jd():
    """Create a sample analyzed JD entity."""
    return JD(
        id=uuid4(),
        company_name="Tech Corp",
        position_title="Senior Software Engineer",
        location="Beijing",
        salary_min=40000,
        salary_max=60000,
        raw_content="Looking for a senior Python developer with FastAPI experience...",
        analysis={
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "responsibilities": [
                "Design and build scalable APIs",
                "Lead technical initiatives",
                "Mentor junior developers",
            ],
            "experience_level": "Senior",
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
        company_name="Another Corp",
        position_title="Developer",
        raw_content="Job description...",
        analysis=None,
        is_analyzed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def sample_experiences():
    """Create sample experience entities."""
    return [
        Experience(
            id=uuid4(),
            user_id=uuid4(),
            type="work",
            title="Senior Software Engineer",
            organization="Tech Corp",
            location="Beijing",
            start_date=date(2020, 1, 1),
            end_date=date(2023, 12, 31),
            is_current=False,
            description="Developed scalable web applications using Python and FastAPI",
            description_ai=None,
            skills=["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
            achievements=[
                "Led team of 5 developers",
                "Improved API performance by 50%",
                "Reduced deployment time by 70%",
            ],
            is_highlighted=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
        Experience(
            id=uuid4(),
            user_id=uuid4(),
            type="work",
            title="Software Engineer",
            organization="Startup Inc",
            location="Shanghai",
            start_date=date(2018, 6, 1),
            end_date=date(2019, 12, 31),
            is_current=False,
            description="Built REST APIs and microservices",
            description_ai=None,
            skills=["Python", "Django", "Redis"],
            achievements=["Shipped 3 major features"],
            is_highlighted=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
    ]


@pytest.fixture
def sample_resume():
    """Create a sample resume entity."""
    return Resume(
        id=uuid4(),
        user_id=uuid4(),
        jd_id=uuid4(),
        title="My Resume",
        template_id="modern",
        content={},
        selected_experience_ids=[uuid4()],
        is_generated=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def ai_response_success():
    """Create a successful AI response."""
    response = MagicMock()
    response.content = """```json
{
    "professional_summary": "Experienced software engineer with 5+ years...",
    "skills_section": {
        "technical": ["Python", "FastAPI", "PostgreSQL"],
        "soft": ["Leadership", "Communication"]
    },
    "experiences": [
        {
            "title": "Senior Software Engineer",
            "organization": "Tech Corp",
            "description": "Led development of scalable APIs..."
        }
    ],
    "education": {
        "degree": "Bachelor of Computer Science",
        "institution": "University"
    }
}
```"""
    response.token_usage = MagicMock()
    response.token_usage.total_tokens = 1500
    return response


# =============================================================================
# GenerateResumeUseCase Tests
# =============================================================================


class TestGenerateResumeUseCase:
    """Tests for GenerateResumeUseCase."""

    @pytest.mark.asyncio
    async def test_generate_resume_success(
        self,
        mock_resume_repository,
        mock_jd_repository,
        mock_experience_repository,
        mock_ai_router,
        sample_jd,
        sample_experiences,
        ai_response_success,
    ):
        """Test successful resume generation."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = sample_jd
        mock_experience_repository.get_by_id.side_effect = sample_experiences
        mock_ai_router.route_request.return_value = ai_response_success
        created_resume = Resume(
            id=uuid4(),
            user_id=uuid4(),
            jd_id=sample_jd.id,
            title="Generated Resume",
            template_id="modern",
            content={
                "professional_summary": "Experienced software engineer...",
                "skills_section": {"technical": ["Python"]},
                "experiences": [{"title": "Senior Engineer"}],
            },
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_resume_repository.create.return_value = created_resume

        use_case = GenerateResumeUseCase(
            resume_repository=mock_resume_repository,
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
            ai_router=mock_ai_router,
        )
        input_data = GenerateResumeInput(
            user_id=uuid4(),
            jd_id=sample_jd.id,
            selected_experience_ids=[exp.id for exp in sample_experiences],
            template_id="modern",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.resume is not None
        assert result.error is None
        mock_jd_repository.get_by_id.assert_called_once_with(sample_jd.id)
        mock_ai_router.route_request.assert_called_once()
        mock_resume_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_resume_no_experience_ids(
        self,
        mock_resume_repository,
        mock_jd_repository,
        mock_experience_repository,
        mock_ai_router,
    ):
        """Test resume generation with no experience IDs."""
        # Arrange
        use_case = GenerateResumeUseCase(
            resume_repository=mock_resume_repository,
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
            ai_router=mock_ai_router,
        )
        input_data = GenerateResumeInput(
            user_id=uuid4(),
            jd_id=uuid4(),
            selected_experience_ids=[],
            template_id="modern",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "At least one experience" in result.message
        mock_jd_repository.get_by_id.assert_not_called()

    @pytest.mark.asyncio
    async def test_generate_resume_jd_not_found(
        self,
        mock_resume_repository,
        mock_jd_repository,
        mock_experience_repository,
        mock_ai_router,
        sample_experiences,
    ):
        """Test resume generation when JD not found."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = None

        use_case = GenerateResumeUseCase(
            resume_repository=mock_resume_repository,
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
            ai_router=mock_ai_router,
        )
        jd_id = uuid4()
        input_data = GenerateResumeInput(
            user_id=uuid4(),
            jd_id=jd_id,
            selected_experience_ids=[exp.id for exp in sample_experiences],
            template_id="modern",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "JD_NOT_FOUND"
        assert str(jd_id) in result.message

    @pytest.mark.asyncio
    async def test_generate_resume_jd_not_analyzed(
        self,
        mock_resume_repository,
        mock_jd_repository,
        mock_experience_repository,
        mock_ai_router,
        sample_jd_unanalyzed,
        sample_experiences,
    ):
        """Test resume generation when JD is not analyzed."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = sample_jd_unanalyzed

        use_case = GenerateResumeUseCase(
            resume_repository=mock_resume_repository,
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
            ai_router=mock_ai_router,
        )
        input_data = GenerateResumeInput(
            user_id=uuid4(),
            jd_id=sample_jd_unanalyzed.id,
            selected_experience_ids=[exp.id for exp in sample_experiences],
            template_id="modern",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "JD_NOT_ANALYZED"
        assert "must be analyzed" in result.message

    @pytest.mark.asyncio
    async def test_generate_resume_no_experiences_found(
        self,
        mock_resume_repository,
        mock_jd_repository,
        mock_experience_repository,
        mock_ai_router,
        sample_jd,
    ):
        """Test resume generation when no experiences are found."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = sample_jd
        mock_experience_repository.get_by_id.return_value = None

        use_case = GenerateResumeUseCase(
            resume_repository=mock_resume_repository,
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
            ai_router=mock_ai_router,
        )
        input_data = GenerateResumeInput(
            user_id=uuid4(),
            jd_id=sample_jd.id,
            selected_experience_ids=[uuid4(), uuid4()],
            template_id="modern",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "NO_EXPERIENCES_FOUND"
        assert "None of the selected experiences" in result.message

    @pytest.mark.asyncio
    async def test_generate_resume_ai_failure(
        self,
        mock_resume_repository,
        mock_jd_repository,
        mock_experience_repository,
        mock_ai_router,
        sample_jd,
        sample_experiences,
    ):
        """Test resume generation when AI fails."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = sample_jd
        mock_experience_repository.get_by_id.side_effect = sample_experiences
        mock_ai_router.route_request.side_effect = Exception("AI service unavailable")
        failed_resume = Resume(
            id=uuid4(),
            user_id=uuid4(),
            jd_id=sample_jd.id,
            title="Failed Resume",
            template_id="modern",
            content={},
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        mock_resume_repository.create.return_value = failed_resume

        use_case = GenerateResumeUseCase(
            resume_repository=mock_resume_repository,
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
            ai_router=mock_ai_router,
        )
        input_data = GenerateResumeInput(
            user_id=uuid4(),
            jd_id=sample_jd.id,
            selected_experience_ids=[exp.id for exp in sample_experiences],
            template_id="modern",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "GENERATION_FAILED"
        assert "Failed to generate" in result.message
        mock_resume_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_resume_parse_ai_response_json_block(self):
        """Test parsing AI response with JSON code block."""
        use_case = GenerateResumeUseCase(
            resume_repository=MagicMock(),
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
            ai_router=MagicMock(),
        )

        content = '''```json
{"key": "value", "number": 123}
```'''
        result = use_case._parse_ai_response(content)

        assert result is not None
        assert result["key"] == "value"
        assert result["number"] == 123

    @pytest.mark.asyncio
    async def test_generate_resume_parse_ai_response_plain_json(self):
        """Test parsing AI response with plain JSON."""
        use_case = GenerateResumeUseCase(
            resume_repository=MagicMock(),
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
            ai_router=MagicMock(),
        )

        content = '{"key": "value", "number": 123}'
        result = use_case._parse_ai_response(content)

        assert result is not None
        assert result["key"] == "value"

    @pytest.mark.asyncio
    async def test_generate_resume_parse_ai_response_invalid_json(self):
        """Test parsing invalid AI response."""
        use_case = GenerateResumeUseCase(
            resume_repository=MagicMock(),
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
            ai_router=MagicMock(),
        )

        content = "This is not valid JSON"
        result = use_case._parse_ai_response(content)

        assert result is None


# =============================================================================
# MatchExperiencesUseCase Tests
# =============================================================================


class TestMatchExperiencesUseCase:
    """Tests for MatchExperiencesUseCase."""

    @pytest.mark.asyncio
    async def test_match_experiences_success(
        self,
        mock_jd_repository,
        mock_experience_repository,
        sample_jd,
        sample_experiences,
    ):
        """Test successful experience matching."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = sample_jd
        mock_experience_repository.get_by_id.side_effect = sample_experiences

        use_case = MatchExperiencesUseCase(
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
        )
        input_data = MatchExperiencesInput(
            jd_id=sample_jd.id,
            experience_ids=[exp.id for exp in sample_experiences],
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert len(result.matches) == 2
        assert result.error is None
        mock_jd_repository.get_by_id.assert_called_once_with(sample_jd.id)

    @pytest.mark.asyncio
    async def test_match_experiences_no_experience_ids(
        self,
        mock_jd_repository,
        mock_experience_repository,
    ):
        """Test matching with no experience IDs."""
        # Arrange
        use_case = MatchExperiencesUseCase(
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
        )
        input_data = MatchExperiencesInput(
            jd_id=uuid4(),
            experience_ids=[],
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert len(result.matches) == 0

    @pytest.mark.asyncio
    async def test_match_experiences_jd_not_found(
        self,
        mock_jd_repository,
        mock_experience_repository,
        sample_experiences,
    ):
        """Test matching when JD not found."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = None

        use_case = MatchExperiencesUseCase(
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
        )
        jd_id = uuid4()
        input_data = MatchExperiencesInput(
            jd_id=jd_id,
            experience_ids=[exp.id for exp in sample_experiences],
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "JD_NOT_FOUND"
        assert len(result.matches) == 0

    @pytest.mark.asyncio
    async def test_match_experiences_no_experiences_found(
        self,
        mock_jd_repository,
        mock_experience_repository,
        sample_jd,
    ):
        """Test matching when no experiences are found."""
        # Arrange
        mock_jd_repository.get_by_id.return_value = sample_jd
        mock_experience_repository.get_by_id.return_value = None

        use_case = MatchExperiencesUseCase(
            jd_repository=mock_jd_repository,
            experience_repository=mock_experience_repository,
        )
        input_data = MatchExperiencesInput(
            jd_id=sample_jd.id,
            experience_ids=[uuid4(), uuid4()],
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "NO_EXPERIENCES_FOUND"
        assert len(result.matches) == 0

    def test_match_experiences_extract_jd_skills(self, sample_jd):
        """Test extracting skills from JD analysis."""
        use_case = MatchExperiencesUseCase(
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
        )

        skills = use_case._extract_jd_skills(sample_jd)

        assert "python" in skills
        assert "fastapi" in skills
        assert "postgresql" in skills

    def test_match_experiences_extract_jd_responsibilities(self, sample_jd):
        """Test extracting responsibilities from JD analysis."""
        use_case = MatchExperiencesUseCase(
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
        )

        responsibilities = use_case._extract_jd_responsibilities(sample_jd)

        assert len(responsibilities) > 0
        assert any("API" in resp for resp in responsibilities)

    def test_match_experiences_calculate_title_relevance_exact(self):
        """Test title relevance calculation with exact match."""
        use_case = MatchExperiencesUseCase(
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
        )

        score = use_case._calculate_title_relevance(
            "Software Engineer", "Software Engineer"
        )

        assert score == 1.0

    def test_match_experiences_calculate_title_relevance_contains(self):
        """Test title relevance calculation with contains match."""
        use_case = MatchExperiencesUseCase(
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
        )

        score = use_case._calculate_title_relevance(
            "Senior Software Engineer", "Software Engineer"
        )

        assert score == 0.8

    def test_match_experiences_calculate_title_relevance_no_match(self):
        """Test title relevance calculation with no match."""
        use_case = MatchExperiencesUseCase(
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
        )

        score = use_case._calculate_title_relevance(
            "Doctor", "Software Engineer"
        )

        assert score <= 0.5  # Low score for unrelated titles

    def test_match_experiences_calculate_description_match(self):
        """Test description matching calculation."""
        use_case = MatchExperiencesUseCase(
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
        )

        description = "Built scalable APIs using Python and FastAPI"
        responsibilities = ["Design APIs", "Build scalable systems"]

        score = use_case._calculate_description_match(description, responsibilities)

        assert score > 0.0
        assert score <= 1.0

    def test_match_experiences_calculate_achievement_relevance(self):
        """Test achievement relevance calculation."""
        use_case = MatchExperiencesUseCase(
            jd_repository=MagicMock(),
            experience_repository=MagicMock(),
        )

        achievements = [
            "Led team of Python developers",
            "Improved API performance",
        ]
        jd_skills = ["python", "fastapi"]
        jd_responsibilities = ["lead team", "build apis"]

        score = use_case._calculate_achievement_relevance(
            achievements, jd_skills, jd_responsibilities
        )

        assert score > 0.0
        assert score <= 1.0


# =============================================================================
# OptimizeExperienceUseCase Tests
# =============================================================================


class TestOptimizeExperienceUseCase:
    """Tests for OptimizeExperienceUseCase."""

    @pytest.mark.asyncio
    async def test_optimize_experience_success_with_ai(
        self,
        mock_experience_repository,
        mock_jd_repository,
        mock_ai_router,
        sample_experiences,
        sample_jd,
    ):
        """Test successful experience optimization with AI."""
        # Arrange
        experience = sample_experiences[0]
        mock_experience_repository.get_by_id.return_value = experience
        mock_jd_repository.get_by_id.return_value = sample_jd

        ai_response = MagicMock()
        ai_response.content = """• Led a team of 5 developers to build scalable APIs using Python and FastAPI
• Improved API performance by 50% through optimization and caching strategies
• Reduced deployment time by 70% by implementing CI/CD pipelines"""
        ai_response.token_usage = MagicMock()
        ai_response.token_usage.total_tokens = 500

        mock_ai_router.route_request.return_value = ai_response
        mock_experience_repository.update.return_value = experience

        use_case = OptimizeExperienceUseCase(
            experience_repository=mock_experience_repository,
            jd_repository=mock_jd_repository,
            ai_router=mock_ai_router,
        )
        input_data = OptimizeExperienceInput(
            experience_id=experience.id,
            jd_id=sample_jd.id,
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.experience is not None
        assert result.error is None
        mock_ai_router.route_request.assert_called_once()
        mock_experience_repository.update.assert_called()

    @pytest.mark.asyncio
    async def test_optimize_experience_fallback_no_ai(
        self,
        mock_experience_repository,
        sample_experiences,
    ):
        """Test experience optimization fallback without AI."""
        # Arrange
        experience = sample_experiences[0]
        mock_experience_repository.get_by_id.return_value = experience
        mock_experience_repository.update.return_value = experience

        use_case = OptimizeExperienceUseCase(
            experience_repository=mock_experience_repository,
            jd_repository=None,
            ai_router=None,
        )
        input_data = OptimizeExperienceInput(
            experience_id=experience.id,
            jd_id=None,
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert result.experience is not None
        assert "basic mode" in result.message

    @pytest.mark.asyncio
    async def test_optimize_experience_not_found(
        self,
        mock_experience_repository,
        mock_jd_repository,
        mock_ai_router,
    ):
        """Test optimization when experience not found."""
        # Arrange
        mock_experience_repository.get_by_id.return_value = None

        use_case = OptimizeExperienceUseCase(
            experience_repository=mock_experience_repository,
            jd_repository=mock_jd_repository,
            ai_router=mock_ai_router,
        )
        exp_id = uuid4()
        input_data = OptimizeExperienceInput(
            experience_id=exp_id,
            jd_id=None,
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "EXPERIENCE_NOT_FOUND"
        assert str(exp_id) in result.message

    @pytest.mark.asyncio
    async def test_optimize_experience_ai_failure_fallback(
        self,
        mock_experience_repository,
        mock_jd_repository,
        mock_ai_router,
        sample_experiences,
        sample_jd,
    ):
        """Test optimization fallback when AI fails."""
        # Arrange
        experience = sample_experiences[0]
        mock_experience_repository.get_by_id.return_value = experience
        mock_jd_repository.get_by_id.return_value = sample_jd
        mock_ai_router.route_request.side_effect = Exception("AI service error")
        mock_experience_repository.update.return_value = experience

        use_case = OptimizeExperienceUseCase(
            experience_repository=mock_experience_repository,
            jd_repository=mock_jd_repository,
            ai_router=mock_ai_router,
        )
        input_data = OptimizeExperienceInput(
            experience_id=experience.id,
            jd_id=sample_jd.id,
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is True
        assert "fallback mode" in result.message
        mock_experience_repository.update.assert_called()

    def test_optimize_experience_build_jd_context(self, sample_jd):
        """Test building JD context for prompt."""
        use_case = OptimizeExperienceUseCase(
            experience_repository=MagicMock(),
        )

        context = use_case._build_jd_context(sample_jd)

        assert "TARGET JOB CONTEXT" in context
        assert sample_jd.position_title in context
        assert sample_jd.company_name in context

    def test_optimize_experience_parse_optimized_description_code_block(self):
        """Test parsing optimized description with code block."""
        use_case = OptimizeExperienceUseCase(
            experience_repository=MagicMock(),
        )

        content = """```
• Led team of developers
• Built scalable systems
```"""
        result = use_case._parse_optimized_description(content)

        assert "Led team" in result
        assert "Built scalable" in result

    def test_optimize_experience_parse_optimized_description_bullets(self):
        """Test parsing optimized description with bullet markers."""
        use_case = OptimizeExperienceUseCase(
            experience_repository=MagicMock(),
        )

        content = """- Led team of developers
* Built scalable systems
• Improved performance
1. First item
2. Second item"""
        result = use_case._parse_optimized_description(content)

        lines = result.split("\n")
        assert len(lines) == 5
        assert not any(line.startswith(("- ", "* ", "• ", "1. ", "2. ")) for line in lines)

    def test_optimize_experience_basic_optimize_with_achievements(self, sample_experiences):
        """Test basic optimization using achievements."""
        use_case = OptimizeExperienceUseCase(
            experience_repository=MagicMock(),
        )

        experience = sample_experiences[0]
        result = use_case._basic_optimize(experience)

        assert "Led team" in result
        assert "performance" in result

    def test_optimize_experience_basic_optimize_no_achievements(self):
        """Test basic optimization without achievements."""
        use_case = OptimizeExperienceUseCase(
            experience_repository=MagicMock(),
        )

        experience = Experience(
            id=uuid4(),
            user_id=uuid4(),
            type="work",
            title="Developer",
            organization="Company",
            description="Worked on various projects",
            skills=["Python", "JavaScript"],
            achievements=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        result = use_case._basic_optimize(experience)

        assert "Worked on various projects" in result
        assert "Utilized" in result
