"""Match Experiences use case."""

import json
import re
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


@dataclass
class MatchExperiencesInput:
    """Input data for matching experiences to a JD."""

    jd_id: UUID
    experience_ids: list[UUID]


@dataclass
class ExperienceMatchDTO:
    """Experience match result data transfer object."""

    experience_id: str
    score: float
    matched_skills: list[str]
    reasoning: str


@dataclass
class MatchExperiencesOutput:
    """Output data for matching experiences."""

    success: bool
    matches: list[ExperienceMatchDTO]
    message: str = ""
    error: Optional[str] = None


class MatchExperiencesUseCase:
    """Use case for matching experiences to JD requirements."""

    def __init__(
        self,
        jd_repository: JDRepository,
        experience_repository: ExperienceRepository,
        ai_router: Optional[AIRequestRouter] = None,
    ):
        """Initialize use case with repositories.

        Args:
            jd_repository: Repository for JD operations.
            experience_repository: Repository for experience operations.
            ai_router: Optional AI router for advanced matching.
        """
        self._jd_repository = jd_repository
        self._experience_repository = experience_repository
        self._ai_router = ai_router

    async def execute(
        self, input_data: MatchExperiencesInput
    ) -> MatchExperiencesOutput:
        """Execute experience matching.

        Args:
            input_data: Matching input data.

        Returns:
            Matching result with scored experiences.
        """
        # Validate input
        if not input_data.experience_ids:
            return MatchExperiencesOutput(
                success=False,
                error="VALIDATION_ERROR",
                message="At least one experience ID is required",
                matches=[],
            )

        try:
            # Step 1: Get JD analysis
            jd = await self._jd_repository.get_by_id(input_data.jd_id)
            if not jd:
                return MatchExperiencesOutput(
                    success=False,
                    error="JD_NOT_FOUND",
                    message=f"JD with ID {input_data.jd_id} not found",
                    matches=[],
                )

            # Extract required skills and responsibilities from JD analysis
            jd_skills = self._extract_jd_skills(jd)
            jd_responsibilities = self._extract_jd_responsibilities(jd)

            # Step 2: Fetch experiences
            experiences: list[Experience] = []
            for exp_id in input_data.experience_ids:
                exp = await self._experience_repository.get_by_id(exp_id)
                if exp:
                    experiences.append(exp)
                else:
                    logger.warning(
                        "Experience not found",
                        extra={"experience_id": str(exp_id)},
                    )

            if not experiences:
                return MatchExperiencesOutput(
                    success=False,
                    error="NO_EXPERIENCES_FOUND",
                    message="None of the specified experiences were found",
                    matches=[],
                )

            # Step 3: Score each experience for relevance
            matches: list[ExperienceMatchDTO] = []

            for exp in experiences:
                match_result = self._calculate_match_score(
                    experience=exp,
                    jd_skills=jd_skills,
                    jd_responsibilities=jd_responsibilities,
                    jd=jd,
                )
                matches.append(match_result)

            # Step 4: Sort by score (descending)
            matches.sort(key=lambda x: x.score, reverse=True)

            logger.info(
                "Experience matching completed",
                extra={
                    "jd_id": str(input_data.jd_id),
                    "experience_count": len(experiences),
                    "top_score": matches[0].score if matches else 0,
                },
            )

            return MatchExperiencesOutput(
                success=True,
                matches=matches,
                message=f"Successfully matched {len(matches)} experiences",
            )

        except Exception as e:
            logger.error(
                "Experience matching failed",
                extra={
                    "error": str(e),
                    "jd_id": str(input_data.jd_id),
                },
            )
            return MatchExperiencesOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Experience matching failed: {str(e)}",
                matches=[],
            )

    def _extract_jd_skills(self, jd: JD) -> list[str]:
        """Extract required skills from JD analysis.

        Args:
            jd: JD entity.

        Returns:
            List of required skills.
        """
        skills = []

        if jd.analysis and isinstance(jd.analysis, dict):
            # Try different possible keys for skills
            skill_keys = ["required_skills", "skills", "key_skills", "technical_skills"]
            for key in skill_keys:
                if key in jd.analysis and isinstance(jd.analysis[key], list):
                    skills.extend(jd.analysis[key])

            # Also check nested structures
            if "requirements" in jd.analysis:
                reqs = jd.analysis["requirements"]
                if isinstance(reqs, dict):
                    for key in ["technical", "skills", "required"]:
                        if key in reqs and isinstance(reqs[key], list):
                            skills.extend(reqs[key])
                elif isinstance(reqs, list):
                    skills.extend(reqs)

        # Normalize skills (lowercase, strip)
        return list(set(skill.lower().strip() for skill in skills if skill))

    def _extract_jd_responsibilities(self, jd: JD) -> list[str]:
        """Extract responsibilities from JD analysis.

        Args:
            jd: JD entity.

        Returns:
            List of responsibilities.
        """
        responsibilities = []

        if jd.analysis and isinstance(jd.analysis, dict):
            resp_keys = ["responsibilities", "key_responsibilities", "duties"]
            for key in resp_keys:
                if key in jd.analysis and isinstance(jd.analysis[key], list):
                    responsibilities.extend(jd.analysis[key])

        return responsibilities

    def _calculate_match_score(
        self,
        experience: Experience,
        jd_skills: list[str],
        jd_responsibilities: list[str],
        jd: JD,
    ) -> ExperienceMatchDTO:
        """Calculate match score for an experience.

        Args:
            experience: Experience entity.
            jd_skills: List of JD required skills.
            jd_responsibilities: List of JD responsibilities.
            jd: JD entity.

        Returns:
            Experience match DTO with score and reasoning.
        """
        matched_skills = []
        score_components = []
        reasoning_parts = []

        # 1. Skill matching (40% weight)
        if jd_skills and experience.skills:
            exp_skills_lower = [s.lower().strip() for s in experience.skills]
            matched = [
                skill
                for skill in jd_skills
                if any(
                    skill in exp_skill or exp_skill in skill
                    for exp_skill in exp_skills_lower
                )
            ]
            matched_skills = list(set(matched))

            skill_score = len(matched_skills) / len(jd_skills) if jd_skills else 0
            score_components.append(("skills", skill_score * 0.4))

            if matched_skills:
                reasoning_parts.append(
                    f"Matches {len(matched_skills)} required skills: {', '.join(matched_skills[:5])}"
                )

        # 2. Title relevance (25% weight)
        title_score = self._calculate_title_relevance(
            experience.title, jd.position_title
        )
        score_components.append(("title", title_score * 0.25))

        if title_score > 0.7:
            reasoning_parts.append(
                f"Title '{experience.title}' closely matches position '{jd.position_title}'"
            )
        elif title_score > 0.3:
            reasoning_parts.append(
                f"Title '{experience.title}' has some relevance to position"
            )

        # 3. Description keyword matching (20% weight)
        if experience.description and jd_responsibilities:
            desc_score = self._calculate_description_match(
                experience.description, jd_responsibilities
            )
            score_components.append(("description", desc_score * 0.2))

            if desc_score > 0.5:
                reasoning_parts.append(
                    "Description contains relevant keywords from job requirements"
                )

        # 4. Achievement relevance (15% weight)
        if experience.achievements:
            achievement_score = self._calculate_achievement_relevance(
                experience.achievements, jd_skills, jd_responsibilities
            )
            score_components.append(("achievements", achievement_score * 0.15))

            if achievement_score > 0.5:
                reasoning_parts.append("Achievements demonstrate relevant capabilities")

        # Calculate total score
        total_score = sum(score for _, score in score_components)

        # Boost score for highlighted experiences
        if experience.is_highlighted:
            total_score = min(1.0, total_score + 0.05)
            reasoning_parts.append("Experience is marked as highlighted")

        # Cap score at 1.0
        total_score = min(1.0, max(0.0, total_score))

        # Build reasoning
        if not reasoning_parts:
            reasoning = "Limited direct match with job requirements"
        else:
            reasoning = "; ".join(reasoning_parts)

        return ExperienceMatchDTO(
            experience_id=str(experience.id),
            score=round(total_score, 2),
            matched_skills=matched_skills,
            reasoning=reasoning,
        )

    def _calculate_title_relevance(self, exp_title: str, jd_title: str) -> float:
        """Calculate title relevance score.

        Args:
            exp_title: Experience title.
            jd_title: JD position title.

        Returns:
            Relevance score between 0 and 1.
        """
        if not exp_title or not jd_title:
            return 0.0

        exp_lower = exp_title.lower()
        jd_lower = jd_title.lower()

        # Exact match
        if exp_lower == jd_lower:
            return 1.0

        # Contains match
        if exp_lower in jd_lower or jd_lower in exp_lower:
            return 0.8

        # Word overlap
        exp_words = set(re.findall(r"\b\w+\b", exp_lower))
        jd_words = set(re.findall(r"\b\w+\b", jd_lower))

        if exp_words and jd_words:
            overlap = len(exp_words & jd_words)
            total = len(exp_words | jd_words)
            if total > 0:
                return 0.5 + (overlap / total) * 0.3

        return 0.0

    def _calculate_description_match(
        self, description: str, responsibilities: list[str]
    ) -> float:
        """Calculate description match score.

        Args:
            description: Experience description.
            responsibilities: List of JD responsibilities.

        Returns:
            Match score between 0 and 1.
        """
        if not description or not responsibilities:
            return 0.0

        desc_lower = description.lower()
        matches = 0

        for resp in responsibilities:
            resp_lower = resp.lower()
            resp_words = set(re.findall(r"\b\w{4,}\b", resp_lower))

            for word in resp_words:
                if word in desc_lower:
                    matches += 1

        max_possible = len(responsibilities) * 3  # Assume avg 3 keywords per resp
        return min(1.0, matches / max_possible) if max_possible > 0 else 0.0

    def _calculate_achievement_relevance(
        self,
        achievements: list[str],
        jd_skills: list[str],
        jd_responsibilities: list[str],
    ) -> float:
        """Calculate achievement relevance score.

        Args:
            achievements: List of achievements.
            jd_skills: List of JD skills.
            jd_responsibilities: List of JD responsibilities.

        Returns:
            Relevance score between 0 and 1.
        """
        if not achievements:
            return 0.0

        all_keywords = set(jd_skills + jd_responsibilities)
        if not all_keywords:
            return 0.5  # Neutral if no keywords to match

        total_matches = 0
        for achievement in achievements:
            ach_lower = achievement.lower()
            for keyword in all_keywords:
                if keyword.lower() in ach_lower:
                    total_matches += 1
                    break  # Count each achievement only once

        return total_matches / len(achievements)
