import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import pytest


@pytest.fixture(autouse=True)
def reset_db_engine():
    """Reset the database engine before each test."""
    import db.database as db_module
    db_module._engine = None
    yield
    db_module._engine = None


@pytest.fixture(autouse=True)
def mock_auth():
    """Mock JWT auth so tests don't need real tokens."""
    from backend.main import app
    from middleware.auth import get_current_user

    def override_get_current_user():
        return {"id": "test-user", "role": "user"}

    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.clear()


def test_health_check():
    """Test GET /api/health returns status ok."""
    from backend.main import app

    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ─── v1 Reports Endpoints ──────────────────────────────────────────────────────


def test_list_reports_v1_returns_list(tmp_path):
    """Test GET /api/v1/reports returns a paginated list."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_rpts.db"

    from backend.main import app
    from db.models import Report
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    from sqlalchemy.orm import Session
    with Session(engine) as session:
        report = Report(
            title="Test Report",
            summary="Test Summary",
        )
        session.add(report)
        session.commit()

    client = TestClient(app)
    response = client.get("/api/v1/reports")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Test Report"


def test_list_reports_v1_pagination(tmp_path):
    """Test GET /api/v1/reports pagination."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_rpts_pg.db"

    from backend.main import app
    from db.models import Report
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    from sqlalchemy.orm import Session
    with Session(engine) as session:
        for i in range(5):
            session.add(Report(title=f"Report {i}", summary=f"Summary {i}"))
        session.commit()

    client = TestClient(app)

    # First page
    resp = client.get("/api/v1/reports?page=1&page_size=2")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["page"] == 1

    # Second page
    resp2 = client.get("/api/v1/reports?page=2&page_size=2")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert len(data2["items"]) == 2


def test_list_reports_v1_status_filter(tmp_path):
    """Test GET /api/v1/reports filters by status."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_rpts_stat.db"

    from backend.main import app
    from db.models import Report
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    from sqlalchemy.orm import Session
    with Session(engine) as session:
        session.add(Report(title="Draft", summary="", status="draft"))
        session.add(Report(title="Published", summary="", status="published"))
        session.commit()

    client = TestClient(app)

    resp = client.get("/api/v1/reports?status=published")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == "published"


def test_get_report_v1_returns_report(tmp_path):
    """Test GET /api/v1/reports/{id} returns a report."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_rpts_get.db"

    from backend.main import app
    from db.models import Report
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    from sqlalchemy.orm import Session
    with Session(engine) as session:
        report = Report(
            title="Detail Report",
            summary="Detail Summary",
            insights='["insight1"]',
        )
        session.add(report)
        session.commit()
        report_id = report.id

    client = TestClient(app)
    response = client.get(f"/api/v1/reports/{report_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Detail Report"
    assert data["insights"] == ["insight1"]


def test_get_report_v1_returns_404(tmp_path):
    """Test GET /api/v1/reports/{id} returns 404 for non-existent report."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_rpts_404.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    client = TestClient(app)
    response = client.get("/api/v1/reports/99999")

    assert response.status_code == 404
