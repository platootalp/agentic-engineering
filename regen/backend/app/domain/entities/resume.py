"""Resume domain entity."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Any
from uuid import UUID, uuid4


@dataclass
class Resume:
    """Resume domain entity representing a user resume."""

    id: UUID = field(default_factory=uuid4)
    user_id: UUID = field(default_factory=uuid4)
    jd_id: Optional[UUID] = None
    title: str = ""
    template_id: str = "modern"
    content: dict[str, Any] = field(default_factory=dict)
    selected_experience_ids: list[UUID] = field(default_factory=list)
    generation_config: Optional[dict[str, Any]] = None
    ai_suggestions: Optional[dict[str, Any]] = None
    pdf_url: Optional[str] = None
    word_url: Optional[str] = None
    markdown_content: Optional[str] = None
    status: str = "draft"  # draft, published, archived
    is_default: bool = False
    view_count: int = 0
    download_count: int = 0
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def is_generated(self) -> bool:
        """Check if resume has been generated."""
        return bool(self.content and self.content.get("professional_summary"))

    @classmethod
    def create(
        cls,
        user_id: UUID,
        title: str,
        template_id: str = "modern",
        jd_id: Optional[UUID] = None,
        content: Optional[dict[str, Any]] = None,
        selected_experience_ids: Optional[list[UUID]] = None,
        generation_config: Optional[dict[str, Any]] = None,
    ) -> "Resume":
        """Create a new Resume entity.

        Args:
            user_id: The user's UUID.
            title: Resume title.
            template_id: Template identifier (default: 'modern').
            jd_id: Optional associated JD ID.
            content: Resume content as JSON structure.
            selected_experience_ids: List of selected experience IDs.
            generation_config: AI generation configuration.

        Returns:
            New Resume instance.
        """
        now = datetime.utcnow()
        return cls(
            id=uuid4(),
            user_id=user_id,
            jd_id=jd_id,
            title=title.strip(),
            template_id=template_id.strip(),
            content=content or {},
            selected_experience_ids=selected_experience_ids or [],
            generation_config=generation_config,
            ai_suggestions=None,
            pdf_url=None,
            word_url=None,
            markdown_content=None,
            status="draft",
            is_default=False,
            view_count=0,
            download_count=0,
            created_at=now,
            updated_at=now,
        )

    def update(
        self,
        title: Optional[str] = None,
        template_id: Optional[str] = None,
        content: Optional[dict[str, Any]] = None,
        selected_experience_ids: Optional[list[UUID]] = None,
        generation_config: Optional[dict[str, Any]] = None,
        ai_suggestions: Optional[dict[str, Any]] = None,
        markdown_content: Optional[str] = None,
    ) -> None:
        """Update resume fields.

        Args:
            title: New resume title.
            template_id: New template ID.
            content: New resume content.
            selected_experience_ids: New list of selected experience IDs.
            generation_config: New generation configuration.
            ai_suggestions: New AI suggestions.
            markdown_content: New markdown content.
        """
        if title is not None:
            self.title = title.strip()
        if template_id is not None:
            self.template_id = template_id.strip()
        if content is not None:
            self.content = content
        if selected_experience_ids is not None:
            self.selected_experience_ids = selected_experience_ids
        if generation_config is not None:
            self.generation_config = generation_config
        if ai_suggestions is not None:
            self.ai_suggestions = ai_suggestions
        if markdown_content is not None:
            self.markdown_content = markdown_content
        self.updated_at = datetime.utcnow()

    def generate_markdown(self) -> str:
        """Generate markdown representation of the resume.

        Returns:
            Markdown formatted resume content.
        """
        # Basic markdown generation from content
        lines = []

        # Title
        lines.append(f"# {self.title}")
        lines.append("")

        # Content sections
        if self.content:
            # Personal info
            personal = self.content.get("personal", {})
            if personal:
                lines.append("## Personal Information")
                if personal.get("name"):
                    lines.append(f"**Name:** {personal['name']}")
                if personal.get("email"):
                    lines.append(f"**Email:** {personal['email']}")
                if personal.get("phone"):
                    lines.append(f"**Phone:** {personal['phone']}")
                if personal.get("location"):
                    lines.append(f"**Location:** {personal['location']}")
                lines.append("")

            # Summary
            summary = self.content.get("summary")
            if summary:
                lines.append("## Summary")
                lines.append(summary)
                lines.append("")

            # Experience
            experiences = self.content.get("experiences", [])
            if experiences:
                lines.append("## Experience")
                for exp in experiences:
                    lines.append(f"### {exp.get('title', 'Untitled')}")
                    lines.append(
                        f"**{exp.get('organization', '')}** | {exp.get('period', '')}"
                    )
                    if exp.get("description"):
                        lines.append(exp["description"])
                    lines.append("")

            # Education
            education = self.content.get("education", [])
            if education:
                lines.append("## Education")
                for edu in education:
                    lines.append(f"### {edu.get('degree', 'Degree')}")
                    lines.append(
                        f"**{edu.get('institution', '')}** | {edu.get('period', '')}"
                    )
                    lines.append("")

            # Skills
            skills = self.content.get("skills", [])
            if skills:
                lines.append("## Skills")
                lines.append(", ".join(skills))
                lines.append("")

        self.markdown_content = "\n".join(lines)
        self.updated_at = datetime.utcnow()
        return self.markdown_content

    def publish(self) -> None:
        """Publish the resume."""
        self.status = "published"
        self.updated_at = datetime.utcnow()

    def archive(self) -> None:
        """Archive the resume."""
        self.status = "archived"
        self.updated_at = datetime.utcnow()

    def set_as_default(self) -> None:
        """Set this resume as the default for the user."""
        self.is_default = True
        self.updated_at = datetime.utcnow()

    def increment_view_count(self) -> None:
        """Increment the view count."""
        self.view_count += 1

    def increment_download_count(self) -> None:
        """Increment the download count."""
        self.download_count += 1

    def set_file_urls(
        self,
        pdf_url: Optional[str] = None,
        word_url: Optional[str] = None,
    ) -> None:
        """Set generated file URLs.

        Args:
            pdf_url: URL to the generated PDF file.
            word_url: URL to the generated Word file.
        """
        if pdf_url is not None:
            self.pdf_url = pdf_url
        if word_url is not None:
            self.word_url = word_url
        self.updated_at = datetime.utcnow()

    def set_ai_suggestions(self, suggestions: dict[str, Any]) -> None:
        """Set AI-generated suggestions.

        Args:
            suggestions: AI suggestions dictionary.
        """
        self.ai_suggestions = suggestions
        self.updated_at = datetime.utcnow()

    def set_error(self, error_message: str) -> None:
        """Set error message for failed generation.

        Args:
            error_message: Error description.
        """
        self.error = error_message
        self.updated_at = datetime.utcnow()

    def update_content(
        self,
        professional_summary: str = "",
        skills_section: Optional[dict[str, Any]] = None,
        experiences: Optional[list[dict[str, Any]]] = None,
        education: Optional[dict[str, Any]] = None,
        raw_content: Optional[str] = None,
    ) -> None:
        """Update resume content with generated data.

        Args:
            professional_summary: Generated professional summary.
            skills_section: Generated skills section.
            experiences: Generated experiences list.
            education: Generated education section.
            raw_content: Raw AI response content.
        """
        if not self.content:
            self.content = {}
        
        if professional_summary:
            self.content["professional_summary"] = professional_summary
        if skills_section:
            self.content["skills_section"] = skills_section
        if experiences:
            self.content["experiences"] = experiences
        if education:
            self.content["education"] = education
        if raw_content:
            self.content["raw_content"] = raw_content
        
        self.updated_at = datetime.utcnow()

    @property
    def professional_summary(self) -> str:
        """Get professional summary from content."""
        return self.content.get("professional_summary", "") if self.content else ""

    @property
    def skills_section(self) -> dict[str, Any]:
        """Get skills section from content."""
        return self.content.get("skills_section", {}) if self.content else {}

    @property
    def experiences(self) -> list[dict[str, Any]]:
        """Get experiences from content."""
        return self.content.get("experiences", []) if self.content else []

    @property
    def education(self) -> Optional[dict[str, Any]]:
        """Get education from content."""
        return self.content.get("education") if self.content else None

    @property
    def experience_count(self) -> int:
        """Get count of experiences."""
        return len(self.experiences)

    @property
    def skill_count(self) -> int:
        """Get count of skills."""
        skills = self.skills_section
        if isinstance(skills, dict):
            return sum(len(v) for v in skills.values() if isinstance(v, list))
        return 0

    @property
    def is_generated(self) -> bool:
        """Check if resume has been generated."""
        return bool(self.content and self.content.get("professional_summary"))
