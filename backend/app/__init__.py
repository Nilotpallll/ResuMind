from flask import Flask
from flask_cors import CORS

from config import Config
from app.routes.resume import resume_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    app.register_blueprint(resume_bp)

    @app.get("/api/health")
    def health_check():
        return {"status": "ok", "message": "ResuMind backend is running"}

    return app