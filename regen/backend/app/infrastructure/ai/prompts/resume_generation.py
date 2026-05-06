"""Prompt templates for resume generation."""

import json
from typing import Dict, List, Any

# System prompt for resume generation
RESUME_GENERATION_SYSTEM_PROMPT = """You are an expert resume writer and career coach specializing in creating tailored resumes that pass ATS (Applicant Tracking Systems) and impress hiring managers.

Your task is to generate optimized resume content based on:
1. Job description analysis
2. Candidate's selected experiences

Rules for resume generation:

1. **Relevance**: Select and emphasize experiences most relevant to the target job
2. **STAR Format**: Structure experience descriptions using STAR (Situation, Task, Action, Result)
3. **Quantification**: Include metrics and numbers wherever possible (%, $, time saved, etc.)
4. **Keyword Optimization**: Naturally incorporate keywords from the job description
5. **Action Verbs**: Start each bullet point with strong action verbs
6. **Conciseness**: Keep bullet points to 1-2 lines maximum
7. **Impact Focus**: Emphasize outcomes and achievements over responsibilities

Output Format:
Provide the response as valid JSON with the following structure:

```json
{
  "professional_summary": "2-3 sentence summary tailored to the position",
  "skills_section": {
    "technical": ["skill1", "skill2"],
    "soft_skills": ["skill1", "skill2"]
  },
  "experiences": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "location": "City, Country (optional)",
      "bullets": [
        "STAR-formatted achievement with metrics",
        "Another achievement"
      ]
    }
  ],
  "education": {
    "degree": "Degree Name",
    "institution": "University Name",
    "year": "Graduation Year"
  }
}
```

Guidelines:
- Tailor content to match the job requirements
- Use industry-standard terminology
- Ensure all claims are supported by the provided experiences
- Maintain professional tone throughout"""

# User prompt template for resume generation
RESUME_GENERATION_USER_TEMPLATE = """Please generate a tailored resume based on the following information:

## JOB DESCRIPTION ANALYSIS
```json
{jd_analysis}
```

## CANDIDATE EXPERIENCES
```json
{experiences}
```

Generate optimized resume content that:
1. Highlights the most relevant experiences for this position
2. Uses STAR format for achievements
3. Incorporates keywords from the job description
4. Quantifies results where possible

Output the result as valid JSON following the format specified in the system instructions."""


def build_resume_generation_messages(
    jd_analysis: Dict[str, Any],
    experiences: List[Dict[str, Any]],
) -> List[Dict[str, str]]:
    """Build message list for resume generation.

    Args:
        jd_analysis: Structured JD analysis data.
        experiences: List of candidate experience dictionaries.

    Returns:
        List of message dictionaries for chat completion.
    """
    return [
        {"role": "system", "content": RESUME_GENERATION_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": RESUME_GENERATION_USER_TEMPLATE.format(
                jd_analysis=json.dumps(jd_analysis, ensure_ascii=False, indent=2),
                experiences=json.dumps(experiences, ensure_ascii=False, indent=2),
            ),
        },
    ]


# Example output format documentation
RESUME_GENERATION_EXAMPLE_OUTPUT = {
    "professional_summary": (
        "Senior Software Engineer with 6+ years of experience building scalable "
        "distributed systems and payment processing platforms. Proven track record "
        "of leading cross-functional teams and delivering high-impact features "
        "that increased revenue by 40%. Expert in Python, React, and cloud-native "
        "architectures."
    ),
    "skills_section": {
        "technical": [
            "Python",
            "React",
            "TypeScript",
            "PostgreSQL",
            "Redis",
            "Docker",
            "Kubernetes",
            "AWS",
            "GraphQL",
            "Microservices",
        ],
        "soft_skills": [
            "Team Leadership",
            "Technical Architecture",
            "Agile/Scrum",
            "Code Review",
            "Mentoring",
        ],
    },
    "experiences": [
        {
            "title": "Senior Software Engineer",
            "company": "TechCorp Inc.",
            "duration": "2021 - Present",
            "location": "San Francisco, CA",
            "bullets": [
                "Led development of payment processing microservice handling $50M+ monthly transactions, reducing latency by 60% through Redis caching and query optimization",
                "Architected and deployed Kubernetes-based infrastructure on AWS, improving system reliability to 99.99% uptime and reducing deployment time by 75%",
                "Mentored team of 4 junior engineers, conducting 50+ code reviews and establishing best practices that reduced bug rate by 35%",
                "Implemented GraphQL API layer consolidating 12 REST endpoints, improving frontend load times by 40% and developer productivity",
            ],
        },
        {
            "title": "Software Engineer",
            "company": "StartupXYZ",
            "duration": "2018 - 2021",
            "location": "New York, NY",
            "bullets": [
                "Built real-time data pipeline processing 1M+ events daily using Kafka and Python, enabling real-time analytics dashboard",
                "Developed React-based admin interface used by 200+ internal users, reducing customer support tickets by 25% through self-service features",
                "Optimized PostgreSQL database queries, reducing average response time from 2s to 200ms for critical user flows",
            ],
        },
    ],
    "education": {
        "degree": "Bachelor of Science in Computer Science",
        "institution": "University of Technology",
        "year": "2018",
    },
}
