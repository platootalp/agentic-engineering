"""
Core data structures for the Agentic Engine.
"""
from dataclasses import dataclass, field
from typing import Any


# ─── ExecutionPlan (planner output) ───────────────────────────────────────────


@dataclass
class SearchQuery:
    category: str
    queries: list[str]
    data_source: str  # "exa" | "appstore" | "google_play"
    focus_areas: list[str] = field(default_factory=list)


@dataclass
class ExecutionPlan:
    search_queries: list[SearchQuery] = field(default_factory=list)
    analysis_dimensions: list[str] = field(default_factory=list)
    expected_sources: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "search_queries": [
                {
                    "category": sq.category,
                    "queries": sq.queries,
                    "data_source": sq.data_source,
                    "focus_areas": sq.focus_areas,
                }
                for sq in self.search_queries
            ],
            "analysis_dimensions": self.analysis_dimensions,
            "expected_sources": self.expected_sources,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ExecutionPlan":
        return cls(
            search_queries=[
                SearchQuery(**sq) for sq in data.get("search_queries", [])
            ],
            analysis_dimensions=data.get("analysis_dimensions", []),
            expected_sources=data.get("expected_sources", []),
        )


# ─── SearchResults (searcher output) ─────────────────────────────────────────


@dataclass
class SearchResults:
    exa_results: list[dict[str, Any]] = field(default_factory=list)
    appstore_results: list[dict[str, Any]] = field(default_factory=list)
    gp_results: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "exa_results": self.exa_results,
            "appstore_results": self.appstore_results,
            "gp_results": self.gp_results,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "SearchResults":
        return cls(
            exa_results=data.get("exa_results", []),
            appstore_results=data.get("appstore_results", []),
            gp_results=data.get("gp_results", []),
        )

    def total_count(self) -> int:
        return len(self.exa_results) + len(self.appstore_results) + len(self.gp_results)

    def coverage_score(self) -> dict[str, float]:
        """Estimate coverage based on result counts (0.0 - 1.0)."""
        exa = min(len(self.exa_results) / 20, 1.0)
        appstore = min(len(self.appstore_results) / 10, 1.0)
        gp = min(len(self.gp_results) / 10, 1.0)
        return {"exa": exa, "appstore": appstore, "google_play": gp}


# ─── AnalysisDraft (analyzer output) ──────────────────────────────────────────


@dataclass
class Insight:
    type: str  # "trend" | "risk" | "opportunity"
    title: str
    evidence: list[str] = field(default_factory=list)
    confidence: float = 0.5

    def to_dict(self) -> dict[str, Any]:
        return {
            "type": self.type,
            "title": self.title,
            "evidence": self.evidence,
            "confidence": self.confidence,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Insight":
        return cls(
            type=data.get("type", "trend"),
            title=data.get("title", ""),
            evidence=data.get("evidence", []),
            confidence=data.get("confidence", 0.5),
        )


@dataclass
class CategoryAnalysis:
    heat_index: float = 50.0
    top_games: list[dict[str, Any]] = field(default_factory=list)
    trends: list[str] = field(default_factory=list)
    opportunities: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "heat_index": self.heat_index,
            "top_games": self.top_games,
            "trends": self.trends,
            "opportunities": self.opportunities,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CategoryAnalysis":
        return cls(
            heat_index=data.get("heat_index", 50.0),
            top_games=data.get("top_games", []),
            trends=data.get("trends", []),
            opportunities=data.get("opportunities", []),
        )


@dataclass
class DataQuality:
    exa_coverage: float = 0.5
    appstore_coverage: float = 0.5
    overall_confidence: float = 0.5

    def to_dict(self) -> dict[str, Any]:
        return {
            "exa_coverage": self.exa_coverage,
            "appstore_coverage": self.appstore_coverage,
            "overall_confidence": self.overall_confidence,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "DataQuality":
        return cls(
            exa_coverage=data.get("exa_coverage", 0.5),
            appstore_coverage=data.get("appstore_coverage", 0.5),
            overall_confidence=data.get("overall_confidence", 0.5),
        )


@dataclass
class AnalysisDraft:
    summary: str = ""
    category_analysis: dict[str, CategoryAnalysis] = field(default_factory=dict)
    insights: list[Insight] = field(default_factory=list)
    risks: list[str] = field(default_factory=list)
    opportunities: list[str] = field(default_factory=list)
    data_quality: DataQuality = field(default_factory=DataQuality)

    def to_dict(self) -> dict[str, Any]:
        return {
            "summary": self.summary,
            "category_analysis": {
                k: v.to_dict() for k, v in self.category_analysis.items()
            },
            "insights": [i.to_dict() for i in self.insights],
            "risks": self.risks,
            "opportunities": self.opportunities,
            "data_quality": self.data_quality.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "AnalysisDraft":
        category_analysis = {
            k: CategoryAnalysis.from_dict(v)
            for k, v in data.get("category_analysis", {}).items()
        }
        insights = [Insight.from_dict(i) for i in data.get("insights", [])]
        return cls(
            summary=data.get("summary", ""),
            category_analysis=category_analysis,
            insights=insights,
            risks=data.get("risks", []),
            opportunities=data.get("opportunities", []),
            data_quality=DataQuality.from_dict(data.get("data_quality", {})),
        )


# ─── VerificationResult (verifier output) ─────────────────────────────────────


@dataclass
class VerificationResult:
    passed: bool
    reasons: list[str] = field(default_factory=list)
    suggested_fixes: list[str] = field(default_factory=list)

    @classmethod
    def pass_result(cls, reason: str = "All checks passed") -> "VerificationResult":
        return cls(passed=True, reasons=[reason])

    @classmethod
    def fail(cls, reasons: list[str], suggested_fixes: list[str] | None = None) -> "VerificationResult":
        return cls(passed=False, reasons=reasons, suggested_fixes=suggested_fixes or [])
