import re

from app.services.ats_analyzer import (
    _extract_nlp_keywords,
    _extract_vocabulary_skills,
    nlp,
    normalize_text,
)


def _extract_required_phrases(text: str) -> list[str]:
    """
    Extract common requirement phrases from a job description.
    """
    phrase_patterns = [
        r"\brest\s+api(?:s)?\b",
        r"\bmachine\s+learning\b",
        r"\bdeep\s+learning\b",
        r"\bnatural\s+language\s+processing\b",
        r"\bcomputer\s+vision\b",
        r"\bdata\s+science\b",
        r"\bdata\s+analysis\b",
        r"\bdata\s+visualization\b",
        r"\bsoftware\s+development\b",
        r"\bweb\s+development\b",
        r"\bfull[\s-]?stack\s+development\b",
        r"\bfront[\s-]?end\s+development\b",
        r"\bback[\s-]?end\s+development\b",
        r"\bobject[\s-]?oriented\s+programming\b",
        r"\bversion\s+control\b",
        r"\bcontinuous\s+integration\b",
        r"\bcontinuous\s+deployment\b",
        r"\bci/cd\b",
        r"\bcloud\s+computing\b",
        r"\bproblem\s+solving\b",
        r"\bcommunication\s+skills\b",
        r"\bteamwork\b",
    ]

    phrases = set()
    normalized_text = text.lower()

    for pattern in phrase_patterns:
        matches = re.findall(
            pattern,
            normalized_text,
        )

        for match in matches:
            phrase = re.sub(
                r"\s+",
                " ",
                match,
            ).strip()

            if phrase == "rest apis":
                phrase = "rest api"

            if phrase == "front end development":
                phrase = "front-end development"

            if phrase == "back end development":
                phrase = "back-end development"

            if phrase == "full stack development":
                phrase = "full-stack development"

            phrases.add(phrase)

    return sorted(phrases)


def _extract_requirement_context(text: str) -> list[str]:
    """
    Extract sentences related to job requirements
    and responsibility sections.
    """
    requirement_indicators = (
        "required",
        "requirements",
        "qualifications",
        "qualification",
        "skills",
        "experience",
        "knowledge",
        "proficiency",
        "proficient",
        "familiarity",
        "ability",
        "responsibilities",
        "must have",
        "should have",
    )

    section_headers = (
        "requirements:",
        "required qualifications:",
        "qualifications:",
        "skills:",
        "responsibilities:",
        "what you'll do:",
        "what you will do:",
        "experience:",
    )

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    requirement_context = []
    active_requirement_section = False

    for line in lines:
        lowered = line.lower()

        if any(
            header in lowered
            for header in section_headers
        ):
            active_requirement_section = True
            requirement_context.append(line)
            continue

        if lowered.endswith(":"):
            active_requirement_section = False

        if active_requirement_section:
            requirement_context.append(line)
            continue

        if any(
            indicator in lowered
            for indicator in requirement_indicators
        ):
            requirement_context.append(line)

    return requirement_context


def analyze_job_description(text: str) -> dict:
    """
    Analyze a job description using spaCy,
    controlled skills, phrases, and requirement context.
    """
    normalized_text = normalize_text(text)

    if not normalized_text:
        return {
            "skills": [],
            "keywords": [],
            "phrases": [],
            "requirement_context": [],
            "skill_count": 0,
            "keyword_count": 0,
            "phrase_count": 0,
        }

    doc = nlp(normalized_text)

    vocabulary_skills = _extract_vocabulary_skills(
        normalized_text
    )

    nlp_keywords = _extract_nlp_keywords(doc)

    phrases = _extract_required_phrases(
        normalized_text
    )

    keywords = sorted(
        set(
            vocabulary_skills
            + nlp_keywords
            + phrases
        )
    )

    requirement_context = _extract_requirement_context(
        normalized_text
    )

    return {
        "skills": vocabulary_skills,
        "keywords": keywords,
        "phrases": phrases,
        "requirement_context": requirement_context,
        "skill_count": len(vocabulary_skills),
        "keyword_count": len(keywords),
        "phrase_count": len(phrases),
    }