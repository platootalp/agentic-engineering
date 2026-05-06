"""Prompt templates for experience optimization and matching."""

import json
from typing import Any, Dict, List

# System prompt for experience optimization
EXPERIENCE_OPTIMIZATION_SYSTEM_PROMPT = """You are an expert career coach specializing in optimizing work experience descriptions for maximum impact and relevance.

Your task is to:
1. Calculate a match score between a candidate's experience and a job description
2. Optimize the experience description to better align with the job requirements
3. Identify which skills from the experience match the job requirements

Rules for optimization:

1. **STAR Format**: Ensure all achievements follow STAR (Situation, Task, Action, Result)
2. **Quantification**: Add or enhance metrics (%, $, numbers, timeframes)
3. **Keyword Alignment**: Incorporate relevant keywords from the job description
4. **Impact Focus**: Lead with outcomes, not responsibilities
5. **Relevance Filtering**: Prioritize aspects of the experience most relevant to the target job
6. **Action Verbs**: Use strong, specific action verbs
7. **Conciseness**: Keep optimized descriptions punchy and scannable

Output Format:
Provide the response as valid JSON:

```json
{
  "match_analysis": {
    "match_score": 85,
    "relevance": "high",
    "matched_skills": ["Python", "AWS", "Leadership"],
    "missing_skills": ["Kubernetes", "GraphQL"],
    "reasoning": "Brief explanation of why this experience matches or doesn't match"
  },
  "optimized_experience": {
    "title": "Original Title",
    "company": "Company Name",
    "duration": "Duration",
    "optimized_bullets": [
      "Optimized achievement description with metrics and keywords",
      "Another optimized bullet"
    ],
    "suggested_additions": [
      "Suggested additional bullet if relevant experience exists but not documented"
    ]
  }
}
```

Scoring Guidelines:
- 90-100: Perfect match - experience directly demonstrates required skills
- 70-89: Strong match - experience shows most required skills with good results
- 50-69: Moderate match - some relevant skills but gaps exist
- 0-49: Weak match - limited relevance to the position"""

# User prompt template for experience optimization
EXPERIENCE_OPTIMIZATION_USER_TEMPLATE = """Please analyze and optimize the following experience for the target job:

## JOB DESCRIPTION ANALYSIS
```json
{jd_analysis}
```

## CANDIDATE EXPERIENCE
```json
{experience}
```

Provide:
1. A match score (0-100) with reasoning
2. An optimized version of the experience description
3. List of matched and missing skills
4. Suggestions for additional content if applicable

Output as valid JSON following the format specified in the system instructions."""


def build_experience_optimization_messages(
    jd_analysis: Dict[str, Any],
    experience: Dict[str, Any],
) -> List[Dict[str, str]]:
    """Build message list for experience optimization.

    Args:
        jd_analysis: Structured JD analysis data.
        experience: Single candidate experience dictionary.

    Returns:
        List of message dictionaries for chat completion.
    """
    return [
        {"role": "system", "content": EXPERIENCE_OPTIMIZATION_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": EXPERIENCE_OPTIMIZATION_USER_TEMPLATE.format(
                jd_analysis=json.dumps(jd_analysis, ensure_ascii=False, indent=2),
                experience=json.dumps(experience, ensure_ascii=False, indent=2),
            ),
        },
    ]


# Batch processing template for multiple experiences
EXPERIENCE_BATCH_USER_TEMPLATE = """Please analyze and optimize the following experiences for the target job:

## JOB DESCRIPTION ANALYSIS
```json
{jd_analysis}
```

## CANDIDATE EXPERIENCES
```json
{experiences}
```

For each experience, provide:
1. Match score (0-100)
2. Relevance level (high/medium/low)
3. Matched skills
4. Optimized bullet points

Output as valid JSON array with one result object per experience."""


def build_experience_batch_messages(
    jd_analysis: Dict[str, Any],
    experiences: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    """Build message list for batch experience optimization.

    Args:
        jd_analysis: Structured JD analysis data.
        experiences: List of candidate experience dictionaries.

    Returns:
        List of message dictionaries for chat completion.
    """
    return [
        {"role": "system", "content": EXPERIENCE_OPTIMIZATION_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": EXPERIENCE_BATCH_USER_TEMPLATE.format(
                jd_analysis=json.dumps(jd_analysis, ensure_ascii=False, indent=2),
                experiences=json.dumps(experiences, ensure_ascii=False, indent=2),
            ),
        },
    ]
