from datetime import datetime, timezone

from app.extensions import db


class Analysis(db.Model):
    __tablename__ = "analyses"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    filename = db.Column(
        db.String(255),
        nullable=False,
    )

    overall_score = db.Column(
        db.Integer,
        nullable=False,
    )

    ats_score = db.Column(
        db.Integer,
        nullable=True,
    )

    resume_data = db.Column(
        db.JSON,
        nullable=False,
    )

    score_breakdown = db.Column(
        db.JSON,
        nullable=False,
    )

    ats_data = db.Column(
        db.JSON,
        nullable=True,
    )

    feedback = db.Column(
        db.JSON,
        nullable=False,
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self):
        return (
            f"<Analysis {self.id}: "
            f"{self.filename}>"
        )