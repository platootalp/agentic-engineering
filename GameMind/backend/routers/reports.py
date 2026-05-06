import asyncio
import json
from datetime import datetime, timezone
from typing import Annotated, AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from db.database import get_db, get_raw_data_by_report, ExecutionLock
from db.models import Report, Execution
from middleware.auth import get_current_user

import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])

# SSE timeout settings
SSE_TIMEOUT = 600  # 10 minutes for report generation


# ─── Serialization ──────────────────────────────────────────────────────────────


def serialize_report(report: Report) -> dict:
    """Serialize a Report ORM object to dict."""
    return {
        "id": report.id,
        "title": report.title,
        "summary": report.summary or "",
        "full_content": report.full_content or "",
        "insights": json.loads(report.insights) if report.insights else [],
        "sources": json.loads(report.sources) if report.sources else [],
        "metrics": json.loads(report.metrics) if report.metrics else {},
        "execution_id": report.execution_id,
        "status": report.status,
        "version": report.version,
        "parent_id": report.parent_id,
        "iteration_depth": report.iteration_depth,
        "created_at": (
            report.created_at.isoformat().replace("+00:00", "Z")
            if report.created_at
            else None
        ),
    }


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.get("")
def list_reports(
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: str | None = Query(default=None, description="按状态筛选: draft/published/archived"),
    user: dict = Depends(get_current_user),
):
    """
    GET /api/v1/reports — 报告列表（支持分页 + 筛选）。
    """
    q = db.query(Report)
    if status:
        q = q.filter(Report.status == status)
    total = q.count()
    reports = (
        q.order_by(Report.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "items": [serialize_report(r) for r in reports],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size if total > 0 else 0,
    }


@router.get("/{report_id}", response_model=dict)
def get_report(
    report_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(get_current_user),
):
    """
    GET /api/v1/reports/{id} — 报告详情。
    """
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    return serialize_report(report)


@router.get("/{report_id}/raw-data")
def get_report_raw_data(
    report_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: dict = Depends(get_current_user),
):
    """GET /api/v1/reports/{id}/raw-data — 返回报告的原始搜索数据（user 权限）"""
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")

    raw_data_records = get_raw_data_by_report(db, report_id)

    return [
        {
            "id": rd.id,
            "category_slug": rd.category_slug,
            "source_type": rd.source_type,
            "query": rd.query,
            "raw_results": json.loads(rd.raw_results) if rd.raw_results else [],
            "created_at": (
                rd.created_at.isoformat().replace("+00:00", "Z")
                if rd.created_at
                else None
            ),
        }
        for rd in raw_data_records
    ]


# ─── SSE Streaming Generation ──────────────────────────────────────────────────


async def _stream_agent_events(
    trigger_type: str,
    execution_id: int | None,
    plan_input: dict | None,
) -> AsyncGenerator[dict, None]:
    """Get the agent engine and stream events from execute_stream()."""
    from services.agent.engine import AgentEngine

    agent = AgentEngine()
    async for event in agent.execute_stream(
        trigger_type=trigger_type,
        execution_id=execution_id,
        plan_input=plan_input,
    ):
        yield event


@router.post("/generate/stream")
async def trigger_report_generate_stream(
    request: Request,
    category_slugs: list[str] | None = Query(default=None),
    force_refresh: bool = Query(default=False),
    user: dict = Depends(get_current_user),
):
    """
    POST /api/v1/reports/generate/stream — SSE流式报告生成。

    触发Agent执行并通过SSE实时推送：
    - 步骤阶段切换 (stage)
    - 步骤日志 (step_log)
    - Claude LLM token流 (token)
    - 完成/错误 (done/error)
    """
    # Acquire lock or raise conflict
    acquired = await ExecutionLock.acquire(raise_on_busy=True)

    plan_input: dict = {
        "category_slugs": category_slugs or [],
        "force_refresh": force_refresh,
    }

    # Create execution record
    with next(get_db()) as db:
        execution = Execution(
            status="running",
            trigger_type="manual",
            plan_input=json.dumps(plan_input, ensure_ascii=False),
            started_at=datetime.now(timezone.utc),
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)
        execution_id = execution.id

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generator that yields SSE events with proper error handling."""
        try:
            # Send initial heartbeat to establish connection
            yield f"data: {json.dumps({'type': 'stage', 'stage': 'init', 'message': '正在初始化报告生成...'}, ensure_ascii=False)}\n\n"

            async for event in _stream_agent_events(
                trigger_type="manual",
                execution_id=execution_id,
                plan_input=plan_input,
            ):
                # Ensure proper SSE formatting
                event_str = json.dumps(event, ensure_ascii=False)
                yield f"data: {event_str}\n\n"

                # Update execution status after report step completes
                if event.get("type") == "done" and event.get("report_id"):
                    try:
                        with next(get_db()) as db:
                            from db.models import Execution
                            execution = db.get(Execution, execution_id)
                            if execution:
                                execution.status = "completed"
                                execution.report_id = int(event["report_id"])
                                execution.completed_at = datetime.now(timezone.utc)
                                db.commit()
                    except Exception as e:
                        logger.error(f"Failed to update execution status: {e}")

        except asyncio.TimeoutError:
            yield f"data: {json.dumps({'type': 'error', 'message': '报告生成超时，请稍后重试'}, ensure_ascii=False)}\n\n"
        except Exception as e:
            logger.error(f"SSE stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': f'生成过程出错: {str(e)}'}, ensure_ascii=False)}\n\n"
        finally:
            ExecutionLock.release()
            yield f"data: {json.dumps({'type': 'close', 'message': '连接已关闭'}, ensure_ascii=False)}\n\n"

    async def event_generator_with_timeout() -> AsyncGenerator[str, None]:
        """Wrapper that adds server-side timeout to event generator."""
        try:
            async with asyncio.timeout(SSE_TIMEOUT):
                async for event in event_generator():
                    yield event
        except asyncio.TimeoutError:
            logger.error("SSE stream timed out after %d seconds", SSE_TIMEOUT)
            yield f"data: {json.dumps({'type': 'error', 'message': '报告生成超时，请稍后重试'}, ensure_ascii=False)}\n\n"
        except Exception as e:
            logger.error("SSE generator error: %s", e)

    return StreamingResponse(
        event_generator_with_timeout(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
