import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ─── JSON helpers ────────────────────────────────────────────────────────────


def _json_loads(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, str):
        return json.loads(value)
    return value


def _json_dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)


# ─── Category ────────────────────────────────────────────────────────────────


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    keywords: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list
    data_sources: Mapped[str] = mapped_column(Text, nullable=False)  # JSON list
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        Index("idx_categories_slug", "slug"),
        Index("idx_categories_enabled", "enabled"),
    )

    # JSON accessors
    @property
    def keywords_list(self) -> list[str]:
        return _json_loads(self.keywords) or []

    @keywords_list.setter
    def keywords_list(self, value: list[str]) -> None:
        self.keywords = _json_dumps(value)

    @property
    def data_sources_list(self) -> list[str]:
        return _json_loads(self.data_sources) or []

    @data_sources_list.setter
    def data_sources_list(self, value: list[str]) -> None:
        self.data_sources = _json_dumps(value)


# ─── Report ───────────────────────────────────────────────────────────────────


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, default=None)
    full_content: Mapped[str | None] = mapped_column(Text, default=None)
    insights: Mapped[str | None] = mapped_column(Text, default=None)  # JSON array
    sources: Mapped[str | None] = mapped_column(Text, default=None)  # JSON array
    metrics: Mapped[str | None] = mapped_column(Text, default=None)  # JSON object
    execution_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("executions.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(Text, default="draft")
    version: Mapped[int] = mapped_column(Integer, default=1)
    parent_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("reports.id"), nullable=True
    )
    iteration_depth: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    execution: Mapped["Execution | None"] = relationship(
        "Execution",
        back_populates="report",
        foreign_keys="Report.execution_id",
        viewonly=True,
    )
    parent: Mapped["Report | None"] = relationship("Report", remote_side=[id], backref="iterations")
    raw_data: Mapped[list["RawData"]] = relationship("RawData", back_populates="report")
    metrics_records: Mapped[list["ReportMetric"]] = relationship("ReportMetric", back_populates="report")

    __table_args__ = (
        CheckConstraint("iteration_depth <= 3", name="ck_reports_iteration_depth"),
        Index("idx_reports_status", "status"),
        Index("idx_reports_created_at", created_at.desc()),
        Index("idx_reports_parent_id", "parent_id"),
        Index("idx_reports_execution_id", "execution_id"),
    )

    # JSON accessors
    @property
    def insights_list(self) -> list[Any]:
        return _json_loads(self.insights) or []

    @insights_list.setter
    def insights_list(self, value: list[Any]) -> None:
        self.insights = _json_dumps(value)

    @property
    def sources_list(self) -> list[Any]:
        return _json_loads(self.sources) or []

    @sources_list.setter
    def sources_list(self, value: list[Any]) -> None:
        self.sources = _json_dumps(value)

    @property
    def metrics_dict(self) -> dict[str, Any]:
        return _json_loads(self.metrics) or {}

    @metrics_dict.setter
    def metrics_dict(self, value: dict[str, Any]) -> None:
        self.metrics = _json_dumps(value)


# ─── RawData ─────────────────────────────────────────────────────────────────


class RawData(Base):
    __tablename__ = "raw_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("reports.id"), nullable=True
    )
    category_slug: Mapped[str] = mapped_column(Text, nullable=False)
    source_type: Mapped[str] = mapped_column(Text, nullable=False)  # exa / appstore / google_play
    query: Mapped[str | None] = mapped_column(Text, default=None)
    raw_results: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    report: Mapped["Report | None"] = relationship("Report", back_populates="raw_data")

    __table_args__ = (
        Index("idx_raw_data_report_id", "report_id"),
        Index("idx_raw_data_category_source", "category_slug", "source_type"),
    )

    @property
    def raw_results_list(self) -> list[Any]:
        return _json_loads(self.raw_results) or []

    @raw_results_list.setter
    def raw_results_list(self, value: list[Any]) -> None:
        self.raw_results = _json_dumps(value)


# ─── Execution ────────────────────────────────────────────────────────────────


class Execution(Base):
    __tablename__ = "executions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("reports.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(Text, nullable=False)  # idle / running / paused / completed / failed
    trigger_type: Mapped[str] = mapped_column(Text, nullable=False)  # scheduled / manual / iteration
    plan_input: Mapped[str | None] = mapped_column(Text, default=None)  # JSON
    step_results: Mapped[str | None] = mapped_column(Text, default=None)  # JSON
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    report: Mapped["Report | None"] = relationship(
        "Report",
        foreign_keys=[report_id],
        viewonly=True,
    )

    __table_args__ = (
        Index("idx_executions_report_id", "report_id"),
        Index("idx_executions_status", "status"),
        Index("idx_executions_started_at", started_at.desc()),
    )

    @property
    def plan_input_dict(self) -> dict[str, Any] | None:
        return _json_loads(self.plan_input)

    @plan_input_dict.setter
    def plan_input_dict(self, value: dict[str, Any] | None) -> None:
        self.plan_input = _json_dumps(value) if value is not None else None

    @property
    def step_results_dict(self) -> dict[str, Any] | None:
        return _json_loads(self.step_results)

    @step_results_dict.setter
    def step_results_dict(self, value: dict[str, Any] | None) -> None:
        self.step_results = _json_dumps(value) if value is not None else None


# ─── ReportMetric ─────────────────────────────────────────────────────────────


class ReportMetric(Base):
    __tablename__ = "report_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    report_id: Mapped[int] = mapped_column(Integer, ForeignKey("reports.id"), nullable=False)
    category_slug: Mapped[str] = mapped_column(Text, nullable=False)
    metric_type: Mapped[str] = mapped_column(Text, nullable=False)  # downloads / revenue / rating / heat_index
    value: Mapped[float] = mapped_column(Float, nullable=False)
    period: Mapped[str] = mapped_column(Text, nullable=False)  # e.g. "2026-04"
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    report: Mapped["Report"] = relationship("Report", back_populates="metrics_records")

    __table_args__ = (
        Index("idx_report_metrics_report_id", "report_id"),
        Index("idx_report_metrics_category_period", "category_slug", "period"),
        Index("idx_report_metrics_metric_type", "metric_type"),
    )
