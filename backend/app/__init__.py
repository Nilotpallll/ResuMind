from flask import Flask
from flask_cors import CORS

from app.extensions import db
from app.models import Analysis
from app.routes.dashboard import dashboard_bp
from app.routes.resume import resume_bp
from config import Config


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)

    if test_config:
        app.config.update(test_config)

    CORS(app)

    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(resume_bp)
    app.register_blueprint(dashboard_bp)

    return app