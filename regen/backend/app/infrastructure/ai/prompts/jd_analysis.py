"""Prompt templates for Job Description (JD) analysis."""

from typing import Dict, List

# System prompt for JD analysis
JD_ANALYSIS_SYSTEM_PROMPT = """You are an expert job description analyzer and career consultant. Your task is to extract structured information from job descriptions.

Analyze the provided job description and extract the following information in JSON format:

1. **summary**: A one-sentence summary of the position
2. **company_type**: Type of company (e.g., "Startup", "Enterprise", "Consulting", "Product Company", "Agency")
3. **position_level**: Level of the position (e.g., "Junior", "Mid-level", "Senior", "Lead", "Principal", "Manager", "Director")
4. **requirements**: List of hard requirements (must-haves)
5. **responsibilities**: List of key responsibilities
6. **required_skills**: List of technical/soft skills that are required
7. **preferred_skills**: List of skills that are nice-to-have or preferred
8. **education_requirement**: Education level required (e.g., "Bachelor's", "Master's", "PhD", "Not specified")
9. **experience_years**: Years of experience required (e.g., "3-5 years", "5+ years", "Not specified")

Output ONLY valid JSON in the following format:
```json
{
  "summary": "string",
  "company_type": "string",
  "position_level": "string",
  "requirements": ["string"],
  "responsibilities": ["string"],
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "education_requirement": "string",
  "experience_years": "string"
}
```

Guidelines:
- Be concise but comprehensive
- Extract specific technologies, tools, and methodologies mentioned
- Identify implicit requirements from the context
- If information is not found, use "Not specified" or empty arrays
- Focus on actionable insights for resume tailoring"""

# User prompt template for JD analysis
JD_ANALYSIS_USER_TEMPLATE = """Please analyze the following job description:

---
{jd_content}
---

Extract the structured information as specified in the system instructions."""


def build_jd_analysis_messages(jd_content: str) -> List[Dict[str, str]]:
    """Build message list for JD analysis.

    Args:
        jd_content: Raw job description text.

    Returns:
        List of message dictionaries for chat completion.
    """
    return [
        {"role": "system", "content": JD_ANALYSIS_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": JD_ANALYSIS_USER_TEMPLATE.format(jd_content=jd_content),
        },
    ]


# Example usage and expected output format documentation
JD_ANALYSIS_EXAMPLE_OUTPUT = {
    "summary": "Senior Full Stack Engineer for fintech startup building payment processing systems",
    "company_type": "Startup",
    "position_level": "Senior",
    "requirements": [
        "5+ years of software engineering experience",
        "Strong proficiency in Python and React",
        "Experience with distributed systems",
        "Bachelor's degree in Computer Science or equivalent",
    ],
    "responsibilities": [
        "Design and implement scalable backend services",
        "Collaborate with product team on feature development",
        "Mentor junior engineers",
        "Participate in code reviews and architecture decisions",
    ],
    "required_skills": [
        "Python",
        "React",
        "PostgreSQL",
        "Docker",
        "Kubernetes",
        "AWS",
    ],
    "preferred_skills": [
        "Go",
        "GraphQL",
        "Redis",
        "Kafka",
        "Terraform",
    ],
    "education_requirement": "Bachelor's",
    "experience_years": "5+ years",
}
