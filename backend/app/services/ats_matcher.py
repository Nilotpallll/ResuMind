from app.services.ats_analyzer import _normalize_skill


def _normalize_items(
    items: list[str],
) -> set[str]:
    """
    Normalize a collection of skills or keywords
    for comparison.
    """
    normalized = set()

    for item in items:
        if not item:
            continue

        value = item.strip().lower()

        if not value:
            continue

        normalized.add(
            _normalize_skill(value)
        )

    return normalized


def _calculate_percentage(
    matched: int,
    required: int,
) -> int:
    """
    Calculate a percentage safely.
    """
    if required <= 0:
        return 0

    return round(
        (matched / required) * 100
    )


def compare_skills(
    resume_skills: list[str],
    job_skills: list[str],
) -> dict:
    """
    Compare resume skills against required job skills.
    """
    resume_set = _normalize_items(
        resume_skills
    )

    job_set = _normalize_items(
        job_skills
    )

    matched = sorted(
        resume_set & job_set
    )

    missing = sorted(
        job_set - resume_set
    )

    match_percentage = _calculate_percentage(
        len(matched),
        len(job_set),
    )

    return {
        "matched": matched,
        "missing": missing,
        "match_percentage": match_percentage,
        "required_count": len(job_set),
        "matched_count": len(matched),
    }


def compare_keywords(
    resume_keywords: list[str],
    job_keywords: list[str],
) -> dict:
    """
    Compare resume keywords against
    job-description keywords.
    """
    resume_set = _normalize_items(
        resume_keywords
    )

    job_set = _normalize_items(
        job_keywords
    )

    matched = sorted(
        resume_set & job_set
    )

    missing = sorted(
        job_set - resume_set
    )

    match_percentage = _calculate_percentage(
        len(matched),
        len(job_set),
    )

    return {
        "matched": matched,
        "missing": missing,
        "match_percentage": match_percentage,
        "required_count": len(job_set),
        "matched_count": len(matched),
    }


def calculate_ats_score(
    skill_match: int,
    keyword_match: int,
) -> int:
    """
    Calculate ATS compatibility.

    Skills receive 60% weight and keywords receive 40%.
    """
    score = (
        (skill_match * 0.60)
        + (keyword_match * 0.40)
    )

    return round(score)


def generate_recommendations(
    missing_skills: list[str],
    missing_keywords: list[str],
) -> list[str]:
    """
    Generate explainable ATS recommendations.

    Recommendations never instruct the candidate to claim
    experience they do not have.
    """
    recommendations = []

    normalized_missing_skills = {
        skill.strip().lower()
        for skill in missing_skills
        if skill and skill.strip()
    }

    for skill in missing_skills[:5]:
        recommendations.append(
            f"Consider adding '{skill}' if you have relevant experience "
            f"or practical knowledge."
        )

    for keyword in missing_keywords[:5]:
        normalized_keyword = keyword.strip().lower()

        if not normalized_keyword:
            continue

        if normalized_keyword in normalized_missing_skills:
            continue

        recommendations.append(
            f"Consider mentioning '{keyword}' where it accurately "
            f"reflects your experience."
        )

    if not recommendations:
        recommendations.append(
            "Your resume contains the main skills and keywords "
            "identified in the job description."
        )

    return recommendations


def match_resume_to_job(
    resume_analysis: dict,
    job_analysis: dict,
) -> dict:
    """
    Compare resume NLP analysis against job-description NLP
    analysis and produce ATS compatibility results.
    """
    if not resume_analysis:
        resume_analysis = {}

    if not job_analysis:
        job_analysis = {}

    resume_skills = resume_analysis.get(
        "skills",
        [],
    )

    resume_keywords = resume_analysis.get(
        "keywords",
        [],
    )

    job_skills = job_analysis.get(
        "skills",
        [],
    )

    job_keywords = job_analysis.get(
        "keywords",
        [],
    )

    skill_comparison = compare_skills(
        resume_skills,
        job_skills,
    )

    keyword_comparison = compare_keywords(
        resume_keywords,
        job_keywords,
    )

    ats_score = calculate_ats_score(
        skill_comparison["match_percentage"],
        keyword_comparison["match_percentage"],
    )

    recommendations = generate_recommendations(
        skill_comparison["missing"],
        keyword_comparison["missing"],
    )

    return {
        "ats_score": ats_score,
        "skill_match": skill_comparison,
        "keyword_match": keyword_comparison,
        "recommendations": recommendations,
    }