import re

import spacy


NLP_MODEL = "en_core_web_sm"


SKILL_VOCABULARY = {
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",
    "go",
    "rust",
    "php",
    "ruby",
    "kotlin",
    "swift",
    "react",
    "react.js",
    "reactjs",
    "angular",
    "vue",
    "vue.js",
    "next.js",
    "nextjs",
    "html",
    "css",
    "tailwind",
    "tailwind css",
    "bootstrap",
    "node.js",
    "nodejs",
    "express",
    "express.js",
    "flask",
    "django",
    "fastapi",
    "spring",
    "spring boot",
    "rest",
    "rest api",
    "rest apis",
    "graphql",
    "api",
    "apis",
    "microservices",
    "sql",
    "mysql",
    "postgresql",
    "postgres",
    "sqlite",
    "mongodb",
    "redis",
    "oracle",
    "git",
    "github",
    "gitlab",
    "docker",
    "kubernetes",
    "jenkins",
    "ci/cd",
    "linux",
    "aws",
    "azure",
    "google cloud",
    "gcp",
    "cloud",
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "natural language processing",
    "nlp",
    "computer vision",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "sklearn",
    "pandas",
    "numpy",
    "matplotlib",
    "seaborn",
    "opencv",
    "spacy",
    "nltk",
    "data analysis",
    "data science",
    "data visualization",
    "blockchain",
    "solidity",
    "web3",
    "ethereum",
    "generative ai",
    "agentic ai",
    "llms",
    "prompt engineering",
    "langchain",
    "ollama",
    "supabase",
    "firebase",
    "dynamodb",
    "vercel",
    "data structures",
    "algorithms",
    "object oriented programming",
    "oop",
    "operating systems",
    "os",
    "computer networks",
    "networks",
    "dbms",
    "problem solving",
    "communication skills",
    "version control",
    "cloud computing",
    "software development",
    "web development",
    "full-stack development",
    "frontend development",
    "backend development",
}


NLP_EXCLUDED_KEYWORDS = {
    "resume",
    "curriculum",
    "vitae",
    "experience",
    "experiences",
    "education",
    "project",
    "projects",
    "skill",
    "skills",
    "work",
    "worked",
    "using",
    "used",
    "developed",
    "development",
    "responsible",
    "responsibilities",
    "team",
    "teams",
    "role",
    "roles",
    "company",
    "companies",
    "university",
    "college",
    "student",
    "students",
    "intern",
    "internship",
    "year",
    "years",
    "candidate",
    "candidates",
    "requirements",
    "requirement",
    "qualifications",
    "qualification",
    "knowledge",
    "strong",
    "building",
    "built",
    "application",
    "applications",
    "web",
    "technologies",
    "technology",
    "programming",
    "developer",
    "developers",
    "stack",
    "cloud",
    "communication",
    "problem",
    "need",
    "needs",
    "looking",
    "seeking",
    "position",
    "job",
    "jobs",
}


def _load_nlp():
    """
    Load the spaCy English language model.
    """
    try:
        return spacy.load(NLP_MODEL)
    except OSError as exc:
        raise RuntimeError(
            f"spaCy model '{NLP_MODEL}' is not installed."
        ) from exc


nlp = _load_nlp()


def normalize_text(text: str) -> str:
    """
    Normalize text before NLP processing.
    """
    if not text:
        return ""

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def _normalize_skill(skill: str) -> str:
    """
    Normalize a detected skill for consistent comparison.
    """
    skill = skill.strip().lower()

    aliases = {
        "react.js": "react",
        "reactjs": "react",
        "nodejs": "node.js",
        "express.js": "express",
        "vue.js": "vue",
        "vuejs": "vue",
        "nextjs": "next.js",
        "postgres": "postgresql",
        "sklearn": "scikit-learn",
        "rest": "rest api",
        "rest apis": "rest api",
        "apis": "api",
        "c plus plus": "c++",
        "object oriented programming": "oop",
        "operating systems": "os",
        "computer networks": "networks",
    }

    return aliases.get(skill, skill)


def _skill_pattern(skill: str) -> str:
    """
    Build a regex pattern for safely matching a skill.
    """
    escaped_skill = re.escape(skill)

    if re.fullmatch(r"[a-z0-9 ]+", skill):
        return rf"\b{escaped_skill}\b"

    return (
        rf"(?<![a-z0-9+#.-])"
        rf"{escaped_skill}"
        rf"(?![a-z0-9+#.-])"
    )


def _extract_vocabulary_skills(text: str) -> list[str]:
    """
    Detect skills using the controlled skill vocabulary.
    """
    normalized_text = text.lower()
    detected = set()

    sorted_skills = sorted(
        SKILL_VOCABULARY,
        key=len,
        reverse=True,
    )

    for skill in sorted_skills:
        pattern = _skill_pattern(skill)

        if re.search(pattern, normalized_text):
            detected.add(_normalize_skill(skill))

    if "rest api" in detected:
        detected.discard("rest")
        detected.discard("api")

    if "ci/cd" in detected:
        detected.discard("ci")
        detected.discard("cd")

    return sorted(detected)


def _extract_nlp_keywords(doc) -> list[str]:
    """
    Extract meaningful NLP keywords using spaCy.

    Stop words and generic resume terminology are excluded.
    """
    keywords = set()

    for token in doc:
        if not token.is_alpha:
            continue

        keyword = token.text.lower().strip()

        if not keyword:
            continue

        if token.is_stop:
            continue

        if keyword in NLP_EXCLUDED_KEYWORDS:
            continue

        if keyword in {
            "rest",
            "apis",
            "api",
            "ci",
            "cd",
        }:
            continue

        keywords.add(keyword)

    return sorted(keywords)


def analyze_resume_keywords(text: str) -> dict:
    """
    Analyze resume text using spaCy and a controlled skill vocabulary.
    """
    normalized_text = normalize_text(text)

    if not normalized_text:
        return {
            "skills": [],
            "keywords": [],
            "skill_count": 0,
            "keyword_count": 0,
        }

    doc = nlp(normalized_text)

    vocabulary_skills = _extract_vocabulary_skills(
        normalized_text
    )

    nlp_keywords = _extract_nlp_keywords(doc)

    keywords = sorted(
        set(vocabulary_skills + nlp_keywords)
    )

    return {
        "skills": vocabulary_skills,
        "keywords": keywords,
        "skill_count": len(vocabulary_skills),
        "keyword_count": len(keywords),
    }


def analyze_resume(resume_data: dict) -> dict:
    """
    Analyze a processed resume.
    """
    if not resume_data:
        return {
            "skills": [],
            "keywords": [],
            "skill_count": 0,
            "keyword_count": 0,
        }

    normalized_text = resume_data.get(
        "normalized_text",
        "",
    )

    if not normalized_text:
        sections = resume_data.get(
            "sections",
            {},
        )

        section_text = []

        for value in sections.values():
            if isinstance(value, list):
                section_text.extend(value)
            elif isinstance(value, str):
                section_text.append(value)

        normalized_text = "\n".join(section_text)

    return analyze_resume_keywords(
        normalized_text
    )