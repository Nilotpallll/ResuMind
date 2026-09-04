from app.services.ats_matcher import (
    _calculate_percentage,
    calculate_ats_score,
    compare_keywords,
    compare_skills,
    generate_recommendations,
    match_resume_to_job,
)


def test_calculate_percentage():
    assert _calculate_percentage(5, 10) == 50
    assert _calculate_percentage(3, 4) == 75
    assert _calculate_percentage(0, 10) == 0


def test_calculate_percentage_with_zero_required():
    assert _calculate_percentage(0, 0) == 0
    assert _calculate_percentage(5, 0) == 0


def test_compare_skills():
    resume_skills = [
        "python",
        "flask",
        "react",
        "postgresql",
    ]

    job_skills = [
        "python",
        "flask",
        "postgresql",
        "docker",
    ]

    result = compare_skills(
        resume_skills,
        job_skills,
    )

    assert result["matched"] == [
        "flask",
        "postgresql",
        "python",
    ]

    assert result["missing"] == [
        "docker",
    ]

    assert result["match_percentage"] == 75
    assert result["required_count"] == 4
    assert result["matched_count"] == 3


def test_compare_skills_normalizes_aliases():
    resume_skills = [
        "REST",
        "Postgres",
        "React.js",
    ]

    job_skills = [
        "REST API",
        "PostgreSQL",
        "React",
    ]

    result = compare_skills(
        resume_skills,
        job_skills,
    )

    assert result["matched"] == [
        "postgresql",
        "react",
        "rest api",
    ]

    assert result["missing"] == []
    assert result["match_percentage"] == 100


def test_compare_keywords():
    resume_keywords = [
        "python",
        "flask",
        "docker",
        "rest api",
    ]

    job_keywords = [
        "python",
        "flask",
        "docker",
        "rest api",
        "aws",
    ]

    result = compare_keywords(
        resume_keywords,
        job_keywords,
    )

    assert result["matched"] == [
        "docker",
        "flask",
        "python",
        "rest api",
    ]

    assert result["missing"] == [
        "aws",
    ]

    assert result["match_percentage"] == 80
    assert result["required_count"] == 5
    assert result["matched_count"] == 4


def test_compare_empty_skills():
    result = compare_skills(
        [],
        ["python", "flask"],
    )

    assert result["matched"] == []
    assert result["missing"] == [
        "flask",
        "python",
    ]
    assert result["match_percentage"] == 0
    assert result["required_count"] == 2
    assert result["matched_count"] == 0


def test_compare_empty_job_skills():
    result = compare_skills(
        ["python", "flask"],
        [],
    )

    assert result["matched"] == []
    assert result["missing"] == []
    assert result["match_percentage"] == 0
    assert result["required_count"] == 0
    assert result["matched_count"] == 0


def test_calculate_ats_score():
    assert calculate_ats_score(
        100,
        100,
    ) == 100

    assert calculate_ats_score(
        100,
        0,
    ) == 60

    assert calculate_ats_score(
        0,
        100,
    ) == 40

    assert calculate_ats_score(
        75,
        50,
    ) == 65


def test_generate_recommendations():
    recommendations = generate_recommendations(
        ["aws", "ci/cd"],
        ["aws", "ci/cd", "microservices"],
    )

    assert recommendations == [
        "Consider adding 'aws' if you have relevant "
        "experience or practical knowledge.",
        "Consider adding 'ci/cd' if you have relevant "
        "experience or practical knowledge.",
        "Consider mentioning 'microservices' where it "
        "accurately reflects your experience.",
    ]


def test_generate_recommendations_when_nothing_is_missing():
    recommendations = generate_recommendations(
        [],
        [],
    )

    assert recommendations == [
        "Your resume contains the main skills and keywords "
        "identified in the job description."
    ]


def test_match_resume_to_job():
    resume_analysis = {
        "skills": [
            "python",
            "flask",
            "react",
            "postgresql",
            "docker",
        ],
        "keywords": [
            "python",
            "flask",
            "react",
            "postgresql",
            "docker",
            "rest api",
        ],
    }

    job_analysis = {
        "skills": [
            "python",
            "flask",
            "postgresql",
            "docker",
            "aws",
        ],
        "keywords": [
            "python",
            "flask",
            "postgresql",
            "docker",
            "rest api",
            "aws",
        ],
    }

    result = match_resume_to_job(
        resume_analysis,
        job_analysis,
    )

    assert result["ats_score"] == 81

    assert result["skill_match"]["matched"] == [
        "docker",
        "flask",
        "postgresql",
        "python",
    ]

    assert result["skill_match"]["missing"] == [
        "aws",
    ]

    assert result["skill_match"]["match_percentage"] == 80

    assert result["keyword_match"]["matched"] == [
        "docker",
        "flask",
        "postgresql",
        "python",
        "rest api",
    ]

    assert result["keyword_match"]["missing"] == [
        "aws",
    ]

    assert result["keyword_match"]["match_percentage"] == 83

    assert result["recommendations"] == [
        "Consider adding 'aws' if you have relevant "
        "experience or practical knowledge."
    ]


def test_match_resume_to_job_with_empty_analysis():
    result = match_resume_to_job(
        {},
        {},
    )

    assert result["ats_score"] == 0

    assert result["skill_match"]["matched"] == []
    assert result["skill_match"]["missing"] == []
    assert result["skill_match"]["match_percentage"] == 0

    assert result["keyword_match"]["matched"] == []
    assert result["keyword_match"]["missing"] == []
    assert result["keyword_match"]["match_percentage"] == 0

    assert result["recommendations"] == [
        "Your resume contains the main skills and keywords "
        "identified in the job description."
    ]
