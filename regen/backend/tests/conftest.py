"""Pytest configuration and shared fixtures for backend tests."""

import asyncio
import os
from typing import AsyncGenerator, Generator
from unittest.mock import Mock, patch

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

# Set testing environment before importing app modules
os.environ["ENVIRONMENT"] = "testing"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:password@localhost:5432/test_db"
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["KIMI_API_KEY"] = "test-kimi-key"
os.environ["DEEPSEEK_API_KEY"] = "test-deepseek-key"

from app.main import create_app
from app.config import get_settings, Settings
from app.database import Base, get_db
from app.infrastructure.security import create_access_token, get_password_hash


# =============================================================================
# Event Loop Fixture
# =============================================================================

@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# =============================================================================
# Database Fixtures
# =============================================================================

TEST_DATABASE_URL = "postgresql+asyncpg://user:password@localhost:5432/test_db"

engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
    echo=False,
)

AsyncTestingSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    """Create all tables at the start of the test session."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Clean up after all tests
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database session for each test."""
    async with AsyncTestingSessionLocal() as session:
        yield session
        # Rollback after each test to ensure isolation
        await session.rollback()


# =============================================================================
# Application & Client Fixtures
# =============================================================================

@pytest.fixture
def app() -> FastAPI:
    """Create a FastAPI application instance for testing."""
    settings = Settings(
        environment="testing",
        database_url=TEST_DATABASE_URL,
        secret_key="test-secret-key",
        debug=True,
    )
    return create_app(settings)


@pytest_asyncio.fixture
async def client(app: FastAPI) -> AsyncGenerator[AsyncClient, None]:
    """Create an HTTP client for testing."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac


@pytest_asyncio.fixture
async def authenticated_client(
    app: FastAPI,
    test_user_data: dict,
) -> AsyncGenerator[AsyncClient, None]:
    """Create an authenticated HTTP client with a valid JWT token."""
    # Create token for test user
    access_token = create_access_token(
        data={"sub": test_user_data["id"], "email": test_user_data["email"]}
    )
    
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        headers={"Authorization": f"Bearer {access_token}"},
    ) as ac:
        yield ac


# =============================================================================
# Test Data Fixtures
# =============================================================================

@pytest.fixture
def test_user_data() -> dict:
    """Return test user data."""
    return {
        "id": "test-user-id-123",
        "email": "test@example.com",
        "full_name": "Test User",
        "hashed_password": get_password_hash("testpassword123"),
    }


@pytest.fixture
def test_jd_data() -> dict:
    """Return test job description data."""
    return {
        "id": "test-jd-id-456",
        "user_id": "test-user-id-123",
        "company_name": "Test Company",
        "position": "Senior Software Engineer",
        "description": "Looking for an experienced Python developer",
        "requirements": ["Python", "FastAPI", "PostgreSQL"],
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
        "location": "Beijing",
        "salary_range": {"min": 30000, "max": 50000},
        "source": "manual",
    }


@pytest.fixture
def test_experience_data() -> dict:
    """Return test experience data."""
    return {
        "id": "test-exp-id-789",
        "user_id": "test-user-id-123",
        "type": "work",
        "title": "Software Engineer",
        "organization": "Tech Corp",
        "location": "Shanghai",
        "start_date": "2020-01-01",
        "end_date": "2023-12-31",
        "is_current": False,
        "description": "Developed scalable web applications",
        "achievements": ["Led team of 5 developers", "Improved performance by 50%"],
        "skills": ["Python", "Django", "AWS"],
        "metadata": {},
    }


@pytest.fixture
def test_resume_data() -> dict:
    """Return test resume data."""
    return {
        "id": "test-resume-id-abc",
        "user_id": "test-user-id-123",
        "job_description_id": "test-jd-id-456",
        "title": "My Resume",
        "template_id": "modern",
        "content": {
            "personal_info": {
                "full_name": "Test User",
                "email": "test@example.com",
                "phone": "+86 13800138000",
                "location": "Beijing",
                "summary": "Experienced software engineer",
            },
            "experiences": [],
            "education": [],
            "projects": [],
            "skills": [],
        },
        "selected_experience_ids": ["test-exp-id-789"],
        "status": "draft",
        "is_default": False,
    }


# =============================================================================
# Mock Fixtures
# =============================================================================

@pytest.fixture
def mock_ai_gateway() -> Generator[Mock, None, None]:
    """Mock AI gateway for testing."""
    with patch("app.infrastructure.ai.gateway.AIGateway") as mock:
        instance = Mock()
        instance.generate.return_value = {
            "content": "Generated resume content",
            "model": "kimi",
            "usage": {"prompt_tokens": 100, "completion_tokens": 200},
        }
        instance.analyze_jd.return_value = {
            "skills": ["Python", "FastAPI"],
            "requirements": ["5+ years experience"],
            "responsibilities": ["Build APIs"],
            "match_score": 85,
        }
        mock.return_value = instance
        yield instance


@pytest.fixture
def mock_pdf_service() -> Generator[Mock, None, None]:
    """Mock PDF export service for testing."""
    with patch("app.infrastructure.pdf.export_service.PDFExportService") as mock:
        instance = Mock()
        instance.export.return_value = b"PDF binary content"
        instance.get_template_names.return_value = ["modern", "classic", "creative"]
        mock.return_value = instance
        yield instance


@pytest.fixture
def mock_kimi_adapter() -> Generator[Mock, None, None]:
    """Mock Kimi AI adapter for testing."""
    with patch("app.infrastructure.ai.kimi_adapter.KimiAdapter") as mock:
        instance = Mock()
        instance.generate.return_value = {
            "content": "Generated content from Kimi",
            "model": "kimi",
            "usage": {"prompt_tokens": 100, "completion_tokens": 200},
        }
        instance.is_available.return_value = True
        mock.return_value = instance
        yield instance


@pytest.fixture
def mock_deepseek_adapter() -> Generator[Mock, None, None]:
    """Mock DeepSeek AI adapter for testing."""
    with patch("app.infrastructure.ai.deepseek_adapter.DeepSeekAdapter") as mock:
        instance = Mock()
        instance.generate.return_value = {
            "content": "Generated content from DeepSeek",
            "model": "deepseek",
            "usage": {"prompt_tokens": 100, "completion_tokens": 200},
        }
        instance.is_available.return_value = True
        mock.return_value = instance
        yield instance


# =============================================================================
# Helper Functions
# =============================================================================

@pytest.fixture
def create_test_token():
    """Factory fixture to create JWT tokens for testing."""
    def _create_token(user_id: str, email: str, **kwargs) -> str:
        data = {"sub": user_id, "email": email, **kwargs}
        return create_access_token(data=data)
    return _create_token


@pytest.fixture
def assert_response_ok():
    """Helper fixture to assert successful responses."""
    def _assert(response, expected_status: int = 200):
        assert response.status_code == expected_status, (
            f"Expected status {expected_status}, got {response.status_code}. "
            f"Response: {response.text}"
        )
        return response.json()
    return _assert
