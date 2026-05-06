"""Integration tests for auth controller."""

import pytest
from httpx import AsyncClient


class TestAuthRegister:
    """Tests for user registration endpoint."""

    async def test_register_user_success(self, client: AsyncClient):
        """Test successful user registration."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "password123",
                "first_name": "New",
                "last_name": "User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "user" in data["data"]
        assert data["data"]["user"]["email"] == "newuser@example.com"
        assert data["data"]["user"]["first_name"] == "New"
        assert data["data"]["user"]["last_name"] == "User"
        assert data["data"]["user"]["full_name"] == "New User"
        assert "id" in data["data"]["user"]
        assert "tokens" in data["data"]
        assert "access_token" in data["data"]["tokens"]
        assert "refresh_token" in data["data"]["tokens"]
        assert "expires_in" in data["data"]["tokens"]

    async def test_register_user_minimal_data(self, client: AsyncClient):
        """Test registration with minimal required data."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "minimal@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["user"]["email"] == "minimal@example.com"

    async def test_register_user_duplicate_email(self, client: AsyncClient):
        """Test registration with duplicate email."""
        # First registration
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "password123",
            },
        )
        # Second registration with same email
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 409
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "EMAIL_EXISTS"

    async def test_register_user_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email format."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "password": "password123",
            },
        )
        assert response.status_code == 422

    async def test_register_user_short_password(self, client: AsyncClient):
        """Test registration with password too short."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "shortpass@example.com",
                "password": "short",
            },
        )
        assert response.status_code == 422

    async def test_register_user_missing_email(self, client: AsyncClient):
        """Test registration without email."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "password": "password123",
            },
        )
        assert response.status_code == 422

    async def test_register_user_missing_password(self, client: AsyncClient):
        """Test registration without password."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "nopass@example.com",
            },
        )
        assert response.status_code == 422


class TestAuthLogin:
    """Tests for user login endpoint."""

    async def test_login_user_success(self, client: AsyncClient):
        """Test successful user login."""
        # First register a user
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "logintest@example.com",
                "password": "password123",
            },
        )
        # Then login
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "logintest@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "user" in data["data"]
        assert data["data"]["user"]["email"] == "logintest@example.com"
        assert "tokens" in data["data"]
        assert "access_token" in data["data"]["tokens"]
        assert "refresh_token" in data["data"]["tokens"]

    async def test_login_user_invalid_password(self, client: AsyncClient):
        """Test login with invalid password."""
        # First register a user
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "wrongpass@example.com",
                "password": "password123",
            },
        )
        # Try login with wrong password
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "wrongpass@example.com",
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "INVALID_CREDENTIALS"

    async def test_login_user_nonexistent(self, client: AsyncClient):
        """Test login with non-existent user."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False

    async def test_login_user_invalid_email_format(self, client: AsyncClient):
        """Test login with invalid email format."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "invalid-email",
                "password": "password123",
            },
        )
        assert response.status_code == 422

    async def test_login_user_missing_fields(self, client: AsyncClient):
        """Test login with missing fields."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
            },
        )
        assert response.status_code == 422


class TestAuthRefresh:
    """Tests for token refresh endpoint."""

    async def test_refresh_token_success(self, client: AsyncClient):
        """Test successful token refresh."""
        # First register and get refresh token
        register_response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "refreshtest@example.com",
                "password": "password123",
            },
        )
        refresh_token = register_response.json()["data"]["tokens"]["refresh_token"]

        # Use refresh token to get new access token
        response = await client.post(
            "/api/v1/auth/refresh",
            json={
                "refresh_token": refresh_token,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "access_token" in data["data"]
        assert "expires_in" in data["data"]
        assert data["data"]["expires_in"] == 7200

    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Test refresh with invalid token."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={
                "refresh_token": "invalid-token",
            },
        )
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "INVALID_REFRESH_TOKEN"

    async def test_refresh_token_missing(self, client: AsyncClient):
        """Test refresh without token."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={},
        )
        assert response.status_code == 422


class TestAuthMe:
    """Tests for current user endpoint."""

    async def test_get_me_success(self, authenticated_client: AsyncClient):
        """Test getting current user info."""
        response = await authenticated_client.get("/api/v1/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "user" in data["data"]
        assert "id" in data["data"]["user"]
        assert "email" in data["data"]["user"]
        assert "full_name" in data["data"]["user"]
        assert "is_active" in data["data"]["user"]
        assert "is_verified" in data["data"]["user"]
        assert "created_at" in data["data"]["user"]

    async def test_get_me_unauthorized(self, client: AsyncClient):
        """Test getting current user without authentication."""
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

    async def test_get_me_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token."""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid-token"},
        )
        assert response.status_code == 401

    async def test_get_me_missing_token(self, client: AsyncClient):
        """Test getting current user with missing token."""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer "},
        )
        assert response.status_code == 401


class TestAuthValidation:
    """Tests for request validation."""

    async def test_register_extra_fields_ignored(self, client: AsyncClient):
        """Test that extra fields in registration are ignored."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "extrafields@example.com",
                "password": "password123",
                "extra_field": "should_be_ignored",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    async def test_login_extra_fields_ignored(self, client: AsyncClient):
        """Test that extra fields in login are ignored."""
        # First register
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "loginextra@example.com",
                "password": "password123",
            },
        )
        # Login with extra fields
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "loginextra@example.com",
                "password": "password123",
                "extra_field": "should_be_ignored",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
