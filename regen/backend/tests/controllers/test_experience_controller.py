"""Integration tests for Experience controller."""

import pytest
from httpx import AsyncClient


class TestExperienceList:
    """Tests for listing experiences endpoint."""

    async def test_list_experiences_success(self, authenticated_client: AsyncClient):
        """Test successful listing of experiences."""
        response = await authenticated_client.get("/api/v1/experiences")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "items" in data["data"]
        assert "pagination" in data["data"]

    async def test_list_experiences_unauthorized(self, client: AsyncClient):
        """Test listing experiences without authentication."""
        response = await client.get("/api/v1/experiences")
        assert response.status_code == 401

    async def test_list_experiences_with_type_filter(self, authenticated_client: AsyncClient):
        """Test listing experiences with type filter."""
        response = await authenticated_client.get("/api/v1/experiences?type=work")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    async def test_list_experiences_with_pagination(self, authenticated_client: AsyncClient):
        """Test listing experiences with pagination."""
        response = await authenticated_client.get("/api/v1/experiences?page=1&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["pagination"]["page"] == 1
        assert data["data"]["pagination"]["page_size"] == 5

    async def test_list_experiences_invalid_type(self, authenticated_client: AsyncClient):
        """Test listing experiences with invalid type filter."""
        response = await authenticated_client.get("/api/v1/experiences?type=invalid")
        assert response.status_code == 422


class TestExperienceCreate:
    """Tests for creating experiences endpoint."""

    async def test_create_experience_success(self, authenticated_client: AsyncClient):
        """Test successful experience creation."""
        response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "work",
                "title": "Software Engineer",
                "organization": "Tech Corp",
                "location": "Beijing",
                "start_date": "2020-01-01",
                "end_date": "2023-12-31",
                "is_current": False,
                "description": "Developed scalable web applications",
                "skills": ["Python", "Django", "AWS"],
                "achievements": ["Led team of 5 developers"],
                "order_index": 0,
                "is_highlighted": True,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "experience" in data["data"]
        exp = data["data"]["experience"]
        assert exp["type"] == "work"
        assert exp["title"] == "Software Engineer"
        assert exp["organization"] == "Tech Corp"
        assert "id" in exp
        assert "user_id" in exp

    async def test_create_experience_minimal_data(self, authenticated_client: AsyncClient):
        """Test experience creation with minimal required data."""
        response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "education",
                "title": "Bachelor of Science",
                "start_date": "2016-09-01",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    async def test_create_experience_unauthorized(self, client: AsyncClient):
        """Test experience creation without authentication."""
        response = await client.post(
            "/api/v1/experiences",
            json={
                "type": "work",
                "title": "Developer",
                "start_date": "2020-01-01",
            },
        )
        assert response.status_code == 401

    async def test_create_experience_missing_type(self, authenticated_client: AsyncClient):
        """Test experience creation without type."""
        response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "title": "Developer",
                "start_date": "2020-01-01",
            },
        )
        assert response.status_code == 422

    async def test_create_experience_invalid_type(self, authenticated_client: AsyncClient):
        """Test experience creation with invalid type."""
        response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "invalid_type",
                "title": "Developer",
                "start_date": "2020-01-01",
            },
        )
        assert response.status_code == 422

    async def test_create_experience_missing_title(self, authenticated_client: AsyncClient):
        """Test experience creation without title."""
        response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "type": "work",
                "start_date": "2020-01-01",
            },
        )
        assert response.status_code == 422

    async def test_create_experience_missing_start_date(self, authenticated_client: AsyncClient):
        """Test experience creation without start date."""
        response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "work",
                "title": "Developer",
            },
        )
        assert response.status_code == 422

    async def test_create_experience_project_type(self, authenticated_client: AsyncClient):
        """Test creating a project type experience."""
        response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "project",
                "title": "Open Source Project",
                "start_date": "2022-01-01",
                "end_date": "2022-06-30",
                "description": "Contributed to open source",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["experience"]["type"] == "project"


class TestExperienceGet:
    """Tests for getting a single experience endpoint."""

    async def test_get_experience_success(self, authenticated_client: AsyncClient):
        """Test successful retrieval of an experience."""
        # First create an experience
        create_response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "work",
                "title": "Senior Developer",
                "organization": "Tech Inc",
                "start_date": "2021-01-01",
            },
        )
        exp_id = create_response.json()["data"]["experience"]["id"]

        # Get the experience
        response = await authenticated_client.get(f"/api/v1/experiences/{exp_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "experience" in data["data"]
        assert data["data"]["experience"]["id"] == exp_id

    async def test_get_experience_not_found(self, authenticated_client: AsyncClient):
        """Test getting a non-existent experience."""
        response = await authenticated_client.get(
            "/api/v1/experiences/12345678-1234-1234-1234-123456789abc"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "EXPERIENCE_NOT_FOUND"

    async def test_get_experience_unauthorized(self, client: AsyncClient):
        """Test getting an experience without authentication."""
        response = await client.get(
            "/api/v1/experiences/12345678-1234-1234-1234-123456789abc"
        )
        assert response.status_code == 401


class TestExperienceUpdate:
    """Tests for updating experiences endpoint."""

    async def test_update_experience_success(self, authenticated_client: AsyncClient):
        """Test successful experience update."""
        # First create an experience
        create_response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "work",
                "title": "Original Title",
                "organization": "Original Company",
                "start_date": "2020-01-01",
            },
        )
        exp_id = create_response.json()["data"]["experience"]["id"]

        # Update the experience
        response = await authenticated_client.put(
            f"/api/v1/experiences/{exp_id}",
            json={
                "title": "Updated Title",
                "organization": "Updated Company",
                "description": "Updated description",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["experience"]["title"] == "Updated Title"
        assert data["data"]["experience"]["organization"] == "Updated Company"

    async def test_update_experience_not_found(self, authenticated_client: AsyncClient):
        """Test updating a non-existent experience."""
        response = await authenticated_client.put(
            "/api/v1/experiences/12345678-1234-1234-1234-123456789abc",
            json={"title": "Updated Title"},
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "EXPERIENCE_NOT_FOUND"

    async def test_update_experience_unauthorized(self, client: AsyncClient):
        """Test updating an experience without authentication."""
        response = await client.put(
            "/api/v1/experiences/12345678-1234-1234-1234-123456789abc",
            json={"title": "Updated Title"},
        )
        assert response.status_code == 401

    async def test_update_experience_partial(self, authenticated_client: AsyncClient):
        """Test partial update of an experience."""
        # First create an experience
        create_response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "work",
                "title": "Developer",
                "organization": "Company",
                "start_date": "2020-01-01",
            },
        )
        exp_id = create_response.json()["data"]["experience"]["id"]

        # Update only one field
        response = await authenticated_client.put(
            f"/api/v1/experiences/{exp_id}",
            json={"location": "Shanghai"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["experience"]["location"] == "Shanghai"
        assert data["data"]["experience"]["title"] == "Developer"


class TestExperienceDelete:
    """Tests for deleting experiences endpoint."""

    async def test_delete_experience_success(self, authenticated_client: AsyncClient):
        """Test successful experience deletion."""
        # First create an experience
        create_response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "work",
                "title": "To Delete",
                "start_date": "2020-01-01",
            },
        )
        exp_id = create_response.json()["data"]["experience"]["id"]

        # Delete the experience
        response = await authenticated_client.delete(f"/api/v1/experiences/{exp_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Experience deleted successfully"

        # Verify experience is deleted
        get_response = await authenticated_client.get(f"/api/v1/experiences/{exp_id}")
        assert get_response.status_code == 404

    async def test_delete_experience_not_found(self, authenticated_client: AsyncClient):
        """Test deleting a non-existent experience."""
        response = await authenticated_client.delete(
            "/api/v1/experiences/12345678-1234-1234-1234-123456789abc"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "EXPERIENCE_NOT_FOUND"

    async def test_delete_experience_unauthorized(self, client: AsyncClient):
        """Test deleting an experience without authentication."""
        response = await client.delete(
            "/api/v1/experiences/12345678-1234-1234-1234-123456789abc"
        )
        assert response.status_code == 401


class TestExperienceOptimize:
    """Tests for experience optimization endpoint."""

    async def test_optimize_experience_success(self, authenticated_client: AsyncClient):
        """Test successful experience optimization."""
        # First create an experience
        create_response = await authenticated_client.post(
            "/api/v1/experiences",
            json={
                "type": "work",
                "title": "Developer",
                "organization": "Tech Corp",
                "start_date": "2020-01-01",
                "description": "Developed web applications",
            },
        )
        exp_id = create_response.json()["data"]["experience"]["id"]

        # Optimize the experience
        response = await authenticated_client.post(f"/api/v1/experiences/{exp_id}/optimize")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["experience_id"] == exp_id
        assert data["data"]["optimization_status"] == "completed"
        assert "description_ai" in data["data"]

    async def test_optimize_experience_not_found(self, authenticated_client: AsyncClient):
        """Test optimizing a non-existent experience."""
        response = await authenticated_client.post(
            "/api/v1/experiences/12345678-1234-1234-1234-123456789abc/optimize"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "EXPERIENCE_NOT_FOUND"

    async def test_optimize_experience_unauthorized(self, client: AsyncClient):
        """Test optimizing an experience without authentication."""
        response = await client.post(
            "/api/v1/experiences/12345678-1234-1234-1234-123456789abc/optimize"
        )
        assert response.status_code == 401
