"""Experience domain entity."""

from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Optional, Any
from uuid import UUID, uuid4


@dataclass
class Experience:
    """Experience domain entity representing a work/education/project experience."""

    id: UUID = field(default_factory=uuid4)
    user_id: UUID = field(default_factory=uuid4)
    type: str = "work"  # work, education, project
    title: str = ""
    organization: Optional[str] = None
    location: Optional[str] = None
    start_date: date = field(default_factory=date.today)
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    description_ai: Optional[str] = None
    skills: list[str] = field(default_factory=list)
    achievements: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    order_index: int = 0
    is_highlighted: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def create(
        cls,
        user_id: UUID,
        type: str,
        title: str,
        organization: Optional[str] = None,
        location: Optional[str] = None,
        start_date: date = None,
        end_date: Optional[date] = None,
        is_current: bool = False,
        description: Optional[str] = None,
        skills: Optional[list[str]] = None,
        achievements: Optional[list[str]] = None,
        metadata: Optional[dict[str, Any]] = None,
        order_index: int = 0,
        is_highlighted: bool = False,
    ) -> "Experience":
        """Create a new Experience entity.

        Args:
            user_id: The user's UUID.
            type: Experience type (work, education, project).
            title: Job title/degree/project name.
            organization: Company/school name (optional).
            location: Location (optional).
            start_date: Start date (defaults to today).
            end_date: End date (optional, None if current).
            is_current: Whether this is the current position.
            description: Raw description (optional).
            skills: List of skills (optional).
            achievements: List of achievements (optional).
            metadata: Additional metadata (optional).
            order_index: Display order index.
            is_highlighted: Whether to highlight this experience.

        Returns:
            New Experience instance.
        """
        now = datetime.utcnow()
        return cls(
            id=uuid4(),
            user_id=user_id,
            type=type.strip().lower(),
            title=title.strip(),
            organization=organization.strip() if organization else None,
            location=location.strip() if location else None,
            start_date=start_date or date.today(),
            end_date=end_date,
            is_current=is_current,
            description=description.strip() if description else None,
            description_ai=None,
            skills=skills or [],
            achievements=achievements or [],
            metadata=metadata or {},
            order_index=order_index,
            is_highlighted=is_highlighted,
            created_at=now,
            updated_at=now,
        )

    def update(self, **kwargs) -> None:
        """Update experience fields."""
        allowed_fields = {
            "type",
            "title",
            "organization",
            "location",
            "start_date",
            "end_date",
            "is_current",
            "description",
            "skills",
            "achievements",
            "metadata",
            "order_index",
            "is_highlighted",
        }
        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                if key in {"type", "title", "organization", "location", "description"}:
                    setattr(self, key, str(value).strip())
                else:
                    setattr(self, key, value)
        self.updated_at = datetime.utcnow()

    def toggle_current(self) -> None:
        """Toggle the is_current status."""
        self.is_current = not self.is_current
        if self.is_current:
            self.end_date = None
        self.updated_at = datetime.utcnow()

    def toggle_highlighted(self) -> None:
        """Toggle the is_highlighted status."""
        self.is_highlighted = not self.is_highlighted
        self.updated_at = datetime.utcnow()

    def set_ai_description(self, description_ai: str) -> None:
        """Set AI-optimized description.

        Args:
            description_ai: AI-optimized description text.
        """
        self.description_ai = description_ai.strip()
        self.updated_at = datetime.utcnow()

    def clear_ai_description(self) -> None:
        """Clear AI-optimized description."""
        self.description_ai = None
        self.updated_at = datetime.utcnow()

    def add_skill(self, skill: str) -> None:
        """Add a skill to the skills list.

        Args:
            skill: Skill to add.
        """
        skill = skill.strip()
        if skill and skill not in self.skills:
            self.skills.append(skill)
            self.updated_at = datetime.utcnow()

    def remove_skill(self, skill: str) -> None:
        """Remove a skill from the skills list.

        Args:
            skill: Skill to remove.
        """
        skill = skill.strip()
        if skill in self.skills:
            self.skills.remove(skill)
            self.updated_at = datetime.utcnow()

    def add_achievement(self, achievement: str) -> None:
        """Add an achievement to the achievements list.

        Args:
            achievement: Achievement to add.
        """
        achievement = achievement.strip()
        if achievement and achievement not in self.achievements:
            self.achievements.append(achievement)
            self.updated_at = datetime.utcnow()

    def remove_achievement(self, achievement: str) -> None:
        """Remove an achievement from the achievements list.

        Args:
            achievement: Achievement to remove.
        """
        achievement = achievement.strip()
        if achievement in self.achievements:
            self.achievements.remove(achievement)
            self.updated_at = datetime.utcnow()

    @property
    def duration(self) -> Optional[str]:
        """Get formatted duration string."""
        if not self.start_date:
            return None

        end = self.end_date or date.today()
        delta = end - self.start_date
        years = delta.days // 365
        months = (delta.days % 365) // 30

        parts = []
        if years > 0:
            parts.append(f"{years} year{'s' if years > 1 else ''}")
        if months > 0:
            parts.append(f"{months} month{'s' if months > 1 else ''}")

        return " ".join(parts) if parts else "Less than a month"

    @property
    def display_period(self) -> str:
        """Get formatted display period."""
        start_str = self.start_date.strftime("%b %Y") if self.start_date else ""
        if self.is_current or not self.end_date:
            end_str = "Present"
        else:
            end_str = self.end_date.strftime("%b %Y") if self.end_date else ""
        return f"{start_str} - {end_str}"
