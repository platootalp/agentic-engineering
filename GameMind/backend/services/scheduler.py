"""
Scheduler service for game market analysis agent.

Manages:
- Daily scheduled execution at 9:00 AM Beijing time
- Manual trigger via API
- Iteration trigger for report regeneration
- Execution state tracking via executions table
"""
import asyncio
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import TYPE_CHECKING

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session

from config import get_cached_settings
from db.database import ExecutionLock, get_db
from db.models import Execution

if TYPE_CHECKING:
    from services.agent.engine import AgentEngine

logger = logging.getLogger("backend.scheduler")


# ─── Trigger Types ────────────────────────────────────────────────────────────


class TriggerType:
    SCHEDULED = "scheduled"
    MANUAL = "manual"
    ITERATION = "iteration"


# ─── Execution Status ────────────────────────────────────────────────────────


class ExecutionStatus:
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


# ─── Step Progress Mapping ───────────────────────────────────────────────────


# Maps step name to progress percentage (0.0 - 1.0)
STEP_PROGRESS: dict[str, float] = {
    "idle": 0.0,
    "plan": 0.2,
    "search": 0.4,
    "analyze": 0.6,
    "verify": 0.8,
    "report": 0.95,
    "completed": 1.0,
}

# All ordered steps in the agent workflow
ALL_STEPS = ["plan", "search", "analyze", "verify", "report"]


# ─── Execution Record Helpers ────────────────────────────────────────────────


def create_execution_record(
    db: Session,
    trigger_type: str,
    plan_input: dict | None = None,
) -> Execution:
    """Create a new execution record in the database."""
    plan_input_json = json.dumps(plan_input, ensure_ascii=False) if plan_input is not None else None
    execution = Execution(
        status=ExecutionStatus.RUNNING,
        trigger_type=trigger_type,
        plan_input=plan_input_json,
        started_at=datetime.now(timezone.utc),
    )
    db.add(execution)
    db.commit()
    db.refresh(execution)
    logger.info(
        "Created execution record id=%d trigger=%s",
        execution.id,
        trigger_type,
    )
    return execution


def update_execution_step(
    db: Session,
    execution_id: int,
    step: str,
    step_results: dict | None = None,
) -> None:
    """Update the current step and results of an execution."""
    execution = db.get(Execution, execution_id)
    if not execution:
        logger.warning("Execution %d not found for step update", execution_id)
        return

    execution.status = ExecutionStatus.RUNNING
    if step_results is not None:
        current_results = execution.step_results_dict or {}
        current_results[step] = step_results
        execution.step_results_dict = current_results

    db.commit()


def complete_execution(
    db: Session,
    execution_id: int,
    report_id: int | None = None,
    error_message: str | None = None,
) -> None:
    """Mark an execution as completed or failed."""
    execution = db.get(Execution, execution_id)
    if not execution:
        logger.warning("Execution %d not found for completion", execution_id)
        return

    if error_message:
        execution.status = ExecutionStatus.FAILED
        execution.error_message = error_message
        logger.error("Execution %d failed: %s", execution_id, error_message)
    else:
        execution.status = ExecutionStatus.COMPLETED
        logger.info("Execution %d completed successfully", execution_id)

    if report_id is not None:
        execution.report_id = report_id

    execution.completed_at = datetime.now(timezone.utc)
    db.commit()


def get_execution_status(
    db: Session,
    execution_id: int,
) -> Execution | None:
    """Retrieve an execution record by ID."""
    return db.get(Execution, execution_id)


# ─── Scheduler Service ───────────────────────────────────────────────────────


class SchedulerService:
    """
    Manages scheduled and manual execution of the game market analysis agent.

    Usage:
        scheduler = SchedulerService(agent_engine)
        scheduler.start()   # Called at app startup
        scheduler.stop()    # Called at app shutdown
    """

    def __init__(self, agent_engine: "AgentEngine") -> None:
        self._agent = agent_engine
        self._scheduler: AsyncIOScheduler | None = None
        self._settings = get_cached_settings()
        self._running_task: asyncio.Task | None = None

    # ── Lifecycle ──────────────────────────────────────────────────────────

    def start(self) -> None:
        """Start the APScheduler background scheduler.

        Registers the daily 9:00 AM Beijing-time job and starts the
        AsyncIOScheduler event loop in a background thread.
        """
        if not self._settings.SCHEDULER_ENABLED:
            logger.info("Scheduler is disabled via SCHEDULER_ENABLED=false")
            return

        self._scheduler = AsyncIOScheduler(timezone=self._settings.SCHEDULER_TIMEZONE)

        # Daily 9:00 AM Beijing time job
        self._scheduler.add_job(
            self._scheduled_execution,
            CronTrigger(hour=self._settings.SCHEDULER_HOUR, minute=0),
            id="daily_report",
            name="Daily Game Market Analysis Report",
            replace_existing=True,
        )

        self._scheduler.start()
        logger.info(
            "Scheduler started — daily execution at %02d:00 %s",
            self._settings.SCHEDULER_HOUR,
            self._settings.SCHEDULER_TIMEZONE,
        )

    def stop(self) -> None:
        """Gracefully shut down the scheduler."""
        if self._scheduler and self._scheduler.running:
            self._scheduler.shutdown(wait=False)
            logger.info("Scheduler stopped")

    # ── Job Coroutines ─────────────────────────────────────────────────────

    async def _scheduled_execution(self) -> None:
        """Coroutine invoked by APScheduler for the daily scheduled run."""
        logger.info("Scheduled execution triggered")
        try:
            await self._agent.execute(trigger_type=TriggerType.SCHEDULED)
        except Exception as e:
            logger.exception("Scheduled execution failed: %s", e)

    async def _run_agent(
        self,
        trigger_type: str,
        execution_id: int | None = None,
        plan_input: dict | None = None,
        iteration_feedback: str | None = None,
    ) -> None:
        """Internal coroutine that wraps agent execution with lock management."""
        logger.info(
            "Agent execution started trigger=%s execution_id=%s",
            trigger_type,
            execution_id,
        )
        try:
            # Pass execution_id so the agent can update the DB record
            await self._agent.execute(
                trigger_type=trigger_type,
                execution_id=execution_id,
                plan_input=plan_input,
                iteration_feedback=iteration_feedback,
            )
        except Exception as e:
            logger.exception("Agent execution failed: %s", e)
            # Mark execution as failed in DB
            if execution_id is not None:
                with next(get_db()) as db:
                    complete_execution(db, execution_id, error_message=str(e))
        finally:
            ExecutionLock.release()

    # ── Trigger Methods ────────────────────────────────────────────────────

    async def trigger_manual(
        self,
        category_slugs: list[str] | None = None,
        force_refresh: bool = False,
    ) -> int:
        """
        Manually trigger an agent execution (runs immediately in background).

        Args:
            category_slugs: Optional list of category slugs to analyze.
                           If None, all enabled categories are used.
            force_refresh: Whether to force re-fetch data even if cached.

        Returns:
            execution_id: The ID of the newly created execution record.

        Raises:
            RuntimeError: If another execution is already running.
        """
        # Check execution lock — fail fast if busy
        acquired = await ExecutionLock.acquire(raise_on_busy=True)

        plan_input: dict = {
            "category_slugs": category_slugs or [],
            "force_refresh": force_refresh,
        }

        # Create execution record
        with next(get_db()) as db:
            execution = create_execution_record(db, TriggerType.MANUAL, plan_input)
            execution_id = execution.id

        # Schedule agent execution in background
        self._running_task = asyncio.create_task(
            self._run_agent(
                trigger_type=TriggerType.MANUAL,
                execution_id=execution_id,
                plan_input=plan_input,
            )
        )

        logger.info(
            "Manual execution triggered — execution_id=%d",
            execution_id,
        )
        return execution_id

    async def trigger_iteration(
        self,
        report_id: int,
        feedback: str,
        focus_areas: list[str] | None = None,
    ) -> int:
        """
        Trigger an iteration (regeneration) of an existing report.

        Args:
            report_id: The ID of the report to regenerate.
            feedback: User feedback guiding the regeneration.
            focus_areas: Optional list of areas to focus on.

        Returns:
            execution_id: The ID of the new execution record.

        Raises:
            RuntimeError: If another execution is already running.
        """
        acquired = await ExecutionLock.acquire(raise_on_busy=True)

        plan_input: dict = {
            "parent_report_id": report_id,
            "feedback": feedback,
            "focus_areas": focus_areas or [],
        }

        with next(get_db()) as db:
            execution = create_execution_record(db, TriggerType.ITERATION, plan_input)
            execution_id = execution.id

        self._running_task = asyncio.create_task(
            self._run_agent(
                trigger_type=TriggerType.ITERATION,
                execution_id=execution_id,
                plan_input=plan_input,
                iteration_feedback=feedback,
            )
        )

        logger.info(
            "Iteration triggered — report_id=%d execution_id=%d",
            report_id,
            execution_id,
        )
        return execution_id

    # ── Status Query ────────────────────────────────────────────────────────

    def get_execution(self, execution_id: int) -> dict | None:
        """
        Get the current status of an execution.

        Returns a dict with id, status, current_step, progress,
        started_at, estimated_completion, report_id, and error_message,
        or None if the execution is not found.
        """
        with next(get_db()) as db:
            execution = get_execution_status(db, execution_id)
            if not execution:
                return None

            return self._build_status_response(execution)

    def list_executions(self, limit: int = 20, offset: int = 0) -> list[dict]:
        """
        List recent executions ordered by started_at descending.

        Returns a list of status response dicts.
        """
        with next(get_db()) as db:
            executions = (
                db.query(Execution)
                .order_by(Execution.started_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            return [self._build_status_response(e) for e in executions]

    def _build_status_response(self, execution: Execution) -> dict:
        """Build a status response dict from an Execution model."""
        # Determine current step and progress from step_results
        current_step = "idle"
        progress = 0.0

        step_results = execution.step_results_dict or {}
        for step in ALL_STEPS:
            if step in step_results:
                current_step = step

        # Progress advances to the next step indicator
        if execution.status == ExecutionStatus.COMPLETED:
            current_step = "completed"
            progress = 1.0
        elif execution.status == ExecutionStatus.FAILED:
            progress = step_results and STEP_PROGRESS.get(current_step, 0.0) or 0.0
        elif execution.status == ExecutionStatus.RUNNING:
            # Show progress through current step
            step_idx = ALL_STEPS.index(current_step) if current_step in ALL_STEPS else 0
            progress = step_results and STEP_PROGRESS.get(current_step, 0.0) or (step_idx / len(ALL_STEPS)) * 0.9

        # Estimate completion time based on average generation time (45s)
        estimated_completion: str | None = None
        if execution.status == ExecutionStatus.RUNNING and execution.started_at:
            avg_duration = timedelta(seconds=45)
            est = execution.started_at + avg_duration
            estimated_completion = est.isoformat().replace("+00:00", "Z")

        started_at_str: str | None = None
        if execution.started_at:
            started_at_str = execution.started_at.isoformat().replace("+00:00", "Z")

        completed_at_str: str | None = None
        if execution.completed_at:
            completed_at_str = execution.completed_at.isoformat().replace("+00:00", "Z")

        return {
            "id": execution.id,
            "status": execution.status,
            "trigger_type": execution.trigger_type,
            "report_id": execution.report_id,
            "started_at": started_at_str,
            "completed_at": completed_at_str,
            "current_step": current_step,
            "progress": round(progress, 2),
            "estimated_completion": estimated_completion,
            "error_message": execution.error_message,
        }


# ─── Singleton instance ───────────────────────────────────────────────────────


_scheduler_instance: SchedulerService | None = None


def get_scheduler() -> SchedulerService | None:
    """Return the global scheduler instance (may be None before start())."""
    return _scheduler_instance


def init_scheduler(agent_engine: "AgentEngine") -> SchedulerService:
    """Initialize and start the global scheduler instance."""
    global _scheduler_instance
    _scheduler_instance = SchedulerService(agent_engine)
    _scheduler_instance.start()
    return _scheduler_instance
