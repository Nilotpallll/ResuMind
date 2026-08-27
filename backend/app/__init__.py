from flask import Flask
from flask_cors import CORS

from app.routes.resume import resume_bp
from config import Config


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    if test_config:
        app.config.update(test_config)

    CORS(app)

    app.register_blueprint(resume_bp)

    return app