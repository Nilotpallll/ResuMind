from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from app.services.ats_analyzer import analyze_resume
from app.services.ats_matcher import match_resume_to_job
from app.services.feedback_generator import generate_feedback
from app.services.job_description_analyzer import (
    analyze_job_description,
)
from app.services.resume_parser import extract_resume_text
from app.services.resume_processor import process_resume
from app.services.resume_scorer import score_resume


resume_bp = Blueprint(
    "resume",
    __name__,
    url_prefix="/api/resume",
)


@resume_bp.post("/upload")
def upload_resume():
    if "resume" not in request.files:
        return jsonify(
            {"error": "No resume file provided"}
        ), 400

    file = request.files["resume"]

    if not file.filename:
        return jsonify(
            {"error": "No file selected"}
        ), 400

    extension = Path(file.filename).suffix.lower()

    if extension not in current_app.config["ALLOWED_EXTENSIONS"]:
        return jsonify(
            {"error": "Only PDF and DOCX files are supported"}
        ), 400

    filename = f"{uuid4().hex}{extension}"

    file_path = (
        Path(current_app.config["UPLOAD_FOLDER"])
        / secure_filename(filename)
    )

    try:
        file.save(file_path)

        text = extract_resume_text(
            str(file_path)
        )

        if not text:
            return jsonify(
                {
                    "error": (
                        "Could not extract text from "
                        "the resume"
                    )
                }
            ), 422

        resume_data = process_resume(text)

        analysis = score_resume(
            resume_data
        )

        ats_analysis = None

        job_description = request.form.get(
            "job_description",
            "",
        ).strip()

        if job_description:
            resume_nlp = analyze_resume(
                resume_data
            )

            job_nlp = analyze_job_description(
                job_description
            )

            ats_analysis = match_resume_to_job(
                resume_nlp,
                job_nlp,
            )

            ats_analysis["job_description"] = {
                "skills": job_nlp["skills"],
                "keywords": job_nlp["keywords"],
                "phrases": job_nlp["phrases"],
                "skill_count": job_nlp["skill_count"],
                "keyword_count": job_nlp["keyword_count"],
                "phrase_count": job_nlp["phrase_count"],
            }

        feedback = generate_feedback(
            analysis,
            ats_analysis,
        )

        response = {
            "message": "Resume processed successfully",
            "filename": file.filename,
            "resume": resume_data,
            "analysis": analysis,
            "feedback": feedback,
        }

        if ats_analysis is not None:
            response["ats_analysis"] = ats_analysis

        return jsonify(response)

    except Exception:
        current_app.logger.exception(
            "Resume processing failed"
        )

        return jsonify(
            {"error": "Failed to process the resume"}
        ), 500

    finally:
        file_path.unlink(
            missing_ok=True
        )