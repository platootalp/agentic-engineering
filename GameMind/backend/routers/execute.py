"""
Execute router — execution status query and report generation trigger.
"""
import asyncio
import json
from datetime import datetime, timezone
from typing import Annotated, AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from middleware.auth import get_current_user
from middleware.rate_limit import limiter
from services.scheduler import SchedulerService, get_scheduler
from db.database import get_db
from db.models import Execution

router = APIRouter(prefix="/api/v1", tags=["execution"])


# ─── Schemas ──────────────────────────────────────────────────────────────────


class ExecutionStatusResponse(BaseModel):
    """Response for GET /api/v1/executions/{id}."""
    id: int
    status: str
    current_step: str
    progress: float
    started_at: str | None
    estimated_completion: str | None
    report_id: int | None
    error_message: str | None
    trigger_type: str | None = None
    completed_at: str | None = None


class ExecutionListResponse(BaseModel):
    items: list[ExecutionStatusResponse]
    total: int
    limit: int
    offset: int


class GenerateRequest(BaseModel):
    """Request body for POST /api/v1/reports/generate."""
    category_slugs: list[str] | None = Field(
        default=None,
        description="可选，指定要分析的品类 slug 列表；None 表示所有启用品类",
    )
    force_refresh: bool = Field(
        default=False,
        description="是否强制重新采集，即使有缓存",
    )


class GenerateResponse(BaseModel):
    execution_id: int
    status: str
    message: str
    poll_url: str


class RegenerateRequest(BaseModel):
    """Request body for POST /api/v1/reports/{id}/regenerate."""
    feedback: str = Field(..., min_length=1, max_length=5000)
    focus_areas: list[str] = Field(default_factory=list, max_length=10)

    @field_validator("feedback")
    @classmethod
    def sanitize_feedback(cls, v: str) -> str:
        """Strip prompt-injection risk characters."""
        v = v.replace("{{", "").replace("}}", "")
        return v.strip()


class RegenerateResponse(BaseModel):
    execution_id: int
    status: str
    parent_report_id: int
    message: str
    poll_url: str


# ─── Helpers ──────────────────────────────────────────────────────────────────


def _get_scheduler_or_404() -> SchedulerService:
    scheduler = get_scheduler()
    if scheduler is None:
        raise HTTPException(
            status_code=503,
            detail="Scheduler not available. The application may not be fully initialized.",
        )
    return scheduler


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.get("/executions/{execution_id}", response_model=ExecutionStatusResponse)
def get_execution_status(
    execution_id: int,
    user: dict = Depends(get_current_user),
):
    """
    GET /api/v1/executions/{id} — 查询执行状态。

    返回当前执行的状态、当前步骤、进度百分比、报告 ID 或错误信息。
    """
    scheduler = _get_scheduler_or_404()
    status_data = scheduler.get_execution(execution_id)
    if status_data is None:
        raise HTTPException(status_code=404, detail="执行记录不存在")
    return status_data


@router.get("/executions", response_model=ExecutionListResponse)
def list_executions(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: dict = Depends(get_current_user),
):
    """
    GET /api/v1/executions — 执行历史列表。

    返回最近的执行记录列表，支持分页。
    """
    scheduler = _get_scheduler_or_404()
    items = scheduler.list_executions(limit=limit, offset=offset)
    # Total count from the database
    from db.database import get_db
    from db.models import Execution
    with next(get_db()) as db:
        total = db.query(Execution).count()
    return ExecutionListResponse(items=items, total=total, limit=limit, offset=offset)


# ─── SSE Streaming for Execution Detail ─────────────────────────────────────


@router.post("/executions/{execution_id}/stream")
async def stream_execution(
    execution_id: int,
    user: dict = Depends(get_current_user),
):
    """
    POST /api/v1/executions/{id}/stream — SSE流式获取执行详情。

    对于已完成的执行，从 step_results 回放日志；
    对于正在进行的执行，从 reports/generate/stream 重新触发并监听。
    """
    with next(get_db()) as db:
        execution = db.get(Execution, execution_id)
        if not execution:
            raise HTTPException(status_code=404, detail="执行记录不存在")

    # 如果已完成，从 step_results 回放事件
    if execution.status in ("completed", "failed"):
        return await _stream_completed_execution(execution)

    # 如果正在运行，重新连接 SSE
    if execution.status == "running":
        return await _stream_live_execution(execution_id)

    # 其他状态（如 idle, paused）直接返回状态
    raise HTTPException(status_code=400, detail=f"执行状态 {execution.status} 不支持流式获取")


async def _stream_completed_execution(execution: Execution) -> StreamingResponse:
    """Replay events from step_results for a completed execution."""

    async def event_generator() -> AsyncGenerator[str, None]:
        step_results = execution.step_results_dict or {}

        # If no step_results (old execution), emit placeholder steps for replay
        if not step_results:
            yield f"data: {json.dumps({'type': 'step_log', 'step': 'plan', 'message': '规划阶段'}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'step_log', 'step': 'search', 'message': '搜索阶段'}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'step_log', 'step': 'analyze', 'message': '分析阶段'}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'step_log', 'step': 'verify', 'message': '验证阶段'}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'step_log', 'step': 'report', 'message': '报告生成阶段'}, ensure_ascii=False)}\n\n"
        else:
            # Replay each stored step
            for step_name, step_data in step_results.items():
                if step_name == "plan":
                    yield f"data: {json.dumps({'type': 'stage', 'stage': 'plan', 'message': '规划阶段'}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'step_log', 'step': 'plan', 'message': '计划生成完成'}, ensure_ascii=False)}\n\n"
                elif step_name == "search":
                    yield f"data: {json.dumps({'type': 'stage', 'stage': 'search', 'message': '搜索阶段'}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'step_log', 'step': 'search', 'message': '搜索完成'}, ensure_ascii=False)}\n\n"
                elif step_name == "analyze":
                    yield f"data: {json.dumps({'type': 'stage', 'stage': 'analyze', 'message': '分析阶段'}, ensure_ascii=False)}\n\n"
                    content = step_data.get("content", step_data.get("summary", ""))
                    if content:
                        yield f"data: {json.dumps({'type': 'token', 'step': 'analyze', 'content': content}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'step_log', 'step': 'analyze', 'message': '分析完成'}, ensure_ascii=False)}\n\n"
                elif step_name == "verify":
                    yield f"data: {json.dumps({'type': 'stage', 'stage': 'verify', 'message': '验证阶段'}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'step_log', 'step': 'verify', 'message': '验证完成'}, ensure_ascii=False)}\n\n"
                elif step_name == "report":
                    yield f"data: {json.dumps({'type': 'stage', 'stage': 'report', 'message': '报告生成'}, ensure_ascii=False)}\n\n"

        # Final status
        if execution.status == "completed" and execution.report_id:
            yield f"data: {json.dumps({'type': 'done', 'report_id': str(execution.report_id), 'message': f'报告生成完成 (ID: {execution.report_id})'}, ensure_ascii=False)}\n\n"
        elif execution.status == "failed":
            yield f"data: {json.dumps({'type': 'error', 'message': execution.error_message or '执行失败'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


async def _stream_live_execution(execution_id: int) -> StreamingResponse:
    """Stream current status of a running execution, polling until completion."""

    async def event_generator() -> AsyncGenerator[str, None]:
        from services.agent.engine import AgentEngine

        # Send initial status
        with next(get_db()) as db:
            execution = db.get(Execution, execution_id)
            if execution:
                yield f"data: {json.dumps({'type': 'step_log', 'message': f'执行状态: {execution.status}，当前步骤: {execution.current_step}'}, ensure_ascii=False)}\n\n"

        agent = AgentEngine()
        max_wait = 120  # max 2 minutes wait
        poll_interval = 2  # seconds between polls

        try:
            async for event in agent.execute_stream(
                trigger_type="manual",
                execution_id=execution_id,
                plan_input=None,
            ):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                # If we get done/error, we're done
                if event.get("type") in ("done", "error"):
                    return
        except Exception as e:
            # Agent lock busy — fall back to polling
            import asyncio
            for _ in range(max_wait // poll_interval):
                await asyncio.sleep(poll_interval)
                with next(get_db()) as db:
                    execution = db.get(Execution, execution_id)
                    if execution and execution.status in ("completed", "failed"):
                        if execution.status == "completed":
                            yield f"data: {json.dumps({'type': 'done', 'report_id': str(execution.report_id), 'message': f'报告生成完成 (ID: {execution.report_id})'}, ensure_ascii=False)}\n\n"
                        else:
                            yield f"data: {json.dumps({'type': 'error', 'message': execution.error_message or '执行失败'}, ensure_ascii=False)}\n\n"
                        return
                    else:
                        yield f"data: {json.dumps({'type': 'step_log', 'message': f'等待执行完成... ({execution.current_step})'}, ensure_ascii=False)}\n\n"
            # Timeout
            yield f"data: {json.dumps({'type': 'error', 'message': '执行超时'}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/reports/generate", response_model=GenerateResponse)
@limiter.limit("5/minute")
async def trigger_report_generate(
    request: Request,
    req: GenerateRequest,
    user: dict = Depends(get_current_user),
):
    """
    POST /api/v1/reports/generate — 手动触发报告生成。

    在后台异步执行 Agent 工作流，立即返回执行 ID。
    通过 GET /api/v1/executions/{id} 轮询执行状态。
    """
    scheduler = _get_scheduler_or_404()
    try:
        execution_id = await scheduler.trigger_manual(
            category_slugs=req.category_slugs,
            force_refresh=req.force_refresh,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))

    return GenerateResponse(
        execution_id=execution_id,
        status="running",
        message="报告生成中，预计 45 秒完成",
        poll_url=f"/api/v1/executions/{execution_id}",
    )


@router.post("/reports/{report_id}/regenerate", response_model=RegenerateResponse)
@limiter.limit("5/minute")
async def trigger_report_regenerate(
    request: Request,
    report_id: int,
    req: RegenerateRequest,
    user: dict = Depends(get_current_user),
):
    """
    POST /api/v1/reports/{id}/regenerate — 根据用户反馈重新生成报告。

    创建新的执行记录，基于父报告的迭代历史重新运行 Agent 工作流。
    """
    scheduler = _get_scheduler_or_404()
    try:
        execution_id = await scheduler.trigger_iteration(
            report_id=report_id,
            feedback=req.feedback,
            focus_areas=req.focus_areas,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))

    return RegenerateResponse(
        execution_id=execution_id,
        status="running",
        parent_report_id=report_id,
        message="正在根据反馈重新生成...",
        poll_url=f"/api/v1/executions/{execution_id}",
    )
