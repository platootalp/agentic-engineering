import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from unittest.mock import patch, MagicMock, AsyncMock
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


# ─── Execution Status ─────────────────────────────────────────────────────────


def test_get_execution_status_404_when_no_scheduler(tmp_path):
    """Test GET /api/v1/executions/{id} returns 503 when scheduler not initialized."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_exec.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    client = TestClient(app)
    response = client.get("/api/v1/executions/1")

    # Scheduler not initialized → 503
    assert response.status_code == 503


def test_get_execution_status_with_mocked_scheduler(tmp_path):
    """Test GET /api/v1/executions/{id} returns execution data via scheduler."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_exec_mock.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    mock_scheduler = MagicMock()
    mock_scheduler.get_execution.return_value = {
        "id": 42,
        "status": "running",
        "current_step": "analyze",
        "progress": 0.6,
        "started_at": "2026-04-13T09:00:00Z",
        "estimated_completion": "2026-04-13T09:00:45Z",
        "report_id": None,
        "error_message": None,
    }

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.get("/api/v1/executions/42")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 42
    assert data["status"] == "running"
    assert data["current_step"] == "analyze"
    assert data["progress"] == 0.6


def test_get_execution_status_not_found(tmp_path):
    """Test GET /api/v1/executions/{id} returns 404 for unknown execution."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_exec_404.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    mock_scheduler = MagicMock()
    mock_scheduler.get_execution.return_value = None

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.get("/api/v1/executions/99999")

    assert response.status_code == 404


# ─── Report Generate ──────────────────────────────────────────────────────────


def test_trigger_generate_returns_execution_id(tmp_path):
    """Test POST /api/v1/reports/generate returns execution_id and poll_url."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_gen.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    mock_scheduler = MagicMock()
    # trigger_manual is async → use AsyncMock
    mock_scheduler.trigger_manual = AsyncMock(return_value=99)

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.post("/api/v1/reports/generate", json={})

    assert response.status_code == 200
    data = response.json()
    assert data["execution_id"] == 99
    assert data["status"] == "running"
    assert data["poll_url"] == "/api/v1/executions/99"


def test_trigger_generate_with_categories(tmp_path):
    """Test POST /api/v1/reports/generate accepts category_slugs."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_gen_cat.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    mock_scheduler = MagicMock()
    mock_scheduler.trigger_manual = AsyncMock(return_value=5)

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.post("/api/v1/reports/generate", json={
            "category_slugs": ["casual_puzzle", "hypercasual"],
            "force_refresh": True,
        })

    assert response.status_code == 200
    mock_scheduler.trigger_manual.assert_called_once_with(
        category_slugs=["casual_puzzle", "hypercasual"],
        force_refresh=True,
    )


def test_trigger_generate_conflict_when_running(tmp_path):
    """Test POST /api/v1/reports/generate returns 409 when another execution is running."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_gen_conf.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    mock_scheduler = MagicMock()
    mock_scheduler.trigger_manual = AsyncMock(
        side_effect=RuntimeError("Another execution is in progress")
    )

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.post("/api/v1/reports/generate", json={})

    assert response.status_code == 409


# ─── Report Regenerate ────────────────────────────────────────────────────────


def test_trigger_regenerate_returns_execution_id(tmp_path):
    """Test POST /api/v1/reports/{id}/regenerate returns execution_id."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_regen.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    mock_scheduler = MagicMock()
    mock_scheduler.trigger_iteration = AsyncMock(return_value=100)

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.post(
            "/api/v1/reports/5/regenerate",
            json={
                "feedback": "请补充更多数据支撑",
                "focus_areas": ["加强趋势证据"],
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["execution_id"] == 100
    assert data["parent_report_id"] == 5
    mock_scheduler.trigger_iteration.assert_called_once_with(
        report_id=5,
        feedback="请补充更多数据支撑",
        focus_areas=["加强趋势证据"],
    )


def test_trigger_regenerate_sanitizes_feedback(tmp_path):
    """Test POST /api/v1/reports/{id}/regenerate sanitizes prompt injection chars."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_regen_san.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    mock_scheduler = MagicMock()
    mock_scheduler.trigger_iteration = AsyncMock(return_value=7)

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.post(
            "/api/v1/reports/1/regenerate",
            json={"feedback": "请用 {{injected}} 方式处理"},
        )

    assert response.status_code == 200
    call_args = mock_scheduler.trigger_iteration.call_args
    # Verify injection chars are stripped
    assert "{{" not in call_args.kwargs["feedback"]
    assert "}}" not in call_args.kwargs["feedback"]


def test_trigger_regenerate_empty_feedback_rejected(tmp_path):
    """Test POST /api/v1/reports/{id}/regenerate rejects empty feedback."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_regen_empty.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    client = TestClient(app)
    response = client.post(
        "/api/v1/reports/1/regenerate",
        json={"feedback": ""},
    )

    assert response.status_code == 422  # Validation error


# ─── Execution List ───────────────────────────────────────────────────────────


def test_list_executions_returns_paginated_history(tmp_path):
    """Test GET /api/v1/executions returns paginated execution history."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_list_exec.db"

    from backend.main import app
    from db.database import get_engine, init_db
    from db.models import Execution
    from sqlalchemy.orm import Session
    from datetime import datetime, timezone

    engine = get_engine()
    init_db(engine)

    # Insert real Execution records so total count query works
    with Session(engine) as session:
        session.add(Execution(
            status="completed",
            trigger_type="manual",
            started_at=datetime(2026, 4, 13, 9, 0, 0, tzinfo=timezone.utc),
            completed_at=datetime(2026, 4, 13, 9, 0, 45, tzinfo=timezone.utc),
        ))
        session.add(Execution(
            status="running",
            trigger_type="manual",
            started_at=datetime(2026, 4, 13, 9, 5, 0, tzinfo=timezone.utc),
        ))
        session.commit()

    mock_scheduler = MagicMock()
    mock_scheduler.list_executions.return_value = [
        {
            "id": 1,
            "status": "completed",
            "trigger_type": "manual",
            "report_id": None,
            "started_at": "2026-04-13T09:00:00Z",
            "completed_at": "2026-04-13T09:00:45Z",
            "current_step": "completed",
            "progress": 1.0,
            "estimated_completion": None,
            "error_message": None,
        },
        {
            "id": 2,
            "status": "running",
            "trigger_type": "manual",
            "report_id": None,
            "started_at": "2026-04-13T09:05:00Z",
            "completed_at": None,
            "current_step": "analyze",
            "progress": 0.4,
            "estimated_completion": "2026-04-13T09:05:45Z",
            "error_message": None,
        },
    ]

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.get("/api/v1/executions")

    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] == 2
    assert data["limit"] == 20
    assert data["offset"] == 0
    assert data["items"][0]["id"] == 1
    assert data["items"][0]["status"] == "completed"
    assert data["items"][0]["trigger_type"] == "manual"


def test_list_executions_with_pagination(tmp_path):
    """Test GET /api/v1/executions respects limit and offset params."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_list_pag.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    mock_scheduler = MagicMock()
    mock_scheduler.list_executions.return_value = []

    with patch("routers.execute.get_scheduler", return_value=mock_scheduler):
        client = TestClient(app)
        response = client.get("/api/v1/executions?limit=5&offset=10")

    assert response.status_code == 200
    data = response.json()
    assert data["limit"] == 5
    assert data["offset"] == 10
    mock_scheduler.list_executions.assert_called_once_with(limit=5, offset=10)


def test_list_executions_503_when_no_scheduler(tmp_path):
    """Test GET /api/v1/executions returns 503 when scheduler not initialized."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_list_no_sched.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    with patch("routers.execute.get_scheduler", return_value=None):
        client = TestClient(app)
        response = client.get("/api/v1/executions")

    assert response.status_code == 503
