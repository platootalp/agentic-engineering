"""Optimize Experience use case."""

from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from app.domain.entities.experience import Experience
from app.domain.entities.jd import JD
from app.domain.repositories.experience_repository import ExperienceRepository
from app.domain.repositories.jd_repository import JDRepository
from app.infrastructure.ai.router import AIRequestRouter
from app.infrastructure.logging import get_logger

logger = get_logger()

# System prompt for experience optimization
EXPERIENCE_OPTIMIZATION_SYSTEM_PROMPT = """You are an expert resume writer specializing in optimizing work experience descriptions using the STAR format (Situation, Task, Action, Result).

Your task is to rewrite experience descriptions to be:
1. **STAR-formatted**: Structure as Situation, Task, Action, Result
2. **Quantified**: Include metrics, percentages, dollar amounts, timeframes
3. **Action-oriented**: Start with strong action verbs
4. **Concise**: 2-4 bullet points, 1-2 lines each
5. **Impact-focused**: Emphasize outcomes over responsibilities
6. **Keyword-optimized**: Incorporate relevant industry keywords

Rules:
- Each bullet point should demonstrate clear impact
- Use specific numbers and metrics where possible
- Focus on achievements, not just duties
- Maintain professional tone
- Ensure accuracy - don't invent metrics

Output Format:
Provide only the optimized bullet points, one per line, without numbering or markdown formatting."""

# User prompt template for experience optimization
EXPERIENCE_OPTIMIZATION_USER_TEMPLATE = """Please optimize the following experience description using STAR format:

## ORIGINAL DESCRIPTION
{description}

## EXPERIENCE DETAILS
- Title: {title}
- Organization: {organization}
- Type: {type}
{jd_context}

## EXISTING SKILLS
{skills}

## EXISTING ACHIEVEMENTS
{achievements}

Please rewrite this as 2-4 optimized bullet points following STAR format with quantified results."""


@dataclass
class OptimizeExperienceInput:
    """Input data for optimizing an experience."""

    experience_id: UUID
    jd_id: Optional[UUID] = None


@dataclass
class OptimizedExperienceDTO:
    """Optimized experience data transfer object."""

    experience_id: str
    original_description: Optional[str]
    optimized_description: str
    skills: list[str]
    achievements: list[str]
    updated_at: str


@dataclass
class OptimizeExperienceOutput:
    """Output data for optimizing an experience."""

    success: bool
    experience: Optional[OptimizedExperienceDTO] = None
    message: str = ""
    error: Optional[str] = None


class OptimizeExperienceUseCase:
    """Use case for optimizing experience descriptions using AI."""

    def __init__(
        self,
        experience_repository: ExperienceRepository,
        jd_repository: Optional[JDRepository] = None,
        ai_router: Optional[AIRequestRouter] = None,
    ):
        """Initialize use case with repositories.

        Args:
            experience_repository: Repository for experience operations.
            jd_repository: Optional repository for JD operations.
            ai_router: Optional AI router for optimization.
        """
        self._experience_repository = experience_repository
        self._jd_repository = jd_repository
        self._ai_router = ai_router

    async def execute(
        self, input_data: OptimizeExperienceInput
    ) -> OptimizeExperienceOutput:
        """Execute experience optimization.

        Args:
            input_data: Optimization input data.

        Returns:
            Optimization result with updated experience.
        """
        try:
            # Step 1: Get experience
            experience = await self._experience_repository.get_by_id(
                input_data.experience_id
            )
            if not experience:
                return OptimizeExperienceOutput(
                    success=False,
                    error="EXPERIENCE_NOT_FOUND",
                    message=f"Experience with ID {input_data.experience_id} not found",
                )

            # Step 2: Get JD context if provided
            jd: Optional[JD] = None
            if input_data.jd_id and self._jd_repository:
                jd = await self._jd_repository.get_by_id(input_data.jd_id)
                if not jd:
                    logger.warning(
                        "JD not found for context",
                        extra={"jd_id": str(input_data.jd_id)},
                    )

            # Step 3: Check if we have AI router
            if not self._ai_router:
                # Fallback: basic optimization without AI
                optimized = self._basic_optimize(experience)
                experience.set_ai_description(optimized)
                updated_experience = await self._experience_repository.update(
                    experience
                )

                return OptimizeExperienceOutput(
                    success=True,
                    experience=OptimizedExperienceDTO(
                        experience_id=str(updated_experience.id),
                        original_description=updated_experience.description,
                        optimized_description=updated_experience.description_ai or "",
                        skills=updated_experience.skills,
                        achievements=updated_experience.achievements,
                        updated_at=updated_experience.updated_at.isoformat(),
                    ),
                    message="Experience optimized (basic mode - no AI)",
                )

            # Step 4: Build prompt for AI
            jd_context = self._build_jd_context(jd) if jd else ""

            messages = [
                {"role": "system", "content": EXPERIENCE_OPTIMIZATION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": EXPERIENCE_OPTIMIZATION_USER_TEMPLATE.format(
                        description=experience.description or "No description provided",
                        title=experience.title,
                        organization=experience.organization or "Unknown",
                        type=experience.type,
                        jd_context=jd_context,
                        skills=", ".join(experience.skills)
                        if experience.skills
                        else "None listed",
                        achievements="\n- ".join([""] + experience.achievements)
                        if experience.achievements
                        else "None listed",
                    ),
                },
            ]

            # Step 5: Call AI to optimize
            logger.info(
                "Starting experience optimization",
                extra={
                    "experience_id": str(input_data.experience_id),
                    "jd_id": str(input_data.jd_id) if input_data.jd_id else None,
                },
            )

            try:
                response = await self._ai_router.route_request(
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000,
                )

                # Parse optimized description
                optimized_description = self._parse_optimized_description(
                    response.content
                )

                # Step 6: Save optimized version
                experience.set_ai_description(optimized_description)
                updated_experience = await self._experience_repository.update(
                    experience
                )

                logger.info(
                    "Experience optimized successfully",
                    extra={
                        "experience_id": str(updated_experience.id),
                        "tokens_used": response.token_usage.total_tokens,
                    },
                )

                return OptimizeExperienceOutput(
                    success=True,
                    experience=OptimizedExperienceDTO(
                        experience_id=str(updated_experience.id),
                        original_description=updated_experience.description,
                        optimized_description=updated_experience.description_ai or "",
                        skills=updated_experience.skills,
                        achievements=updated_experience.achievements,
                        updated_at=updated_experience.updated_at.isoformat(),
                    ),
                    message="Experience optimized successfully",
                )

            except Exception as ai_error:
                logger.error(
                    "AI optimization failed",
                    extra={
                        "error": str(ai_error),
                        "experience_id": str(input_data.experience_id),
                    },
                )

                # Fallback to basic optimization
                optimized = self._basic_optimize(experience)
                experience.set_ai_description(optimized)
                updated_experience = await self._experience_repository.update(
                    experience
                )

                return OptimizeExperienceOutput(
                    success=True,
                    experience=OptimizedExperienceDTO(
                        experience_id=str(updated_experience.id),
                        original_description=updated_experience.description,
                        optimized_description=updated_experience.description_ai or "",
                        skills=updated_experience.skills,
                        achievements=updated_experience.achievements,
                        updated_at=updated_experience.updated_at.isoformat(),
                    ),
                    message="Experience optimized (fallback mode - AI failed)",
                )

        except Exception as e:
            logger.error(
                "Experience optimization failed",
                extra={
                    "error": str(e),
                    "experience_id": str(input_data.experience_id),
                },
            )
            return OptimizeExperienceOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Experience optimization failed: {str(e)}",
            )

    def _build_jd_context(self, jd: JD) -> str:
        """Build JD context string for prompt.

        Args:
            jd: JD entity.

        Returns:
            Formatted JD context string.
        """
        context_parts = [f"\n## TARGET JOB CONTEXT"]
        context_parts.append(f"- Position: {jd.position_title}")
        context_parts.append(f"- Company: {jd.company_name}")

        if jd.analysis and isinstance(jd.analysis, dict):
            if "required_skills" in jd.analysis:
                skills = jd.analysis["required_skills"]
                if isinstance(skills, list) and skills:
                    context_parts.append(f"- Key Skills: {', '.join(skills[:10])}")

            if "responsibilities" in jd.analysis:
                responsibilities = jd.analysis["responsibilities"]
                if isinstance(responsibilities, list) and responsibilities:
                    context_parts.append("- Key Responsibilities:")
                    for resp in responsibilities[:3]:
                        context_parts.append(f"  * {resp}")

        return "\n".join(context_parts)

    def _parse_optimized_description(self, content: str) -> str:
        """Parse optimized description from AI response.

        Args:
            content: Raw AI response content.

        Returns:
            Parsed and cleaned description.
        """
        # Remove markdown code blocks if present
        if "```" in content:
            lines = content.split("\n")
            cleaned_lines = []
            in_code_block = False
            for line in lines:
                if line.strip().startswith("```"):
                    in_code_block = not in_code_block
                    continue
                if not in_code_block or line.strip():
                    cleaned_lines.append(line)
            content = "\n".join(cleaned_lines)

        # Clean up bullet points
        lines = content.split("\n")
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            # Remove bullet markers
            if line.startswith(("- ", "* ", "• ", "1. ", "2. ", "3. ", "4. ")):
                line = line[2:]
            # Remove empty lines
            if line:
                cleaned_lines.append(line)

        return "\n".join(cleaned_lines)

    def _basic_optimize(self, experience: Experience) -> str:
        """Basic optimization without AI.

        Args:
            experience: Experience entity.

        Returns:
            Basic optimized description.
        """
        parts = []

        # Use existing achievements if available
        if experience.achievements:
            for achievement in experience.achievements[:4]:
                parts.append(f"• {achievement}")

        # Add description if available and not too long
        if experience.description and len(parts) < 3:
            # Split description into sentences
            sentences = experience.description.replace("\n", ". ").split(". ")
            for sentence in sentences[:2]:
                sentence = sentence.strip()
                if sentence and len(sentence) > 20:
                    parts.append(f"• {sentence}")

        # Add skills context
        if experience.skills and len(parts) < 2:
            skills_str = ", ".join(experience.skills[:5])
            parts.append(f"• Utilized {skills_str} to deliver results")

        if not parts:
            parts.append(
                f"• {experience.title} at {experience.organization or 'organization'}"
            )

        return "\n".join(parts[:4])
