from app.services.ats_analyzer import (
    analyze_resume_keywords,
    analyze_resume,
    normalize_text,
    _normalize_skill,
)


def test_normalize_text():
    text = "Python\r\n\r\n\r\nFlask\t\tReact"

    result = normalize_text(text)

    assert result == "Python\n\nFlask React"


def test_normalize_skill_aliases():
    assert _normalize_skill("React.js") == "react"
    assert _normalize_skill("ReactJS") == "react"
    assert _normalize_skill("NodeJS") == "node.js"
    assert _normalize_skill("Postgres") == "postgresql"
    assert _normalize_skill("REST") == "rest api"
    assert _normalize_skill("REST APIs") == "rest api"
    assert _normalize_skill("C plus plus") == "c++"


def test_resume_skill_extraction():
    text = """
    Developed applications using Python, Flask, React,
    PostgreSQL, Docker and REST APIs.
    """

    result = analyze_resume_keywords(text)

    assert result["skills"] == [
        "docker",
        "flask",
        "postgresql",
        "python",
        "react",
        "rest api",
    ]


def test_resume_keyword_extraction_removes_stop_words():
    text = """
    Developed applications using Python, Flask, React,
    PostgreSQL, Docker and REST APIs.
    """

    result = analyze_resume_keywords(text)

    assert "and" not in result["keywords"]
    assert "using" not in result["keywords"]
    assert "developed" not in result["keywords"]


def test_resume_keyword_extraction_removes_rest_duplicates():
    text = """
    Developed applications using Python, Flask,
    REST APIs and REST.
    """

    result = analyze_resume_keywords(text)

    assert "rest api" in result["keywords"]
    assert "rest" not in result["keywords"]
    assert "apis" not in result["keywords"]
    assert "api" not in result["keywords"]


def test_resume_keyword_extraction():
    text = """
    Python Flask React PostgreSQL Docker REST API
    """

    result = analyze_resume_keywords(text)

    assert "python" in result["keywords"]
    assert "flask" in result["keywords"]
    assert "react" in result["keywords"]
    assert "postgresql" in result["keywords"]
    assert "docker" in result["keywords"]
    assert "rest api" in result["keywords"]


def test_empty_resume_text():
    result = analyze_resume_keywords("")

    assert result == {
        "skills": [],
        "keywords": [],
        "skill_count": 0,
        "keyword_count": 0,
    }


def test_none_resume_text():
    result = analyze_resume_keywords(None)

    assert result == {
        "skills": [],
        "keywords": [],
        "skill_count": 0,
        "keyword_count": 0,
    }


def test_resume_analysis_from_processed_resume():
    resume_data = {
        "normalized_text": (
            "Python Flask React PostgreSQL Docker REST APIs"
        )
    }

    result = analyze_resume(resume_data)

    assert "python" in result["skills"]
    assert "flask" in result["skills"]
    assert "react" in result["skills"]
    assert "postgresql" in result["skills"]
    assert "docker" in result["skills"]
    assert "rest api" in result["skills"]


def test_resume_analysis_falls_back_to_sections():
    resume_data = {
        "sections": {
            "skills": [
                "Python",
                "Flask",
                "React",
            ],
            "projects": [
                "Built a REST API using PostgreSQL and Docker."
            ],
        }
    }

    result = analyze_resume(resume_data)

    assert "python" in result["skills"]
    assert "flask" in result["skills"]
    assert "react" in result["skills"]
    assert "postgresql" in result["skills"]
    assert "docker" in result["skills"]
    assert "rest api" in result["skills"]


def test_analyze_resume_empty_data():
    result = analyze_resume({})

    assert result == {
        "skills": [],
        "keywords": [],
        "skill_count": 0,
        "keyword_count": 0,
    }