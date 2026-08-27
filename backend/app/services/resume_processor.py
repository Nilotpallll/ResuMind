import re


SECTION_ALIASES = {
    "summary": {
        "summary",
        "professional summary",
        "professional profile",
        "profile",
        "career summary",
        "career objective",
        "objective",
        "about me",
    },
    "education": {
        "education",
        "educational background",
        "academic background",
        "academic qualifications",
        "qualifications",
        "academic history",
    },
    "skills": {
        "skills",
        "technical skills",
        "technical skill",
        "core skills",
        "core competencies",
        "technical expertise",
        "technical proficiencies",
        "technologies",
        "technology stack",
        "skills and technologies",
    },
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "work history",
        "employment history",
        "professional history",
        "career history",
    },
    "projects": {
        "projects",
        "project",
        "personal projects",
        "academic projects",
        "professional projects",
        "key projects",
        "selected projects",
    },
    "certifications": {
        "certifications",
        "certification",
        "certificates",
        "courses and certifications",
        "certifications and courses",
        "professional certifications",
    },
}


CONTACT_PATTERNS = {
    "email": re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    ),
    "phone": re.compile(
        r"(?<!\d)(?:\+?\d{1,3}[-.\s]?)?"
        r"(?:\(?\d{3}\)?[-.\s]?)?"
        r"\d{3}[-.\s]?\d{4}(?!\d)"
    ),
    "linkedin": re.compile(
        r"(?:https?://)?(?:www\.)?linkedin\.com/in/[A-Za-z0-9._-]+",
        re.IGNORECASE,
    ),
    "github": re.compile(
        r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9._-]+",
        re.IGNORECASE,
    ),
}


def normalize_text(text: str) -> str:
    """Clean extracted resume text while preserving useful line breaks."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def detect_section(line: str) -> str | None:
    """Identify whether a line represents a known resume section."""
    normalized_line = re.sub(r"[^a-zA-Z ]", " ", line)
    normalized_line = re.sub(r"\s+", " ", normalized_line)
    normalized_line = normalized_line.strip().lower()

    for section, aliases in SECTION_ALIASES.items():
        if normalized_line in aliases:
            return section

    return None


def extract_sections(text: str) -> dict[str, list[str]]:
    """Split normalized resume text into recognized sections."""
    sections = {section: [] for section in SECTION_ALIASES}
    current_section = None

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        detected_section = detect_section(line)

        if detected_section:
            current_section = detected_section
            continue

        if current_section:
            sections[current_section].append(line)

    return sections


def normalize_url(url: str) -> str:
    """Normalize social profile URLs to a consistent format."""
    url = url.strip()

    if not url.startswith(("http://", "https://")):
        return f"https://{url}"

    return url


def extract_contact_info(text: str) -> dict[str, str | None]:
    """Extract and normalize common contact details from resume text."""
    contact = {
        "email": None,
        "phone": None,
        "linkedin": None,
        "github": None,
    }

    for field, pattern in CONTACT_PATTERNS.items():
        match = pattern.search(text)

        if not match:
            continue

        value = match.group(0)

        if field in {"linkedin", "github"}:
            value = normalize_url(value)

        contact[field] = value

    return contact


def extract_name(text: str) -> str | None:
    """Extract a likely candidate name from the resume header."""
    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue

        if detect_section(line):
            break

        if CONTACT_PATTERNS["email"].search(line):
            continue

        if CONTACT_PATTERNS["phone"].search(line):
            continue

        if CONTACT_PATTERNS["linkedin"].search(line):
            continue

        if CONTACT_PATTERNS["github"].search(line):
            continue

        if 1 <= len(line.split()) <= 5:
            return line

    return None


def process_resume(text: str) -> dict:
    """Create a structured representation of the resume."""
    normalized_text = normalize_text(text)

    return {
        "raw_text": text,
        "normalized_text": normalized_text,
        "contact": {
            "name": extract_name(normalized_text),
            **extract_contact_info(normalized_text),
        },
        "sections": extract_sections(normalized_text),
    }