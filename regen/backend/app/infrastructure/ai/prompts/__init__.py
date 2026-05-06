"""Prompt templates for AI-powered resume generation."""

from app.infrastructure.ai.prompts.jd_analysis import (
    JD_ANALYSIS_SYSTEM_PROMPT,
    JD_ANALYSIS_USER_TEMPLATE,
    build_jd_analysis_messages,
)
from app.infrastructure.ai.prompts.resume_generation import (
    RESUME_GENERATION_SYSTEM_PROMPT,
    RESUME_GENERATION_USER_TEMPLATE,
    build_resume_generation_messages,
)
from app.infrastructure.ai.prompts.experience_optimization import (
    EXPERIENCE_OPTIMIZATION_SYSTEM_PROMPT,
    EXPERIENCE_OPTIMIZATION_USER_TEMPLATE,
    build_experience_optimization_messages,
)

__all__ = [
    # JD Analysis
    "JD_ANALYSIS_SYSTEM_PROMPT",
    "JD_ANALYSIS_USER_TEMPLATE",
    "build_jd_analysis_messages",
    # Resume Generation
    "RESUME_GENERATION_SYSTEM_PROMPT",
    "RESUME_GENERATION_USER_TEMPLATE",
    "build_resume_generation_messages",
    # Experience Optimization
    "EXPERIENCE_OPTIMIZATION_SYSTEM_PROMPT",
    "EXPERIENCE_OPTIMIZATION_USER_TEMPLATE",
    "build_experience_optimization_messages",
]
