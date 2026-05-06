"""Resume use cases."""

from .generate_resume import (
    GenerateResumeInput,
    GenerateResumeOutput,
    GenerateResumeUseCase,
    ResumeDTO,
)
from .match_experiences import (
    ExperienceMatchDTO,
    MatchExperiencesInput,
    MatchExperiencesOutput,
    MatchExperiencesUseCase,
)
from .optimize_experience import (
    OptimizeExperienceInput,
    OptimizeExperienceOutput,
    OptimizeExperienceUseCase,
    OptimizedExperienceDTO,
)

__all__ = [
    # Generate Resume
    "GenerateResumeUseCase",
    "GenerateResumeInput",
    "GenerateResumeOutput",
    "ResumeDTO",
    # Match Experiences
    "MatchExperiencesUseCase",
    "MatchExperiencesInput",
    "MatchExperiencesOutput",
    "ExperienceMatchDTO",
    # Optimize Experience
    "OptimizeExperienceUseCase",
    "OptimizeExperienceInput",
    "OptimizeExperienceOutput",
    "OptimizedExperienceDTO",
]
