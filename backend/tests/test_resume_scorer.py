from app.services.resume_scorer import (
    score_contact_information,
    score_resume_structure,
    score_skills,
    score_education,
    score_projects,
    score_experience,
    score_completeness,
    score_resume,
)


def test_contact_information_full_score():
    contact = {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe",
    }

    result = score_contact_information(contact)

    assert result["score"] == 10
    assert result["max_score"] == 10


def test_contact_information_missing_fields():
    contact = {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": None,
        "linkedin": None,
        "github": None,
    }

    result = score_contact_information(contact)

    assert result["score"] == 4


def test_resume_structure_full_score():
    sections = {
        "summary": ["Computer science student"],
        "education": ["B.Tech Computer Science"],
        "skills": ["Python", "Java", "SQL"],
        "experience": ["Software Intern"],
        "projects": ["Resume Analyzer"],
        "certifications": ["Python Certification"],
    }

    result = score_resume_structure(sections)

    assert result["score"] == 20
    assert result["max_score"] == 20


def test_resume_structure_missing_sections():
    sections = {
        "summary": [],
        "education": ["B.Tech Computer Science"],
        "skills": ["Python"],
        "experience": [],
        "projects": ["Resume Analyzer"],
        "certifications": [],
    }

    result = score_resume_structure(sections)

    assert result["score"] == 11


def test_skills_score():
    sections = {
        "skills": [
            "Python",
            "Java",
            "SQL",
            "React",
            "Git",
            "Docker",
        ]
    }

    result = score_skills(sections)

    assert result["score"] == 15
    assert result["skill_count"] == 6


def test_skills_low_count():
    sections = {
        "skills": [
            "Python",
            "Java",
        ]
    }

    result = score_skills(sections)

    assert result["score"] == 5
    assert result["skill_count"] == 2


def test_skills_full_score():
    sections = {
        "skills": [
            "Python",
            "Java",
            "SQL",
            "React",
            "Git",
            "Docker",
            "Flask",
            "MongoDB",
            "Linux",
            "AWS",
        ]
    }

    result = score_skills(sections)

    assert result["score"] == 20


def test_education_score():
    sections = {
        "education": [
            "B.Tech in Computer Science",
            "VIT University",
            "2028",
        ]
    }

    result = score_education(sections)

    assert result["score"] == 15


def test_education_incomplete():
    sections = {
        "education": [
            "Computer Science",
        ]
    }

    result = score_education(sections)

    assert result["score"] == 5


def test_projects_score():
    sections = {
        "projects": [
            "Developed a web-based resume analyzer using Python and Flask",
            "Built a machine learning dashboard using React and REST APIs",
        ]
    }

    result = score_projects(sections)

    assert result["score"] == 15
    assert result["project_count"] == 2
    assert result["meaningful_projects"] == 2


def test_projects_empty():
    sections = {
        "projects": []
    }

    result = score_projects(sections)

    assert result["score"] == 0
    assert result["project_count"] == 0


def test_experience_score():
    sections = {
        "experience": [
            "Software Engineering Intern at ABC Technologies developed backend APIs"
        ]
    }

    result = score_experience(sections)

    assert result["score"] == 10
    assert result["experience_count"] == 1


def test_experience_empty():
    sections = {
        "experience": []
    }

    result = score_experience(sections)

    assert result["score"] == 0
    assert result["experience_count"] == 0


def test_completeness_score():
    sections = {
        "summary": ["Computer science student"],
        "education": [
            "B.Tech Computer Science",
            "VIT University",
            "2028",
        ],
        "skills": [
            "Python",
            "Java",
            "SQL",
        ],
        "experience": [
            "Software Intern developed backend APIs"
        ],
        "projects": [
            "Developed a web application using Flask and React",
            "Built a dashboard using Python and SQL",
        ],
        "certifications": [
            "Python Certification"
        ],
    }

    result = score_completeness(sections)

    assert result["score"] == 10


def test_score_resume_total():
    resume_data = {
        "contact": {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "9876543210",
            "linkedin": "https://linkedin.com/in/johndoe",
            "github": "https://github.com/johndoe",
        },
        "sections": {
            "summary": ["Computer science student"],
            "education": [
                "B.Tech in Computer Science",
                "VIT University",
                "2028",
            ],
            "skills": [
                "Python",
                "Java",
                "SQL",
                "React",
                "Git",
                "Docker",
                "Flask",
                "MongoDB",
                "Linux",
                "AWS",
            ],
            "experience": [
                "Software Engineering Intern at ABC Technologies developed backend APIs"
            ],
            "projects": [
                "Developed a web-based resume analyzer using Python and Flask",
                "Built a machine learning dashboard using React and REST APIs",
            ],
            "certifications": [
                "Python Certification"
            ],
        },
    }

    result = score_resume(resume_data)

    assert result["overall_score"] == 100
    assert result["overall_score"] <= 100

    assert "breakdown" in result
    assert "strengths" in result
    assert "weaknesses" in result