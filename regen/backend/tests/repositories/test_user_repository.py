"""Integration tests for PostgresUserRepository."""

import pytest
from datetime import datetime
from uuid import uuid4

from app.adapters.repositories.postgres_user_repository import PostgresUserRepository
from app.domain.entities.user import User


@pytest.mark.asyncio
async def test_create_user(db_session):
    """Test creating a new user."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="test@example.com",
        hashed_password="hashed_password_123",
        first_name="Test",
        last_name="User",
    )

    # Act
    created_user = await repo.create(user)

    # Assert
    assert created_user.email == "test@example.com"
    assert created_user.id is not None
    assert created_user.first_name == "Test"
    assert created_user.last_name == "User"
    assert created_user.is_active is True
    assert created_user.is_verified is False
    assert created_user.created_at is not None
    assert created_user.updated_at is not None


@pytest.mark.asyncio
async def test_get_user_by_id(db_session):
    """Test retrieving a user by ID."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="test@example.com",
        hashed_password="hashed_password_123",
        first_name="Test",
        last_name="User",
    )
    created_user = await repo.create(user)

    # Act
    found_user = await repo.get_by_id(created_user.id)

    # Assert
    assert found_user is not None
    assert found_user.id == created_user.id
    assert found_user.email == "test@example.com"
    assert found_user.first_name == "Test"
    assert found_user.last_name == "User"


@pytest.mark.asyncio
async def test_get_user_by_id_not_found(db_session):
    """Test retrieving a non-existent user by ID."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    non_existent_id = uuid4()

    # Act
    result = await repo.get_by_id(non_existent_id)

    # Assert
    assert result is None


@pytest.mark.asyncio
async def test_get_user_by_email(db_session):
    """Test retrieving a user by email."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="test@example.com",
        hashed_password="hashed_password_123",
        first_name="Test",
        last_name="User",
    )
    await repo.create(user)

    # Act
    found_user = await repo.get_by_email("test@example.com")

    # Assert
    assert found_user is not None
    assert found_user.email == "test@example.com"
    assert found_user.first_name == "Test"


@pytest.mark.asyncio
async def test_get_user_by_email_case_insensitive(db_session):
    """Test that email lookup is case insensitive."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="Test@Example.COM",
        hashed_password="hashed_password_123",
    )
    await repo.create(user)

    # Act
    found_user = await repo.get_by_email("test@example.com")

    # Assert
    assert found_user is not None
    assert found_user.email == "test@example.com"


@pytest.mark.asyncio
async def test_get_user_by_email_not_found(db_session):
    """Test retrieving a non-existent user by email."""
    # Arrange
    repo = PostgresUserRepository(db_session)

    # Act
    result = await repo.get_by_email("nonexistent@example.com")

    # Assert
    assert result is None


@pytest.mark.asyncio
async def test_update_user(db_session):
    """Test updating an existing user."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="test@example.com",
        hashed_password="hashed_password_123",
        first_name="Test",
        last_name="User",
    )
    created_user = await repo.create(user)

    # Modify user
    created_user.first_name = "Updated"
    created_user.last_name = "Name"
    created_user.email = "updated@example.com"
    created_user.updated_at = datetime.utcnow()

    # Act
    updated_user = await repo.update(created_user)

    # Assert
    assert updated_user.first_name == "Updated"
    assert updated_user.last_name == "Name"
    assert updated_user.email == "updated@example.com"

    # Verify in database
    found_user = await repo.get_by_id(created_user.id)
    assert found_user.first_name == "Updated"
    assert found_user.email == "updated@example.com"


@pytest.mark.asyncio
async def test_update_user_not_found(db_session):
    """Test updating a non-existent user raises error."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    non_existent_user = User.create(
        email="test@example.com",
        hashed_password="hashed_password_123",
    )
    # Set a random ID that doesn't exist in DB
    non_existent_user.id = uuid4()

    # Act & Assert
    with pytest.raises(ValueError, match="User with id .* not found"):
        await repo.update(non_existent_user)


@pytest.mark.asyncio
async def test_delete_user(db_session):
    """Test deleting a user."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="test@example.com",
        hashed_password="hashed_password_123",
    )
    created_user = await repo.create(user)

    # Act
    result = await repo.delete(created_user.id)

    # Assert
    assert result is True

    # Verify user is deleted
    found_user = await repo.get_by_id(created_user.id)
    assert found_user is None


@pytest.mark.asyncio
async def test_delete_user_not_found(db_session):
    """Test deleting a non-existent user."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    non_existent_id = uuid4()

    # Act
    result = await repo.delete(non_existent_id)

    # Assert
    assert result is False


@pytest.mark.asyncio
async def test_exists_by_email(db_session):
    """Test checking if user exists by email."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="test@example.com",
        hashed_password="hashed_password_123",
    )
    await repo.create(user)

    # Act & Assert
    assert await repo.exists_by_email("test@example.com") is True
    assert await repo.exists_by_email("nonexistent@example.com") is False


@pytest.mark.asyncio
async def test_exists_by_email_case_insensitive(db_session):
    """Test that exists_by_email is case insensitive."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="Test@Example.COM",
        hashed_password="hashed_password_123",
    )
    await repo.create(user)

    # Act & Assert
    assert await repo.exists_by_email("test@example.com") is True
    assert await repo.exists_by_email("TEST@EXAMPLE.COM") is True


@pytest.mark.asyncio
async def test_create_multiple_users(db_session):
    """Test creating multiple users."""
    # Arrange
    repo = PostgresUserRepository(db_session)

    user1 = User.create(
        email="user1@example.com",
        hashed_password="hashed_password_1",
        first_name="User",
        last_name="One",
    )
    user2 = User.create(
        email="user2@example.com",
        hashed_password="hashed_password_2",
        first_name="User",
        last_name="Two",
    )

    # Act
    created1 = await repo.create(user1)
    created2 = await repo.create(user2)

    # Assert
    assert created1.id != created2.id
    assert created1.email == "user1@example.com"
    assert created2.email == "user2@example.com"

    # Verify both exist
    assert await repo.get_by_id(created1.id) is not None
    assert await repo.get_by_id(created2.id) is not None


@pytest.mark.asyncio
async def test_user_full_name_property(db_session):
    """Test the full_name property of User entity."""
    # Arrange
    repo = PostgresUserRepository(db_session)

    # Test with both names
    user1 = User.create(
        email="user1@example.com",
        hashed_password="hashed_password_1",
        first_name="John",
        last_name="Doe",
    )
    created1 = await repo.create(user1)

    # Test with only first name
    user2 = User.create(
        email="user2@example.com",
        hashed_password="hashed_password_2",
        first_name="Jane",
    )
    created2 = await repo.create(user2)

    # Test with only last name
    user3 = User.create(
        email="user3@example.com",
        hashed_password="hashed_password_3",
        last_name="Smith",
    )
    created3 = await repo.create(user3)

    # Assert
    assert created1.full_name == "John Doe"
    assert created2.full_name == "Jane"
    assert created3.full_name == "Smith"


@pytest.mark.asyncio
async def test_user_deactivate_and_verify(db_session):
    """Test user deactivate and verify methods."""
    # Arrange
    repo = PostgresUserRepository(db_session)
    user = User.create(
        email="test@example.com",
        hashed_password="hashed_password_123",
    )
    created_user = await repo.create(user)

    # Act - Deactivate
    created_user.deactivate()
    updated = await repo.update(created_user)

    # Assert
    assert updated.is_active is False

    # Act - Verify
    updated.verify()
    updated2 = await repo.update(updated)

    # Assert
    assert updated2.is_verified is True
