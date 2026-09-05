# ResuMind

### Smart Resume Analyzer with AI-Based Feedback

ResuMind is a web application that helps students and job seekers evaluate resumes using **Natural Language Processing (NLP)** and **explainable rule-based analysis**.

It accepts **PDF** and **DOCX** resumes, scores resume quality, compares content against an optional job description for ATS compatibility, and shows actionable feedback in an interactive dashboard.

> **ResuMind does not use LLMs or deep-learning models for resume evaluation.**
> Results come from NLP, vocabulary matching, pattern recognition, and deterministic scoring rules, so every score and recommendation can be explained.

---

## Table of Contents

- [Features](#features)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [System Architecture](#system-architecture)
- [How ResuMind Works](#how-resumind-works)
- [NLP Approach](#nlp-approach)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Example Workflow](#example-workflow)
- [Security and Input Validation](#security-and-input-validation)
- [Limitations](#limitations)
- [Future Scope](#future-scope)
- [Project Outcomes](#project-outcomes)
- [Contributors](#contributors)
- [License](#license)

---

## Features

- Upload resumes in **PDF** and **DOCX** formats (max **5 MB**)
- Automatic resume text extraction
- Resume section detection and normalization
- Contact information extraction
- Skill and keyword extraction using NLP
- Resume quality scoring out of **100**, with an explainable breakdown
- Optional job-description analysis and ATS compatibility scoring
- Resume-to-job skill and keyword matching
- Missing skill and keyword identification
- Personalized, priority-based improvement suggestions
- Persistent analysis history in SQLite
- Dashboard statistics and previous-analysis retrieval
- Input validation and error handling
- Automated backend tests with pytest
- Responsive glassmorphism UI

---

## Problem Statement

Students and early-career job seekers often struggle to tell whether a resume meets modern hiring and Applicant Tracking System (ATS) expectations.

Common problems include:

- Missing role-specific keywords
- Poor resume structure
- Incomplete sections
- Weak presentation of skills and experience
- Little measurable feedback
- Difficulty comparing a resume with a specific job description

ResuMind turns a resume into structured data and returns an explainable evaluation of quality and job relevance.

---

## Objectives

1. Extract useful information from uploaded resumes automatically.
2. Evaluate resume quality with measurable, transparent criteria.
3. Identify skills and keywords relevant to a target job.
4. Compare resume content with a job description.
5. Generate understandable, actionable feedback.
6. Store previous analyses for later review.
7. Present results in a clean, interactive dashboard.

---

## System Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + Vite        │
                         │ Tailwind CSS        │
                         └──────────┬──────────┘
                                    │
                             HTTP / REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Flask Backend       │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
      ┌───────────────┐    ┌────────────────┐    ┌────────────────┐
      │ Resume Parser │    │ Resume Scorer  │    │ ATS / NLP      │
      │ PDF / DOCX    │    │                │    │ Analyzer       │
      └───────┬───────┘    └───────┬────────┘    └───────┬────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │ Feedback Generator  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ SQLite Database     │
                         │ Analysis History    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Dashboard / Results │
                         └─────────────────────┘
```

---

## How ResuMind Works

### 1. Resume Parsing

The user uploads a resume in PDF or DOCX format.

The backend then:

1. Validates the file type (`.pdf`, `.docx`) and upload size (5 MB).
2. Saves the file under a unique temporary name.
3. Extracts and normalizes text.
4. Detects resume sections.
5. Extracts structured information (contact, skills, education, and so on).
6. Deletes the temporary file after processing.

| Format | Library |
|--------|---------|
| PDF | PyMuPDF |
| DOCX | python-docx |

The parser also handles resumes whose original layout has been flattened into a single text block.

### 2. Resume Scoring

ResuMind scores the resume with an explainable rule-based engine. Category scores sum to **100**.

| Category | Max points | What is evaluated |
|----------|------------|-------------------|
| Contact information | 10 | Name, email, phone, LinkedIn, GitHub |
| Resume structure | 20 | Presence of summary, education, skills, experience, projects, certifications |
| Skills | 20 | Presence and quantity of listed skills |
| Education | 15 | Education information and completeness |
| Projects | 15 | Project presence and completeness |
| Experience | 10 | Work or internship experience |
| Completeness | 10 | Overall coverage of resume information |

The API also returns per-category details so the user can see **why** the overall score was produced.

### 3. ATS and NLP Analysis

When a job description is provided, ResuMind runs an extra NLP pass on both the resume and the job text.

It extracts:

- Technical skills (against a controlled vocabulary)
- General keywords
- Important phrases
- Requirement-related context

The resume and job description are then compared.

#### Skill matching

Equivalent skill spellings are normalized before comparison, which reduces false mismatches.

| Input | Normalized form |
|-------|-----------------|
| `React.js` / `ReactJS` | `react` |
| `NodeJS` | `node.js` |
| `Postgres` | `postgresql` |
| `REST APIs` | `rest api` |
| `C++` | `c++` |

#### ATS score

```text
ATS Score = (Skill Match × 60%) + (Keyword Match × 40%)
```

Skill match and keyword match are percentages of required job items found on the resume. The formula is deterministic and fully inspectable.

ATS analysis is skipped when no job description is supplied. In that case the stored `ats_score` is empty.

### 4. Smart Feedback

The feedback engine turns scoring and ATS results into readable recommendations. It never tells the candidate to claim experience they do not have.

It surfaces:

- **Strengths** — for example strong skills coverage, complete contact details, or solid project/experience sections
- **Improvements** — missing sections, weak completeness, missing skills, or missing job-specific keywords
- **Priority actions** — the highest-impact next steps first

### 5. Dashboard and Analysis History

Each completed analysis is stored in SQLite. The dashboard shows:

- Total number of analyses
- Average and best resume scores
- Average and best ATS scores
- Analysis history
- Full results for a previously stored analysis (no re-upload required)

---

## NLP Approach

ResuMind uses NLP to turn unstructured resume and job-description text into comparable tokens and phrases.

```text
Raw Text
    ↓
Normalization
    ↓
Tokenization / linguistic processing (spaCy)
    ↓
Skill vocabulary matching
    ↓
Keyword extraction
    ↓
Phrase detection
    ↓
Resume ↔ job description matching
    ↓
Explainable feedback
```

The system does not generate free-form prose with a large language model. It extracts structured signals and applies deterministic rules.

### Why NLP?

Resumes are mostly unstructured natural language. A line such as:

> Developed REST APIs using Flask and PostgreSQL.

can be found by a simple keyword search, but NLP plus normalization treats `REST APIs`, `Flask`, and `PostgreSQL` more consistently across documents.

NLP is used for:

- Skill extraction
- Keyword extraction
- Phrase detection
- Text normalization
- Resume / job-description comparison

### Why spaCy?

spaCy is the primary NLP library. ResuMind loads the **`en_core_web_sm`** English model for tokenization, stop-word handling, and part-of-speech information.

It is a practical, lightweight pipeline for a student-scale web app and does not require training a custom deep-learning model.

### Why rule-based analysis instead of an LLM?

An LLM could produce more fluent wording, but it would weaken this project’s goals:

- Less deterministic scoring
- Reduced explainability
- Higher compute cost
- Dependence on external AI services
- Harder academic validation

ResuMind instead uses NLP processing, skill vocabularies, regex and pattern matching, normalization rules, deterministic scoring, and rule-based feedback. Each recommendation maps back to a condition in the resume or job description.

---

## Technology Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React, JavaScript, Vite, Tailwind CSS, Framer Motion, Lucide React |
| Backend | Python, Flask, Flask-CORS |
| NLP | spaCy (`en_core_web_sm`) |
| Documents | PyMuPDF, python-docx |
| Database | SQLite, Flask-SQLAlchemy, SQLAlchemy |
| Testing | pytest |

---

## Project Structure

```text
ResuMind/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── analysis.py
│   │   ├── routes/
│   │   │   ├── dashboard.py
│   │   │   └── resume.py
│   │   ├── services/
│   │   │   ├── ats_analyzer.py
│   │   │   ├── ats_matcher.py
│   │   │   ├── feedback_generator.py
│   │   │   ├── job_description_analyzer.py
│   │   │   ├── resume_parser.py
│   │   │   ├── resume_processor.py
│   │   │   └── resume_scorer.py
│   │   ├── extensions.py
│   │   └── __init__.py
│   ├── tests/
│   ├── config.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisResult.jsx
│   │   │   ├── CursorGlow.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ResumeUploader.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## API Endpoints

The Flask app listens at `http://127.0.0.1:5000`. The frontend calls these routes directly.

### Resume analysis

#### `POST /api/resume/upload`

Uploads and analyzes a resume. Send `multipart/form-data`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | file | Yes | PDF or DOCX resume |
| `job_description` | text | No | Target job description for ATS matching |

**Success response** includes:

- `filename`
- `resume` — structured resume data
- `analysis` — overall score and category breakdown
- `feedback` — strengths, improvements, and recommendations
- `ats_analysis` — present only when a job description was provided

**Typical error responses:**

| Status | When |
|--------|------|
| `400` | Missing file, empty filename, or unsupported type |
| `422` | Text could not be extracted |
| `500` | Processing failed (generic client message; details stay in server logs) |

### Analysis history

#### `GET /api/dashboard/analyses`

Returns a list of stored analyses (id, filename, scores, timestamp) and a `count`.

#### `GET /api/dashboard/analyses/<id>`

Returns one full stored analysis, including resume data, score breakdown, feedback, and ATS data when available.

If the id does not exist:

```json
{
  "error": "Analysis not found"
}
```

Status code: `404`.

### Dashboard statistics

#### `GET /api/dashboard/stats`

| Field | Meaning |
|-------|---------|
| `total_analyses` | Number of stored analyses |
| `average_score` | Mean overall resume score |
| `best_score` | Highest overall resume score |
| `average_ats_score` | Mean ATS score among analyses that have one |
| `best_ats_score` | Highest ATS score |

Empty history returns zeros for all numeric fields.

---

## Database

ResuMind uses **SQLite** for local persistence. The file is created as `resumind.db` in the working directory when the backend starts. Database files are listed in `.gitignore` and are not committed.

The main entity is `Analysis` (table `analyses`):

| Column | Type | Notes |
|--------|------|--------|
| `id` | integer | Primary key |
| `filename` | string | Original upload name |
| `overall_score` | integer | Resume quality score (0–100) |
| `ats_score` | integer, nullable | Present only when a job description was analyzed |
| `resume_data` | JSON | Structured parse result |
| `score_breakdown` | JSON | Scoring details |
| `ats_data` | JSON, nullable | ATS comparison payload |
| `feedback` | JSON | Generated recommendations |
| `created_at` | datetime | UTC timestamp |

---

## Installation

### Prerequisites

- Python 3.10 or newer
- Node.js and npm
- Git

### Backend

From the repository root:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

Install Python packages and the spaCy English model:

```bash
pip install -r requirements.txt
pip install spacy
python -m spacy download en_core_web_sm
```

`spacy` is required for ATS/NLP analysis even though the rest of the backend packages are pinned in `requirements.txt`.

### Frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
```

---

## Running the Application

Start **both** servers. The UI talks to the backend at `http://127.0.0.1:5000`.

### Backend

```bash
cd backend
python run.py
```

Flask runs at [http://127.0.0.1:5000](http://127.0.0.1:5000) with debug mode enabled in `run.py`.

### Frontend

```bash
cd frontend
npm run dev
```

Vite prints the local URL (typically [http://localhost:5173](http://localhost:5173)). Open that URL in a browser.

---

## Testing

The backend pytest suite covers:

- Resume processing and parsing
- Upload API behavior
- Resume scoring
- ATS analysis and matching
- Job-description analysis
- Feedback generation
- Dashboard routes

From the `backend` directory, with the virtual environment activated:

```bash
pytest -q
```

---

## Example Workflow

```text
1. Open ResuMind in the browser
        ↓
2. Upload a PDF or DOCX resume
        ↓
3. Optionally paste a job description
        ↓
4. Click Analyze Resume
        ↓
5. Backend parses and scores the resume
        ↓
6. If a job description was provided, NLP + ATS matching runs
        ↓
7. Feedback is generated
        ↓
8. The result is stored in SQLite
        ↓
9. The user views the result
        ↓
10. The analysis appears in Dashboard history
```

---

## Security and Input Validation

ResuMind applies application-level checks on uploads:

- Only `.pdf` and `.docx` are accepted
- Request body size is capped at **5 MB** (`MAX_CONTENT_LENGTH`)
- Temporary files use unique names and are deleted after processing
- Invalid or corrupted documents return a client-safe error; stack traces stay in server logs
- Persistence goes through SQLAlchemy rather than raw SQL strings

This is local academic software, not a hardened multi-tenant production service.

---

## Limitations

These limits are intentional so the system stays explainable and lightweight:

- Analysis is deterministic NLP plus rules, not generative AI
- Skill detection depends on a predefined vocabulary
- Visual layout and graphic design of the resume are not scored in depth
- Semantic similarity beyond the implemented NLP rules is limited
- English resumes and job descriptions are the primary target
- ATS scoring approximates compatibility; it is not any vendor’s proprietary ATS

---

## Future Scope

- Broader skill and industry vocabularies
- Additional resume formats
- Richer semantic similarity
- Formatting and visual-layout analysis
- Industry-specific scoring models
- Multilingual processing
- Exportable analysis reports
- Cloud deployment
- User accounts and personal history
- Progress tracking over time

---

## Project Outcomes

ResuMind is an end-to-end resume intelligence workflow: document processing, NLP, rule-based scoring, ATS matching, feedback, SQLite persistence, and an interactive dashboard.

It shows that useful AI-assisted tools can be built with transparent NLP techniques, without relying on large language models.

---

## Contributors

Developed as a capstone project.

---

## License

This project was developed for academic and educational purposes.
