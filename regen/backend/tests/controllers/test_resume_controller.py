"""Integration tests for Resume controller."""

import pytest
from httpx import AsyncClient
from uuid import uuid4


class TestResumeList:
    """Tests for listing resumes endpoint."""

    async def test_list_resumes_success(self, authenticated_client: AsyncClient):
        """Test successful listing of resumes."""
        response = await authenticated_client.get("/api/v1/resumes")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "items" in data["data"]
        assert "pagination" in data["data"]

    async def test_list_resumes_unauthorized(self, client: AsyncClient):
        """Test listing resumes without authentication."""
        response = await client.get("/api/v1/resumes")
        assert response.status_code == 401

    async def test_list_resumes_with_pagination(
        self, authenticated_client: AsyncClient
    ):
        """Test listing resumes with pagination parameters."""
        response = await authenticated_client.get("/api/v1/resumes?page=1&page_size=10")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["pagination"]["page"] == 1
        assert data["data"]["pagination"]["page_size"] == 10

    async def test_list_resumes_with_status_filter(
        self, authenticated_client: AsyncClient
    ):
        """Test listing resumes with status filter."""
        response = await authenticated_client.get("/api/v1/resumes?status=draft")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    async def test_list_resumes_invalid_page(self, authenticated_client: AsyncClient):
        """Test listing resumes with invalid page number."""
        response = await authenticated_client.get("/api/v1/resumes?page=0")
        assert response.status_code == 422

    async def test_list_resumes_invalid_page_size(self, authenticated_client: AsyncClient):
        """Test listing resumes with invalid page size."""
        response = await authenticated_client.get("/api/v1/resumes?page_size=101")
        assert response.status_code == 422


class TestResumeCreate:
    """Tests for creating resumes endpoint."""

    async def test_create_resume_success(self, authenticated_client: AsyncClient):
        """Test successful resume creation."""
        response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "My Test Resume",
                "template_id": "modern",
                "content": {
                    "personal_info": {
                        "full_name": "Test User",
                        "email": "test@example.com",
                    },
                    "experiences": [],
                    "education": [],
                    "skills": [],
                },
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "resume" in data["data"]
        resume = data["data"]["resume"]
        assert resume["title"] == "My Test Resume"
        assert resume["template_id"] == "modern"
        assert resume["status"] == "draft"
        assert "id" in resume
        assert "user_id" in resume
        assert "created_at" in resume
        assert "updated_at" in resume

    async def test_create_resume_minimal_data(self, authenticated_client: AsyncClient):
        """Test resume creation with minimal required data."""
        response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Minimal Resume",
                "template_id": "classic",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume"]["title"] == "Minimal Resume"

    async def test_create_resume_with_jd_id(self, authenticated_client: AsyncClient):
        """Test resume creation with associated JD ID."""
        jd_id = str(uuid4())
        response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "JD-Linked Resume",
                "template_id": "modern",
                "jd_id": jd_id,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume"]["jd_id"] == jd_id

    async def test_create_resume_with_experience_ids(self, authenticated_client: AsyncClient):
        """Test resume creation with selected experience IDs."""
        exp_id1 = str(uuid4())
        exp_id2 = str(uuid4())
        response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Experience Resume",
                "template_id": "modern",
                "selected_experience_ids": [exp_id1, exp_id2],
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert exp_id1 in data["data"]["resume"]["selected_experience_ids"]
        assert exp_id2 in data["data"]["resume"]["selected_experience_ids"]

    async def test_create_resume_unauthorized(self, client: AsyncClient):
        """Test resume creation without authentication."""
        response = await client.post(
            "/api/v1/resumes",
            json={
                "title": "Test Resume",
                "template_id": "modern",
            },
        )
        assert response.status_code == 401

    async def test_create_resume_missing_title(self, authenticated_client: AsyncClient):
        """Test resume creation without title."""
        response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "template_id": "modern",
            },
        )
        assert response.status_code == 422

    async def test_create_resume_invalid_template(self, authenticated_client: AsyncClient):
        """Test resume creation with empty template_id."""
        response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Test Resume",
                "template_id": "",
            },
        )
        assert response.status_code == 422

    async def test_create_resume_title_too_long(self, authenticated_client: AsyncClient):
        """Test resume creation with title exceeding max length."""
        response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "x" * 201,
                "template_id": "modern",
            },
        )
        assert response.status_code == 422


class TestResumeGet:
    """Tests for getting a single resume endpoint."""

    async def test_get_resume_success(self, authenticated_client: AsyncClient):
        """Test successful retrieval of a resume."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Get Test Resume",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Get the resume
        response = await authenticated_client.get(f"/api/v1/resumes/{resume_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "resume" in data["data"]
        resume = data["data"]["resume"]
        assert resume["id"] == resume_id
        assert resume["title"] == "Get Test Resume"
        assert "view_count" in resume

    async def test_get_resume_increments_view_count(self, authenticated_client: AsyncClient):
        """Test that getting a resume increments view count."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "View Count Test",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Get the resume twice
        await authenticated_client.get(f"/api/v1/resumes/{resume_id}")
        response = await authenticated_client.get(f"/api/v1/resumes/{resume_id}")
        data = response.json()
        assert data["data"]["resume"]["view_count"] >= 2

    async def test_get_resume_not_found(self, authenticated_client: AsyncClient):
        """Test getting a non-existent resume."""
        response = await authenticated_client.get(
            "/api/v1/resumes/12345678-1234-1234-1234-123456789abc"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "RESUME_NOT_FOUND"

    async def test_get_resume_unauthorized(self, client: AsyncClient):
        """Test getting a resume without authentication."""
        response = await client.get("/api/v1/resumes/12345678-1234-1234-1234-123456789abc")
        assert response.status_code == 401

    async def test_get_resume_invalid_uuid(self, authenticated_client: AsyncClient):
        """Test getting a resume with invalid UUID format."""
        response = await authenticated_client.get("/api/v1/resumes/invalid-uuid")
        assert response.status_code == 422


class TestResumeUpdate:
    """Tests for updating resumes endpoint."""

    async def test_update_resume_success(self, authenticated_client: AsyncClient):
        """Test successful resume update."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Original Resume",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Update the resume
        response = await authenticated_client.put(
            f"/api/v1/resumes/{resume_id}",
            json={
                "title": "Updated Resume",
                "template_id": "classic",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume"]["title"] == "Updated Resume"
        assert data["data"]["resume"]["template_id"] == "classic"

    async def test_update_resume_not_found(self, authenticated_client: AsyncClient):
        """Test updating a non-existent resume."""
        response = await authenticated_client.put(
            "/api/v1/resumes/12345678-1234-1234-1234-123456789abc",
            json={"title": "Updated Resume"},
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "RESUME_NOT_FOUND"

    async def test_update_resume_unauthorized(self, client: AsyncClient):
        """Test updating a resume without authentication."""
        response = await client.put(
            "/api/v1/resumes/12345678-1234-1234-1234-123456789abc",
            json={"title": "Updated Resume"},
        )
        assert response.status_code == 401

    async def test_update_resume_partial(self, authenticated_client: AsyncClient):
        """Test partial update of a resume."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Partial Update Resume",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Update only the title
        response = await authenticated_client.put(
            f"/api/v1/resumes/{resume_id}",
            json={"title": "Only Title Updated"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["resume"]["title"] == "Only Title Updated"
        assert data["data"]["resume"]["template_id"] == "modern"

    async def test_update_resume_with_content(self, authenticated_client: AsyncClient):
        """Test updating resume with content."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Content Update Test",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Update with content
        response = await authenticated_client.put(
            f"/api/v1/resumes/{resume_id}",
            json={
                "content": {
                    "personal_info": {
                        "full_name": "Updated Name",
                        "email": "updated@example.com",
                    },
                    "summary": "Updated summary",
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume"]["content"]["personal_info"]["full_name"] == "Updated Name"

    async def test_update_resume_with_ai_suggestions(self, authenticated_client: AsyncClient):
        """Test updating resume with AI suggestions."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "AI Suggestions Test",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Update with AI suggestions
        response = await authenticated_client.put(
            f"/api/v1/resumes/{resume_id}",
            json={
                "ai_suggestions": {
                    "improvements": ["Add more details"],
                    "keywords": ["Python", "FastAPI"],
                },
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["resume"]["ai_suggestions"]["improvements"] == ["Add more details"]


class TestResumeDelete:
    """Tests for deleting resumes endpoint."""

    async def test_delete_resume_success(self, authenticated_client: AsyncClient):
        """Test successful resume deletion."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Delete Test Resume",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Delete the resume
        response = await authenticated_client.delete(f"/api/v1/resumes/{resume_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

        # Verify it's deleted
        get_response = await authenticated_client.get(f"/api/v1/resumes/{resume_id}")
        assert get_response.status_code == 404

    async def test_delete_resume_not_found(self, authenticated_client: AsyncClient):
        """Test deleting a non-existent resume."""
        response = await authenticated_client.delete(
            "/api/v1/resumes/12345678-1234-1234-1234-123456789abc"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "RESUME_NOT_FOUND"

    async def test_delete_resume_unauthorized(self, client: AsyncClient):
        """Test deleting a resume without authentication."""
        response = await client.delete("/api/v1/resumes/12345678-1234-1234-1234-123456789abc")
        assert response.status_code == 401


class TestResumeGenerate:
    """Tests for resume generation endpoint."""

    async def test_generate_resume_success(self, authenticated_client: AsyncClient):
        """Test successful resume generation."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Generate Test Resume",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Generate content
        response = await authenticated_client.post(f"/api/v1/resumes/{resume_id}/generate")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume_id"] == resume_id
        assert data["data"]["generation_status"] == "completed"
        assert "content" in data["data"]
        assert "suggestions" in data["data"]

    async def test_generate_resume_not_found(self, authenticated_client: AsyncClient):
        """Test generating content for a non-existent resume."""
        response = await authenticated_client.post(
            "/api/v1/resumes/12345678-1234-1234-1234-123456789abc/generate"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "RESUME_NOT_FOUND"

    async def test_generate_resume_unauthorized(self, client: AsyncClient):
        """Test generating content without authentication."""
        response = await client.post("/api/v1/resumes/12345678-1234-1234-1234-123456789abc/generate")
        assert response.status_code == 401


class TestResumeExportPDF:
    """Tests for resume PDF export endpoint."""

    async def test_export_resume_pdf_success(self, authenticated_client: AsyncClient):
        """Test successful PDF export."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Export Test Resume",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Export to PDF
        response = await authenticated_client.post(f"/api/v1/resumes/{resume_id}/export/pdf")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume_id"] == resume_id
        assert data["data"]["format"] == "pdf"
        assert "download_url" in data["data"]
        assert data["data"]["status"] == "ready"

    async def test_export_resume_pdf_not_found(self, authenticated_client: AsyncClient):
        """Test exporting a non-existent resume to PDF."""
        response = await authenticated_client.post(
            "/api/v1/resumes/12345678-1234-1234-1234-123456789abc/export/pdf"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "RESUME_NOT_FOUND"

    async def test_export_resume_pdf_unauthorized(self, client: AsyncClient):
        """Test exporting to PDF without authentication."""
        response = await client.post("/api/v1/resumes/12345678-1234-1234-1234-123456789abc/export/pdf")
        assert response.status_code == 401


class TestResumePublish:
    """Tests for resume publish endpoint."""

    async def test_publish_resume_success(self, authenticated_client: AsyncClient):
        """Test successful resume publishing."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Publish Test Resume",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Publish using POST (controller uses POST not PATCH)
        response = await authenticated_client.post(f"/api/v1/resumes/{resume_id}/publish")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume_id"] == resume_id
        assert data["data"]["status"] == "published"
        assert "published_at" in data["data"]

    async def test_publish_resume_not_found(self, authenticated_client: AsyncClient):
        """Test publishing a non-existent resume."""
        response = await authenticated_client.post(
            "/api/v1/resumes/12345678-1234-1234-1234-123456789abc/publish"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "RESUME_NOT_FOUND"

    async def test_publish_resume_unauthorized(self, client: AsyncClient):
        """Test publishing without authentication."""
        response = await client.post("/api/v1/resumes/12345678-1234-1234-1234-123456789abc/publish")
        assert response.status_code == 401


class TestResumeDownload:
    """Tests for resume download endpoint."""

    async def test_download_resume_pdf_success(self, authenticated_client: AsyncClient):
        """Test successful PDF download URL generation."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Download Test Resume",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Get download URL for PDF
        response = await authenticated_client.get(f"/api/v1/resumes/{resume_id}/download?format=pdf")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume_id"] == resume_id
        assert data["data"]["format"] == "pdf"
        assert "download_url" in data["data"]
        assert "filename" in data["data"]

    async def test_download_resume_word_success(self, authenticated_client: AsyncClient):
        """Test successful Word download URL generation."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Word Download Test",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Get download URL for Word
        response = await authenticated_client.get(f"/api/v1/resumes/{resume_id}/download?format=word")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["format"] == "word"
        assert data["data"]["filename"].endswith(".docx")

    async def test_download_resume_not_found(self, authenticated_client: AsyncClient):
        """Test downloading a non-existent resume."""
        response = await authenticated_client.get(
            "/api/v1/resumes/12345678-1234-1234-1234-123456789abc/download"
        )
        assert response.status_code == 404
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "RESUME_NOT_FOUND"

    async def test_download_resume_unauthorized(self, client: AsyncClient):
        """Test downloading without authentication."""
        response = await client.get("/api/v1/resumes/12345678-1234-1234-1234-123456789abc/download")
        assert response.status_code == 401

    async def test_download_resume_invalid_format(self, authenticated_client: AsyncClient):
        """Test downloading with invalid format."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Invalid Format Test",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Try invalid format
        response = await authenticated_client.get(
            f"/api/v1/resumes/{resume_id}/download?format=invalid"
        )
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "INVALID_FORMAT"

    async def test_download_resume_increments_count(self, authenticated_client: AsyncClient):
        """Test that downloading increments download count."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Download Count Test",
                "template_id": "modern",
            },
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Download twice
        await authenticated_client.get(f"/api/v1/resumes/{resume_id}/download?format=pdf")
        response = await authenticated_client.get(f"/api/v1/resumes/{resume_id}/download?format=pdf")
        data = response.json()
        assert data["data"]["download_count"] >= 2


class TestResumeController:
    """Comprehensive test resume API endpoints."""

    async def test_create_resume(self, authenticated_client: AsyncClient):
        """POST /api/v1/resumes - Create a new resume."""
        response = await authenticated_client.post(
            "/api/v1/resumes",
            json={
                "title": "Controller Test Resume",
                "template_id": "modern",
                "content": {"summary": "Test resume content"},
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "resume" in data["data"]
        assert data["data"]["resume"]["title"] == "Controller Test Resume"

    async def test_create_resume_unauthorized(self, client: AsyncClient):
        """Test 401 without auth."""
        response = await client.post(
            "/api/v1/resumes",
            json={"title": "Unauthorized Resume", "template_id": "modern"},
        )
        assert response.status_code == 401

    async def test_list_resumes(self, authenticated_client: AsyncClient):
        """GET /api/v1/resumes - List all resumes."""
        response = await authenticated_client.get("/api/v1/resumes")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "items" in data["data"]
        assert "pagination" in data["data"]

    async def test_get_resume_detail(self, authenticated_client: AsyncClient):
        """GET /api/v1/resumes/{id} - Get resume details."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={"title": "Detail Test Resume", "template_id": "modern"},
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Get the resume
        response = await authenticated_client.get(f"/api/v1/resumes/{resume_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume"]["id"] == resume_id

    async def test_update_resume(self, authenticated_client: AsyncClient):
        """PUT /api/v1/resumes/{id} - Update resume."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={"title": "Update Test Resume", "template_id": "modern"},
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Update the resume
        response = await authenticated_client.put(
            f"/api/v1/resumes/{resume_id}",
            json={"title": "Updated Resume Title"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["resume"]["title"] == "Updated Resume Title"

    async def test_delete_resume(self, authenticated_client: AsyncClient):
        """DELETE /api/v1/resumes/{id} - Delete resume."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={"title": "Delete Test Resume", "template_id": "modern"},
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Delete the resume
        response = await authenticated_client.delete(f"/api/v1/resumes/{resume_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    async def test_generate_resume(self, authenticated_client: AsyncClient):
        """POST /api/v1/resumes/{id}/generate - Generate resume content."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={"title": "Generate Test Resume", "template_id": "modern"},
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Generate content
        response = await authenticated_client.post(f"/api/v1/resumes/{resume_id}/generate")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["generation_status"] == "completed"
        assert "content" in data["data"]

    async def test_export_pdf(self, authenticated_client: AsyncClient):
        """POST /api/v1/resumes/{id}/export/pdf - Export to PDF."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={"title": "PDF Export Test Resume", "template_id": "modern"},
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Export to PDF
        response = await authenticated_client.post(f"/api/v1/resumes/{resume_id}/export/pdf")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["format"] == "pdf"
        assert "download_url" in data["data"]

    async def test_publish_resume(self, authenticated_client: AsyncClient):
        """POST /api/v1/resumes/{id}/publish - Publish resume."""
        # First create a resume
        create_response = await authenticated_client.post(
            "/api/v1/resumes",
            json={"title": "Publish Test Resume", "template_id": "modern"},
        )
        resume_id = create_response.json()["data"]["resume"]["id"]

        # Publish using POST (controller uses POST not PATCH)
        response = await authenticated_client.post(f"/api/v1/resumes/{resume_id}/publish")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["status"] == "published"
