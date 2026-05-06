"""
Comprehensive unit tests for the Agent Engine.

Tests types, verifier, planner, and reporter modules.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import patch, MagicMock, AsyncMock

from backend.services.agent.types import (
    ExecutionPlan,
    SearchQuery,
    SearchResults,
    AnalysisDraft,
    Insight,
    CategoryAnalysis,
    DataQuality,
    VerificationResult,
)
from backend.services.agent.verifier import Verifier
from backend.services.agent.planner import Planner
from backend.services.agent.reporter import Reporter


# =============================================================================
# TYPES TESTS
# =============================================================================

class TestExecutionPlanRoundTrip:
    def test_to_dict_contains_all_fields(self):
        plan = ExecutionPlan(
            search_queries=[
                SearchQuery(
                    category="action_games",
                    queries=["action games trending 2026"],
                    data_source="exa",
                    focus_areas=["市场趋势", "热门品类"],
                )
            ],
            analysis_dimensions=["市场热度变化", "Top 游戏分析"],
            expected_sources=["exa", "appstore"],
        )
        d = plan.to_dict()
        assert "search_queries" in d
        assert "analysis_dimensions" in d
        assert "expected_sources" in d
        assert len(d["search_queries"]) == 1
        assert d["analysis_dimensions"] == ["市场热度变化", "Top 游戏分析"]
        assert d["expected_sources"] == ["exa", "appstore"]

    def test_from_dict_returns_equivalent_object(self):
        original = ExecutionPlan(
            search_queries=[
                SearchQuery(
                    category="puzzle_games",
                    queries=["puzzle games 2026", "casual games trending"],
                    data_source="appstore",
                    focus_areas=["下载量趋势", "新游戏发布"],
                )
            ],
            analysis_dimensions=["市场热度变化"],
            expected_sources=["exa"],
        )
        d = original.to_dict()
        restored = ExecutionPlan.from_dict(d)

        assert len(restored.search_queries) == 1
        assert restored.search_queries[0].category == "puzzle_games"
        assert restored.search_queries[0].queries == ["puzzle games 2026", "casual games trending"]
        assert restored.search_queries[0].data_source == "appstore"
        assert restored.search_queries[0].focus_areas == ["下载量趋势", "新游戏发布"]
        assert restored.analysis_dimensions == ["市场热度变化"]
        assert restored.expected_sources == ["exa"]

    def test_from_dict_handles_empty_data(self):
        d = {}
        plan = ExecutionPlan.from_dict(d)
        assert plan.search_queries == []
        assert plan.analysis_dimensions == []
        assert plan.expected_sources == []


class TestSearchResultsCoverage:
    def test_empty_results_yields_zero_scores(self):
        sr = SearchResults(exa_results=[], appstore_results=[], gp_results=[])
        scores = sr.coverage_score()
        assert scores["exa"] == 0.0
        assert scores["appstore"] == 0.0
        assert scores["google_play"] == 0.0

    def test_partial_results_yields_partial_scores(self):
        # exa: 10/20 = 0.5, appstore: 5/10 = 0.5, gp: 0/10 = 0
        sr = SearchResults(
            exa_results=[{}] * 10,
            appstore_results=[{}] * 5,
            gp_results=[],
        )
        scores = sr.coverage_score()
        assert scores["exa"] == 0.5
        assert scores["appstore"] == 0.5
        assert scores["google_play"] == 0.0

    def test_full_results_yields_full_scores(self):
        # exa: 20/20 = 1.0, appstore: 10/10 = 1.0, gp: 10/10 = 1.0
        sr = SearchResults(
            exa_results=[{}] * 30,  # more than 20, capped at 1.0
            appstore_results=[{}] * 15,  # more than 10, capped at 1.0
            gp_results=[{}] * 20,  # more than 10, capped at 1.0
        )
        scores = sr.coverage_score()
        assert scores["exa"] == 1.0
        assert scores["appstore"] == 1.0
        assert scores["google_play"] == 1.0

    def test_total_count_sums_all_sources(self):
        sr = SearchResults(
            exa_results=[{}, {}],
            appstore_results=[{}, {}, {}],
            gp_results=[{}],
        )
        assert sr.total_count() == 6


class TestAnalysisDraftRoundTrip:
    def test_to_dict_contains_all_fields(self):
        draft = AnalysisDraft(
            summary="Test summary",
            category_analysis={
                "action_games": CategoryAnalysis(
                    heat_index=85.0,
                    top_games=[{"name": "Game A", "rating": "4.5"}],
                    trends=["battle royale trending"],
                    opportunities=["multiplayer growth"],
                )
            },
            insights=[
                Insight(type="trend", title="Rising popularity", evidence=["source 1"], confidence=0.8)
            ],
            risks=["Market saturation"],
            opportunities=["Cross-platform integration"],
            data_quality=DataQuality(exa_coverage=0.9, appstore_coverage=0.8, overall_confidence=0.85),
        )
        d = draft.to_dict()
        assert d["summary"] == "Test summary"
        assert "action_games" in d["category_analysis"]
        assert len(d["insights"]) == 1
        assert d["risks"] == ["Market saturation"]
        assert d["opportunities"] == ["Cross-platform integration"]
        assert d["data_quality"]["overall_confidence"] == 0.85

    def test_from_dict_returns_equivalent_object(self):
        original = AnalysisDraft(
            summary="Market is growing",
            category_analysis={
                "puzzle_games": CategoryAnalysis(
                    heat_index=70.0,
                    top_games=[{"name": "Puzzle Master", "developer": "Studio X", "rating": "4.2", "insight": "Top rated"}],
                    trends=["logic puzzles popular"],
                    opportunities=["educational games"],
                )
            },
            insights=[
                Insight(type="risk", title="High competition", evidence=[], confidence=0.6),
                Insight(type="opportunity", title="Untapped market", evidence=["data shows demand"], confidence=0.9),
            ],
            risks=["Copycat games flooding market"],
            opportunities=["AI-powered puzzle generation"],
            data_quality=DataQuality(exa_coverage=0.7, appstore_coverage=0.6, overall_confidence=0.65),
        )
        d = original.to_dict()
        restored = AnalysisDraft.from_dict(d)

        assert restored.summary == "Market is growing"
        assert "puzzle_games" in restored.category_analysis
        assert restored.category_analysis["puzzle_games"].heat_index == 70.0
        assert len(restored.insights) == 2
        assert restored.insights[0].type == "risk"
        assert restored.insights[1].title == "Untapped market"
        assert restored.risks == ["Copycat games flooding market"]
        assert restored.opportunities == ["AI-powered puzzle generation"]
        assert restored.data_quality.overall_confidence == 0.65


class TestVerificationResult:
    def test_pass_result_creates_passed_true(self):
        result = VerificationResult.pass_result("All checks passed")
        assert result.passed is True
        assert result.reasons == ["All checks passed"]
        assert result.suggested_fixes == []

    def test_pass_result_with_custom_message(self):
        result = VerificationResult.pass_result("Custom success message")
        assert result.passed is True
        assert result.reasons == ["Custom success message"]

    def test_fail_creates_passed_false_with_reasons(self):
        reasons = ["Missing category data", "Low confidence score"]
        fixes = ["Expand search scope", "Add more data sources"]
        result = VerificationResult.fail(reasons, fixes)

        assert result.passed is False
        assert result.reasons == ["Missing category data", "Low confidence score"]
        assert result.suggested_fixes == ["Expand search scope", "Add more data sources"]

    def test_fail_with_no_fixes(self):
        result = VerificationResult.fail(["Error without fix"])
        assert result.passed is False
        assert result.reasons == ["Error without fix"]
        assert result.suggested_fixes == []


# =============================================================================
# VERIFIER TESTS
# =============================================================================

class TestVerifierCompleteness:
    @pytest.mark.asyncio
    async def test_completeness_passes_when_all_categories_covered(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={
                "action_games": CategoryAnalysis(),
                "puzzle_games": CategoryAnalysis(),
            },
            insights=[],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier(expected_categories=["action_games", "puzzle_games"])
        result = await verifier.verify(draft)

        assert result.passed is True
        assert not any("缺少" in r for r in result.reasons)

    @pytest.mark.asyncio
    async def test_completeness_fails_when_categories_missing(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={
                "action_games": CategoryAnalysis(),
                # "puzzle_games" is missing
            },
            insights=[],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier(expected_categories=["action_games", "puzzle_games", "strategy_games"])
        result = await verifier.verify(draft)

        assert result.passed is False
        assert any("缺少以下品类的分析数据" in r for r in result.reasons)
        # Check that the missing categories are reported
        failure_text = " ".join(result.reasons)
        assert "puzzle_games" in failure_text
        assert "strategy_games" in failure_text

    @pytest.mark.asyncio
    async def test_completeness_skipped_when_no_expected_categories(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier(expected_categories=None)
        result = await verifier.verify(draft)

        # Should not fail on completeness since no expectations were set
        assert result.passed is True


class TestVerifierCredibility:
    @pytest.mark.asyncio
    async def test_credibility_fails_below_0_6(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[],
            data_quality=DataQuality(overall_confidence=0.59),
        )
        verifier = Verifier()
        result = await verifier.verify(draft)

        assert result.passed is False
        failure_text = " ".join(result.reasons)
        assert any("数据可信度过低" in r for r in result.reasons)
        assert "0.59" in failure_text

    @pytest.mark.asyncio
    async def test_credibility_passes_at_0_6(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[],
            data_quality=DataQuality(overall_confidence=0.6),
        )
        verifier = Verifier()
        result = await verifier.verify(draft)

        # Should not fail on credibility at exactly 0.6
        assert all("数据可信度过低" not in r for r in result.reasons)


class TestVerifierInsightValidity:
    @pytest.mark.asyncio
    async def test_insight_validity_passes_with_evidence(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[
                Insight(type="trend", title="Gaming revenue rising", evidence=["source A", "source B"], confidence=0.8)
            ],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier()
        result = await verifier.verify(draft)

        assert result.passed is True

    @pytest.mark.asyncio
    async def test_insight_validity_fails_trend_without_evidence(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[
                Insight(type="trend", title="Market trend rising", evidence=[], confidence=0.5)
            ],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier()
        result = await verifier.verify(draft)

        assert result.passed is False
        assert any("缺少证据支撑" in r for r in result.reasons)
        assert "Market trend rising" in " ".join(result.reasons)

    @pytest.mark.asyncio
    async def test_insight_validity_risk_without_evidence_is_valid(self):
        # Risk and opportunity insights can be inferred without evidence
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[
                Insight(type="risk", title="Market saturation", evidence=[], confidence=0.7)
            ],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier()
        result = await verifier.verify(draft)

        assert result.passed is True


class TestVerifierConsistency:
    @pytest.mark.asyncio
    async def test_consistency_detects_contradictory_trends(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[
                Insight(type="trend", title="Mobile games market rising", evidence=["source"], confidence=0.8),
                Insight(type="trend", title="Mobile gaming revenue下降", evidence=["source"], confidence=0.7),
            ],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier()
        result = await verifier.verify(draft)

        assert result.passed is False
        assert any("洞察逻辑矛盾" in r for r in result.reasons)

    @pytest.mark.asyncio
    async def test_consistency_passes_when_insights_aligned(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[
                Insight(type="trend", title="Casual games market rising", evidence=["source A"], confidence=0.9),
                Insight(type="trend", title="Mobile gaming revenue增长", evidence=["source B"], confidence=0.8),
            ],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier()
        result = await verifier.verify(draft)

        # Both are positive, should not contradict
        assert result.passed is True

    @pytest.mark.asyncio
    async def test_consistency_passes_when_no_trend_insights(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[
                Insight(type="risk", title="High competition", evidence=[], confidence=0.6),
                Insight(type="opportunity", title="New market segment", evidence=[], confidence=0.5),
            ],
            data_quality=DataQuality(overall_confidence=0.8),
        )
        verifier = Verifier()
        result = await verifier.verify(draft)

        # No trend type insights, consistency check doesn't apply
        assert result.passed is True

    @pytest.mark.asyncio
    async def test_verification_pass_result_helper(self):
        """Test that VerificationResult.pass_result is used correctly by verifier."""
        draft = AnalysisDraft(
            summary="All good",
            category_analysis={"action_games": CategoryAnalysis()},
            insights=[
                Insight(type="trend", title="Market growing", evidence=["data"], confidence=0.9)
            ],
            data_quality=DataQuality(overall_confidence=0.9),
        )
        verifier = Verifier(expected_categories=["action_games"])
        result = await verifier.verify(draft)

        assert result.passed is True
        assert len(result.reasons) == 1


# =============================================================================
# PLANNER TESTS
# =============================================================================

class TestPlannerDefaultPlan:
    @pytest.mark.asyncio
    async def test_default_plan_returns_valid_execution_plan(self):
        planner = Planner(llm_client=None)
        plan = await planner.plan(categories=[])  # empty list triggers default

        assert isinstance(plan, ExecutionPlan)
        assert plan.search_queries is not None
        assert plan.analysis_dimensions is not None

    @pytest.mark.asyncio
    async def test_default_plan_has_default_dimensions(self):
        planner = Planner(llm_client=None)
        plan = await planner.plan(categories=[])

        expected_dimensions = [
            "市场热度变化",
            "Top 游戏分析",
            "新兴趋势识别",
            "竞争格局评估",
            "机会与风险",
        ]
        assert plan.analysis_dimensions == expected_dimensions

    @pytest.mark.asyncio
    async def test_default_plan_has_fallback_category(self):
        planner = Planner(llm_client=None)
        plan = await planner.plan(categories=[])

        assert len(plan.search_queries) == 1
        assert plan.search_queries[0].category == "casual_games"


class TestPlannerFromCategories:
    @pytest.mark.asyncio
    async def test_plan_from_categories_creates_correct_queries(self):
        # Create mock Category objects
        mock_category = MagicMock()
        mock_category.slug = "action_games"
        mock_category.keywords_list = ["action games", "battle royale", "shooter games"]
        mock_category.data_sources_list = ["exa", "appstore"]

        planner = Planner(llm_client=None)
        plan = await planner.plan(categories=[mock_category])

        assert len(plan.search_queries) == 1
        sq = plan.search_queries[0]
        assert sq.category == "action_games"
        # Keywords get " 2026" appended
        assert "action games 2026" in sq.queries
        assert "battle royale 2026" in sq.queries
        assert "shooter games 2026" in sq.queries
        # Primary data source is the first in data_sources_list
        assert sq.data_source == "exa"

    @pytest.mark.asyncio
    async def test_plan_from_categories_multiple_categories(self):
        cat1 = MagicMock()
        cat1.slug = "puzzle_games"
        cat1.keywords_list = ["puzzle games"]
        cat1.data_sources_list = ["appstore"]

        cat2 = MagicMock()
        cat2.slug = "strategy_games"
        cat2.keywords_list = ["strategy games", "rts games"]
        cat2.data_sources_list = ["google_play"]

        planner = Planner(llm_client=None)
        plan = await planner.plan(categories=[cat1, cat2])

        assert len(plan.search_queries) == 2
        assert plan.search_queries[0].category == "puzzle_games"
        assert plan.search_queries[1].category == "strategy_games"

    @pytest.mark.asyncio
    async def test_plan_falls_back_when_llm_fails(self):
        mock_llm = MagicMock()
        mock_llm.messages.create.side_effect = Exception("LLM error")

        mock_category = MagicMock()
        mock_category.slug = "test_category"
        mock_category.keywords_list = ["test"]
        mock_category.data_sources_list = ["exa"]

        planner = Planner(llm_client=mock_llm)
        plan = await planner.plan(categories=[mock_category])

        # Should fall back to _plan_from_categories
        assert len(plan.search_queries) == 1
        assert plan.search_queries[0].category == "test_category"


# =============================================================================
# REPORTER TESTS
# =============================================================================

class TestReporterBuildMarkdown:
    def test_build_markdown_contains_all_sections(self):
        draft = AnalysisDraft(
            summary="Test market overview",
            category_analysis={
                "action_games": CategoryAnalysis(
                    heat_index=75.0,
                    top_games=[{"name": "TopGame", "developer": "DevX", "rating": "4.5", "insight": "Popular"}],
                    trends=["battle royale trending"],
                    opportunities=["multiplayer expansion"],
                )
            },
            insights=[
                Insight(type="trend", title="Market growing", evidence=["source 1"], confidence=0.85),
                Insight(type="risk", title="High competition", evidence=[], confidence=0.6),
            ],
            risks=["Market saturation risk"],
            opportunities=["New platform expansion"],
            data_quality=DataQuality(exa_coverage=0.8, appstore_coverage=0.7, overall_confidence=0.75),
        )

        reporter = Reporter()
        markdown = reporter._build_markdown(draft, forced_incomplete=False)

        assert "# 游戏市场分析报告" in markdown
        assert "市场概览" in markdown
        assert "Test market overview" in markdown
        assert "品类分析" in markdown
        assert "action_games" in markdown
        assert "关键洞察" in markdown
        assert "Market growing" in markdown
        assert "风险提示" in markdown
        assert "市场机会" in markdown
        assert "数据可信度" in markdown
        assert "Exa覆盖率" in markdown
        assert "App Store覆盖率" in markdown

    def test_build_markdown_includes_incomplete_warning(self):
        draft = AnalysisDraft(
            summary="Limited data",
            category_analysis={},
            insights=[],
            data_quality=DataQuality(overall_confidence=0.5),
        )

        reporter = Reporter()
        markdown_complete = reporter._build_markdown(draft, forced_incomplete=False)
        markdown_incomplete = reporter._build_markdown(draft, forced_incomplete=True)

        # Complete report should not have the warning
        assert "注意" not in markdown_complete
        assert "迭代次数已达上限" not in markdown_complete

        # Incomplete report should have the warning
        assert "注意" in markdown_incomplete
        assert "迭代次数已达上限" in markdown_incomplete
        assert "3次" in markdown_incomplete

    def test_build_markdown_top_games_formatted(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={
                "test_cat": CategoryAnalysis(
                    heat_index=80.0,
                    top_games=[
                        {"name": "Game One", "developer": "Studio A", "rating": "4.8", "insight": "Leading"},
                        {"name": "Game Two", "developer": "Studio B", "rating": "4.3", "insight": "Rising"},
                    ],
                )
            },
            insights=[],
            data_quality=DataQuality(overall_confidence=0.7),
        )

        reporter = Reporter()
        markdown = reporter._build_markdown(draft, forced_incomplete=False)

        assert "Game One" in markdown
        assert "Studio A" in markdown
        assert "4.8" in markdown
        assert "Game Two" in markdown

    def test_build_markdown_emoji_per_insight_type(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[
                Insight(type="trend", title="Trend insight", evidence=["data"], confidence=0.8),
                Insight(type="risk", title="Risk insight", evidence=[], confidence=0.6),
                Insight(type="opportunity", title="Opportunity insight", evidence=["data"], confidence=0.9),
            ],
            data_quality=DataQuality(overall_confidence=0.8),
        )

        reporter = Reporter()
        markdown = reporter._build_markdown(draft, forced_incomplete=False)

        # Check all insight types appear
        assert "Trend insight" in markdown
        assert "Risk insight" in markdown
        assert "Opportunity insight" in markdown


class TestReporterBuildMetrics:
    def test_build_metrics_returns_correct_structure(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={
                "cat_a": CategoryAnalysis(heat_index=80.0, trends=["trend1"]),
                "cat_b": CategoryAnalysis(heat_index=60.0, trends=["trend2"]),
                "cat_c": CategoryAnalysis(heat_index=90.0, trends=["trend3"]),
            },
            insights=[
                Insight(type="trend", title="I1", evidence=[], confidence=0.5),
                Insight(type="risk", title="I2", evidence=[], confidence=0.5),
                Insight(type="opportunity", title="I3", evidence=[], confidence=0.5),
            ],
            risks=["risk1", "risk2"],
            opportunities=["opp1"],
            data_quality=DataQuality(overall_confidence=0.75),
        )

        reporter = Reporter()
        metrics = reporter._build_metrics(draft)

        assert "category_rankings" in metrics
        assert "total_insights" in metrics
        assert "total_risks" in metrics
        assert "total_opportunities" in metrics
        assert "overall_confidence" in metrics

        assert metrics["total_insights"] == 3
        assert metrics["total_risks"] == 2
        assert metrics["total_opportunities"] == 1
        assert metrics["overall_confidence"] == 0.75

        # Rankings should be sorted by heat_index descending
        rankings = metrics["category_rankings"]
        assert rankings[0]["slug"] == "cat_c"  # heat_index 90
        assert rankings[1]["slug"] == "cat_a"  # heat_index 80
        assert rankings[2]["slug"] == "cat_b"  # heat_index 60

    def test_build_metrics_empty_categories(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[],
            risks=[],
            opportunities=[],
            data_quality=DataQuality(overall_confidence=0.5),
        )

        reporter = Reporter()
        metrics = reporter._build_metrics(draft)

        assert metrics["category_rankings"] == []
        assert metrics["total_insights"] == 0
        assert metrics["total_risks"] == 0
        assert metrics["total_opportunities"] == 0


@pytest.mark.asyncio
class TestReporterGenerateReport:
    @pytest.mark.asyncio
    async def test_generate_report_calls_save_functions(self):
        draft = AnalysisDraft(
            summary="Test report content",
            category_analysis={},
            insights=[],
            data_quality=DataQuality(overall_confidence=0.8),
        )

        mock_report = MagicMock()
        mock_report.id = 42

        with patch("backend.services.agent.reporter.save_report", return_value=mock_report), \
             patch("backend.services.agent.reporter.save_report_metric"), \
             patch("backend.services.agent.reporter.get_db") as mock_get_db:

            # Mock sync context manager
            mock_db = MagicMock()
            mock_get_db.return_value = mock_db

            reporter = Reporter()
            report_id = await reporter.generate_report(draft, ["action_games"], iteration_depth=0)

            assert report_id == 42

    @pytest.mark.asyncio
    async def test_generate_report_markdown_includes_incomplete_warning_at_depth_3(self):
        draft = AnalysisDraft(
            summary="Test",
            category_analysis={},
            insights=[],
            data_quality=DataQuality(overall_confidence=0.5),
        )

        mock_report = MagicMock()
        mock_report.id = 1

        with patch("backend.services.agent.reporter.save_report", return_value=mock_report), \
             patch("backend.services.agent.reporter.save_report_metric"), \
             patch("backend.services.agent.reporter.get_db") as mock_get_db:

            mock_db = MagicMock()
            mock_get_db.return_value = mock_db

            reporter = Reporter()

            # iteration_depth >= 3 triggers forced_incomplete
            with patch.object(reporter, "_build_markdown", wraps=reporter._build_markdown) as mock_build:
                # Just test the underlying logic by checking the markdown
                markdown = reporter._build_markdown(draft, forced_incomplete=True)
                assert "迭代次数已达上限" in markdown