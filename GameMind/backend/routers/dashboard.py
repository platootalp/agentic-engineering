import json
from datetime import datetime, timezone, timedelta
from typing import Any

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import Category, Execution, Report, ReportMetric
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


# ─── KPI 计算 ──────────────────────────────────────────────────────────────────


def _compute_kpis(db) -> dict[str, Any]:
    # total_reports: COUNT(reports)
    total_reports = db.query(func.count(Report.id)).scalar() or 0

    # latest_report_date: MAX(created_at) FROM reports
    latest_report_date = (
        db.query(func.max(Report.created_at)).scalar()
    )

    # categories_tracked: COUNT(*) FROM categories (enabled categories)
    categories_tracked = db.query(func.count(Category.id)).filter(Category.enabled == True).scalar() or 0

    # avg_generation_time_seconds: AVG(completed_at - started_at)
    #   FROM executions WHERE status='completed'
    exec_row = (
        db.query(
            func.avg(
                func.julianday(Execution.completed_at)
                - func.julianday(Execution.started_at)
            )
            * 86400.0  # convert days to seconds
        )
        .filter(Execution.status == "completed")
        .filter(Execution.completed_at.isnot(None))
        .filter(Execution.started_at.isnot(None))
        .scalar()
    )
    avg_generation_time_seconds = round(exec_row) if exec_row else 0

    return {
        "total_reports": total_reports,
        "latest_report_date": (
            latest_report_date.isoformat()
            if latest_report_date
            else None
        ),
        "categories_tracked": categories_tracked,
        "avg_generation_time_seconds": avg_generation_time_seconds,
    }


# ─── 品类排名 ──────────────────────────────────────────────────────────────────


def _category_rankings(db) -> list[dict[str, Any]]:
    """
    从 report_metrics 中取每个 category_slug 的最新两条 heat_index 记录，
    计算 trend 百分比。同时包含所有启用的品类（无数据的显示0），
    按 heat_index 降序排列。
    """
    # 首先获取所有启用的品类
    all_categories = db.query(Category).filter(Category.enabled == True).all()
    category_map = {cat.slug: cat.name for cat in all_categories}

    # 获取 metrics 数据
    metrics = (
        db.query(
            ReportMetric.category_slug,
            ReportMetric.period,
            ReportMetric.value,
        )
        .filter(ReportMetric.metric_type == "heat_index")
        .order_by(ReportMetric.category_slug, desc(ReportMetric.period))
        .all()
    )

    from collections import defaultdict

    by_cat: dict[str, list] = defaultdict(list)
    for m in metrics:
        by_cat[m.category_slug].append(m)

    rankings = []
    seen_slugs = set()

    for slug, records in by_cat.items():
        seen_slugs.add(slug)
        if len(records) >= 1:
            current = records[0]
            if not current.value:
                continue
            if len(records) >= 2:
                prev = records[1]
                if prev.value and prev.value != 0:
                    change_pct = ((current.value - prev.value) / prev.value) * 100
                    trend = f"{'+' if change_pct >= 0 else ''}{change_pct:.0f}%"
                else:
                    trend = "0%"
            else:
                trend = "0%"

            rankings.append(
                {
                    "slug": slug,
                    "name": category_map.get(slug, slug),
                    "heat_index": round(current.value),
                    "trend": trend,
                }
            )

    # 添加没有 metrics 数据的启用品类
    for slug, name in category_map.items():
        if slug not in seen_slugs:
            rankings.append(
                {
                    "slug": slug,
                    "name": name,
                    "heat_index": 0,
                    "trend": "0%",
                }
            )

    # 按 heat_index 降序排列
    rankings.sort(key=lambda x: x["heat_index"], reverse=True)
    return rankings


# ─── 最新报告 ──────────────────────────────────────────────────────────────────


def _latest_report(db) -> dict[str, Any] | None:
    report = (
        db.query(Report)
        .order_by(desc(Report.created_at))
        .first()
    )
    if not report:
        return None
    return {
        "id": report.id,
        "title": report.title,
        "summary": report.summary or "",
        "created_at": (
            report.created_at.isoformat() if report.created_at else None
        ),
    }


# ─── 最近活动 ──────────────────────────────────────────────────────────────────


def _recent_activities(db) -> list[dict[str, Any]]:
    """
    从 executions 表中取最新 10 条 completed/failed 记录作为最近活动。
    """
    activities = []

    execs = (
        db.query(Execution)
        .filter(Execution.status.in_(["completed", "failed"]))
        .order_by(desc(Execution.completed_at))
        .limit(10)
        .all()
    )
    for e in execs:
        if e.status == "completed":
            msg = "报告生成完成"
        else:
            msg = f"执行失败: {e.error_message[:30] if e.error_message else '未知错误'}"
        activities.append(
            {
                "type": f"execution_{e.status}",
                "message": msg,
                "timestamp": (
                    e.completed_at.isoformat()
                    if e.completed_at
                    else None
                ),
            }
        )

    # 按时间排序
    activities.sort(key=lambda x: x.get("timestamp") or "", reverse=True)
    return activities[:10]


# ─── 端点 ─────────────────────────────────────────────────────────────────────


@router.get("/summary")
def get_dashboard_summary(
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(get_current_user),
):
    """
    仪表盘摘要：KPI + 品类排名 + 最新报告 + 最近活动。
    """
    kpis = _compute_kpis(db)
    rankings = _category_rankings(db)
    latest = _latest_report(db)
    activities = _recent_activities(db)

    return {
        "kpis": kpis,
        "category_rankings": rankings,
        "latest_report": latest,
        "recent_activities": activities,
    }


# ─── 趋势数据 ──────────────────────────────────────────────────────────────────


def _period_months(period: str) -> int:
    mapping = {"1m": 1, "3m": 3, "6m": 6, "1y": 12}
    return mapping.get(period, 3)


def _month_periods_list(months: int) -> list[str]:
    """
    生成最近 N 个月对应的 period 字符串列表，如 ["2026-01", "2026-02", ...]
    """
    now = datetime.now(timezone.utc)
    periods = []
    for i in range(months - 1, -1, -1):
        d = now - timedelta(days=i * 30)
        periods.append(d.strftime("%Y-%m"))
    return periods


def _heat_index_trend(
    db, category_slug: str, months: int
) -> list[dict[str, Any]]:
    """
    从 report_metrics 表获取 heat_index 趋势，
    按 period 聚合（同一 period 多条记录时取均值）。
    """
    periods = _month_periods_list(months)

    rows = (
        db.query(
            ReportMetric.period,
            func.avg(ReportMetric.value).label("avg_value"),
        )
        .filter(ReportMetric.category_slug == category_slug)
        .filter(ReportMetric.metric_type == "heat_index")
        .filter(ReportMetric.period.in_(periods))
        .group_by(ReportMetric.period)
        .order_by(ReportMetric.period)
        .all()
    )

    trend = []
    for r in rows:
        trend.append({"date": r.period, "value": round(r.avg_value)})

    return trend


def _top_games_from_reports(db, category_slug: str) -> list[dict[str, Any]]:
    """
    从 reports.metrics JSON 字段中提取 top_games 数据。
    格式: {"top_games": [{"name": "...", "downloads": "...", "change": "..."}]}
    """
    reports_with_metrics = (
        db.query(Report)
        .filter(Report.metrics.isnot(None))
        .order_by(desc(Report.created_at))
        .limit(20)
        .all()
    )

    games_map: dict[str, dict] = {}
    for report in reports_with_metrics:
        try:
            metrics = json.loads(report.metrics) if isinstance(report.metrics, str) else (report.metrics or {})
        except (json.JSONDecodeError, TypeError):
            metrics = {}
        if isinstance(metrics, dict):
            top_games = metrics.get("top_games", [])
            for game in top_games:
                if isinstance(game, dict) and "name" in game:
                    name = game["name"]
                    if name not in games_map:
                        games_map[name] = {
                            "name": name,
                            "downloads": str(game.get("downloads", "")),
                            "change": str(game.get("change", "0%")),
                        }

    return list(games_map.values())[:10]


@router.get("/trends")
def get_dashboard_trends(
    db: Annotated[Session, Depends(get_db)],
    period: str = Query(
        default="3m",
        description="时间范围: 1m, 3m, 6m, 1y",
    ),
    category: str = Query(
        default="casual_puzzle",
        description="品类 slug",
    ),
    user: dict = Depends(get_current_user),
):
    """
    趋势数据：heat_index 趋势 + top_games 列表。
    """
    if period not in ("1m", "3m", "6m", "1y"):
        period = "3m"

    months = _period_months(period)

    heat_index_trend = _heat_index_trend(db, category, months)
    top_games = _top_games_from_reports(db, category)

    return {
        "period": period,
        "category": category,
        "heat_index_trend": heat_index_trend,
        "top_games": top_games,
    }
