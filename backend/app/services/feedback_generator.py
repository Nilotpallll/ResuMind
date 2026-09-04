from typing import Any


def _get_breakdown(
    analysis: dict[str, Any],
) -> dict[str, Any]:
    breakdown = analysis.get("breakdown", {})

    if isinstance(breakdown, dict):
        return breakdown

    return {}


def _get_section(
    analysis: dict[str, Any],
    key: str,
) -> dict[str, Any]:
    breakdown = _get_breakdown(analysis)

    section = breakdown.get(key)

    if isinstance(section, dict):
        return section

    section = analysis.get(key)

    if isinstance(section, dict):
        return section

    return {}


def _get_score(
    analysis: dict[str, Any],
    key: str,
) -> int:
    section = _get_section(
        analysis,
        key,
    )

    score = section.get("score", 0)

    try:
        return int(score)
    except (TypeError, ValueError):
        return 0


def _get_items(
    analysis: dict[str, Any],
    key: str,
) -> list[str]:
    value = analysis.get(key, [])

    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    return []


def _get_structure_details(
    analysis: dict[str, Any],
) -> dict[str, Any]:
    structure = _get_section(
        analysis,
        "structure",
    )

    details = structure.get(
        "details",
        {},
    )

    if isinstance(details, dict):
        return details

    return {}


def generate_strengths(
    analysis: dict[str, Any],
) -> list[str]:
    strengths = []

    score_rules = [
        (
            "contact",
            10,
            "Your contact information is complete.",
        ),
        (
            "skills",
            18,
            "Your resume has a strong skills section.",
        ),
        (
            "education",
            12,
            "Your education information is clearly included.",
        ),
        (
            "projects",
            12,
            "Your resume includes relevant projects.",
        ),
        (
            "experience",
            8,
            "Your resume demonstrates relevant experience.",
        ),
        (
            "completeness",
            8,
            "Your resume contains the major information expected in a professional resume.",
        ),
    ]

    for section, threshold, message in score_rules:
        if _get_score(analysis, section) >= threshold:
            strengths.append(message)

    overall_score = analysis.get(
        "overall_score",
        analysis.get("score", 0),
    )

    try:
        overall_score = int(overall_score)
    except (TypeError, ValueError):
        overall_score = 0

    if overall_score >= 85:
        strengths.append(
            "Your resume has a strong overall score."
        )

    return strengths


def generate_improvements(
    analysis: dict[str, Any],
) -> list[str]:
    improvements = []

    structure_details = _get_structure_details(
        analysis
    )

    missing_structure_sections = []

    for section, detail in structure_details.items():
        if not isinstance(detail, dict):
            continue

        status = str(
            detail.get("status", "")
        ).lower()

        if status == "missing":
            label = detail.get(
                "label",
                section.replace("_", " ").title(),
            )

            missing_structure_sections.append(
                str(label)
            )

    if missing_structure_sections:
        improvements.append(
            "Consider adding the missing resume sections: "
            + ", ".join(missing_structure_sections)
            + "."
        )
    elif _get_score(analysis, "structure") < 20:
        improvements.append(
            "Improve the resume structure by ensuring important sections are clearly organized."
        )

    skills_score = _get_score(
        analysis,
        "skills",
    )

    if skills_score < 18:
        improvements.append(
            "Strengthen the skills section with relevant technical and professional skills."
        )

    education_score = _get_score(
        analysis,
        "education",
    )

    if education_score < 12:
        improvements.append(
            "Review the education section and ensure the relevant degree and academic details are included."
        )

    projects_score = _get_score(
        analysis,
        "projects",
    )

    if projects_score < 12:
        improvements.append(
            "Add or improve project details to demonstrate practical experience."
        )

    experience_score = _get_score(
        analysis,
        "experience",
    )

    if experience_score < 8:
        improvements.append(
            "Strengthen the experience section with clear roles, responsibilities, and measurable contributions."
        )

    completeness_score = _get_score(
        analysis,
        "completeness",
    )

    if completeness_score < 8:
        improvements.append(
            "Complete missing resume information to improve overall completeness."
        )

    if not improvements:
        improvements.append(
            "Your resume is strong across the evaluated sections. Continue refining it for the specific role you are targeting."
        )

    return improvements


def generate_ats_feedback(
    ats_analysis: dict[str, Any] | None,
) -> list[str]:
    if not ats_analysis:
        return []

    feedback = []

    ats_score = ats_analysis.get(
        "ats_score",
        0,
    )

    try:
        ats_score = int(ats_score)
    except (TypeError, ValueError):
        ats_score = 0

    if ats_score >= 80:
        feedback.append(
            "Your resume has strong keyword and skill alignment with the job description."
        )
    elif ats_score >= 60:
        feedback.append(
            "Your resume has moderate alignment with the job description and can be improved by addressing missing requirements."
        )
    else:
        feedback.append(
            "Your resume has limited alignment with the job description. Review the missing skills and keywords carefully."
        )

    skill_match = ats_analysis.get(
        "skill_match",
        {},
    )

    missing_skills = _get_items(
        skill_match,
        "missing",
    )

    if missing_skills:
        missing_skill_text = ", ".join(
            missing_skills[:5]
        )

        feedback.append(
            f"Consider mentioning missing skills such as {missing_skill_text} if they accurately reflect your experience."
        )

    keyword_match = ats_analysis.get(
        "keyword_match",
        {},
    )

    missing_keywords = _get_items(
        keyword_match,
        "missing",
    )

    normalized_missing_skills = {
        item.strip().lower()
        for item in missing_skills
        if item.strip()
    }

    unique_keywords = [
        keyword
        for keyword in missing_keywords
        if keyword.strip().lower()
        not in normalized_missing_skills
    ]

    if unique_keywords:
        missing_keyword_text = ", ".join(
            unique_keywords[:5]
        )

        feedback.append(
            f"Review missing job-description keywords such as {missing_keyword_text} and include them only where they truthfully describe your experience."
        )

    return feedback


def generate_priority_actions(
    improvements: list[str],
    ats_feedback: list[str],
) -> list[str]:
    actions = []

    if ats_feedback:
        actions.append(
            "Address the most relevant missing ATS skills and keywords."
        )

    if improvements:
        actions.append(
            improvements[0]
        )

    if len(improvements) > 1:
        actions.append(
            improvements[1]
        )

    if not actions:
        actions.append(
            "Continue tailoring your resume to the target role."
        )

    return actions[:3]


def generate_feedback(
    analysis: dict[str, Any] | None,
    ats_analysis: dict[str, Any] | None = None,
) -> dict[str, list[str]]:
    if not analysis:
        analysis = {}

    strengths = generate_strengths(
        analysis
    )

    improvements = generate_improvements(
        analysis
    )

    ats_feedback = generate_ats_feedback(
        ats_analysis
    )

    priority_actions = generate_priority_actions(
        improvements,
        ats_feedback,
    )

    return {
        "strengths": strengths,
        "improvements": improvements,
        "ats_feedback": ats_feedback,
        "priority_actions": priority_actions,
    }