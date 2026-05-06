"""Generate Resume use case."""

import json
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from app.domain.entities.experience import Experience
from app.domain.entities.jd import JD
from app.domain.entities.resume import Resume
from app.domain.repositories.experience_repository import ExperienceRepository
from app.domain.repositories.jd_repository import JDRepository
from app.domain.repositories.resume_repository import ResumeRepository
from app.infrastructure.ai.prompts.resume_generation import (
    build_resume_generation_messages,
)
from app.infrastructure.ai.router import AIRequestRouter
from app.infrastructure.logging import get_logger

logger = get_logger()


@dataclass
class GenerateResumeInput:
    """Input data for generating a resume."""

    user_id: UUID
    jd_id: UUID
    selected_experience_ids: list[UUID]
    template_id: str = "default"


@dataclass
class ResumeDTO:
    """Resume data transfer object for response."""

    id: str
    user_id: str
    jd_id: str
    template_id: str
    professional_summary: str
    skills_section: dict
    experiences: list[dict]
    education: Optional[dict]
    is_generated: bool
    experience_count: int
    skill_count: int
    created_at: datetime
    updated_at: datetime


@dataclass
class GenerateResumeOutput:
    """Output data for generating a resume."""

    success: bool
    resume: Optional[ResumeDTO] = None
    message: str = ""
    error: Optional[str] = None


class GenerateResumeUseCase:
    """Use case for generating a tailored resume."""

    def __init__(
        self,
        resume_repository: ResumeRepository,
        jd_repository: JDRepository,
        experience_repository: ExperienceRepository,
        ai_router: AIRequestRouter,
    ):
        """Initialize use case with repositories and AI router.

        Args:
            resume_repository: Repository for resume operations.
            jd_repository: Repository for JD operations.
            experience_repository: Repository for experience operations.
            ai_router: AI request router for generation.
        """
        self._resume_repository = resume_repository
        self._jd_repository = jd_repository
        self._experience_repository = experience_repository
        self._ai_router = ai_router

    async def execute(self, input_data: GenerateResumeInput) -> GenerateResumeOutput:
        """Execute resume generation.

        Args:
            input_data: Generation input data.

        Returns:
            Generation result with resume data.
        """
        # Validate input
        if not input_data.selected_experience_ids:
            return GenerateResumeOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="At least one experience must be selected",
            )

        try:
            # Step 1: Fetch JD with analysis
            jd = await self._jd_repository.get_by_id(input_data.jd_id)
            if not jd:
                return GenerateResumeOutput(
                    success=False,
                    error="JD_NOT_FOUND",
                    message=f"JD with ID {input_data.jd_id} not found",
                )

            if not jd.is_analyzed or not jd.analysis:
                return GenerateResumeOutput(
                    success=False,
                    error="JD_NOT_ANALYZED",
                    message="JD must be analyzed before generating resume",
                )

            # Step 2: Fetch selected experiences
            experiences: list[Experience] = []
            for exp_id in input_data.selected_experience_ids:
                exp = await self._experience_repository.get_by_id(exp_id)
                if exp:
                    experiences.append(exp)
                else:
                    logger.warning(
                        "Experience not found",
                        extra={"experience_id": str(exp_id)},
                    )

            if not experiences:
                return GenerateResumeOutput(
                    success=False,
                    error="NO_EXPERIENCES_FOUND",
                    message="None of the selected experiences were found",
                )

            # Step 3: Create Resume entity
            resume = Resume.create(
                user_id=input_data.user_id,
                title=f"Resume for {jd.position_title} at {jd.company_name}",
                jd_id=input_data.jd_id,
                template_id=input_data.template_id,
                selected_experience_ids=input_data.selected_experience_ids,
            )

            # Step 4: Build prompt for AI
            jd_analysis_data = self._build_jd_analysis_data(jd)
            experiences_data = self._build_experiences_data(experiences)

            messages = build_resume_generation_messages(
                jd_analysis=jd_analysis_data,
                experiences=experiences_data,
            )

            # Step 5: Call AI router to generate resume content
            logger.info(
                "Starting resume generation",
                extra={
                    "user_id": str(input_data.user_id),
                    "jd_id": str(input_data.jd_id),
                    "experience_count": len(experiences),
                },
            )

            try:
                response = await self._ai_router.route_request(
                    messages=messages,
                    temperature=0.7,
                    max_tokens=4000,
                )

                # Parse AI response
                generated_content = self._parse_ai_response(response.content)

                if not generated_content:
                    raise ValueError("Failed to parse AI response")

                # Step 6: Update Resume entity with generated content
                resume.update_content(
                    professional_summary=generated_content.get(
                        "professional_summary", ""
                    ),
                    skills_section=generated_content.get("skills_section", {}),
                    experiences=generated_content.get("experiences", []),
                    education=generated_content.get("education"),
                    raw_content=response.content,
                )

                # Step 7: Save to database
                created_resume = await self._resume_repository.create(resume)

                logger.info(
                    "Resume generated successfully",
                    extra={
                        "resume_id": str(created_resume.id),
                        "user_id": str(input_data.user_id),
                        "jd_id": str(input_data.jd_id),
                        "tokens_used": response.token_usage.total_tokens,
                    },
                )

                # Build response DTO
                resume_dto = ResumeDTO(
                    id=str(created_resume.id),
                    user_id=str(created_resume.user_id),
                    jd_id=str(created_resume.jd_id),
                    template_id=created_resume.template_id,
                    professional_summary=created_resume.professional_summary,
                    skills_section=created_resume.skills_section,
                    experiences=created_resume.experiences,
                    education=created_resume.education,
                    is_generated=created_resume.is_generated,
                    experience_count=created_resume.experience_count,
                    skill_count=created_resume.skill_count,
                    created_at=created_resume.created_at,
                    updated_at=created_resume.updated_at,
                )

                return GenerateResumeOutput(
                    success=True,
                    resume=resume_dto,
                    message="Resume generated successfully",
                )

            except Exception as ai_error:
                logger.error(
                    "AI generation failed",
                    extra={
                        "error": str(ai_error),
                        "user_id": str(input_data.user_id),
                        "jd_id": str(input_data.jd_id),
                    },
                )

                # Save failed resume attempt
                resume.set_error(f"AI generation failed: {str(ai_error)}")
                await self._resume_repository.create(resume)

                return GenerateResumeOutput(
                    success=False,
                    error="GENERATION_FAILED",
                    message=f"Failed to generate resume: {str(ai_error)}",
                )

        except Exception as e:
            logger.error(
                "Resume generation failed",
                extra={
                    "error": str(e),
                    "user_id": str(input_data.user_id),
                    "jd_id": str(input_data.jd_id),
                },
            )
            return GenerateResumeOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Resume generation failed: {str(e)}",
            )

    def _build_jd_analysis_data(self, jd: JD) -> dict:
        """Build JD analysis data for AI prompt.

        Args:
            jd: JD entity.

        Returns:
            Structured JD analysis data.
        """
        return {
            "company_name": jd.company_name,
            "position_title": jd.position_title,
            "location": jd.location,
            "salary_range": jd.salary_range,
            "analysis": jd.analysis or {},
        }

    def _build_experiences_data(self, experiences: list[Experience]) -> list[dict]:
        """Build experiences data for AI prompt.

        Args:
            experiences: List of experience entities.

        Returns:
            List of structured experience data.
        """
        return [
            {
                "type": exp.type,
                "title": exp.title,
                "organization": exp.organization,
                "location": exp.location,
                "duration": exp.display_period,
                "is_current": exp.is_current,
                "description": exp.description,
                "description_ai": exp.description_ai,
                "skills": exp.skills,
                "achievements": exp.achievements,
            }
            for exp in experiences
        ]

    def _parse_ai_response(self, content: str) -> Optional[dict]:
        """Parse AI response content.

        Args:
            content: Raw AI response content.

        Returns:
            Parsed content dictionary or None if parsing fails.
        """
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                if json_end > json_start:
                    content = content[json_start:json_end].strip()
            elif "```" in content:
                json_start = content.find("```") + 3
                json_end = content.find("```", json_start)
                if json_end > json_start:
                    content = content[json_start:json_end].strip()

            return json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(
                "Failed to parse AI response",
                extra={"error": str(e), "content_preview": content[:200]},
            )
            return None
