"""
Reporter — Step 5 of the Agentic Engine.
Assembles and saves the final report to the database.
"""
import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from db.database import (
    get_db,
    save_report,
    save_report_metric,
    save_raw_data,
    update_execution,
)
from db.models import Execution, Report, RawData

from .types import AnalysisDraft, ExecutionPlan, SearchResults

logger = logging.getLogger(__name__)


class Reporter:
    """Step 5: Assemble and persist the final report."""

    def __init__(self):
        pass

    async def generate_report(
        self,
        draft: AnalysisDraft,
        category_slugs: list[str],
        iteration_depth: int,
        parent_report_id: int | None = None,
    ) -> int:
        """
        Generate and save the final report.

        Args:
            draft: The analysis draft.
            category_slugs: List of category slugs analyzed.
            iteration_depth: Current iteration depth.
            parent_report_id: ID of the parent report for iteration.

        Returns:
            The report ID (int).
        """
        now = datetime.now(timezone.utc)
        period = now.strftime("%Y-%m")
        forced_incomplete = iteration_depth >= 3

        # Build report title
        title = f"游戏市场分析报告 {now.strftime('%Y-%m-%d %H:%M')}"

        # Build full_content (markdown)
        full_content = self._build_markdown(draft, forced_incomplete)

        # Build summary (short version for cards)
        # Extract a more meaningful summary
        summary_lines = []
        if draft.summary:
            try:
                # Take first 2-3 sentences
                sentences = draft.summary.split('。')
                summary_lines = [s.strip() for s in sentences[:3] if s.strip()]
            except (AttributeError, TypeError):
                summary_lines = [draft.summary[:300]] if draft.summary else []
        if draft.insights and len(draft.insights) >= 1:
            # Add first insight as summary
            first_insight = draft.insights[0]
            summary_lines.append(f"核心发现: {first_insight.title}")
        summary = "。".join(summary_lines) if summary_lines else (draft.summary[:300] if draft.summary else "")

        # Build insights JSON
        insights_json = [i.to_dict() for i in draft.insights]

        # Build sources (empty for generated report without search context)
        sources = []

        # Build metrics JSON
        metrics = self._build_metrics(draft)

        # Save the report
        report_data: dict[str, Any] = {
            "title": title,
            "summary": summary,
            "full_content": full_content,
            "insights": insights_json,
            "sources": sources,
            "metrics": metrics,
            "status": "published",
            "parent_id": parent_report_id,
            "iteration_depth": iteration_depth,
        }

        # Run sync DB operations in a thread pool to avoid blocking the event loop
        report_id = await asyncio.to_thread(
            self._save_report_and_metrics,
            report_data,
            draft,
            category_slugs,
            period,
        )

        logger.info(
            "Report saved: id=%d, title='%s', iteration=%d",
            report_id,
            title,
            iteration_depth,
        )
        return report_id

    def _save_report_and_metrics(
        self,
        report_data: dict[str, Any],
        draft: AnalysisDraft,
        category_slugs: list[str],
        period: str,
    ) -> int:
        """Sync function that saves report and metrics in a single transaction."""
        with next(get_db()) as db:
            report = save_report(db, report_data)
            report_id = report.id

            for slug, cat in draft.category_analysis.items():
                save_report_metric(
                    db,
                    {
                        "report_id": report_id,
                        "category_slug": slug,
                        "metric_type": "heat_index",
                        "value": cat.heat_index,
                        "period": period,
                    },
                )

            return report_id

    def _build_markdown(
        self,
        draft: AnalysisDraft,
        forced_incomplete: bool,
    ) -> str:
        """Build a full markdown report with rich content."""
        lines = [
            f"# 🎮 游戏市场分析报告",
            f"\n> **生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            f"\n---\n",
            f"## 📊 市场概览\n",
            f"\n{draft.summary}",
        ]

        # Executive summary if insights are available
        if draft.insights and len(draft.insights) >= 3:
            lines.append("\n### 📌 核心发现\n")
            for insight in draft.insights[:3]:
                emoji = "📈" if insight.type == "trend" else "⚠️" if insight.type == "risk" else "💡"
                lines.append(f"- {emoji} **{insight.title}**")

        # Category analysis
        if draft.category_analysis:
            lines.append("\n---\n")
            lines.append("\n## 🎯 品类深度分析\n")

            # Calculate total heat index for overview
            total_heat = sum(cat.heat_index for cat in draft.category_analysis.values()) / len(draft.category_analysis)
            lines.append(f"\n> 📈 品类综合热度指数: **{total_heat:.0f}/100**\n")

            for slug, cat in draft.category_analysis.items():
                # Category header with heat bar
                heat_bar = "█" * int(cat.heat_index / 10) + "░" * (10 - int(cat.heat_index / 10))
                lines.append(f"\n### 📁 {slug}\n")
                lines.append(f"\n热度指数: {heat_bar} **{cat.heat_index:.0f}/100**")

                if cat.top_games:
                    lines.append("\n\n**🏆 热门游戏 TOP 5**\n")
                    lines.append("| 排名 | 游戏名称 | 开发商 | 评分 | 点评 |")
                    lines.append("|------|----------|--------|------|------|")
                    for idx, game in enumerate(cat.top_games[:5], 1):
                        name = game.get("name", "N/A")
                        dev = game.get("developer", "未知")
                        rating = game.get("rating", "N/A")
                        insight = game.get("insight", "-")
                        lines.append(f"| {idx} | **{name}** | {dev} | ⭐{rating} | {insight} |")
                    lines.append("")

                if cat.trends:
                    lines.append("\n**📈 市场趋势**\n")
                    for trend in cat.trends:
                        lines.append(f"- {trend}")
                    lines.append("")

                if cat.opportunities:
                    lines.append("\n**💰 市场机会**\n")
                    for opp in cat.opportunities:
                        lines.append(f"- {opp}")
                    lines.append("")

        # Insights section
        if draft.insights:
            lines.append("\n---\n")
            lines.append("\n## 💡 关键洞察\n")

            for i, insight in enumerate(draft.insights, 1):
                emoji = "📈" if insight.type == "trend" else "⚠️" if insight.type == "risk" else "💡"
                type_label = "趋势" if insight.type == "trend" else "风险" if insight.type == "risk" else "机会"
                lines.append(f"\n### {emoji} {i}. {insight.title}\n")
                lines.append(f"\n**类型**: {type_label} | **置信度**: {insight.confidence:.0%}\n")

                if insight.evidence:
                    lines.append("\n**证据支持**:\n")
                    for ev in insight.evidence:
                        lines.append(f"- {ev}")
                lines.append("")

        # Risks section
        if draft.risks:
            lines.append("\n---\n")
            lines.append("\n## ⚠️ 风险提示\n")
            lines.append("\n")
            for risk in draft.risks:
                lines.append(f"> - {risk}\n")

        # Opportunities section
        if draft.opportunities:
            lines.append("\n---\n")
            lines.append("\n## 🌟 市场机会\n")
            lines.append("\n")
            for opp in draft.opportunities:
                lines.append(f"> - {opp}\n")

        # Data quality section
        lines.append("\n---\n")
        lines.append("\n## 📋 数据可信度报告\n")
        lines.append("\n")
        lines.append("| 数据源 | 覆盖率 | 状态 |")
        lines.append("|--------|--------|------|")

        exa_status = "✅ 充足" if draft.data_quality.exa_coverage > 0.6 else "⚠️ 有限" if draft.data_quality.exa_coverage > 0.3 else "❌ 不足"
        appstore_status = "✅ 充足" if draft.data_quality.appstore_coverage > 0.6 else "⚠️ 有限" if draft.data_quality.appstore_coverage > 0.3 else "❌ 不足"
        overall_status = "✅ 高可信" if draft.data_quality.overall_confidence > 0.6 else "⚠️ 中可信" if draft.data_quality.overall_confidence > 0.3 else "❌ 低可信"

        lines.append(f"| Exa 搜索 | {draft.data_quality.exa_coverage:.0%} | {exa_status} |")
        lines.append(f"| App Store | {draft.data_quality.appstore_coverage:.0%} | {appstore_status} |")
        lines.append(f"| **综合置信度** | **{draft.data_quality.overall_confidence:.0%}** | **{overall_status}** |")
        lines.append("")

        # Recommendations
        lines.append("\n---\n")
        lines.append("\n## 📝 建议\n")
        if draft.data_quality.overall_confidence < 0.5:
            lines.append("\n> ⚠️ **注意**: 当前数据置信度较低，建议：\n")
            lines.append("> - 增加更多搜索关键词\n")
            lines.append("> - 扩大数据源覆盖范围\n")
            lines.append("> - 等待更多实时数据更新\n")

        if draft.opportunities and len(draft.opportunities) > 0:
            lines.append("\n> 💡 **行动建议**: 重点关注上述市场机会，选择合适的切入点。\n")

        if forced_incomplete:
            lines.append("\n> ⚠️ **警告**: 由于迭代次数已达上限（3次），数据可能不够完整，建议手动补充分析。\n")

        lines.append("\n---\n")
        lines.append(f"\n*报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n")
        lines.append("*本报告由 AI 自动生成，数据仅供参考*\n")

        return "\n".join(lines)

    def _build_metrics(self, draft: AnalysisDraft) -> dict[str, Any]:
        """Build the metrics dict for the report."""
        category_rankings = []
        for slug, cat in draft.category_analysis.items():
            category_rankings.append(
                {
                    "slug": slug,
                    "heat_index": cat.heat_index,
                    "trends": cat.trends,
                }
            )
        category_rankings.sort(key=lambda x: x["heat_index"], reverse=True)

        return {
            "category_rankings": category_rankings,
            "total_insights": len(draft.insights),
            "total_risks": len(draft.risks),
            "total_opportunities": len(draft.opportunities),
            "overall_confidence": draft.data_quality.overall_confidence,
        }

    async def _save_metrics(
        self,
        db: Session,
        report_id: int,
        draft: AnalysisDraft,
        category_slugs: list[str],
        period: str,
    ) -> None:
        """Persist per-category metrics to report_metrics table."""
        for slug, cat in draft.category_analysis.items():
            save_report_metric(
                db,
                {
                    "report_id": report_id,
                    "category_slug": slug,
                    "metric_type": "heat_index",
                    "value": cat.heat_index,
                    "period": period,
                },
            )
