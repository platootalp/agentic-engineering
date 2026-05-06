"""
Planner — Step 1 of the Agentic Engine.
Generates an ExecutionPlan based on categories and context.
"""
import json
import logging
from datetime import datetime

from db.models import Category

from .types import ExecutionPlan, SearchQuery

logger = logging.getLogger(__name__)

# ─── Default analysis dimensions ────────────────────────────────────────────────

DEFAULT_ANALYSIS_DIMENSIONS = [
    "市场热度变化",
    "Top 游戏分析",
    "新兴趋势识别",
    "竞争格局评估",
    "机会与风险",
]

DEFAULT_DATA_SOURCES = ["exa", "appstore", "google_play"]


# ─── Prompt templates ───────────────────────────────────────────────────────────


PLANNER_SYSTEM_PROMPT = """你是一个游戏市场分析师。根据以下品类配置，制定搜索计划。

品类配置：
{categories}

历史报告摘要（用于避免重复）：
{last_report_summary}

请制定：
1. 每个品类的搜索关键词（针对Exa搜索）
2. 数据源优先级（exa / appstore / google_play）
3. 重点关注的问题列表

请返回纯JSON格式：
{
  "search_queries": [
    {
      "category": "品类slug",
      "queries": ["关键词1", "关键词2"],
      "data_source": "exa",
      "focus_areas": ["关注点1", "关注点2"]
    }
  ],
  "analysis_dimensions": ["维度1", "维度2"],
  "expected_sources": ["exa", "appstore"]
}"""


# ─── Planner ───────────────────────────────────────────────────────────────────


class Planner:
    """Step 1: Generate an ExecutionPlan from category config."""

    def __init__(self, llm_client=None):
        """
        Args:
            llm_client: Optional Anthropic client for LLM-powered planning.
                       If None, falls back to keyword-based default plan.
        """
        self._llm = llm_client

    async def plan(
        self,
        categories: list[Category],
        last_report_summary: str | None = None,
        feedback: str | None = None,
        iteration_depth: int = 0,
    ) -> ExecutionPlan:
        """
        Generate an ExecutionPlan.

        Args:
            categories: Enabled categories from DB.
            last_report_summary: Summary of the previous report (for context).
            feedback: User feedback from a regeneration request.
            iteration_depth: Current iteration (0 = first run).

        Returns:
            ExecutionPlan
        """
        if not categories:
            # Fallback to default
            return self._default_plan()

        # Try LLM-powered planning first
        if self._llm is not None:
            try:
                plan = await self._plan_with_llm(
                    categories, last_report_summary, feedback, iteration_depth
                )
                if plan.search_queries:
                    return plan
            except Exception as e:
                logger.warning("LLM planning failed, falling back to default: %s", e)

        return self._plan_from_categories(categories)

    async def _plan_with_llm(
        self,
        categories: list[Category],
        last_report_summary: str | None,
        feedback: str | None,
        iteration_depth: int,
    ) -> ExecutionPlan:
        """Use LLM to generate a dynamic ExecutionPlan."""
        cat_json = json.dumps(
            [
                {
                    "name": c.name,
                    "slug": c.slug,
                    "keywords": c.keywords_list,
                    "data_sources": c.data_sources_list,
                    "priority": c.priority,
                }
                for c in categories
            ],
            ensure_ascii=False,
        )

        prompt = PLANNER_SYSTEM_PROMPT.format(
            categories=cat_json,
            last_report_summary=last_report_summary or "（无历史报告）",
        )
        if feedback:
            prompt += f"\n\n用户反馈（用于本次搜索优化）：{feedback}"

        response = self._llm.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system="你是一个JSON生成器。只返回纯JSON，不要markdown代码块。",
            messages=[{"role": "user", "content": prompt}],
        )

        content = ""
        for block in response.content:
            if hasattr(block, "text"):
                content += block.text

        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        data = json.loads(content)
        return ExecutionPlan.from_dict(data)

    def _plan_from_categories(self, categories: list[Category]) -> ExecutionPlan:
        """Build ExecutionPlan directly from category metadata."""
        search_queries = []
        for cat in categories:
            # Build search queries from keywords
            queries = []
            for kw in cat.keywords_list:
                # Build a query string with time context
                queries.append(f"{kw} 2026")

            # Determine primary data source
            ds_list = cat.data_sources_list
            primary_ds = ds_list[0] if ds_list else "exa"

            search_queries.append(
                SearchQuery(
                    category=cat.slug,
                    queries=queries,
                    data_source=primary_ds,
                    focus_areas=["下载量趋势", "新游戏发布", "市场排名"],
                )
            )

        return ExecutionPlan(
            search_queries=search_queries,
            analysis_dimensions=DEFAULT_ANALYSIS_DIMENSIONS,
            expected_sources=DEFAULT_DATA_SOURCES,
        )

    def _default_plan(self) -> ExecutionPlan:
        """Minimal fallback when no categories are configured."""
        return ExecutionPlan(
            search_queries=[
                SearchQuery(
                    category="casual_games",
                    queries=[
                        "casual mobile games trending April 2026",
                        "casual puzzle game market 2026",
                    ],
                    data_source="exa",
                    focus_areas=["市场趋势", "热门品类"],
                )
            ],
            analysis_dimensions=DEFAULT_ANALYSIS_DIMENSIONS,
            expected_sources=["exa"],
        )
