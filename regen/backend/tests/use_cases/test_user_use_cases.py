"""Unit tests for user use cases."""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID, uuid4

import pytest

from app.domain.entities.user import User
from app.use_cases.user.register_user import (
    RegisterUserInput,
    RegisterUserOutput,
    RegisterUserUseCase,
)
from app.use_cases.user.login_user import (
    LoginUserInput,
    LoginUserOutput,
    LoginUserUseCase,
)
from app.use_cases.user.get_current_user import (
    GetCurrentUserOutput,
    GetCurrentUserUseCase,
)


# =============================================================================
# Fixtures
# =============================================================================

@pytest.fixture
def mock_user_repository():
    """Create a mock user repository."""
    repo = MagicMock()
    repo.get_by_id = AsyncMock()
    repo.get_by_email = AsyncMock()
    repo.create = AsyncMock()
    repo.exists_by_email = AsyncMock()
    return repo


@pytest.fixture
def sample_user():
    """Create a sample user entity."""
    return User(
        id=uuid4(),
        email="test@example.com",
        hashed_password="hashed_password_123",
        first_name="Test",
        last_name="User",
        is_active=True,
        is_verified=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@pytest.fixture
def inactive_user():
    """Create an inactive user entity."""
    return User(
        id=uuid4(),
        email="inactive@example.com",
        hashed_password="hashed_password_123",
        first_name="Inactive",
        last_name="User",
        is_active=False,
        is_verified=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


# =============================================================================
# RegisterUserUseCase Tests
# =============================================================================


class TestRegisterUserUseCase:
    """Tests for RegisterUserUseCase."""

    @pytest.mark.asyncio
    async def test_register_user_success(self, mock_user_repository, sample_user):
        """Test successful user registration."""
        # Arrange
        mock_user_repository.exists_by_email.return_value = False
        mock_user_repository.create.return_value = sample_user

        with patch("app.use_cases.user.register_user.get_password_hash", return_value="hashed_password"):
            with patch("app.use_cases.user.register_user.create_access_token", return_value="access_token"):
                with patch("app.use_cases.user.register_user.create_refresh_token", return_value="refresh_token"):
                    use_case = RegisterUserUseCase(mock_user_repository)
                    input_data = RegisterUserInput(
                        email="test@example.com",
                        password="password123",
                        first_name="Test",
                        last_name="User",
                    )

                    # Act
                    result = await use_case.execute(input_data)

                    # Assert
                    assert result.success is True
                    assert result.user is not None
                    assert result.user.email == "test@example.com"
                    assert result.user.first_name == "Test"
                    assert result.user.last_name == "User"
                    assert result.user.full_name == "Test User"
                    assert result.tokens is not None
                    assert result.tokens.access_token is not None
                    assert result.tokens.refresh_token is not None
                    assert result.tokens.expires_in == 7200
                    assert result.error is None
                    mock_user_repository.exists_by_email.assert_called_once_with("test@example.com")
                    mock_user_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_user_email_already_exists(self, mock_user_repository):
        """Test registration with existing email."""
        # Arrange
        mock_user_repository.exists_by_email.return_value = True

        use_case = RegisterUserUseCase(mock_user_repository)
        input_data = RegisterUserInput(
            email="existing@example.com",
            password="password123",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "EMAIL_EXISTS"
        assert result.user is None
        assert result.tokens is None
        assert "already exists" in result.message
        mock_user_repository.exists_by_email.assert_called_once_with("existing@example.com")
        mock_user_repository.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_register_user_missing_email(self, mock_user_repository):
        """Test registration with missing email."""
        # Arrange
        use_case = RegisterUserUseCase(mock_user_repository)
        input_data = RegisterUserInput(
            email="",
            password="password123",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "required" in result.message
        mock_user_repository.exists_by_email.assert_not_called()

    @pytest.mark.asyncio
    async def test_register_user_missing_password(self, mock_user_repository):
        """Test registration with missing password."""
        # Arrange
        use_case = RegisterUserUseCase(mock_user_repository)
        input_data = RegisterUserInput(
            email="test@example.com",
            password="",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "required" in result.message

    @pytest.mark.asyncio
    async def test_register_user_invalid_email_format(self, mock_user_repository):
        """Test registration with invalid email format."""
        # Arrange
        use_case = RegisterUserUseCase(mock_user_repository)
        input_data = RegisterUserInput(
            email="invalid-email",
            password="password123",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "Invalid email format" in result.message

    @pytest.mark.asyncio
    async def test_register_user_short_password(self, mock_user_repository):
        """Test registration with password too short."""
        # Arrange
        use_case = RegisterUserUseCase(mock_user_repository)
        input_data = RegisterUserInput(
            email="test@example.com",
            password="short",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "at least 8 characters" in result.message

    @pytest.mark.asyncio
    async def test_register_user_email_without_domain(self, mock_user_repository):
        """Test registration with email missing domain."""
        # Arrange
        use_case = RegisterUserUseCase(mock_user_repository)
        input_data = RegisterUserInput(
            email="test@",
            password="password123",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "Invalid email format" in result.message

    @pytest.mark.asyncio
    async def test_register_user_repository_exception(self, mock_user_repository):
        """Test registration when repository raises exception."""
        # Arrange
        mock_user_repository.exists_by_email.return_value = False
        mock_user_repository.create.side_effect = Exception("Database connection failed")

        with patch("app.use_cases.user.register_user.get_password_hash", return_value="hashed_password"):
            use_case = RegisterUserUseCase(mock_user_repository)
            input_data = RegisterUserInput(
                email="test@example.com",
                password="password123",
            )

            # Act
            result = await use_case.execute(input_data)

            # Assert
            assert result.success is False
            assert result.error == "INTERNAL_ERROR"
            assert "Registration failed" in result.message

    @pytest.mark.asyncio
    async def test_register_user_optional_names_none(self, mock_user_repository, sample_user):
        """Test registration without optional first/last name."""
        # Arrange
        mock_user_repository.exists_by_email.return_value = False
        mock_user_repository.create.return_value = sample_user

        with patch("app.use_cases.user.register_user.get_password_hash", return_value="hashed_password"):
            with patch("app.use_cases.user.register_user.create_access_token", return_value="access_token"):
                with patch("app.use_cases.user.register_user.create_refresh_token", return_value="refresh_token"):
                    use_case = RegisterUserUseCase(mock_user_repository)
                    input_data = RegisterUserInput(
                        email="test@example.com",
                        password="password123",
                    )

                    # Act
                    result = await use_case.execute(input_data)

                    # Assert
                    assert result.success is True
                    assert result.user is not None


# =============================================================================
# LoginUserUseCase Tests
# =============================================================================


class TestLoginUserUseCase:
    """Tests for LoginUserUseCase."""

    @pytest.mark.asyncio
    async def test_login_user_success(self, mock_user_repository, sample_user):
        """Test successful user login."""
        # Arrange
        mock_user_repository.get_by_email.return_value = sample_user

        use_case = LoginUserUseCase(mock_user_repository)
        input_data = LoginUserInput(
            email="test@example.com",
            password="password123",
        )

        # Mock password verification to return True
        with patch("app.use_cases.user.login_user.verify_password", return_value=True):
            with patch("app.use_cases.user.login_user.create_access_token", return_value="access_token"):
                with patch("app.use_cases.user.login_user.create_refresh_token", return_value="refresh_token"):
                    # Act
                    result = await use_case.execute(input_data)

                    # Assert
                    assert result.success is True
                    assert result.user is not None
                    assert result.user.email == "test@example.com"
                    assert result.tokens is not None
                    assert result.tokens.access_token is not None
                    assert result.tokens.refresh_token is not None
                    assert result.error is None
                    mock_user_repository.get_by_email.assert_called_once_with("test@example.com")

    @pytest.mark.asyncio
    async def test_login_user_invalid_credentials_wrong_password(self, mock_user_repository, sample_user):
        """Test login with wrong password."""
        # Arrange
        mock_user_repository.get_by_email.return_value = sample_user

        use_case = LoginUserUseCase(mock_user_repository)
        input_data = LoginUserInput(
            email="test@example.com",
            password="wrongpassword",
        )

        # Mock password verification to return False
        with patch("app.use_cases.user.login_user.verify_password", return_value=False):
            # Act
            result = await use_case.execute(input_data)

            # Assert
            assert result.success is False
            assert result.error == "INVALID_CREDENTIALS"
            assert result.user is None
            assert result.tokens is None
            assert "Invalid email or password" in result.message

    @pytest.mark.asyncio
    async def test_login_user_invalid_credentials_user_not_found(self, mock_user_repository):
        """Test login with non-existent user."""
        # Arrange
        mock_user_repository.get_by_email.return_value = None

        use_case = LoginUserUseCase(mock_user_repository)
        input_data = LoginUserInput(
            email="nonexistent@example.com",
            password="password123",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "INVALID_CREDENTIALS"
        assert result.user is None
        assert "Invalid email or password" in result.message

    @pytest.mark.asyncio
    async def test_login_user_inactive_account(self, mock_user_repository, inactive_user):
        """Test login with inactive account."""
        # Arrange
        mock_user_repository.get_by_email.return_value = inactive_user

        use_case = LoginUserUseCase(mock_user_repository)
        input_data = LoginUserInput(
            email="inactive@example.com",
            password="password123",
        )

        # Mock password verification to return True
        with patch("app.use_cases.user.login_user.verify_password", return_value=True):
            # Act
            result = await use_case.execute(input_data)

            # Assert
            assert result.success is False
            assert result.error == "ACCOUNT_INACTIVE"
            assert result.user is None
            assert "deactivated" in result.message

    @pytest.mark.asyncio
    async def test_login_user_missing_email(self, mock_user_repository):
        """Test login with missing email."""
        # Arrange
        use_case = LoginUserUseCase(mock_user_repository)
        input_data = LoginUserInput(
            email="",
            password="password123",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "required" in result.message

    @pytest.mark.asyncio
    async def test_login_user_missing_password(self, mock_user_repository):
        """Test login with missing password."""
        # Arrange
        use_case = LoginUserUseCase(mock_user_repository)
        input_data = LoginUserInput(
            email="test@example.com",
            password="",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "VALIDATION_ERROR"
        assert "required" in result.message

    @pytest.mark.asyncio
    async def test_login_user_repository_exception(self, mock_user_repository):
        """Test login when repository raises exception."""
        # Arrange
        mock_user_repository.get_by_email.side_effect = Exception("Database connection failed")

        use_case = LoginUserUseCase(mock_user_repository)
        input_data = LoginUserInput(
            email="test@example.com",
            password="password123",
        )

        # Act
        result = await use_case.execute(input_data)

        # Assert
        assert result.success is False
        assert result.error == "INTERNAL_ERROR"
        assert "Login failed" in result.message


# =============================================================================
# GetCurrentUserUseCase Tests
# =============================================================================


class TestGetCurrentUserUseCase:
    """Tests for GetCurrentUserUseCase."""

    @pytest.mark.asyncio
    async def test_get_current_user_success(self, mock_user_repository, sample_user):
        """Test successful retrieval of current user."""
        # Arrange
        mock_user_repository.get_by_id.return_value = sample_user

        use_case = GetCurrentUserUseCase(mock_user_repository)
        user_id = sample_user.id

        # Act
        result = await use_case.execute(user_id)

        # Assert
        assert result.success is True
        assert result.user is not None
        assert result.user.id == str(sample_user.id)
        assert result.user.email == sample_user.email
        assert result.user.first_name == sample_user.first_name
        assert result.user.last_name == sample_user.last_name
        assert result.user.full_name == "Test User"
        assert result.user.is_active is True
        assert result.error is None
        mock_user_repository.get_by_id.assert_called_once_with(user_id)

    @pytest.mark.asyncio
    async def test_get_current_user_not_found(self, mock_user_repository):
        """Test retrieval when user not found."""
        # Arrange
        mock_user_repository.get_by_id.return_value = None

        use_case = GetCurrentUserUseCase(mock_user_repository)
        user_id = uuid4()

        # Act
        result = await use_case.execute(user_id)

        # Assert
        assert result.success is False
        assert result.error == "USER_NOT_FOUND"
        assert result.user is None
        assert "not found" in result.message

    @pytest.mark.asyncio
    async def test_get_current_user_inactive_account(self, mock_user_repository, inactive_user):
        """Test retrieval of inactive user."""
        # Arrange
        mock_user_repository.get_by_id.return_value = inactive_user

        use_case = GetCurrentUserUseCase(mock_user_repository)
        user_id = inactive_user.id

        # Act
        result = await use_case.execute(user_id)

        # Assert
        assert result.success is False
        assert result.error == "ACCOUNT_INACTIVE"
        assert result.user is None
        assert "deactivated" in result.message

    @pytest.mark.asyncio
    async def test_get_current_user_repository_exception(self, mock_user_repository):
        """Test retrieval when repository raises exception."""
        # Arrange
        mock_user_repository.get_by_id.side_effect = Exception("Database connection failed")

        use_case = GetCurrentUserUseCase(mock_user_repository)
        user_id = uuid4()

        # Act
        result = await use_case.execute(user_id)

        # Assert
        assert result.success is False
        assert result.error == "INTERNAL_ERROR"
        assert "Failed to retrieve user" in result.message

    @pytest.mark.asyncio
    async def test_get_current_user_with_minimal_data(self, mock_user_repository):
        """Test retrieval of user with minimal data (no first/last name)."""
        # Arrange
        user = User(
            id=uuid4(),
            email="minimal@example.com",
            hashed_password="hashed",
            first_name=None,
            last_name=None,
            is_active=True,
            created_at=datetime.utcnow(),
        )
        mock_user_repository.get_by_id.return_value = user

        use_case = GetCurrentUserUseCase(mock_user_repository)

        # Act
        result = await use_case.execute(user.id)

        # Assert
        assert result.success is True
        assert result.user is not None
        assert result.user.email == "minimal@example.com"
        assert result.user.first_name is None
        assert result.user.last_name is None
        assert result.user.full_name == ""
