from app.services.job_description_analyzer import (
    analyze_job_description,
    _extract_required_phrases,
    _extract_requirement_context,
)


def test_empty_job_description():
    result = analyze_job_description("")

    assert result == {
        "skills": [],
        "keywords": [],
        "phrases": [],
        "requirement_context": [],
        "skill_count": 0,
        "keyword_count": 0,
        "phrase_count": 0,
    }


def test_job_description_skill_extraction():
    text = """
    We need a Python developer with Flask, REST APIs,
    PostgreSQL, Docker, AWS and CI/CD experience.
    """

    result = analyze_job_description(text)

    assert result["skills"] == [
        "aws",
        "ci/cd",
        "docker",
        "flask",
        "postgresql",
        "python",
        "rest api",
    ]


def test_job_description_keyword_extraction_is_clean():
    text = """
    We need a Python developer with Flask, REST APIs,
    PostgreSQL, Docker, AWS and CI/CD experience.
    """

    result = analyze_job_description(text)

    assert result["keywords"] == [
        "aws",
        "ci/cd",
        "docker",
        "flask",
        "postgresql",
        "python",
        "rest api",
    ]


def test_rest_api_is_not_duplicated():
    text = """
    Experience building REST APIs and REST API services.
    """

    result = analyze_job_description(text)

    assert "rest api" in result["skills"]
    assert "rest" not in result["skills"]
    assert "api" not in result["skills"]
    assert "apis" not in result["keywords"]


def test_ci_cd_is_not_split():
    text = """
    Experience with CI/CD pipelines and continuous integration.
    """

    result = analyze_job_description(text)

    assert "ci/cd" in result["skills"]
    assert "ci" not in result["keywords"]
    assert "cd" not in result["keywords"]


def test_required_phrases():
    text = """
    Requirements include REST APIs, machine learning,
    data analysis, cloud computing, problem solving,
    and communication skills.
    """

    phrases = _extract_required_phrases(text)

    assert "rest api" in phrases
    assert "machine learning" in phrases
    assert "data analysis" in phrases
    assert "cloud computing" in phrases
    assert "problem solving" in phrases
    assert "communication skills" in phrases


def test_phrase_normalization():
    text = """
    Experience with full stack development,
    front end development and back end development.
    """

    phrases = _extract_required_phrases(text)

    assert "full-stack development" in phrases
    assert "front-end development" in phrases
    assert "back-end development" in phrases


def test_requirement_context():
    text = """
    We are looking for a Python developer.

    Requirements:
    Strong Python and Flask experience.

    Responsibilities:
    Build scalable web applications.

    Benefits:
    Flexible working hours.
    """

    context = _extract_requirement_context(text)

    assert any(
        "Requirements:" in sentence
        for sentence in context
    )

    assert any(
        "Strong Python and Flask experience."
        in sentence
        for sentence in context
    )

    assert any(
        "Responsibilities:" in sentence
        for sentence in context
    )

    assert any(
        "Build scalable web applications."
        in sentence
        for sentence in context
    )

    assert not any(
        "Flexible working hours." in sentence
        for sentence in context
    )


def test_job_description_counts():
    text = """
    Python Flask PostgreSQL Docker AWS CI/CD REST APIs
    """

    result = analyze_job_description(text)

    assert result["skill_count"] == len(result["skills"])
    assert result["keyword_count"] == len(result["keywords"])
    assert result["phrase_count"] == len(result["phrases"])


def test_empty_job_description_has_zero_counts():
    result = analyze_job_description("")

    assert result["skill_count"] == 0
    assert result["keyword_count"] == 0
    assert result["phrase_count"] == 0