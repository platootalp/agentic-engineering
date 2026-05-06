"""Integration tests for JD (Job Description) controller."""

import pytest
from httpx import AsyncClient


class TestJDList:
    """Tests for listing jobs endpoint."""

    async def test_list_jobs_success(self, authenticated_client: AsyncClient):
        """Test successful listing of jobs."""
        response = await authenticated_client.get("/api/v1/jobs")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "items" in data["data"]
        assert "pagination" in data["data"]

    async def test_list_jobs_unauthorized(self, client: AsyncClient):
        """Test listing jobs without authentication."""
        response = await client.get("/api/v1/jobs")
        assert response.status_code == 401

    async def test_list_jobs_with_pagination(self, authenticated_client: AsyncClient):
        """Test listing jobs with pagination parameters."""
        response = await authenticated_client.get("/api/v1/jobs?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["pagination"]["page"] == 1
        assert data["data"]["pagination"]["page_size"] == 10

    async def test_list_jobs_with_search(self, authenticated_client: AsyncClient):
        """Test listing jobs with search parameter."""
        response = await authenticated_client.get("/api/v1/jobs?search=engineer")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    async def test_list_jobs_invalid_page(self, authenticated_client: AsyncClient):
        """Test listing jobs with invalid page number."""
        response = await authenticated_client.get("/api/v1/jobs?page=0")
        assert response.status_code == 422


class TestJDCreate:
    """Tests for creating jobs endpoint."""

    async def test_create_job_success(self, authenticated_client: AsyncClient):
        """Test successful job creation."""
        response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "company_name": "Test Company",
                "position_title": "Software Engineer",
                "raw_content": "Looking for an experienced Python developer",
                "location": "Beijing",
                "salary_min": 30000,
                "salary_max": 50000,
                "source": "manual",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "job" in data["data"]
        job = data["data"]["job"]
        assert job["company_name"] == "Test Company"
        assert job["position_title"] == "Software Engineer"
        assert job["is_analyzed"] is False
        assert "id" in job

    async def test_create_job_minimal_data(self, authenticated_client: AsyncClient):
        """Test job creation with minimal required data."""
        response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "company_name": "Minimal Company",
                "position_title": "Developer",
                "raw_content": "Job description here",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    async def test_create_job_unauthorized(self, client: AsyncClient):
        """Test job creation without authentication."""
        response = await client.post(
            "/api/v1/jobs",
            json={
                "company_name": "Test Company",
                "position_title": "Software Engineer",
                "raw_content": "Job description",
            },
        )
        assert response.status_code == 401

    async def test_create_job_missing_company_name(self, authenticated_client: AsyncClient):
        """Test job creation without company name."""
        response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "position_title": "Software Engineer",
                "raw_content": "Job description",
            },
        )
        assert response.status_code == 422


class TestJDGet:
    """Tests for getting a single job endpoint."""

    async def test_get_job_success(self, authenticated_client: AsyncClient):
        """Test successful retrieval of a job."""
        # First create a job
        create_response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "company_name": "Get Test Company",
                "position_title": "Senior Engineer",
                "raw_content": "Detailed job description",
            },
        )
        job_id = create_response.json()["data"]["job"]["id"]

        # Get the job
        response = await authenticated_client.get(f"/api/v1/jobs/{job_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "job" in data["data"]
        job = data["data"]["job"]
        assert job["id"] == job_id
        assert "analysis" in job

    async def test_get_job_not_found(self, authenticated_client: AsyncClient):
        """Test getting a non-existent job."""
        response = await authenticated_client.get(
            "/api/v1/jobs/12345678-1234-1234-1234-123456789abc"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "JOB_NOT_FOUND"

    async def test_get_job_unauthorized(self, client: AsyncClient):
        """Test getting a job without authentication."""
        response = await client.get("/api/v1/jobs/12345678-1234-1234-1234-123456789abc")
        assert response.status_code == 401


class TestJDUpdate:
    """Tests for updating jobs endpoint."""

    async def test_update_job_success(self, authenticated_client: AsyncClient):
        """Test successful job update."""
        # First create a job
        create_response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "company_name": "Original Company",
                "position_title": "Original Title",
                "raw_content": "Original description",
            },
        )
        job_id = create_response.json()["data"]["job"]["id"]

        # Update the job
        response = await authenticated_client.put(
            f"/api/v1/jobs/{job_id}",
            json={
                "company_name": "Updated Company",
                "position_title": "Updated Title",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["job"]["company_name"] == "Updated Company"

    async def test_update_job_not_found(self, authenticated_client: AsyncClient):
        """Test updating a non-existent job."""
        response = await authenticated_client.put(
            "/api/v1/jobs/12345678-1234-1234-1234-123456789abc",
            json={"company_name": "Updated Company"},
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "JOB_NOT_FOUND"

    async def test_update_job_unauthorized(self, client: AsyncClient):
        """Test updating a job without authentication."""
        response = await client.put(
            "/api/v1/jobs/12345678-1234-1234-1234-123456789abc",
            json={"company_name": "Updated Company"},
        )
        assert response.status_code == 401


class TestJDDelete:
    """Tests for deleting jobs endpoint."""

    async def test_delete_job_success(self, authenticated_client: AsyncClient):
        """Test successful job deletion."""
        # First create a job
        create_response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "company_name": "Delete Test Company",
                "position_title": "Developer",
                "raw_content": "Description",
            },
        )
        job_id = create_response.json()["data"]["job"]["id"]

        # Delete the job
        response = await authenticated_client.delete(f"/api/v1/jobs/{job_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # Verify job is deleted
        get_response = await authenticated_client.get(f"/api/v1/jobs/{job_id}")
        assert get_response.status_code == 404

    async def test_delete_job_not_found(self, authenticated_client: AsyncClient):
        """Test deleting a non-existent job."""
        response = await authenticated_client.delete(
            "/api/v1/jobs/12345678-1234-1234-1234-123456789abc"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "JOB_NOT_FOUND"

    async def test_delete_job_unauthorized(self, client: AsyncClient):
        """Test deleting a job without authentication."""
        response = await client.delete("/api/v1/jobs/12345678-1234-1234-1234-123456789abc")
        assert response.status_code == 401


class TestJDAnalyze:
    """Tests for job analysis endpoint."""

    async def test_analyze_job_success(self, authenticated_client: AsyncClient):
        """Test successful job analysis."""
        # First create a job
        create_response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "company_name": "Analyze Test Company",
                "position_title": "AI Engineer",
                "raw_content": "Looking for AI/ML engineer with Python experience",
            },
        )
        job_id = create_response.json()["data"]["job"]["id"]

        # Analyze the job
        response = await authenticated_client.post(f"/api/v1/jobs/{job_id}/analyze")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["job_id"] == job_id
        assert data["data"]["analysis_status"] == "completed"

    async def test_analyze_job_not_found(self, authenticated_client: AsyncClient):
        """Test analyzing a non-existent job."""
        response = await authenticated_client.post(
            "/api/v1/jobs/12345678-1234-1234-1234-123456789abc/analyze"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "JOB_NOT_FOUND"

    async def test_analyze_job_unauthorized(self, client: AsyncClient):
        """Test analyzing a job without authentication."""
        response = await client.post("/api/v1/jobs/12345678-1234-1234-1234-123456789abc/analyze")
        assert response.status_code == 401


class TestJDAnalysisResult:
    """Tests for getting job analysis result endpoint."""

    async def test_get_analysis_not_analyzed(self, authenticated_client: AsyncClient):
        """Test getting analysis for non-analyzed job."""
        # First create a job
        create_response = await authenticated_client.post(
            "/api/v1/jobs",
            json={
                "company_name": "Analysis Test Company",
                "position_title": "Developer",
                "raw_content": "Description",
            },
        )
        job_id = create_response.json()["data"]["job"]["id"]

        # Get analysis (should return not analyzed)
        response = await authenticated_client.get(f"/api/v1/jobs/{job_id}/analysis")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["is_analyzed"] is False

    async def test_get_analysis_result_not_found(self, authenticated_client: AsyncClient):
        """Test getting analysis for non-existent job."""
        response = await authenticated_client.get(
            "/api/v1/jobs/12345678-1234-1234-1234-123456789abc/analysis"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "JOB_NOT_FOUND"

    async def test_get_analysis_result_unauthorized(self, client: AsyncClient):
        """Test getting analysis without authentication."""
        response = await client.get(
            "/api/v1/jobs/12345678-1234-1234-1234-123456789abc/analysis"
        )
        assert response.status_code == 401
