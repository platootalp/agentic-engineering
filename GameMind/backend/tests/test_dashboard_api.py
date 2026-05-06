import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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


# ─── Dashboard /summary ───────────────────────────────────────────────────────


def test_dashboard_summary_returns_kpis(tmp_path):
    """Test GET /api/v1/dashboard/summary returns KPI data."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_dash.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    client = TestClient(app)
    response = client.get("/api/v1/dashboard/summary")

    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "category_rankings" in data
    assert "latest_report" in data
    assert "recent_activities" in data

    kpis = data["kpis"]
    assert "total_reports" in kpis
    assert "latest_report_date" in kpis
    assert "categories_tracked" in kpis
    assert "avg_generation_time_seconds" in kpis


def test_dashboard_summary_with_data(tmp_path):
    """Test GET /api/v1/dashboard/summary with reports and metrics."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_dash_data.db"

    from backend.main import app
    from db.models import Report, ReportMetric, Execution
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    from sqlalchemy.orm import Session
    from datetime import datetime, timezone

    with Session(engine) as session:
        # Add a report
        report = Report(title="Market Report 2026-04", summary="Summary text")
        session.add(report)
        session.commit()
        session.refresh(report)

        # Add metrics
        session.add(ReportMetric(
            report_id=report.id,
            category_slug="casual_puzzle",
            metric_type="heat_index",
            value=85.0,
            period="2026-04",
        ))
        session.add(ReportMetric(
            report_id=report.id,
            category_slug="casual_puzzle",
            metric_type="heat_index",
            value=73.0,
            period="2026-03",
        ))
        session.add(ReportMetric(
            report_id=report.id,
            category_slug="hypercasual",
            metric_type="heat_index",
            value=72.0,
            period="2026-04",
        ))

        # Add completed execution
        session.add(Execution(
            status="completed",
            trigger_type="manual",
            started_at=datetime(2026, 4, 13, 9, 0, 0, tzinfo=timezone.utc),
            completed_at=datetime(2026, 4, 13, 9, 0, 45, tzinfo=timezone.utc),
        ))
        session.commit()

    client = TestClient(app)
    response = client.get("/api/v1/dashboard/summary")

    assert response.status_code == 200
    data = response.json()

    # KPIs
    assert data["kpis"]["total_reports"] == 1
    assert data["kpis"]["categories_tracked"] == 2
    assert data["kpis"]["avg_generation_time_seconds"] == 45

    # Category rankings (sorted by heat_index DESC)
    rankings = data["category_rankings"]
    assert len(rankings) == 2
    assert rankings[0]["slug"] == "casual_puzzle"
    assert rankings[0]["heat_index"] == 85
    assert "+" in rankings[0]["trend"]  # positive trend

    # Latest report
    assert data["latest_report"]["title"] == "Market Report 2026-04"

    # Recent activities
    assert len(data["recent_activities"]) >= 1


# ─── Dashboard /trends ─────────────────────────────────────────────────────────


def test_dashboard_trends_default_params(tmp_path):
    """Test GET /api/v1/dashboard/trends with default params."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_trends.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    client = TestClient(app)
    response = client.get("/api/v1/dashboard/trends")

    assert response.status_code == 200
    data = response.json()
    assert data["period"] == "3m"
    assert data["category"] == "casual_puzzle"
    assert "heat_index_trend" in data
    assert "top_games" in data


def test_dashboard_trends_with_metrics(tmp_path):
    """Test GET /api/v1/dashboard/trends returns heat_index trend data."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_trends_data.db"

    from backend.main import app
    from db.models import Report, ReportMetric
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    from sqlalchemy.orm import Session
    from datetime import datetime, timezone

    with Session(engine) as session:
        report = Report(title="Trend Report", summary="")
        session.add(report)
        session.commit()
        session.refresh(report)

        for month in range(1, 4):
            session.add(ReportMetric(
                report_id=report.id,
                category_slug="casual_puzzle",
                metric_type="heat_index",
                value=70.0 + month * 5,
                period=f"2026-0{month}",
                created_at=datetime(2026, month, 1, tzinfo=timezone.utc),
            ))
        session.commit()

    client = TestClient(app)
    response = client.get("/api/v1/dashboard/trends?category=casual_puzzle&period=3m")

    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "casual_puzzle"
    assert data["period"] == "3m"
    trend = data["heat_index_trend"]
    assert len(trend) >= 1
    assert "date" in trend[0]
    assert "value" in trend[0]


def test_dashboard_trends_invalid_period(tmp_path):
    """Test GET /api/v1/dashboard/trends with invalid period falls back to 3m."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_trends_bad.db"

    from backend.main import app
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    client = TestClient(app)
    response = client.get("/api/v1/dashboard/trends?period=invalid")

    assert response.status_code == 200
    assert response.json()["period"] == "3m"


def test_dashboard_trends_top_games_from_metrics(tmp_path):
    """Test GET /api/v1/dashboard/trends extracts top_games from report metrics."""
    import db.database as db_module
    db_module._engine = None
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test_trends_games.db"

    from backend.main import app
    from db.models import Report
    from db.database import get_engine, init_db

    engine = get_engine()
    init_db(engine)

    from sqlalchemy.orm import Session
    import json

    with Session(engine) as session:
        session.add(Report(
            title="Games Report",
            summary="",
            metrics=json.dumps({
                "top_games": [
                    {"name": "Candy Crush", "downloads": "12M", "change": "+5%"},
                    {"name": "Royal Revolt", "downloads": "8M", "change": "-2%"},
                ]
            }),
        ))
        session.commit()

    client = TestClient(app)
    response = client.get("/api/v1/dashboard/trends")

    assert response.status_code == 200
    data = response.json()
    top_games = data["top_games"]
    assert len(top_games) == 2
    assert any(g["name"] == "Candy Crush" for g in top_games)
    assert any(g["downloads"] == "12M" for g in top_games)
