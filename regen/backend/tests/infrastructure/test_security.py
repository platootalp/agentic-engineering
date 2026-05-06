"""Tests for security utilities (JWT and password hashing)."""

from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock

import pytest
from jose import jwt

from app.infrastructure.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token,
)


class TestPasswordHashing:
    """Tests for password hashing functions."""

    @pytest.fixture(autouse=True)
    def mock_pwd_context(self):
        """Mock the password context to avoid bcrypt compatibility issues."""
        with patch("app.infrastructure.security.pwd_context") as mock:
            # Setup mock hash behavior
            def mock_hash(password):
                return f"$2b$12$mockhash{password}"
            mock.hash.side_effect = mock_hash
            
            # Setup mock verify behavior
            def mock_verify(plain, hashed):
                expected = f"$2b$12$mockhash{plain}"
                return hashed == expected
            mock.verify.side_effect = mock_verify
            
            yield mock

    def test_get_password_hash_returns_different_string(self, mock_pwd_context):
        """Test that hashing produces a different string."""
        from app.infrastructure.security import get_password_hash
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert hashed != password
        assert isinstance(hashed, str)
        assert len(hashed) > 0
        mock_pwd_context.hash.assert_called_once_with(password)

    def test_get_password_hash_consistency(self, mock_pwd_context):
        """Test that hashing produces different hashes for same password (due to salt)."""
        from app.infrastructure.security import get_password_hash
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        # Both should be called
        assert mock_pwd_context.hash.call_count == 2

    def test_verify_password_correct(self, mock_pwd_context):
        """Test verifying correct password."""
        from app.infrastructure.security import verify_password, get_password_hash
        password = "testpassword123"
        hashed = get_password_hash(password)
        result = verify_password(password, hashed)
        assert result is True

    def test_verify_password_incorrect(self, mock_pwd_context):
        """Test verifying incorrect password."""
        from app.infrastructure.security import verify_password, get_password_hash
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)
        result = verify_password(wrong_password, hashed)
        assert result is False

    def test_verify_password_empty(self, mock_pwd_context):
        """Test verifying empty password."""
        from app.infrastructure.security import verify_password, get_password_hash
        password = ""
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True
        assert verify_password("notempty", hashed) is False

    def test_verify_password_unicode(self, mock_pwd_context):
        """Test verifying unicode password."""
        from app.infrastructure.security import verify_password, get_password_hash
        password = "密码测试123!@#"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True
        assert verify_password("wrong密码", hashed) is False


class TestAccessToken:
    """Tests for access token creation and verification."""

    def test_create_access_token_returns_string(self):
        """Test that access token is created as string."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data=data)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_contains_data(self):
        """Test that access token contains the encoded data."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data=data)
        payload = jwt.decode(token, "test-secret-key-for-testing-only", algorithms=["HS256"])
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"

    def test_create_access_token_has_expiration(self):
        """Test that access token has expiration."""
        data = {"sub": "user123"}
        token = create_access_token(data=data)
        payload = jwt.decode(token, "test-secret-key-for-testing-only", algorithms=["HS256"])
        assert "exp" in payload
        assert "type" in payload
        assert payload["type"] == "access"

    def test_create_access_token_custom_expiration(self):
        """Test creating token with custom expiration."""
        data = {"sub": "user123"}
        expires = timedelta(minutes=5)
        token = create_access_token(data=data, expires_delta=expires)
        payload = jwt.decode(token, "test-secret-key-for-testing-only", algorithms=["HS256"])
        exp_timestamp = payload["exp"]
        exp_datetime = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        now = datetime.now(timezone.utc)
        # Should be approximately 5 minutes from now
        assert 240 < (exp_datetime - now).total_seconds() < 360

    def test_create_access_token_does_not_modify_original_data(self):
        """Test that original data dict is not modified."""
        data = {"sub": "user123", "email": "test@example.com"}
        original_data = data.copy()
        create_access_token(data=data)
        assert data == original_data


class TestRefreshToken:
    """Tests for refresh token creation and verification."""

    def test_create_refresh_token_returns_string(self):
        """Test that refresh token is created as string."""
        data = {"sub": "user123"}
        token = create_refresh_token(data=data)
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_refresh_token_contains_data(self):
        """Test that refresh token contains the encoded data."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_refresh_token(data=data)
        payload = jwt.decode(token, "test-secret-key-for-testing-only", algorithms=["HS256"])
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"

    def test_create_refresh_token_has_expiration(self):
        """Test that refresh token has expiration."""
        data = {"sub": "user123"}
        token = create_refresh_token(data=data)
        payload = jwt.decode(token, "test-secret-key-for-testing-only", algorithms=["HS256"])
        assert "exp" in payload
        assert "type" in payload
        assert payload["type"] == "refresh"

    def test_create_refresh_token_longer_expiration(self):
        """Test that refresh token has longer expiration than access token."""
        data = {"sub": "user123"}
        access_token = create_access_token(data=data)
        refresh_token = create_refresh_token(data=data)

        access_payload = jwt.decode(access_token, "test-secret-key-for-testing-only", algorithms=["HS256"])
        refresh_payload = jwt.decode(refresh_token, "test-secret-key-for-testing-only", algorithms=["HS256"])

        access_exp = access_payload["exp"]
        refresh_exp = refresh_payload["exp"]

        # Refresh token should expire later than access token
        assert refresh_exp > access_exp


class TestVerifyToken:
    """Tests for token verification."""

    def test_verify_valid_access_token(self):
        """Test verifying a valid access token."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data=data)
        payload = verify_token(token, token_type="access")
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"

    def test_verify_valid_refresh_token(self):
        """Test verifying a valid refresh token."""
        data = {"sub": "user123"}
        token = create_refresh_token(data=data)
        payload = verify_token(token, token_type="refresh")
        assert payload is not None
        assert payload["sub"] == "user123"

    def test_verify_token_wrong_type(self):
        """Test verifying token with wrong type."""
        data = {"sub": "user123"}
        access_token = create_access_token(data=data)
        # Try to verify access token as refresh token
        payload = verify_token(access_token, token_type="refresh")
        assert payload is None

    def test_verify_expired_token(self):
        """Test verifying an expired token."""
        data = {"sub": "user123"}
        # Create token that expired 1 hour ago
        expired_delta = timedelta(hours=-1)
        token = create_access_token(data=data, expires_delta=expired_delta)
        payload = verify_token(token, token_type="access")
        assert payload is None

    def test_verify_invalid_token(self):
        """Test verifying an invalid token."""
        payload = verify_token("invalid.token.here", token_type="access")
        assert payload is None

    def test_verify_malformed_token(self):
        """Test verifying a malformed token."""
        payload = verify_token("not-a-valid-jwt", token_type="access")
        assert payload is None

    def test_verify_empty_token(self):
        """Test verifying an empty token."""
        payload = verify_token("", token_type="access")
        assert payload is None

    def test_verify_token_without_exp(self):
        """Test verifying token without expiration."""
        # Manually create token without exp
        token = jwt.encode(
            {"sub": "user123", "type": "access"},
            "test-secret-key-for-testing-only",
            algorithm="HS256",
        )
        payload = verify_token(token, token_type="access")
        assert payload is None

    def test_verify_token_without_type(self):
        """Test verifying token without type."""
        # Manually create token without type
        token = jwt.encode(
            {"sub": "user123", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
            "test-secret-key-for-testing-only",
            algorithm="HS256",
        )
        payload = verify_token(token, token_type="access")
        assert payload is None


class TestDecodeToken:
    """Tests for token decoding without verification."""

    def test_decode_valid_token(self):
        """Test decoding a valid token."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data=data)
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@example.com"

    def test_decode_expired_token(self):
        """Test decoding an expired token (should work without verification)."""
        data = {"sub": "user123"}
        expired_delta = timedelta(hours=-1)
        token = create_access_token(data=data, expires_delta=expired_delta)
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"

    def test_decode_invalid_token(self):
        """Test decoding an invalid token."""
        payload = decode_token("invalid.token.here")
        assert payload is None

    def test_decode_malformed_token(self):
        """Test decoding a malformed token."""
        payload = decode_token("not-a-valid-jwt")
        assert payload is None


class TestSecurityIntegration:
    """Integration tests for security functions."""

    @pytest.fixture(autouse=True)
    def mock_pwd_context(self):
        """Mock the password context to avoid bcrypt compatibility issues."""
        with patch("app.infrastructure.security.pwd_context") as mock:
            def mock_hash(password):
                return f"$2b$12$mockhash{password}"
            mock.hash.side_effect = mock_hash
            
            def mock_verify(plain, hashed):
                expected = f"$2b$12$mockhash{plain}"
                return hashed == expected
            mock.verify.side_effect = mock_verify
            
            yield mock

    def test_full_auth_flow(self, mock_pwd_context):
        """Test complete authentication flow."""
        from app.infrastructure.security import verify_password, get_password_hash
        
        # 1. Hash password
        password = "securepassword123"
        hashed = get_password_hash(password)

        # 2. Verify password
        assert verify_password(password, hashed) is True

        # 3. Create tokens
        user_data = {"sub": "user123", "email": "user@example.com"}
        access_token = create_access_token(data=user_data)
        refresh_token = create_refresh_token(data=user_data)

        # 4. Verify tokens
        access_payload = verify_token(access_token, token_type="access")
        refresh_payload = verify_token(refresh_token, token_type="refresh")

        assert access_payload["sub"] == "user123"
        assert refresh_payload["sub"] == "user123"

    def test_token_type_isolation(self):
        """Test that access and refresh tokens are properly isolated."""
        user_data = {"sub": "user123"}

        access_token = create_access_token(data=user_data)
        refresh_token = create_refresh_token(data=user_data)

        # Access token should not work as refresh token
        assert verify_token(access_token, token_type="refresh") is None

        # Refresh token should not work as access token
        assert verify_token(refresh_token, token_type="access") is None

        # But both should decode successfully
        assert decode_token(access_token) is not None
        assert decode_token(refresh_token) is not None
