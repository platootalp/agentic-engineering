"""
Verifier — Step 4 of the Agentic Engine.
Validates an AnalysisDraft against 4 rule checks.
"""
import logging

from db.models import Category

from .types import AnalysisDraft, VerificationResult

logger = logging.getLogger(__name__)

# ─── Verification rules ────────────────────────────────────────────────────────


class Verifier:
    """Step 4: Verify AnalysisDraft quality."""

    def __init__(self, expected_categories: list[str] | None = None):
        """
        Args:
            expected_categories: List of category slugs that should be covered.
                                 If None, skip category coverage check.
        """
        self._expected = set(expected_categories or [])

    async def verify(self, draft: AnalysisDraft) -> VerificationResult:
        """
        Run all 4 verification checks.

        1. Data completeness — are all expected categories covered?
        2. Credibility check — overall_confidence >= 0.6
        3. Insight validity — each insight has evidence?
        4. Logical consistency — insights don't contradict each other?
        """
        failures: list[str] = []
        fixes: list[str] = []

        # 1. Data completeness
        missing = self._check_completeness(draft)
        if missing:
            failures.append(f"缺少以下品类的分析数据: {', '.join(missing)}")
            fixes.append("扩大搜索范围，确保所有品类都有足够数据")

        # 2. Credibility
        if draft.data_quality.overall_confidence < 0.6:
            failures.append(
                f"数据可信度过低 (confidence={draft.data_quality.overall_confidence:.2f} < 0.6)"
            )
            fixes.append("增加更多数据源搜索结果，或延长搜索关键词")

        # 3. Insight validity
        invalid_insights = self._check_insight_validity(draft)
        if invalid_insights:
            failures.append(f"以下洞察缺少证据支撑: {', '.join(invalid_insights)}")
            fixes.append("为每条洞察补充具体数据来源")

        # 4. Logical consistency
        contradictions = self._check_consistency(draft)
        if contradictions:
            failures.append(f"洞察逻辑矛盾: {contradictions}")
            fixes.append("检查对立洞察，确保分析结论一致")

        if failures:
            logger.info("Verification failed: %s", failures)
            return VerificationResult.fail(failures, fixes)

        return VerificationResult.pass_result("All verification checks passed")

    def _check_completeness(self, draft: AnalysisDraft) -> list[str]:
        """Return list of missing category slugs."""
        if not self._expected:
            return []
        covered = set(draft.category_analysis.keys())
        missing = [c for c in self._expected if c not in covered]
        return missing

    def _check_insight_validity(self, draft: AnalysisDraft) -> list[str]:
        """Return titles of insights without evidence."""
        invalid = []
        for insight in draft.insights:
            if insight.type == "trend":
                # Trends must have evidence
                if not insight.evidence:
                    invalid.append(insight.title)
                elif len(insight.evidence) < 1:
                    invalid.append(insight.title)
            # risk / opportunity can be inferred without evidence
        return invalid

    def _check_consistency(self, draft: AnalysisDraft) -> list[str]:
        """Check for contradictory insights."""
        contradictions = []

        # Build a map of positive vs negative trend keywords
        positive_kw = {"上升", "增长", "热门", "爆发", "上涨", "上升趋势", "增长趋势", "hot", "rising", "growing"}
        negative_kw = {"下降", "下跌", "萎缩", "下降趋势", "冷门", "falling", "declining", "shrinking"}

        for i, insight_a in enumerate(draft.insights):
            if insight_a.type != "trend":
                continue
            title_lower = insight_a.title.lower()

            for insight_b in draft.insights[i + 1 :]:
                if insight_b.type != "trend":
                    continue
                title_b_lower = insight_b.title.lower()

                # Check for contradictory keywords
                a_pos = any(kw in title_lower for kw in positive_kw)
                a_neg = any(kw in title_lower for kw in negative_kw)
                b_pos = any(kw in title_b_lower for kw in positive_kw)
                b_neg = any(kw in title_b_lower for kw in negative_kw)

                if (a_pos and b_neg) or (a_neg and b_pos):
                    contradictions.append(
                        f"'{insight_a.title}' vs '{insight_b.title}'"
                    )

        return contradictions
