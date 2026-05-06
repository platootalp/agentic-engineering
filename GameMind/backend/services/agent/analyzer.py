"""
Analyzer — Step 3 of the Agentic Engine.
Generates an AnalysisDraft from search results using LLM.
"""
import asyncio
import json
import logging
from typing import Any, AsyncGenerator

from .types import (
    AnalysisDraft,
    CategoryAnalysis,
    DataQuality,
    ExecutionPlan,
    Insight,
    SearchQuery,
    SearchResults,
)

logger = logging.getLogger(__name__)


ANALYZER_SYSTEM_PROMPT = """你是一位资深游戏市场分析师。请分析以下搜索结果，生成结构化的市场洞察报告。

**输出要求：**
1. 只输出纯JSON格式，不要包含任何markdown代码块标记
2. 严格按照以下JSON schema输出

**JSON Schema：**
{
  "summary": "市场概览（200-300字），包含市场规模、增长趋势、关键发现",
  "category_analysis": {
    "品类slug": {
      "heat_index": 0-100的热度指数,
      "top_games": [{"name": "游戏名", "developer": "开发商", "rating": 4.5, "insight": "简短点评"}],
      "trends": ["趋势1", "趋势2"],
      "opportunities": ["机会1", "机会2"]
    }
  },
  "insights": [
    {
      "type": "trend|risk|opportunity",
      "title": "洞察标题",
      "evidence": ["证据1", "证据2"],
      "confidence": 0.0-1.0
    }
  ],
  "risks": ["风险1", "风险2"],
  "opportunities": ["机会1", "机会2"],
  "data_quality": {
    "exa_coverage": 0.0-1.0,
    "appstore_coverage": 0.0-1.0,
    "overall_confidence": 0.0-1.0
  }
}"""


class Analyzer:
    """Step 3: Generate AnalysisDraft from SearchResults."""

    def __init__(self, api_key: str | None = None):
        import os as _os
        try:
            import anthropic
        except ImportError:
            anthropic = None
        key = api_key or _os.getenv("ANTHROPIC_API_KEY", "")
        self._llm = None
        if key and anthropic:
            self._llm = anthropic.Anthropic(api_key=key)

    async def analyze_stream(
        self,
        search_results: SearchResults,
        analysis_dimensions: list[str],
        categories: list,
        feedback: str | None = None,
    ) -> AsyncGenerator[dict, None]:
        """
        Stream analysis: yields token events and returns final draft via callback.
        Each yielded dict: {"type": "token", "content": "字"} or {"type": "done", "draft": AnalysisDraft}
        """
        if not self._llm:
            yield {"type": "error", "message": "No LLM API key configured"}
            return

        plan = ExecutionPlan(
            search_queries=categories if categories and isinstance(categories[0], SearchQuery) else [],
            analysis_dimensions=analysis_dimensions,
        )
        context = self._build_context(search_results, plan, feedback)
        full_content: list[str] = []

        try:
            # Run synchronous streaming in a thread pool to avoid blocking
            def sync_stream():
                with self._llm.messages.stream(
                    model="claude-sonnet-4-6",
                    max_tokens=8192,
                    system=ANALYZER_SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": context}],
                ) as stream:
                    for text in stream.text_stream:
                        full_content.append(text)
                        yield {"type": "token", "content": text}

            for event in sync_stream():
                yield event
        except Exception as e:
            logger.error("Streaming LLM failed: %s", e)
            yield {"type": "error", "message": str(e)}
            return

        # Parse final result
        content = "".join(full_content)
        content = content.strip()
        if content.startswith("```"):
            parts = content.split("```")
            content = parts[1] if len(parts) > 1 else content
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        draft = self._fallback_analysis(search_results, plan)
        try:
            data = json.loads(content)
            draft = self._parse_draft(data)
        except json.JSONDecodeError:
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end > start:
                try:
                    data = json.loads(content[start:end])
                    draft = self._parse_draft(data)
                except json.JSONDecodeError:
                    pass  # use fallback

        yield {"type": "done", "draft": draft}

    async def analyze(
        self,
        search_results: SearchResults,
        analysis_dimensions: list[str],
        categories: list,  # list[SearchQuery] at runtime
        feedback: str | None = None,
    ) -> AnalysisDraft:
        """
        Analyze search results and produce an AnalysisDraft.

        Args:
            search_results: Raw results from Searcher.
            analysis_dimensions: List of analysis dimensions.
            categories: List of SearchQuery objects.
            feedback: Optional user feedback for guided analysis.
        """
        # Build analysis context
        plan = ExecutionPlan(
            search_queries=categories if categories and isinstance(categories[0], SearchQuery) else [],
            analysis_dimensions=analysis_dimensions,
        )
        context = self._build_context(search_results, plan, feedback)

        try:
            return await self._analyze_with_llm(context)
        except Exception as e:
            logger.error("LLM analysis failed: %s", e)
            return self._fallback_analysis(search_results, plan)

    def _build_context(
        self,
        search_results: SearchResults,
        plan: ExecutionPlan,
        feedback: str | None,
    ) -> str:
        """Build a text context from search results for the LLM."""
        lines = []
        lines.append(f"# 数据源概览\n总结果数: {search_results.total_count()}")

        coverage = search_results.coverage_score()
        lines.append(f"- Exa: {len(search_results.exa_results)} 条 (覆盖率约 {coverage['exa']:.0%})")
        lines.append(f"- App Store: {len(search_results.appstore_results)} 条 (覆盖率约 {coverage['appstore']:.0%})")
        lines.append(f"- Google Play: {len(search_results.gp_results)} 条 (覆盖率约 {coverage['google_play']:.0%})")

        lines.append(f"\n# 分析维度\n" + "\n".join(f"- {d}" for d in plan.analysis_dimensions))

        if plan.search_queries:
            lines.append(f"\n# 品类配置")
            for sq in plan.search_queries:
                lines.append(f"- [{sq.category}] 数据源: {sq.data_source}, 关注: {', '.join(sq.focus_areas)}")

        if feedback:
            lines.append(f"\n# 用户反馈（分析时请重点关注）\n{feedback}")

        lines.append("\n# 原始搜索结果")

        # Exa results
        if search_results.exa_results:
            lines.append("\n## Exa 搜索结果")
            for i, item in enumerate(search_results.exa_results[:20]):
                title = item.get("title", "")
                text = (item.get("text", "") or "")[:400]
                url = item.get("url", "")
                lines.append(f"{i+1}. [{title}]({url})")
                if text:
                    lines.append(f"   {text}")

        # App Store results
        if search_results.appstore_results:
            lines.append("\n## App Store 榜单")
            for item in search_results.appstore_results[:15]:
                lines.append(f"- {item.get('name', '')} | {item.get('developer', '')} | ★{item.get('rating', 'N/A')}")

        # Google Play results
        if search_results.gp_results:
            lines.append("\n## Google Play 榜单")
            for item in search_results.gp_results[:15]:
                lines.append(f"- {item.get('name', '')} | {item.get('developer', '')} | ★{item.get('rating', 'N/A')}")

        return "\n".join(lines)

    async def _analyze_with_llm(self, context: str) -> AnalysisDraft:
        """Send context to LLM and parse the response into an AnalysisDraft."""
        response = self._llm.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8192,
            system=ANALYZER_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": context}],
        )

        content = ""
        for block in response.content:
            if hasattr(block, "text"):
                content += block.text

        content = content.strip()
        # Strip markdown code blocks
        if content.startswith("```"):
            parts = content.split("```")
            content = parts[1] if len(parts) > 1 else content
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        # Try to extract JSON
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            # Try to find JSON bounds
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end > start:
                try:
                    data = json.loads(content[start:end])
                except json.JSONDecodeError:
                    return self._parse_fallback(content)
            else:
                return self._parse_fallback(content)

        return self._parse_draft(data)

    def _parse_draft(self, data: dict[str, Any]) -> AnalysisDraft:
        """Parse LLM JSON output into an AnalysisDraft."""
        category_analysis = {}
        for slug, cat_data in data.get("category_analysis", {}).items():
            if isinstance(cat_data, dict):
                category_analysis[slug] = CategoryAnalysis.from_dict(cat_data)

        insights = [Insight.from_dict(i) for i in data.get("insights", [])]
        data_quality = DataQuality.from_dict(data.get("data_quality", {}))

        return AnalysisDraft(
            summary=data.get("summary", ""),
            category_analysis=category_analysis,
            insights=insights,
            risks=data.get("risks", []),
            opportunities=data.get("opportunities", []),
            data_quality=data_quality,
        )

    def _parse_fallback(self, text: str) -> AnalysisDraft:
        """Create a minimal draft from raw text when JSON parsing fails."""
        return AnalysisDraft(
            summary=text[:1000] if text else "（分析结果待整理）",
            data_quality=DataQuality(overall_confidence=0.3),
        )

    def _fallback_analysis(
        self, search_results: SearchResults, plan: ExecutionPlan
    ) -> AnalysisDraft:
        """Generate a simple analysis without LLM."""
        coverage = search_results.coverage_score()
        overall = round(
            coverage["exa"] * 0.4
            + coverage["appstore"] * 0.3
            + coverage["google_play"] * 0.3,
            2,
        )

        category_analysis = {}
        for sq in plan.search_queries:
            category_analysis[sq.category] = CategoryAnalysis(
                heat_index=50.0,
                trends=["（数据不足）"],
            )

        return AnalysisDraft(
            summary=f"基于 {search_results.total_count()} 条搜索结果的初步分析。Exa {len(search_results.exa_results)} 条，App Store {len(search_results.appstore_results)} 条，Google Play {len(search_results.gp_results)} 条。",
            category_analysis=category_analysis,
            insights=[],
            risks=["数据量不足，分析可能不够深入"],
            opportunities=["建议增加搜索关键词以获取更多数据"],
            data_quality=DataQuality(
                exa_coverage=coverage["exa"],
                appstore_coverage=coverage["appstore"],
                overall_confidence=overall,
            ),
        )
