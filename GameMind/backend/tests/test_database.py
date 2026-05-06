import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import get_engine, init_db
from db.models import Report


def test_init_db_creates_tables(tmp_path):
    """测试建表成功"""
    import db.database as db_module
    db_module._engine = None  # reset cached engine
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test.db"
    engine = get_engine()
    init_db(engine)
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    assert "reports" in tables


def test_report_crud(tmp_path):
    """测试 Report CRUD 操作"""
    import db.database as db_module
    db_module._engine = None  # reset cached engine
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_path}/test.db"
    engine = get_engine()
    init_db(engine)

    from sqlalchemy.orm import Session
    with Session(engine) as session:
        # Create - Note: id is auto-increment, raw_results goes in RawData table
        report = Report(
            title="测试报告",
            summary="这是测试摘要",
            insights='["洞察1", "洞察2"]',
            sources='["source1"]',
            metrics=None,
        )
        session.add(report)
        session.commit()
        session.refresh(report)

        # Read
        result = session.get(Report, report.id)
        assert result.title == "测试报告"
        assert result.summary == "这是测试摘要"

        # Delete
        session.delete(result)
        session.commit()
        assert session.get(Report, report.id) is None
