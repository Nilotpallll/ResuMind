from app.services.feedback_generator import (
    generate_ats_feedback,
    generate_feedback,
    generate_improvements,
    generate_priority_actions,
    generate_strengths,
)


def test_generate_strengths_for_strong_resume():
    analysis = {
        "overall_score": 95,
        "contact": {"score": 10},
        "structure": {"score": 20},
        "skills": {"score": 20},
        "education": {"score": 15},
        "projects": {"score": 15},
        "experience": {"score": 10},
        "completeness": {"score": 10},
    }

    strengths = generate_strengths(analysis)

    assert len(strengths) >= 6
    assert any(
        "contact information" in item
        for item in strengths
    )
    assert any(
        "overall score" in item
        for item in strengths
    )


def test_generate_strengths_for_weak_resume():
    analysis = {
        "overall_score": 45,
        "contact": {"score": 5},
        "structure": {"score": 10},
        "skills": {"score": 10},
        "education": {"score": 8},
        "projects": {"score": 5},
        "experience": {"score": 4},
        "completeness": {"score": 5},
    }

    strengths = generate_strengths(analysis)

    assert strengths == []


def test_generate_strengths_from_real_module_2_structure():
    analysis = {
        "overall_score": 97,
        "breakdown": {
            "contact": {"score": 10},
            "structure": {"score": 17},
            "skills": {"score": 20},
            "education": {"score": 15},
            "projects": {"score": 15},
            "experience": {"score": 10},
            "completeness": {"score": 10},
        },
    }

    strengths = generate_strengths(analysis)

    assert "Your contact information is complete." in strengths
    assert "Your resume has a strong skills section." in strengths
    assert "Your education information is clearly included." in strengths
    assert "Your resume includes relevant projects." in strengths
    assert "Your resume demonstrates relevant experience." in strengths
    assert "Your resume has a strong overall score." in strengths


def test_generate_improvements_for_weak_resume():
    analysis = {
        "overall_score": 45,
        "contact": {"score": 5},
        "structure": {"score": 10},
        "skills": {"score": 10},
        "education": {"score": 8},
        "projects": {"score": 5},
        "experience": {"score": 4},
        "completeness": {"score": 5},
    }

    improvements = generate_improvements(analysis)

    assert len(improvements) >= 5
    assert any(
        "structure" in item.lower()
        for item in improvements
    )
    assert any(
        "skills" in item.lower()
        for item in improvements
    )


def test_generate_improvements_for_strong_resume():
    analysis = {
        "overall_score": 95,
        "contact": {"score": 10},
        "structure": {"score": 20},
        "skills": {"score": 20},
        "education": {"score": 15},
        "projects": {"score": 15},
        "experience": {"score": 10},
        "completeness": {"score": 10},
    }

    improvements = generate_improvements(analysis)

    assert len(improvements) == 1
    assert "strong" in improvements[0].lower()


def test_generate_improvements_from_real_module_2_structure():
    analysis = {
        "overall_score": 97,
        "breakdown": {
            "contact": {"score": 10},
            "structure": {"score": 17},
            "skills": {"score": 20},
            "education": {"score": 15},
            "projects": {"score": 15},
            "experience": {"score": 10},
            "completeness": {"score": 10},
        },
    }

    improvements = generate_improvements(analysis)

    assert len(improvements) == 1
    assert "structure" in improvements[0].lower()


def test_generate_improvements_identifies_missing_sections():
    analysis = {
        "overall_score": 94,
        "breakdown": {
            "structure": {
                "score": 14,
                "details": {
                    "summary": {
                        "label": "Summary/Profile",
                        "score": 0,
                        "status": "missing",
                    },
                    "education": {
                        "label": "Education",
                        "score": 4,
                        "status": "present",
                    },
                    "skills": {
                        "label": "Skills",
                        "score": 4,
                        "status": "present",
                    },
                    "experience": {
                        "label": "Experience",
                        "score": 3,
                        "status": "present",
                    },
                    "projects": {
                        "label": "Projects",
                        "score": 3,
                        "status": "present",
                    },
                    "certifications": {
                        "label": "Certifications",
                        "score": 0,
                        "status": "missing",
                    },
                },
            },
            "skills": {"score": 20},
            "education": {"score": 15},
            "projects": {"score": 15},
            "experience": {"score": 10},
            "completeness": {"score": 10},
        },
    }

    improvements = generate_improvements(
        analysis
    )

    assert len(improvements) == 1
    assert "Summary/Profile" in improvements[0]
    assert "Certifications" in improvements[0]


def test_generate_ats_feedback_with_strong_match():
    ats_analysis = {
        "ats_score": 85,
        "skill_match": {
            "missing": [],
        },
        "keyword_match": {
            "missing": [],
        },
    }

    feedback = generate_ats_feedback(
        ats_analysis
    )

    assert len(feedback) == 1
    assert "strong" in feedback[0].lower()


def test_generate_ats_feedback_with_missing_skills():
    ats_analysis = {
        "ats_score": 65,
        "skill_match": {
            "missing": [
                "aws",
                "ci/cd",
            ],
        },
        "keyword_match": {
            "missing": [],
        },
    }

    feedback = generate_ats_feedback(
        ats_analysis
    )

    assert len(feedback) == 2
    assert any(
        "aws" in item.lower()
        for item in feedback
    )
    assert any(
        "ci/cd" in item.lower()
        for item in feedback
    )


def test_generate_ats_feedback_with_missing_keywords():
    ats_analysis = {
        "ats_score": 55,
        "skill_match": {
            "missing": [],
        },
        "keyword_match": {
            "missing": [
                "scalable",
                "cloud",
            ],
        },
    }

    feedback = generate_ats_feedback(
        ats_analysis
    )

    assert len(feedback) == 2
    assert any(
        "scalable" in item.lower()
        for item in feedback
    )


def test_generate_ats_feedback_without_analysis():
    feedback = generate_ats_feedback(None)

    assert feedback == []


def test_generate_ats_feedback_with_empty_analysis():
    feedback = generate_ats_feedback({})

    assert feedback == []


def test_generate_priority_actions_with_ats_feedback():
    improvements = [
        "Improve resume structure.",
        "Strengthen the skills section.",
    ]

    ats_feedback = [
        "Consider mentioning AWS.",
    ]

    actions = generate_priority_actions(
        improvements,
        ats_feedback,
    )

    assert len(actions) == 3
    assert (
        actions[0]
        == "Address the most relevant missing ATS skills and keywords."
    )


def test_generate_priority_actions_without_ats_feedback():
    improvements = [
        "Improve resume structure.",
        "Strengthen the skills section.",
    ]

    actions = generate_priority_actions(
        improvements,
        [],
    )

    assert actions == [
        "Improve resume structure.",
        "Strengthen the skills section.",
    ]


def test_generate_feedback_without_job_description():
    analysis = {
        "overall_score": 90,
        "contact": {"score": 10},
        "structure": {"score": 20},
        "skills": {"score": 20},
        "education": {"score": 15},
        "projects": {"score": 15},
        "experience": {"score": 10},
        "completeness": {"score": 10},
    }

    feedback = generate_feedback(
        analysis
    )

    assert "strengths" in feedback
    assert "improvements" in feedback
    assert "ats_feedback" in feedback
    assert "priority_actions" in feedback

    assert feedback["strengths"]
    assert feedback["improvements"]
    assert feedback["ats_feedback"] == []
    assert feedback["priority_actions"]


def test_generate_feedback_with_job_description():
    analysis = {
        "overall_score": 75,
        "contact": {"score": 10},
        "structure": {"score": 15},
        "skills": {"score": 16},
        "education": {"score": 15},
        "projects": {"score": 10},
        "experience": {"score": 8},
        "completeness": {"score": 8},
    }

    ats_analysis = {
        "ats_score": 70,
        "skill_match": {
            "missing": [
                "aws",
                "docker",
            ],
        },
        "keyword_match": {
            "missing": [
                "ci/cd",
            ],
        },
    }

    feedback = generate_feedback(
        analysis,
        ats_analysis,
    )

    assert feedback["strengths"]
    assert feedback["improvements"]
    assert feedback["ats_feedback"]
    assert feedback["priority_actions"]

    assert any(
        "aws" in item.lower()
        for item in feedback["ats_feedback"]
    )


def test_generate_feedback_with_empty_analysis():
    feedback = generate_feedback({})

    assert "strengths" in feedback
    assert "improvements" in feedback
    assert "ats_feedback" in feedback
    assert "priority_actions" in feedback

    assert feedback["strengths"] == []
    assert feedback["improvements"]
    assert feedback["ats_feedback"] == []
    assert feedback["priority_actions"]


def test_generate_ats_feedback_does_not_duplicate_missing_skills():
    ats_analysis = {
        "ats_score": 60,
        "skill_match": {
            "missing": [
                "flask",
                "ci/cd",
            ],
        },
        "keyword_match": {
            "missing": [
                "flask",
                "ci/cd",
                "python",
            ],
        },
    }

    feedback = generate_ats_feedback(
        ats_analysis
    )

    combined_feedback = " ".join(feedback)

    assert combined_feedback.count("flask") == 1
    assert combined_feedback.count("ci/cd") == 1
    assert "python" in combined_feedback