from flask import Blueprint, jsonify

from app.extensions import db
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


@dashboard_bp.get("/analyses/<int:analysis_id>")
def get_analysis(analysis_id):
    analysis = db.session.get(
        Analysis,
        analysis_id,
    )

    if analysis is None:
        return jsonify(
            {"error": "Analysis not found"}
        ), 404

    response = {
        "id": analysis.id,
        "filename": analysis.filename,
        "overall_score": analysis.overall_score,
        "ats_score": analysis.ats_score,
        "created_at": analysis.created_at.isoformat(),
        "resume": analysis.resume_data,
        "analysis": analysis.score_breakdown,
        "feedback": analysis.feedback,
    }

    if analysis.ats_data is not None:
        response["ats_analysis"] = analysis.ats_data

    return jsonify(response)


@dashboard_bp.get("/stats")
def get_dashboard_stats():
    analyses = Analysis.query.all()

    total_analyses = len(analyses)

    if total_analyses == 0:
        return jsonify(
            {
                "total_analyses": 0,
                "average_score": 0,
                "best_score": 0,
                "average_ats_score": 0,
                "best_ats_score": 0,
            }
        )

    overall_scores = [
        analysis.overall_score
        for analysis in analyses
    ]

    ats_scores = [
        analysis.ats_score
        for analysis in analyses
        if analysis.ats_score is not None
    ]

    average_score = round(
        sum(overall_scores) / len(overall_scores),
        2,
    )

    best_score = max(overall_scores)

    average_ats_score = (
        round(
            sum(ats_scores) / len(ats_scores),
            2,
        )
        if ats_scores
        else 0
    )

    best_ats_score = (
        max(ats_scores)
        if ats_scores
        else 0
    )

    return jsonify(
        {
            "total_analyses": total_analyses,
            "average_score": average_score,
            "best_score": best_score,
            "average_ats_score": average_ats_score,
            "best_ats_score": best_ats_score,
        }
    )