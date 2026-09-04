import re


def _is_bullet(line: str) -> bool:
    return bool(
        re.match(
            r"^\s*(?:[-•▪◦*➢➤→])\s+",
            line,
        )
    )


def _is_date_line(line: str) -> bool:
    normalized = line.strip().lower()

    if not normalized:
        return False

    has_year = bool(
        re.search(
            r"\b(?:19|20)\d{2}\b",
            normalized,
        )
    )

    if not has_year:
        return False

    date_indicators = [
        "present",
        "current",
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "sept",
        "oct",
        "nov",
        "dec",
        "-",
        "–",
        "—",
    ]

    return any(
        indicator in normalized
        for indicator in date_indicators
    )


def _is_location_line(line: str) -> bool:
    normalized = line.strip().lower()

    if not normalized:
        return False

    location_terms = [
        "remote",
        "pune",
        "mumbai",
        "delhi",
        "bangalore",
        "bengaluru",
        "hyderabad",
        "chennai",
        "kolkata",
        "india",
        "usa",
        "united states",
        "uk",
        "united kingdom",
    ]

    return any(
        re.search(
            rf"\b{re.escape(term)}\b",
            normalized,
        )
        for term in location_terms
    )


def _looks_like_experience_role(
    line: str,
) -> bool:
    normalized = line.strip().lower()

    if not normalized:
        return False

    if _is_bullet(normalized):
        return False

    if _is_date_line(normalized):
        return False

    if _is_location_line(normalized):
        return False

    role_keywords = [
        "engineer",
        "developer",
        "intern",
        "analyst",
        "manager",
        "designer",
        "consultant",
        "researcher",
        "associate",
        "specialist",
        "architect",
        "administrator",
        "scientist",
        "trainee",
        "lead",
        "software",
        "technical",
        "full-stack",
        "frontend",
        "backend",
        "data",
    ]

    return any(
        re.search(
            rf"\b{re.escape(keyword)}\b",
            normalized,
        )
        for keyword in role_keywords
    )


def _count_experience_entries(
    experience: list[str],
) -> int:
    """
    Estimate the number of meaningful experience entries.

    Native PDF/DOCX extraction may preserve role/date boundaries,
    while flattened documents may combine multiple roles into one
    line. This function therefore supports both formats.
    """

    if not experience:
        return 0

    structured_count = 0

    for index, line in enumerate(experience):
        if not _looks_like_experience_role(line):
            continue

        following_lines = experience[
            index + 1:index + 4
        ]

        if any(
            _is_date_line(next_line)
            for next_line in following_lines
        ):
            structured_count += 1

    if structured_count > 0:
        return structured_count

    combined_text = " ".join(
        line.strip()
        for line in experience
        if line.strip()
    )

    if not combined_text:
        return 0

    date_pattern = re.compile(
        r"\b"
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)"
        r"\.?\s+\d{4}"
        r"\s*[–—-]\s*"
        r"(?:Present|Current|"
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)"
        r"\.?\s+\d{4})"
        r"\b",
        re.IGNORECASE,
    )

    date_ranges = date_pattern.findall(
        combined_text
    )

    if date_ranges:
        role_patterns = [
            r"\bsoftware engineer\b",
            r"\bsoftware developer\b",
            r"\bfull[- ]stack developer\b",
            r"\bfrontend developer\b",
            r"\bbackend developer\b",
            r"\bai intern\b",
            r"\bartificial intelligence intern\b",
            r"\bdata analyst\b",
            r"\bresearcher\b",
            r"\bdeveloper\b",
            r"\bengineer\b",
            r"\bintern\b",
            r"\banalyst\b",
            r"\bdesigner\b",
            r"\bconsultant\b",
            r"\bmanager\b",
        ]

        role_matches = []

        for pattern in role_patterns:
            role_matches.extend(
                re.findall(
                    pattern,
                    combined_text,
                    re.IGNORECASE,
                )
            )

        unique_roles = {
            role.lower()
            for role in role_matches
        }

        if len(unique_roles) >= len(
            date_ranges
        ):
            return len(date_ranges)

    return sum(
        1
        for line in experience
        if (
            _looks_like_experience_role(line)
            and len(line.split()) >= 5
        )
    )


def _is_project_title(line: str) -> bool:
    normalized = line.strip()

    if not normalized:
        return False

    if _is_bullet(normalized):
        return False

    if _is_date_line(normalized):
        return False

    if _is_location_line(normalized):
        return False

    if "|" in normalized:
        return True

    return False


def _count_project_entries(
    projects: list[str],
) -> int:
    if not projects:
        return 0

    non_empty = [
        line.strip()
        for line in projects
        if line.strip()
    ]

    if not non_empty:
        return 0

    explicit_titles = [
        line
        for line in non_empty
        if _is_project_title(line)
    ]

    if explicit_titles:
        return len(explicit_titles)

    non_bullet_lines = [
        line
        for line in non_empty
        if not _is_bullet(line)
    ]

    return len(non_bullet_lines)


def _count_meaningful_projects(
    projects: list[str],
) -> int:
    if not projects:
        return 0

    explicit_titles = [
        line
        for line in projects
        if _is_project_title(line)
    ]

    if explicit_titles:
        return sum(
            1
            for line in explicit_titles
            if len(
                re.findall(
                    r"\b\w+\b",
                    line,
                )
            ) >= 5
        )

    return sum(
        1
        for line in projects
        if (
            line.strip()
            and not _is_bullet(line)
            and len(
                re.findall(
                    r"\b\w+\b",
                    line,
                )
            ) >= 5
        )
    )


def _extract_skills(
    skills_section: list[str],
) -> list[str]:
    skills = []

    for line in skills_section:
        line = line.strip()

        if not line:
            continue

        if ":" in line:
            line = line.split(
                ":",
                1,
            )[1]

        parts = re.split(
            r"[,;|]",
            line,
        )

        for part in parts:
            skill = part.strip()

            if skill:
                skills.append(skill)

    unique_skills = []
    seen = set()

    for skill in skills:
        normalized = skill.lower()

        if normalized not in seen:
            seen.add(normalized)
            unique_skills.append(skill)

    return unique_skills


def _has_meaningful_content(
    lines: list[str],
    minimum_words: int = 5,
) -> bool:
    for line in lines:
        words = re.findall(
            r"\b\w+\b",
            line,
        )

        if len(words) >= minimum_words:
            return True

    return False


def score_contact_information(
    contact: dict,
) -> dict:
    score = 0
    max_score = 10
    details = {}

    fields = [
        ("name", "Name"),
        ("email", "Email"),
        ("phone", "Phone"),
        ("linkedin", "LinkedIn"),
        ("github", "GitHub"),
    ]

    for field, label in fields:
        if contact.get(field):
            score += 2

            details[field] = {
                "label": label,
                "score": 2,
                "max_score": 2,
                "status": "present",
            }
        else:
            details[field] = {
                "label": label,
                "score": 0,
                "max_score": 2,
                "status": "missing",
            }

    return {
        "score": score,
        "max_score": max_score,
        "details": details,
    }


def score_resume_structure(
    sections: dict,
) -> dict:
    score = 0
    max_score = 20
    details = {}

    structure_rules = [
        ("summary", "Summary/Profile", 3),
        ("education", "Education", 4),
        ("skills", "Skills", 4),
        ("experience", "Experience", 3),
        ("projects", "Projects", 3),
        ("certifications", "Certifications", 3),
    ]

    for section, label, points in structure_rules:
        exists = bool(
            sections.get(section)
        )

        if exists:
            score += points

        details[section] = {
            "label": label,
            "score": points if exists else 0,
            "max_score": points,
            "status": (
                "present"
                if exists
                else "missing"
            ),
        }

    return {
        "score": score,
        "max_score": max_score,
        "details": details,
    }


def score_skills(
    sections: dict,
) -> dict:
    skills_section = sections.get(
        "skills",
        [],
    )

    skills = _extract_skills(
        skills_section
    )

    skill_count = len(skills)

    score = 0
    max_score = 20

    if skill_count > 0:
        score += 5

    if skill_count >= 3:
        score += 5

    if skill_count >= 6:
        score += 5

    if skill_count >= 10:
        score += 5

    return {
        "score": score,
        "max_score": max_score,
        "skill_count": skill_count,
        "skills": skills,
    }


def score_education(
    sections: dict,
    resume_text: str = "",
) -> dict:
    education = sections.get(
        "education",
        [],
    )

    score = 0
    max_score = 15

    combined_text = " ".join(
        education
    ).lower()

    if education:
        score += 5

    degree_patterns = [
        r"\bb\.?\s*tech\b",
        r"\bbtech\b",
        r"\bb\.?\s*e\.?\b",
        r"\bbachelor\b",
        r"\bm\.?\s*tech\b",
        r"\bmtech\b",
        r"\bm\.?\s*e\.?\b",
        r"\bmaster\b",
        r"\bmba\b",
        r"\bph\.?\s*d\b",
        r"\bdegree\b",
        r"\bdiploma\b",
    ]

    has_degree = any(
        re.search(
            pattern,
            combined_text,
        )
        for pattern in degree_patterns
    )

    if has_degree:
        score += 4

    institution_keywords = [
        "university",
        "institute",
        "college",
        "school",
    ]

    has_institution = any(
        re.search(
            rf"\b{re.escape(keyword)}\b",
            combined_text,
        )
        for keyword in institution_keywords
    )

    if has_institution:
        score += 3

    has_year = bool(
        re.search(
            r"\b(?:19|20)\d{2}\b",
            combined_text,
        )
    )

    if not has_year and resume_text:
        has_year = bool(
            re.search(
                r"\b(?:19|20)\d{2}\s*[–—-]\s*"
                r"(?:\d{4}|Present|Current)\b",
                resume_text,
                re.IGNORECASE,
            )
        )

    if has_year:
        score += 3

    return {
        "score": score,
        "max_score": max_score,
        "has_degree": has_degree,
        "has_institution": has_institution,
        "has_year": has_year,
    }


def score_projects(
    sections: dict,
) -> dict:
    projects = sections.get(
        "projects",
        [],
    )

    project_count = _count_project_entries(
        projects
    )

    meaningful_projects = (
        _count_meaningful_projects(
            projects
        )
    )

    score = 0
    max_score = 15

    if projects:
        score += 5

    if project_count >= 1:
        score += 3

    if project_count >= 2:
        score += 3

    if meaningful_projects > 0:
        score += 4

    return {
        "score": score,
        "max_score": max_score,
        "project_count": project_count,
        "meaningful_projects": meaningful_projects,
    }


def score_experience(
    sections: dict,
) -> dict:
    experience = sections.get(
        "experience",
        [],
    )

    experience_count = _count_experience_entries(
        experience
    )

    score = 0
    max_score = 10

    if experience:
        score += 3

    if experience_count >= 1:
        score += 4

    combined_text = " ".join(
        experience
    ).lower()

    role_keywords = [
        "engineer",
        "developer",
        "intern",
        "analyst",
        "manager",
        "designer",
        "consultant",
        "researcher",
        "associate",
        "specialist",
        "architect",
        "administrator",
        "scientist",
        "trainee",
        "lead",
    ]

    has_role = any(
        re.search(
            rf"\b{re.escape(keyword)}\b",
            combined_text,
        )
        for keyword in role_keywords
    )

    meaningful_experience = _has_meaningful_content(
        experience,
        minimum_words=5,
    )

    if meaningful_experience:
        score += 1

    if has_role:
        score += 2

    return {
        "score": score,
        "max_score": max_score,
        "experience_count": experience_count,
        "has_role": has_role,
        "meaningful_experience": meaningful_experience,
    }


def score_completeness(
    sections: dict,
    resume_text: str = "",
) -> dict:
    score = 0
    max_score = 10

    has_content = any(
        bool(lines)
        for lines in sections.values()
    )

    if has_content:
        score += 3

    skills_result = score_skills(
        sections
    )

    projects_result = score_projects(
        sections
    )

    experience_result = score_experience(
        sections
    )

    education_result = score_education(
        sections,
        resume_text,
    )

    meaningful_skills = (
        skills_result["skill_count"] >= 3
    )

    if meaningful_skills:
        score += 2

    meaningful_projects = (
        projects_result["meaningful_projects"] > 0
        or experience_result["meaningful_experience"]
    )

    if meaningful_projects:
        score += 2

    if education_result["has_year"]:
        score += 2

    core_sections = [
        "education",
        "skills",
        "projects",
    ]

    core_sections_complete = all(
        bool(sections.get(section))
        for section in core_sections
    )

    if core_sections_complete:
        score += 1

    return {
        "score": score,
        "max_score": max_score,
        "meaningful_skills": meaningful_skills,
        "meaningful_projects_or_experience": (
            meaningful_projects
        ),
        "education_year": education_result[
            "has_year"
        ],
        "core_sections_complete": (
            core_sections_complete
        ),
    }


def calculate_percentage(
    score: int,
    max_score: int,
) -> float:
    if max_score == 0:
        return 0.0

    return round(
        (score / max_score) * 100,
        2,
    )


def _build_strengths_and_weaknesses(
    categories: dict,
) -> tuple[list[str], list[str]]:
    strengths = []
    weaknesses = []

    for name, result in categories.items():
        percentage = calculate_percentage(
            result["score"],
            result["max_score"],
        )

        display_name = name.replace(
            "_",
            " ",
        ).title()

        if percentage >= 80:
            strengths.append(
                display_name
            )

        elif percentage < 50:
            weaknesses.append(
                display_name
            )

    return strengths, weaknesses


def score_resume(
    resume_data: dict,
) -> dict:
    contact = resume_data.get(
        "contact",
        {},
    )

    sections = resume_data.get(
        "sections",
        {},
    )

    resume_text = resume_data.get(
        "normalized_text",
        "",
    )

    contact_result = score_contact_information(
        contact
    )

    structure_result = score_resume_structure(
        sections
    )

    skills_result = score_skills(
        sections
    )

    education_result = score_education(
        sections,
        resume_text,
    )

    projects_result = score_projects(
        sections
    )

    experience_result = score_experience(
        sections
    )

    completeness_result = score_completeness(
        sections,
        resume_text,
    )

    breakdown = {
        "contact": contact_result,
        "structure": structure_result,
        "skills": skills_result,
        "education": education_result,
        "projects": projects_result,
        "experience": experience_result,
        "completeness": completeness_result,
    }

    overall_score = sum(
        result["score"]
        for result in breakdown.values()
    )

    overall_score = min(
        overall_score,
        100,
    )

    strengths, weaknesses = (
        _build_strengths_and_weaknesses(
            breakdown
        )
    )

    return {
        "overall_score": overall_score,
        "max_score": 100,
        "breakdown": breakdown,
        "categories": breakdown,
        "strengths": strengths,
        "weaknesses": weaknesses,
    }