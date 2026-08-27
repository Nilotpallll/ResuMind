from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.get("/api/health")
    def health_check():
        return {"status": "ok", "message": "ResuMind backend is running"}

    return app