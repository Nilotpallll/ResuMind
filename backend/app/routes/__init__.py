from flask import Blueprint, jsonify

from app.models import Analysis


dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard",
)


@dashboard_bp.get("/analyses")
def get_analyses():
    analyses = (
        Analysis.query
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return jsonify(
        {
            "analyses": [
                {
                    "id": analysis.id,
                    "filename": analysis.filename,
                    "overall_score": analysis.overall_score,
                    "ats_score": analysis.ats_score,
                    "created_at": analysis.created_at.isoformat(),
                }
                for analysis in analyses
            ],
            "count": len(analyses),
        }
    )