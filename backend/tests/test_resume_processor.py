from app.services.resume_processor import (
    detect_section,
    extract_contact_info,
    extract_sections,
    normalize_text,
)


def test_normalize_text():
    text = "John   Doe\r\n\r\n\r\nPython\t\tSQL"

    result = normalize_text(text)

    assert result == "John Doe\n\nPython SQL"


def test_detect_section():
    assert detect_section("TECHNICAL SKILLS:") == "skills"
    assert detect_section("Work Experience") == "experience"
    assert detect_section("Academic Background") == "education"
    assert detect_section("Random Heading") is None


def test_extract_sections():
    text = """
    EDUCATION
    B.Tech Computer Science

    SKILLS
    Python
    SQL

    PROJECTS
    Resume Analyzer
    """

    result = extract_sections(normalize_text(text))

    assert result["education"] == ["B.Tech Computer Science"]
    assert result["skills"] == ["Python", "SQL"]
    assert result["projects"] == ["Resume Analyzer"]


def test_extract_contact_info():
    text = """
    Nilotpal Deo
    nilotpal.deo24@vit.edu
    +91 93220 24179
    linkedin.com/in/nilotpal1112712
    github.com/NilotpalIII
    """

    result = extract_contact_info(text)

    assert result["email"] == "nilotpal.deo24@vit.edu"
    assert result["phone"] is not None
    assert result["linkedin"].startswith("https://")
    assert result["github"].startswith("https://")