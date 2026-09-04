import re


SECTION_ALIASES = {
    "summary": {
        "summary",
        "profile",
        "professional summary",
        "objective",
        "career objective",
    },
    "education": {
        "education",
        "academic background",
        "academic qualifications",
    },
    "skills": {
        "skills",
        "technical skills",
        "technical skill",
        "skills & technologies",
        "technologies",
    },
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "employment",
    },
    "projects": {
        "projects",
        "academic projects",
        "personal projects",
        "project experience",
    },
    "certifications": {
        "certifications",
        "certificates",
        "certification",
    },
    "achievements": {
        "achievements",
        "awards",
        "honors",
        "accomplishments",
    },
    "publications": {
        "publications",
        "patents & publications",
        "patents and publications",
        "research publications",
        "patents",
    },
}


CONTACT_PATTERNS = {
    "email": re.compile(
        r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
        re.IGNORECASE,
    ),
    "phone": re.compile(
        r"(?<!\d)\+?\d[\d\s().-]{8,}\d(?!\d)"
    ),
    "linkedin": re.compile(
        r"(?:https?://)?(?:www\.)?linkedin\.com/[^\s|]+",
        re.IGNORECASE,
    ),
    "github": re.compile(
        r"(?:https?://)?(?:www\.)?github\.com/[^\s|]+",
        re.IGNORECASE,
    ),
}


def normalize_text(text: str) -> str:
    """
    Normalize extracted resume text while preserving line structure.
    """

    if not text:
        return ""

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


def _normalize_section_heading(line: str) -> str:
    """
    Normalize a possible section heading.
    """

    normalized = line.strip().lower()

    normalized = re.sub(
        r"[:\-]+$",
        "",
        normalized,
    )

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized


def detect_section(line: str) -> str | None:
    """
    Detect whether a line represents a known resume section.
    """

    normalized = _normalize_section_heading(line)

    for section, aliases in SECTION_ALIASES.items():
        if normalized in aliases:
            return section

    return None


def _normalize_publication_entries(
    lines: list[str],
) -> list[str]:
    """
    Normalize publication entries.

    If extracted text already contains separate publication lines,
    preserve those boundaries.

    For flattened PDF/DOCX text where multiple publications appear
    on the same line, reconstruct entries using a publication-style
    boundary.
    """

    non_empty_lines = [
        line.strip()
        for line in lines
        if line.strip()
    ]

    if not non_empty_lines:
        return []

    publication_boundary = re.compile(
        r"(?<=[.!?])\s+"
        r"(?=[A-Z][A-Za-z0-9&'()/+.,\- ]{2,100}"
        r"\s+[–—-]\s+"
        r"(?:Published|Patent|Presented)\b)",
        re.IGNORECASE,
    )

    entries = []

    for line in non_empty_lines:
        parts = publication_boundary.split(line)

        entries.extend(
            part.strip()
            for part in parts
            if part.strip()
        )

    return entries


def _normalize_section_entries(
    section: str,
    lines: list[str],
) -> list[str]:
    """
    Apply section-specific normalization.
    """

    if section == "publications":
        return _normalize_publication_entries(
            lines
        )

    return [
        line.strip()
        for line in lines
        if line.strip()
    ]


def extract_sections(text: str) -> dict[str, list[str]]:
    """
    Extract recognized resume sections while preserving their entries.
    """

    sections = {
        section: []
        for section in SECTION_ALIASES
    }

    current_section = None

    for line in text.splitlines():
        stripped = line.strip()

        if not stripped:
            continue

        detected = detect_section(stripped)

        if detected:
            current_section = detected
            continue

        if current_section:
            sections[current_section].append(
                stripped
            )

    for section in sections:
        sections[section] = _normalize_section_entries(
            section,
            sections[section],
        )

    return sections


def normalize_url(url: str) -> str:
    """
    Normalize a profile URL.
    """

    value = url.strip()

    value = re.sub(
        r"^\[",
        "",
        value,
    )

    value = re.sub(
        r"\]\([^)]*\)$",
        "",
        value,
    )

    if not re.match(
        r"^https?://",
        value,
        re.IGNORECASE,
    ):
        value = "https://" + value

    return value


def extract_contact_info(
    text: str,
) -> dict[str, str | None]:
    """
    Extract contact information from resume text.
    """

    contact = {
        "name": None,
        "email": None,
        "phone": None,
        "linkedin": None,
        "github": None,
    }

    email_match = CONTACT_PATTERNS["email"].search(
        text
    )

    phone_match = CONTACT_PATTERNS["phone"].search(
        text
    )

    linkedin_match = CONTACT_PATTERNS[
        "linkedin"
    ].search(text)

    github_match = CONTACT_PATTERNS[
        "github"
    ].search(text)

    if email_match:
        contact["email"] = email_match.group(
            0
        )

    if phone_match:
        phone = re.sub(
            r"\D",
            "",
            phone_match.group(0),
        )

        if len(phone) >= 10:
            contact["phone"] = phone[-10:]

    if linkedin_match:
        contact["linkedin"] = normalize_url(
            linkedin_match.group(0)
        )

    if github_match:
        contact["github"] = normalize_url(
            github_match.group(0)
        )

    return contact


def _clean_header_for_name(
    header: str,
) -> str:
    """
    Remove known contact information from a resume header.
    """

    cleaned = header

    for pattern in CONTACT_PATTERNS.values():
        cleaned = pattern.sub(
            " ",
            cleaned,
        )

    cleaned = re.sub(
        r"https?://\S+",
        " ",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\[[^\]]+\]\([^)]+\)",
        " ",
        cleaned,
    )

    cleaned = cleaned.replace(
        "|",
        " ",
    )

    cleaned = re.sub(
        r"\s+",
        " ",
        cleaned,
    )

    return cleaned.strip()


def extract_name(
    text: str,
) -> str | None:
    """
    Extract the candidate name from the resume header.

    The parser first examines content before the first recognized
    resume section. Known contact information is removed, leaving
    the likely candidate name.

    No person-specific names are hardcoded.
    """

    if not text:
        return None

    normalized = normalize_text(text)

    header_lines = []

    for line in normalized.splitlines():
        section = detect_section(line)

        if section:
            break

        header_lines.append(line)

    header = " ".join(
        header_lines
    ).strip()

    if not header:
        return None

    cleaned = _clean_header_for_name(
        header
    )

    if not cleaned:
        return None

    candidates = [
        candidate.strip()
        for candidate in re.split(
            r"\s{2,}",
            cleaned,
        )
        if candidate.strip()
    ]

    if not candidates:
        candidates = [
            cleaned
        ]

    for candidate in candidates:
        candidate = candidate.strip(
            " -–—|,:;"
        )

        words = candidate.split()

        if not words:
            continue

        if not (
            1 <= len(words) <= 5
        ):
            continue

        if any(
            re.search(r"\d", word)
            for word in words
        ):
            continue

        if any(
            "@" in word
            for word in words
        ):
            continue

        if any(
            "." in word
            for word in words
        ):
            continue

        if all(
            re.fullmatch(
                r"[A-Za-z][A-Za-z'’-]*",
                word,
            )
            for word in words
        ):
            return candidate

    words = cleaned.split()

    if (
        1 <= len(words) <= 5
        and all(
            re.fullmatch(
                r"[A-Za-z][A-Za-z'’-]*",
                word,
            )
            for word in words
        )
    ):
        return cleaned

    return None


def process_resume(text: str) -> dict:
    """
    Convert extracted resume text into structured resume data.
    """

    normalized_text = normalize_text(
        text
    )

    contact = extract_contact_info(
        normalized_text
    )

    contact["name"] = extract_name(
        normalized_text
    )

    sections = extract_sections(
        normalized_text
    )

    return {
        "raw_text": text,
        "normalized_text": normalized_text,
        "contact": contact,
        "sections": sections,
    }