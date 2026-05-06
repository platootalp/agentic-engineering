import asyncio
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

from db.models import Base

# ─── Sync engine (for migrations / init) ─────────────────────────────────────

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        db_url = os.getenv("DATABASE_URL", "sqlite:///./data/game_market.db")
        # Support both sqlite:// and sqlite+aiosqlite://
        if db_url.startswith("sqlite"):
            db_url_sync = db_url.replace("sqlite+aiosqlite://", "sqlite:///")
            _engine = create_engine(
                db_url_sync,
                connect_args={"check_same_thread": False},
            )
        else:
            _engine = create_engine(db_url)
    return _engine


# ─── Async engine ────────────────────────────────────────────────────────────

_async_engine = None
_async_session_factory = None


def get_async_engine():
    global _async_engine
    if _async_engine is None:
        db_url = os.getenv("DATABASE_URL", "sqlite:///./data/game_market.db")
        # Convert sqlite:// → sqlite+aiosqlite://
        if db_url.startswith("sqlite:///"):
            db_url_async = db_url.replace("sqlite:///", "sqlite+aiosqlite:///")
        elif db_url.startswith("sqlite://"):
            db_url_async = db_url.replace("sqlite://", "sqlite+aiosqlite://")
        else:
            db_url_async = db_url  # PostgreSQL / etc. use their own async drivers
        _async_engine = create_async_engine(db_url_async, echo=False)
    return _async_engine


def get_async_session_factory():
    global _async_session_factory
    if _async_session_factory is None:
        engine = get_async_engine()
        _async_session_factory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _async_session_factory


# ─── Init ────────────────────────────────────────────────────────────────────


def init_db(engine=None):
    """Create all tables and indexes synchronously."""
    if engine is None:
        engine = get_engine()

    # Enable WAL mode for better concurrent read performance
    if engine.dialect.name == "sqlite":
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.close()

    Base.metadata.create_all(bind=engine)
    seed_categories()


def seed_categories(force: bool = False):
    """Seed default categories if none exist."""
    engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        from db.models import Category
        existing = session.query(Category).count()
        if existing == 0 or force:
            default_categories = [
                Category(
                    name="休闲解谜",
                    slug="casual_puzzle",
                    keywords=json.dumps(["休闲游戏", "解谜游戏", "益智", "休闲益智"], ensure_ascii=False),
                    data_sources=json.dumps(["exa", "appstore"], ensure_ascii=False),
                    enabled=True,
                    priority=5,
                ),
                Category(
                    name="超休闲游戏",
                    slug="hypercasual",
                    keywords=json.dumps(["超休闲游戏", "休闲手游", "quick game"], ensure_ascii=False),
                    data_sources=json.dumps(["exa", "appstore", "google_play"], ensure_ascii=False),
                    enabled=True,
                    priority=4,
                ),
                Category(
                    name="跑酷闯关",
                    slug="running_obstacle",
                    keywords=json.dumps(["跑酷游戏", "闯关游戏", "障碍跑酷"], ensure_ascii=False),
                    data_sources=json.dumps(["exa", "appstore"], ensure_ascii=False),
                    enabled=True,
                    priority=3,
                ),
                Category(
                    name="音乐节奏",
                    slug="music_rhythm",
                    keywords=json.dumps(["音乐游戏", "节奏游戏", "音游"], ensure_ascii=False),
                    data_sources=json.dumps(["exa", "appstore", "google_play"], ensure_ascii=False),
                    enabled=True,
                    priority=3,
                ),
                Category(
                    name="模拟经营",
                    slug="simulation",
                    keywords=json.dumps(["模拟经营", "养成游戏", "放置游戏"], ensure_ascii=False),
                    data_sources=json.dumps(["exa", "appstore"], ensure_ascii=False),
                    enabled=True,
                    priority=4,
                ),
            ]
            session.add_all(default_categories)
            session.commit()
            logger = __import__("logging").getLogger("backend.db")
            logger.info(f"Seeded {len(default_categories)} default categories")
    except Exception as e:
        session.rollback()
        logger = __import__("logging").getLogger("backend.db")
        logger.warning(f"Failed to seed categories: {e}")
    finally:
        session.close()


async def init_db_async():
    """Create all tables asynchronously."""
    engine = get_async_engine()

    if engine.dialect.name == "sqlite":
        @event.listens_for(engine.sync_engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA synchronous=NORMAL")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.close()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ─── Session factories ───────────────────────────────────────────────────────


def get_db():
    """Sync session context manager (FastAPIDepends style)."""
    engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@asynccontextmanager
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Async session context manager."""
    factory = get_async_session_factory()
    session: AsyncSession = factory()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


# ─── ExecutionLock ───────────────────────────────────────────────────────────


class ExecutionLock:
    """Ensure only one Agent execution runs at a time (asyncio-based)."""

    _lock: asyncio.Lock | None = None

    @classmethod
    def get_lock(cls) -> asyncio.Lock:
        if cls._lock is None:
            cls._lock = asyncio.Lock()
        return cls._lock

    @classmethod
    async def acquire(cls, raise_on_busy: bool = True) -> bool:
        """
        Attempt to acquire the execution lock.

        Args:
            raise_on_busy: If True, raises RuntimeError when lock is held.
                           If False, returns False immediately.

        Returns:
            True when lock is acquired (only when raise_on_busy=False).

        Raises:
            RuntimeError: When lock is already held and raise_on_busy=True.
        """
        lock = cls.get_lock()
        if lock.locked():
            if raise_on_busy:
                raise RuntimeError("Another execution is already in progress")
            return False
        await lock.acquire()
        return True

    @classmethod
    def release(cls) -> None:
        """Release the execution lock. Idempotent — safe to call multiple times."""
        lock = cls.get_lock()
        if lock.locked():
            lock.release()

    @classmethod
    def is_locked(cls) -> bool:
        """Check if execution lock is currently held (sync, for status endpoints)."""
        lock = cls.get_lock()
        return lock.locked()


# ─── CRUD helpers ─────────────────────────────────────────────────────────────

import json
from datetime import datetime, timezone
from typing import Any

from db.models import Category, Execution, RawData, Report, ReportMetric


# ── Reports ────────────────────────────────────────────────────────────────────


def save_report(db: Session, data: dict[str, Any]) -> Report:
    """Insert or update a report. Accepts both string IDs (legacy) and int IDs."""
    report_id = data.get("id")
    if report_id is not None:
        # Legacy string ID — try to find by string id first
        existing = db.query(Report).filter_by(id=report_id).first()
        if existing:
            # Update
            for key in ("title", "summary", "full_content", "insights", "sources", "metrics", "status"):
                if key in data:
                    setattr(existing, key, data[key])
            return existing

    report = Report(
        id=report_id if isinstance(report_id, int) else None,
        title=data.get("title", ""),
        summary=data.get("summary"),
        full_content=data.get("full_content"),
        insights=json.dumps(data.get("insights", []), ensure_ascii=False) if "insights" in data else None,
        sources=json.dumps(data.get("sources", []), ensure_ascii=False) if "sources" in data else None,
        metrics=json.dumps(data.get("metrics", {}), ensure_ascii=False) if "metrics" in data else None,
        status=data.get("status", "draft"),
        execution_id=data.get("execution_id"),
        parent_id=data.get("parent_id"),
        iteration_depth=data.get("iteration_depth", 0),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_report_by_id(db: Session, report_id: int | str) -> Report | None:
    """Get a report by integer or string ID."""
    if isinstance(report_id, int):
        return db.query(Report).filter(Report.id == report_id).first()
    # Legacy string IDs
    try:
        return db.query(Report).filter(Report.id == int(report_id)).first()
    except (ValueError, TypeError):
        return None


def get_all_reports(db: Session, limit: int = 50, offset: int = 0) -> list[Report]:
    return db.query(Report).order_by(Report.created_at.desc()).offset(offset).limit(limit).all()


def get_latest_report(db: Session) -> Report | None:
    return db.query(Report).order_by(Report.created_at.desc()).first()


def get_reports_by_category(db: Session, category_slug: str, limit: int = 10) -> list[Report]:
    """Get latest reports that have raw data for a given category."""
    subq = (
        db.query(RawData.report_id)
        .filter(RawData.category_slug == category_slug)
        .distinct()
        .subquery()
    )
    return (
        db.query(Report)
        .filter(Report.id.in_(subq))
        .order_by(Report.created_at.desc())
        .limit(limit)
        .all()
    )


# ── Executions ─────────────────────────────────────────────────────────────────


def save_execution(db: Session, data: dict[str, Any]) -> Execution:
    """Insert or update an execution record."""
    exec_id = data.get("id")
    if exec_id is not None:
        existing = db.query(Execution).filter(Execution.id == exec_id).first()
        if existing:
            for key in ("status", "report_id", "plan_input", "step_results", "completed_at", "error_message"):
                if key in data and data[key] is not None:
                    if key in ("plan_input", "step_results"):
                        setattr(existing, key, json.dumps(data[key], ensure_ascii=False))
                    else:
                        setattr(existing, key, data[key])
            return existing

    execution = Execution(
        status=data.get("status", "running"),
        trigger_type=data.get("trigger_type", "manual"),
        plan_input=json.dumps(data["plan_input"], ensure_ascii=False) if "plan_input" in data else None,
        step_results=json.dumps(data["step_results"], ensure_ascii=False) if "step_results" in data else None,
        started_at=data.get("started_at", datetime.now(timezone.utc)),
        completed_at=data.get("completed_at"),
        error_message=data.get("error_message"),
        report_id=data.get("report_id"),
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    return execution


def update_execution(db: Session, exec_id: int, **kwargs) -> Execution | None:
    """Update specific fields on an execution."""
    execution = db.query(Execution).filter(Execution.id == exec_id).first()
    if not execution:
        return None
    for key, value in kwargs.items():
        if value is None:
            continue
        if key in ("plan_input", "step_results"):
            setattr(execution, key, json.dumps(value, ensure_ascii=False))
        elif key == "completed_at" and isinstance(value, datetime):
            execution.completed_at = value
        else:
            setattr(execution, key, value)
    db.commit()
    db.refresh(execution)
    return execution


def get_execution_by_id(db: Session, exec_id: int) -> Execution | None:
    return db.query(Execution).filter(Execution.id == exec_id).first()


def get_latest_execution(db: Session) -> Execution | None:
    return db.query(Execution).order_by(Execution.started_at.desc()).first()


# ── Categories ─────────────────────────────────────────────────────────────────


def get_enabled_categories(db: Session) -> list[Category]:
    return db.query(Category).filter(Category.enabled == True).order_by(Category.priority.desc()).all()


def get_all_categories(db: Session) -> list[Category]:
    return db.query(Category).order_by(Category.priority.desc()).all()


def get_category_by_slug(db: Session, slug: str) -> Category | None:
    return db.query(Category).filter(Category.slug == slug).first()


# ── RawData ────────────────────────────────────────────────────────────────────


def save_raw_data(db: Session, data: dict[str, Any]) -> RawData:
    raw = RawData(
        report_id=data.get("report_id"),
        category_slug=data.get("category_slug", ""),
        source_type=data.get("source_type", ""),
        query=data.get("query"),
        raw_results=json.dumps(data.get("raw_results", []), ensure_ascii=False),
    )
    db.add(raw)
    db.commit()
    db.refresh(raw)
    return raw


def get_raw_data_by_report(db: Session, report_id: int) -> list[RawData]:
    return db.query(RawData).filter(RawData.report_id == report_id).all()


# ── ReportMetrics ──────────────────────────────────────────────────────────────


def save_report_metric(db: Session, data: dict[str, Any]) -> ReportMetric:
    metric = ReportMetric(
        report_id=data["report_id"],
        category_slug=data["category_slug"],
        metric_type=data["metric_type"],
        value=data["value"],
        period=data["period"],
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


def get_metrics_by_report(db: Session, report_id: int) -> list[ReportMetric]:
    return db.query(ReportMetric).filter(ReportMetric.report_id == report_id).all()


def get_metrics_by_category_period(
    db: Session, category_slug: str, period: str, metric_type: str | None = None
) -> list[ReportMetric]:
    q = db.query(ReportMetric).filter(
        ReportMetric.category_slug == category_slug,
        ReportMetric.period == period,
    )
    if metric_type:
        q = q.filter(ReportMetric.metric_type == metric_type)
    return q.all()

