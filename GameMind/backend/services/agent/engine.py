"""
Agent Engine — Orchestrates the Agentic Loop (Plan → Search → Analyze → Verify → Report).
"""
import asyncio
import logging
from typing import TYPE_CHECKING, Any, AsyncGenerator

from config import get_cached_settings
from db.database import ExecutionLock, get_db
from db.models import Category, Report, ReportMetric

from .types import (
    AnalysisDraft,
    DataQuality,
    ExecutionPlan,
    Insight,
    SearchResults,
    VerificationResult,
)
from .planner import Planner
from .searcher import Searcher
from .analyzer import Analyzer
from .verifier import Verifier
from .reporter import Reporter

if TYPE_CHECKING:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = logging.getLogger(__name__)

# ─── Constants ─────────────────────────────────────────────────────────────────

MAX_ITERATIONS = 3
STEP_PROGRESS = {"plan": 0.2, "search": 0.4, "analyze": 0.6, "verify": 0.8, "report": 0.95}
ALL_STEPS = ["plan", "search", "analyze", "verify", "report"]


# ─── Execution State ──────────────────────────────────────────────────────────


class ExecutionState:
    """Holds all state for a single agent execution run."""

    def __init__(
        self,
        trigger_type: str,
        execution_id: int | None = None,
        plan_input: dict | None = None,
        iteration_feedback: str | None = None,
    ):
        self.trigger_type = trigger_type
        self.execution_id = execution_id
        self.plan_input = plan_input or {}
        self.iteration_feedback = iteration_feedback

        self.iteration_depth = 0
        self.plan: ExecutionPlan | None = None
        self.search_results: SearchResults | None = None
        self.draft: AnalysisDraft | None = None
        self.verification: VerificationResult | None = None
        self.report_id: int | None = None
        self.error_message: str | None = None

    @property
    def parent_report_id(self) -> int | None:
        return self.plan_input.get("parent_report_id")

    @property
    def category_slugs(self) -> list[str]:
        return self.plan_input.get("category_slugs", [])

    @property
    def force_refresh(self) -> bool:
        return self.plan_input.get("force_refresh", False)


# ─── Agent Engine ─────────────────────────────────────────────────────────────


class AgentEngine:
    """
    Orchestrates the full Agentic Loop:

        IDLE → PLAN → SEARCH → ANALYZE → VERIFY → REPORT
                       ↑          ↓
                       └──────────┘  (iterate up to MAX_ITERATIONS times)
    """

    def __init__(
        self,
        llm_api_key: str | None = None,
        exa_api_key: str | None = None,
        appstore_api_key: str | None = None,
        gp_api_key: str | None = None,
    ):
        settings = get_cached_settings()
        self._anthropic_key = llm_api_key or settings.ANTHROPIC_API_KEY
        self._exa_key = exa_api_key or settings.EXA_API_KEY
        self._appstore_key = appstore_api_key
        self._gp_key = gp_api_key

        # Step handlers
        self._planner = Planner()
        self._searcher = Searcher(
            exa_api_key=self._exa_key,
            appstore_api_key=self._appstore_key,
            gp_api_key=self._gp_key,
        )
        self._analyzer = Analyzer(api_key=self._anthropic_key)
        self._verifier = Verifier()
        self._reporter = Reporter()

    # ── Public API ──────────────────────────────────────────────────────────

    async def execute(
        self,
        trigger_type: str,
        execution_id: int | None = None,
        plan_input: dict | None = None,
        iteration_feedback: str | None = None,
    ) -> dict[str, Any]:
        """
        Main entry point. Runs the full agentic loop.

        Args:
            trigger_type: 'scheduled' | 'manual' | 'iteration'
            execution_id: DB record id for this execution (for progress updates)
            plan_input: Dict with category_slugs, force_refresh, parent_report_id, feedback
            iteration_feedback: User feedback for regeneration

        Returns:
            Dict with execution result
        """
        state = ExecutionState(
            trigger_type=trigger_type,
            execution_id=execution_id,
            plan_input=plan_input,
            iteration_feedback=iteration_feedback,
        )

        logger.info(
            "Agent execution started trigger=%s iteration_depth=%d",
            trigger_type,
            state.iteration_depth,
        )

        try:
            # Load categories
            categories = self._load_categories(state)

            # Check iteration depth
            if state.parent_report_id:
                state.iteration_depth = await self._get_parent_iteration_depth(state.parent_report_id) + 1

            # ── Main Loop ──────────────────────────────────────────────────
            while True:
                logger.info("Starting iteration %d", state.iteration_depth)

                # Step 1: PLAN
                await self._step_plan(state, categories)
                if state.error_message:
                    break

                # Step 2: SEARCH
                await self._step_search(state)
                if state.error_message:
                    break

                # Step 3: ANALYZE
                await self._step_analyze(state)
                if state.error_message:
                    break

                # Step 4: VERIFY
                await self._step_verify(state)
                if state.error_message:
                    break

                # Check iteration
                if state.verification and state.verification.passed:
                    logger.info("Verification passed, moving to report")
                    break

                state.iteration_depth += 1
                if state.iteration_depth >= MAX_ITERATIONS:
                    logger.warning(
                        "Max iterations (%d) reached, forcing report step",
                        MAX_ITERATIONS,
                    )
                    state.error_message = "数据可能不够完整，建议手动补充"
                    break

                logger.info(
                    "Verification failed, iterating (depth=%d/%d)",
                    state.iteration_depth,
                    MAX_ITERATIONS,
                )

            # Step 5: REPORT
            if not state.error_message or state.iteration_depth >= MAX_ITERATIONS:
                await self._step_report(state)
            else:
                await self._save_execution_error(state)

            return {
                "success": state.error_message is None,
                "report_id": state.report_id,
                "iteration_depth": state.iteration_depth,
                "error": state.error_message,
            }

        except Exception as e:
            logger.exception("Agent execution failed: %s", e)
            state.error_message = str(e)
            await self._save_execution_error(state)
            return {"success": False, "error": str(e)}

    async def execute_stream(
        self,
        trigger_type: str,
        execution_id: int | None = None,
        plan_input: dict | None = None,
        iteration_feedback: str | None = None,
    ) -> AsyncGenerator[dict, None]:
        """
        Streaming version of execute(). Yields events as the agent progresses.
        Each yielded dict has a "type" field:
          - "stage":    {"type": "stage", "stage": str, "message": str}
          - "step_log": {"type": "step_log", "step": str, "message": str}
          - "token":    {"type": "token", "step": str, "content": str}
          - "done":     {"type": "done", "report_id": int|None, "message": str}
          - "error":    {"type": "error", "message": str}
        """
        state = ExecutionState(
            trigger_type=trigger_type,
            execution_id=execution_id,
            plan_input=plan_input,
            iteration_feedback=iteration_feedback,
        )

        logger.info(
            "Agent streaming execution started trigger=%s",
            trigger_type,
        )

        try:
            categories = self._load_categories(state)

            if state.parent_report_id:
                state.iteration_depth = await self._get_parent_iteration_depth(state.parent_report_id) + 1

            while True:
                logger.info("Starting iteration %d", state.iteration_depth)

                # ── Step 1: PLAN ─────────────────────────────────────────────
                self._update_step(state.execution_id, "plan")
                yield {
                    "type": "stage",
                    "stage": "plan",
                    "message": "正在分析需求并制定执行计划...",
                }
                try:
                    last_summary = await self._get_last_report_summary()
                    state.plan = await self._planner.plan(
                        categories=categories,
                        last_report_summary=last_summary,
                        feedback=state.iteration_feedback,
                        iteration_depth=state.iteration_depth,
                    )
                    yield {
                        "type": "step_log",
                        "step": "plan",
                        "message": f"生成了 {len(state.plan.search_queries)} 个搜索任务",
                    }
                except Exception as e:
                    logger.error("PLAN step failed: %s", e)
                    state.error_message = f"Plan step failed: {e}"
                    yield {"type": "error", "message": str(e)}
                    break

                # ── Step 2: SEARCH ────────────────────────────────────────────
                self._update_step(state.execution_id, "search")
                yield {
                    "type": "stage",
                    "stage": "search",
                    "message": "正在搜索游戏市场数据...",
                }
                if not state.plan:
                    state.error_message = "No plan available"
                    break
                try:
                    state.search_results = await self._searcher.search(state.plan)
                    exa_count = len(state.search_results.exa_results)
                    app_count = len(state.search_results.appstore_results)
                    gp_count = len(state.search_results.gp_results)
                    yield {
                        "type": "step_log",
                        "step": "search",
                        "message": f"搜索完成：Exa {exa_count} 条，App Store {app_count} 条，Google Play {gp_count} 条",
                    }
                except Exception as e:
                    logger.error("SEARCH step failed: %s", e)
                    state.error_message = f"Search step failed: {e}"
                    yield {"type": "error", "message": str(e)}
                    break

                # ── Step 3: ANALYZE (streaming) ──────────────────────────────
                self._update_step(state.execution_id, "analyze")
                yield {
                    "type": "stage",
                    "stage": "analyze",
                    "message": "正在分析数据并生成洞察...",
                }
                if not state.plan or not state.search_results:
                    state.error_message = "No plan or search results"
                    break
                try:
                    # Stream tokens from the analyzer
                    async for event in self._analyzer.analyze_stream(
                        search_results=state.search_results,
                        analysis_dimensions=state.plan.analysis_dimensions,
                        categories=list(state.plan.search_queries),
                    ):
                        if event["type"] == "token":
                            yield {
                                "type": "token",
                                "step": "analyze",
                                "content": event["content"],
                            }
                        elif event["type"] == "done":
                            state.draft = event["draft"]
                        elif event["type"] == "error":
                            yield event
                            state.error_message = event["message"]
                    if state.draft:
                        # Save analyze content for SSE replay
                        self._update_step(state.execution_id, "analyze", content=state.draft.summary)
                        yield {
                            "type": "step_log",
                            "step": "analyze",
                            "message": "分析完成，已生成洞察",
                        }
                except Exception as e:
                    logger.error("ANALYZE step failed: %s", e)
                    state.error_message = f"Analyze step failed: {e}"
                    yield {"type": "error", "message": str(e)}
                    break

                if state.error_message:
                    break

                # ── Step 4: VERIFY ──────────────────────────────────────────
                self._update_step(state.execution_id, "verify")
                yield {
                    "type": "stage",
                    "stage": "verify",
                    "message": "正在验证分析结果可靠性...",
                }
                if not state.draft:
                    state.error_message = "No draft to verify"
                    break
                try:
                    if state.plan:
                        expected = [sq.category for sq in state.plan.search_queries]
                        self._verifier = Verifier(expected_categories=expected)
                    state.verification = await self._verifier.verify(state.draft)
                    passed = state.verification.passed
                    yield {
                        "type": "step_log",
                        "step": "verify",
                        "message": f"验证{'通过' if passed else '未通过'}: {', '.join(state.verification.reasons[:2])}",
                    }
                except Exception as e:
                    logger.error("VERIFY step failed: %s", e)
                    state.error_message = f"Verify step failed: {e}"
                    yield {"type": "error", "message": str(e)}
                    break

                # Check iteration
                if state.verification and state.verification.passed:
                    logger.info("Verification passed, moving to report")
                    break

                state.iteration_depth += 1
                if state.iteration_depth >= MAX_ITERATIONS:
                    logger.warning("Max iterations reached, forcing report step")
                    state.error_message = "数据可能不够完整，建议手动补充"
                    break

                logger.info("Verification failed, iterating (depth=%d/%d)", state.iteration_depth, MAX_ITERATIONS)

            # ── Step 5: REPORT ──────────────────────────────────────────────
            if not state.error_message or state.iteration_depth >= MAX_ITERATIONS:
                self._update_step(state.execution_id, "report")
                yield {
                    "type": "stage",
                    "stage": "report",
                    "message": "正在生成最终报告...",
                }
                if not state.draft:
                    state.error_message = "No draft to report"
                else:
                    try:
                        category_slugs = [sq.category for sq in state.plan.search_queries] if state.plan else []
                        state.report_id = await self._reporter.generate_report(
                            draft=state.draft,
                            category_slugs=category_slugs,
                            iteration_depth=state.iteration_depth,
                            parent_report_id=state.parent_report_id,
                        )
                        if state.execution_id:
                            self._complete_execution(state.execution_id, state.report_id)
                        yield {
                            "type": "done",
                            "report_id": state.report_id,
                            "message": f"报告生成完成 (ID: {state.report_id})",
                        }
                        return
                    except Exception as e:
                        logger.error("REPORT step failed: %s", e)
                        state.error_message = f"Report step failed: {e}"
                        await self._save_execution_error(state)

            yield {
                "type": "done",
                "report_id": state.report_id,
                "message": state.error_message or "执行完成",
            }

        except Exception as e:
            logger.exception("Agent streaming execution failed: %s", e)
            yield {"type": "error", "message": str(e)}
            await self._save_execution_error(state)

    # ── Step Implementations ────────────────────────────────────────────────

    async def _step_plan(self, state: ExecutionState, categories: list[Category]) -> None:
        """Step 1: Generate ExecutionPlan."""
        logger.info("PLAN step starting")
        self._update_step(state.execution_id, "plan")

        try:
            # Get last report summary for context
            last_summary = await self._get_last_report_summary()

            state.plan = await self._planner.plan(
                categories=categories,
                last_report_summary=last_summary,
                feedback=state.iteration_feedback,
                iteration_depth=state.iteration_depth,
            )
            logger.info("PLAN step completed: %d search queries", len(state.plan.search_queries))
        except Exception as e:
            logger.error("PLAN step failed: %s", e)
            state.error_message = f"Plan step failed: {e}"

    async def _step_search(self, state: ExecutionState) -> None:
        """Step 2: Execute searches."""
        logger.info("SEARCH step starting")
        self._update_step(state.execution_id, "search")

        if not state.plan:
            state.error_message = "No plan available"
            return

        try:
            state.search_results = await self._searcher.search(state.plan)
            logger.info(
                "SEARCH step completed: exa=%d appstore=%d gp=%d",
                len(state.search_results.exa_results),
                len(state.search_results.appstore_results),
                len(state.search_results.gp_results),
            )
        except Exception as e:
            logger.error("SEARCH step failed: %s", e)
            state.error_message = f"Search step failed: {e}"

    async def _step_analyze(self, state: ExecutionState) -> None:
        """Step 3: Analyze search results."""
        logger.info("ANALYZE step starting")
        self._update_step(state.execution_id, "analyze")

        if not state.plan or not state.search_results:
            state.error_message = "No plan or search results"
            return

        try:
            state.draft = await self._analyzer.analyze(
                search_results=state.search_results,
                analysis_dimensions=state.plan.analysis_dimensions,
                categories=list(state.plan.search_queries),
            )
            # Save analyze content for SSE replay
            if state.draft:
                self._update_step(state.execution_id, "analyze", content=state.draft.summary)
            logger.info("ANALYZE step completed")
        except Exception as e:
            logger.error("ANALYZE step failed: %s", e)
            state.error_message = f"Analyze step failed: {e}"

    async def _step_verify(self, state: ExecutionState) -> None:
        """Step 4: Verify analysis draft."""
        logger.info("VERIFY step starting")
        self._update_step(state.execution_id, "verify")

        if not state.draft:
            state.error_message = "No draft to verify"
            return

        try:
            # Set expected categories for completeness check
            if state.plan:
                expected = [sq.category for sq in state.plan.search_queries]
                self._verifier = Verifier(expected_categories=expected)

            state.verification = await self._verifier.verify(state.draft)
            logger.info(
                "VERIFY step completed: passed=%s reasons=%s",
                state.verification.passed,
                state.verification.reasons,
            )
        except Exception as e:
            logger.error("VERIFY step failed: %s", e)
            state.error_message = f"Verify step failed: {e}"

    async def _step_report(self, state: ExecutionState) -> None:
        """Step 5: Generate final report."""
        logger.info("REPORT step starting")
        self._update_step(state.execution_id, "report")

        if not state.draft:
            state.error_message = "No draft to report"
            return

        try:
            # Extract category slugs from plan
            category_slugs = [sq.category for sq in state.plan.search_queries] if state.plan else []

            state.report_id = await self._reporter.generate_report(
                draft=state.draft,
                category_slugs=category_slugs,
                iteration_depth=state.iteration_depth,
                parent_report_id=state.parent_report_id,
            )
            logger.info("REPORT step completed: report_id=%d", state.report_id)

            # Update execution record
            if state.execution_id:
                self._complete_execution(state.execution_id, state.report_id)

        except Exception as e:
            logger.error("REPORT step failed: %s", e)
            state.error_message = f"Report step failed: {e}"
            await self._save_execution_error(state)

    # ── Helper Methods ──────────────────────────────────────────────────────

    def _load_categories(self, state: ExecutionState) -> list[Category]:
        """Load enabled categories from DB."""
        with next(get_db()) as db:
            query = db.query(Category).filter(Category.enabled == True)
            if state.category_slugs:
                query = query.filter(Category.slug.in_(state.category_slugs))
            return query.order_by(Category.priority.desc()).all()

    async def _get_parent_iteration_depth(self, parent_report_id: int) -> int:
        """Get iteration depth of parent report."""
        with next(get_db()) as db:
            parent = db.get(Report, parent_report_id)
            return parent.iteration_depth if parent else 0

    async def _get_last_report_summary(self) -> str | None:
        """Get summary of the most recent report."""
        with next(get_db()) as db:
            latest = db.query(Report).order_by(Report.created_at.desc()).first()
            return latest.summary if latest else None

    def _update_step(self, execution_id: int | None, step: str, content: str | None = None) -> None:
        """Update execution record with current step."""
        if not execution_id:
            return
        try:
            with next(get_db()) as db:
                from db.models import Execution
                execution = db.get(Execution, execution_id)
                if execution:
                    execution.status = "running"
                    step_results = execution.step_results_dict or {}
                    step_results[step] = {"completed_at": __import__("datetime").datetime.now().isoformat()}
                    if content:
                        step_results[step]["content"] = content
                    execution.step_results_dict = step_results
                    db.commit()
        except Exception as e:
            logger.warning("Failed to update step: %s", e)

    def _complete_execution(self, execution_id: int, report_id: int) -> None:
        """Mark execution as completed."""
        try:
            with next(get_db()) as db:
                from db.models import Execution
                execution = db.get(Execution, execution_id)
                if execution:
                    execution.status = "completed"
                    execution.report_id = report_id
                    execution.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
                    db.commit()
        except Exception as e:
            logger.warning("Failed to complete execution: %s", e)

    async def _save_execution_error(self, state: ExecutionState) -> None:
        """Save error to execution record."""
        if not state.execution_id:
            return
        try:
            with next(get_db()) as db:
                from db.models import Execution
                execution = db.get(Execution, state.execution_id)
                if execution:
                    execution.status = "failed"
                    execution.error_message = state.error_message
                    execution.completed_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
                    db.commit()
        except Exception as e:
            logger.warning("Failed to save execution error: %s", e)
