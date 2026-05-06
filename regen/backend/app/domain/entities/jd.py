"""JD (Job Description) domain entity."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Any
from uuid import UUID, uuid4


@dataclass
class JD:
    """JD domain entity representing a job description."""

    id: UUID = field(default_factory=uuid4)
    company_name: str = ""
    position_title: str = ""
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    raw_content: str = ""
    analysis: Optional[dict[str, Any]] = None
    source: Optional[str] = None
    is_analyzed: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def create(
        cls,
        company_name: str,
        position_title: str,
        raw_content: str,
        location: Optional[str] = None,
        salary_min: Optional[int] = None,
        salary_max: Optional[int] = None,
        source: Optional[str] = None,
    ) -> "JD":
        """Create a new JD entity.

        Args:
            company_name: Name of the company.
            position_title: Job position title.
            raw_content: Raw JD content/text.
            location: Job location (optional).
            salary_min: Minimum salary (optional).
            salary_max: Maximum salary (optional).
            source: Source of the JD (optional).

        Returns:
            New JD instance.
        """
        now = datetime.utcnow()
        return cls(
            id=uuid4(),
            company_name=company_name.strip(),
            position_title=position_title.strip(),
            raw_content=raw_content.strip(),
            location=location.strip() if location else None,
            salary_min=salary_min,
            salary_max=salary_max,
            source=source.strip() if source else None,
            is_analyzed=False,
            analysis=None,
            created_at=now,
            updated_at=now,
        )

    def update(self, **kwargs) -> None:
        """Update JD fields."""
        allowed_fields = {
            "company_name",
            "position_title",
            "location",
            "salary_min",
            "salary_max",
            "raw_content",
            "source",
        }
        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                if key in {
                    "company_name",
                    "position_title",
                    "raw_content",
                    "location",
                    "source",
                }:
                    setattr(self, key, str(value).strip())
                else:
                    setattr(self, key, value)
        self.updated_at = datetime.utcnow()

    def set_analysis(self, analysis: dict[str, Any]) -> None:
        """Set AI analysis result.

        Args:
            analysis: Analysis result dictionary.
        """
        self.analysis = analysis
        self.is_analyzed = True
        self.updated_at = datetime.utcnow()

    def clear_analysis(self) -> None:
        """Clear AI analysis result."""
        self.analysis = None
        self.is_analyzed = False
        self.updated_at = datetime.utcnow()

    @property
    def salary_range(self) -> Optional[str]:
        """Get formatted salary range."""
        if self.salary_min and self.salary_max:
            return f"{self.salary_min:,} - {self.salary_max:,}"
        elif self.salary_min:
            return f"{self.salary_min:,}+"
        elif self.salary_max:
            return f"Up to {self.salary_max:,}"
        return None
