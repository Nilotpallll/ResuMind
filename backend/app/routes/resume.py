from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from app.services.resume_parser import extract_resume_text
from app.services.resume_processor import process_resume


resume_bp = Blueprint("resume", __name__, url_prefix="/api/resume")


@resume_bp.post("/upload")
def upload_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    file = request.files["resume"]

    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    extension = Path(file.filename).suffix.lower()

    if extension not in current_app.config["ALLOWED_EXTENSIONS"]:
        return jsonify({"error": "Only PDF and DOCX files are supported"}), 400

    filename = f"{uuid4().hex}{extension}"
    file_path = Path(current_app.config["UPLOAD_FOLDER"]) / secure_filename(filename)

    try:
        file.save(file_path)

        text = extract_resume_text(str(file_path))

        if not text:
            return jsonify({"error": "Could not extract text from the resume"}), 422

        resume_data = process_resume(text)

        return jsonify(
            {
                "message": "Resume processed successfully",
                "filename": file.filename,
                "resume": resume_data,
            }
        )

    except Exception:
        current_app.logger.exception("Resume processing failed")
        return jsonify({"error": "Failed to process the resume"}), 500

    finally:
        file_path.unlink(missing_ok=True)