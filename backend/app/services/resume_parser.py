from pathlib import Path
import re

import pymupdf
from docx import Document


SUPPORTED_EXTENSIONS = {".pdf", ".docx"}

RESUME_SECTION_HEADINGS = (
    "Education",
    "Experience",
    "Projects",
    "Achievements",
    "Patents & Publications",
    "Technical Skills",
)

SKILL_CATEGORY_HEADINGS = (
    "Languages:",
    "Frameworks & Libraries:",
    "Databases & Cloud:",
    "AI & Engineering:",
    "Developer Tools & Core CS:",
)

MONTH_PATTERN = (
    r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
    r"\.?"
)

MONTH_DATE_RANGE_PATTERN = re.compile(
    rf"\b"
    rf"{MONTH_PATTERN}\s+\d{{4}}"
    rf"\s*[–—-]\s*"
    rf"(?:Present|{MONTH_PATTERN}\s+\d{{4}})"
    rf"\b",
    re.IGNORECASE,
)

YEAR_RANGE_PATTERN = re.compile(
    r"\b\d{4}\s*[–—-]\s*\d{4}\b"
)

PHONE_PATTERN = re.compile(
    r"\b\d{10}\b"
)

EMAIL_PATTERN = re.compile(
    r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
    re.IGNORECASE,
)

PROFILE_PATTERN = re.compile(
    r"(?:linkedin\.com|github\.com)/[^\s|]+",
    re.IGNORECASE,
)


def extract_pdf_text(file_path: str) -> str:
    document = pymupdf.open(file_path)

    try:
        return "\n".join(
            page.get_text()
            for page in document
        ).strip()
    finally:
        document.close()


def _normalize_docx_text(text: str) -> str:
    text = text.replace("\xa0", " ")

    text = text.replace("\ufb00", "ff")
    text = text.replace("\ufb01", "fi")
    text = text.replace("\ufb02", "fl")
    text = text.replace("\ufb03", "ffi")
    text = text.replace("\ufb04", "ffl")

    text = text.replace("\u2013", "–")
    text = text.replace("\u2014", "—")

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r"\s*\|\s*",
        " | ",
        text,
    )

    return text.strip()


def _find_section_matches(
    text: str,
) -> list[tuple[str, int, int]]:
    matches = []

    for heading in RESUME_SECTION_HEADINGS:
        pattern = re.compile(
            rf"\b{re.escape(heading)}\b",
            re.IGNORECASE,
        )

        match = pattern.search(text)

        if match:
            matches.append(
                (
                    heading,
                    match.start(),
                    match.end(),
                )
            )

    return sorted(
        matches,
        key=lambda item: item[1],
    )


def _split_section_headings(text: str) -> str:
    """
    Reconstruct top-level resume sections from flattened DOCX text.
    """

    matches = _find_section_matches(text)

    if not matches:
        return text

    valid_matches = []

    expected_index = 0
    last_position = -1

    for heading, start, end in matches:
        heading_index = RESUME_SECTION_HEADINGS.index(
            heading
        )

        if heading_index != expected_index:
            continue

        if start < last_position:
            continue

        valid_matches.append(
            (
                heading,
                start,
                end,
            )
        )

        last_position = start
        expected_index += 1

    if not valid_matches:
        return text

    result = []

    first_start = valid_matches[0][1]

    if first_start > 0:
        result.append(
            text[:first_start].strip()
        )

    for index, (
        heading,
        start,
        end,
    ) in enumerate(valid_matches):

        if index + 1 < len(valid_matches):
            content_end = valid_matches[index + 1][1]
        else:
            content_end = len(text)

        content = text[end:content_end].strip()

        result.append(heading)

        if content:
            result.append(content)

    return "\n".join(
        part
        for part in result
        if part.strip()
    )


def _extract_header_from_text(
    text: str,
) -> tuple[str, str]:
    """
    Extract contact/header information from flattened resume text.
    """

    phone_match = PHONE_PATTERN.search(text)
    email_match = EMAIL_PATTERN.search(text)

    profile_matches = list(
        PROFILE_PATTERN.finditer(text)
    )

    if not (
        phone_match
        or email_match
        or profile_matches
    ):
        return "", text

    positions = []

    if phone_match:
        positions.append(
            (
                phone_match.start(),
                phone_match.end(),
            )
        )

    if email_match:
        positions.append(
            (
                email_match.start(),
                email_match.end(),
            )
        )

    positions.extend(
        (
            match.start(),
            match.end(),
        )
        for match in profile_matches
    )

    start = min(
        position[0]
        for position in positions
    )

    end = max(
        position[1]
        for position in positions
    )

    header_start = text.rfind(
        "\n",
        0,
        start,
    )

    if header_start == -1:
        header_start = 0
    else:
        header_start += 1

    header_end = end

    remaining_start = header_end

    while (
        remaining_start < len(text)
        and text[remaining_start] in " |"
    ):
        remaining_start += 1

    header = text[
        header_start:header_end
    ].strip()

    remaining = (
        text[:header_start]
        + text[remaining_start:]
    ).strip()

    return header, remaining


def _split_header(text: str) -> str:
    """
    Move contact/header information before the first resume section.
    """

    section_match = re.search(
        r"\bEducation\b",
        text,
        re.IGNORECASE,
    )

    if not section_match:
        return text

    education_start = section_match.start()
    education_end = section_match.end()

    before_education = text[:education_start].strip()
    after_education = text[education_end:].strip()

    header, remaining_before = _extract_header_from_text(
        before_education
    )

    if not header:
        header, remaining_after = _extract_header_from_text(
            after_education
        )

        if header:
            return "\n".join(
                part
                for part in (
                    header,
                    "Education",
                    remaining_after,
                )
                if part.strip()
            )

        return text

    return "\n".join(
        part
        for part in (
            header,
            "Education",
            remaining_before,
            after_education,
        )
        if part.strip()
    )


def _split_date_boundaries(text: str) -> str:
    """
    Put date ranges on their own lines.
    """

    result = MONTH_DATE_RANGE_PATTERN.sub(
        lambda match: (
            "\n"
            + match.group(0).strip()
            + "\n"
        ),
        text,
    )

    result = YEAR_RANGE_PATTERN.sub(
        lambda match: (
            "\n"
            + match.group(0).strip()
            + "\n"
        ),
        result,
    )

    result = re.sub(
        r"\n+",
        "\n",
        result,
    )

    return result.strip()


def _split_bullets(text: str) -> str:
    """
    Reconstruct bullet points from flattened text.
    """

    return re.sub(
        r"\s*•\s*",
        "\n• ",
        text,
    ).strip()


def _find_month_date_positions(
    text: str,
) -> list[re.Match]:
    return list(
        MONTH_DATE_RANGE_PATTERN.finditer(text)
    )


def _split_experience_entries(text: str) -> str:
    """
    Reconstruct flattened experience entries.

    The important structural signal is a month-based employment
    date range. When a new date range appears after existing
    experience content, the preceding non-bullet content is kept
    separate from the new entry.

    Job titles and company names are not hardcoded.
    """

    text = _split_bullets(text)

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:
        return ""

    rebuilt = []

    for line in lines:
        if line.startswith("•"):
            rebuilt.append(line)
            continue

        matches = _find_month_date_positions(line)

        if not matches:
            rebuilt.append(line)
            continue

        cursor = 0

        for match in matches:
            before = line[
                cursor:match.start()
            ].strip()

            date = match.group(0).strip()

            if before:
                rebuilt.append(before)

            rebuilt.append(date)

            cursor = match.end()

        after = line[cursor:].strip()

        if after:
            rebuilt.append(after)

    return "\n".join(rebuilt)


def _split_project_entries(text: str) -> str:
    """
    Reconstruct flattened project entries.

    Project titles are detected using the common:
        Project Title | technologies
    pattern.
    """

    text = _split_bullets(text)

    project_boundary = re.compile(
        r"(?<=[.!?])\s+"
        r"(?=[A-Z][A-Za-z0-9&'()/+.,\- ]{2,100}"
        r"\s*\|\s*)"
    )

    rebuilt = []

    for line in text.splitlines():
        stripped = line.strip()

        if not stripped:
            continue

        if stripped.startswith("•"):
            bullet_content = stripped[1:].strip()

            parts = project_boundary.split(
                bullet_content
            )

            if len(parts) == 1:
                rebuilt.append(
                    "• " + bullet_content
                )
                continue

            rebuilt.append(
                "• " + parts[0].strip()
            )

            for part in parts[1:]:
                if part.strip():
                    rebuilt.append(
                        part.strip()
                    )

            continue

        parts = project_boundary.split(
            stripped
        )

        rebuilt.extend(
            part.strip()
            for part in parts
            if part.strip()
        )

    return "\n".join(rebuilt)


def _split_publication_entries(text: str) -> str:
    """
    Separate consecutive publication entries.
    """

    text = _split_bullets(text)

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:
        return ""

    combined_text = " ".join(lines)

    combined_text = re.sub(
        r"\s+",
        " ",
        combined_text,
    ).strip()

    boundary = re.compile(
        r"(?<=[.!?])\s+"
        r"(?=[A-Z][A-Za-z0-9&'()/+.,\- ]{2,100}"
        r"\s*[–—-]\s*"
        r"(?:Published|Patent|Presented)\b)",
        re.IGNORECASE,
    )

    entries = boundary.split(
        combined_text
    )

    return "\n".join(
        entry.strip()
        for entry in entries
        if entry.strip()
    )


def _split_skill_categories(text: str) -> str:
    """
    Separate flattened technical-skill categories.
    """

    for category in SKILL_CATEGORY_HEADINGS:
        text = re.sub(
            rf"\s+(?={re.escape(category)})",
            "\n",
            text,
            flags=re.IGNORECASE,
        )

    return text.strip()


def _reconstruct_sections(text: str) -> str:
    """
    Apply section-specific reconstruction while preserving content
    before the first top-level section.
    """

    blocks = []

    current_section = None
    current_lines = []
    pre_section_lines = []

    for line in text.splitlines():
        stripped = line.strip()

        if not stripped:
            continue

        heading = next(
            (
                section
                for section in RESUME_SECTION_HEADINGS
                if stripped.lower()
                == section.lower()
            ),
            None,
        )

        if heading:
            if current_section is not None:
                blocks.append(
                    (
                        current_section,
                        current_lines,
                    )
                )
            elif current_lines:
                pre_section_lines = current_lines

            current_section = heading
            current_lines = []
            continue

        current_lines.append(stripped)

    if current_section is not None:
        blocks.append(
            (
                current_section,
                current_lines,
            )
        )

    output = []

    if pre_section_lines:
        output.extend(pre_section_lines)

    for section, lines in blocks:
        output.append(section)

        section_text = "\n".join(lines)

        if section == "Experience":
            section_text = _split_experience_entries(
                section_text
            )

        elif section == "Projects":
            section_text = _split_project_entries(
                section_text
            )

        elif section == "Patents & Publications":
            section_text = _split_publication_entries(
                section_text
            )

        elif section == "Technical Skills":
            section_text = _split_skill_categories(
                section_text
            )

        if section_text.strip():
            output.extend(
                line.strip()
                for line in section_text.splitlines()
                if line.strip()
            )

    return "\n".join(output).strip()


def _reconstruct_flattened_resume(text: str) -> str:
    text = _normalize_docx_text(text)

    if not text:
        return ""

    text = _split_section_headings(text)
    text = _split_header(text)

    return _reconstruct_sections(text)


def extract_docx_text(file_path: str) -> str:
    document = Document(file_path)

    paragraphs = [
        paragraph.text.strip()
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    if not paragraphs:
        return ""

    if len(paragraphs) > 1:
        return "\n".join(paragraphs)

    return _reconstruct_flattened_resume(
        paragraphs[0]
    )


def extract_resume_text(file_path: str) -> str:
    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    if extension == ".docx":
        return extract_docx_text(file_path)

    raise ValueError("Unsupported file type")