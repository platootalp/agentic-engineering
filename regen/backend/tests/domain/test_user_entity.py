"""Tests for User domain entity."""

from datetime import datetime
from uuid import UUID, uuid4

import pytest

from app.domain.entities.user import User


class TestUserCreation:
    """Test user entity creation."""

    def test_user_creation_with_defaults(self):
        """Test creating a user with default values."""
        user = User()

        assert isinstance(user.id, UUID)
        assert user.email == ""
        assert user.hashed_password == ""
        assert user.first_name is None
        assert user.last_name is None
        assert user.is_active is True
        assert user.is_verified is False
        assert isinstance(user.created_at, datetime)
        assert isinstance(user.updated_at, datetime)

    def test_user_creation_with_custom_values(self):
        """Test creating a user with custom values."""
        user_id = uuid4()
        created_at = datetime(2024, 1, 1, 12, 0, 0)
        updated_at = datetime(2024, 1, 1, 12, 0, 0)

        user = User(
            id=user_id,
            email="test@example.com",
            hashed_password="hashed_password_123",
            first_name="John",
            last_name="Doe",
            is_active=True,
            is_verified=True,
            created_at=created_at,
            updated_at=updated_at,
        )

        assert user.id == user_id
        assert user.email == "test@example.com"
        assert user.hashed_password == "hashed_password_123"
        assert user.first_name == "John"
        assert user.last_name == "Doe"
        assert user.is_active is True
        assert user.is_verified is True
        assert user.created_at == created_at
        assert user.updated_at == updated_at

    def test_user_create_classmethod(self):
        """Test the User.create classmethod."""
        user = User.create(
            email="  TEST@EXAMPLE.COM  ",
            hashed_password="hashed_password",
            first_name="Jane",
            last_name="Smith",
        )

        assert isinstance(user.id, UUID)
        assert user.email == "test@example.com"  # Should be lowercased and stripped
        assert user.hashed_password == "hashed_password"
        assert user.first_name == "Jane"
        assert user.last_name == "Smith"
        assert user.is_active is True
        assert user.is_verified is False
        assert isinstance(user.created_at, datetime)
        assert isinstance(user.updated_at, datetime)

    def test_user_create_without_optional_fields(self):
        """Test creating a user without optional fields."""
        user = User.create(
            email="test@example.com",
            hashed_password="hashed_password",
        )

        assert user.first_name is None
        assert user.last_name is None


class TestUserProperties:
    """Test user entity properties."""

    @pytest.mark.parametrize(
        "first_name,last_name,expected",
        [
            ("John", "Doe", "John Doe"),
            ("Jane", None, "Jane"),
            (None, "Smith", "Smith"),
            (None, None, ""),
            ("", "", ""),
            ("John", "", "John"),
            ("", "Doe", "Doe"),
        ],
    )
    def test_full_name_property(self, first_name, last_name, expected):
        """Test the full_name property with various name combinations."""
        user = User(first_name=first_name, last_name=last_name)
        assert user.full_name == expected


class TestUserUpdate:
    """Test user entity update methods."""

    def test_update_single_field(self):
        """Test updating a single field."""
        user = User.create(email="test@example.com", hashed_password="hash")
        original_updated_at = user.updated_at

        user.update(first_name="NewName")

        assert user.first_name == "NewName"
        assert user.updated_at > original_updated_at

    def test_update_multiple_fields(self):
        """Test updating multiple fields at once."""
        user = User.create(email="test@example.com", hashed_password="hash")

        user.update(first_name="NewFirst", last_name="NewLast", email="new@example.com")

        assert user.first_name == "NewFirst"
        assert user.last_name == "NewLast"
        assert user.email == "new@example.com"

    def test_update_ignores_none_values(self):
        """Test that None values are ignored during update."""
        user = User.create(
            email="test@example.com",
            hashed_password="hash",
            first_name="Original",
        )

        user.update(first_name=None)

        assert user.first_name == "Original"

    def test_update_ignores_invalid_fields(self):
        """Test that invalid fields are ignored during update."""
        user = User.create(email="test@example.com", hashed_password="hash")

        user.update(nonexistent_field="value", email="new@example.com")

        assert user.email == "new@example.com"
        assert not hasattr(user, "nonexistent_field")


class TestUserStatusMethods:
    """Test user entity status methods."""

    def test_deactivate(self):
        """Test deactivating a user."""
        user = User.create(email="test@example.com", hashed_password="hash")
        original_updated_at = user.updated_at

        user.deactivate()

        assert user.is_active is False
        assert user.updated_at > original_updated_at

    def test_verify(self):
        """Test verifying a user."""
        user = User.create(email="test@example.com", hashed_password="hash")
        original_updated_at = user.updated_at

        user.verify()

        assert user.is_verified is True
        assert user.updated_at > original_updated_at

    def test_deactivate_already_inactive(self):
        """Test deactivating an already inactive user."""
        user = User.create(email="test@example.com", hashed_password="hash")
        user.deactivate()
        original_updated_at = user.updated_at

        user.deactivate()

        assert user.is_active is False
        assert user.updated_at >= original_updated_at

    def test_verify_already_verified(self):
        """Test verifying an already verified user."""
        user = User.create(email="test@example.com", hashed_password="hash")
        user.verify()
        original_updated_at = user.updated_at

        user.verify()

        assert user.is_verified is True
        assert user.updated_at >= original_updated_at


class TestUserEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_user_with_empty_strings(self):
        """Test user with empty string values."""
        user = User(
            email="",
            hashed_password="",
            first_name="",
            last_name="",
        )

        assert user.email == ""
        assert user.hashed_password == ""
        assert user.first_name == ""
        assert user.last_name == ""
        assert user.full_name == ""

    def test_user_with_whitespace_in_names(self):
        """Test user with whitespace in names."""
        user = User(
            first_name="  John  ",
            last_name="  Doe  ",
        )

        assert user.full_name == "  John     Doe  "

    def test_user_email_case_sensitivity_in_create(self):
        """Test that email is lowercased in create method."""
        user = User.create(
            email="UPPER@EXAMPLE.COM",
            hashed_password="hash",
        )

        assert user.email == "upper@example.com"

    def test_user_email_whitespace_stripping_in_create(self):
        """Test that email whitespace is stripped in create method."""
        user = User.create(
            email="  test@example.com  ",
            hashed_password="hash",
        )

        assert user.email == "test@example.com"

    def test_user_timestamps_are_datetime_objects(self):
        """Test that timestamps are datetime objects."""
        user = User.create(email="test@example.com", hashed_password="hash")

        assert isinstance(user.created_at, datetime)
        assert isinstance(user.updated_at, datetime)
        assert user.created_at.tzinfo is None  # Should be naive datetime (utcnow)
        assert user.updated_at.tzinfo is None

    def test_user_id_is_uuid(self):
        """Test that user id is a valid UUID."""
        user = User.create(email="test@example.com", hashed_password="hash")

        assert isinstance(user.id, UUID)
        assert len(str(user.id)) == 36  # Standard UUID string length

    def test_multiple_users_have_unique_ids(self):
        """Test that multiple users get unique IDs."""
        user1 = User.create(email="user1@example.com", hashed_password="hash1")
        user2 = User.create(email="user2@example.com", hashed_password="hash2")

        assert user1.id != user2.id
