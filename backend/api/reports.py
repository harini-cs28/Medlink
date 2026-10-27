"""
MedPredict AI - Reports & Metrics API Router
"""

from fastapi import APIRouter
from backend.services.report_service import (
    get_model_evaluation_metrics,
    get_smart_recommendations,
    get_available_reports
)

router = APIRouter(tags=["Reports & Recommendations"])


@router.get("/api/models/metrics")
def get_model_metrics_endpoint():
    return get_model_evaluation_metrics()


@router.get("/api/recommendations")
def get_recommendations_endpoint():
    return get_smart_recommendations()


@router.get("/api/reports")
def get_reports_endpoint():
    return get_available_reports()
