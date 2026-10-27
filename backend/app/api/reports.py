"""
MedPredict AI - Reports & Model Metrics API Router
"""

from fastapi import APIRouter
from backend.services.report_service import (
    get_model_evaluation_metrics,
    get_smart_recommendations,
    get_available_reports
)

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("")
def list_reports():
    """Returns downloadable reports and auditing metadata."""
    return get_available_reports()


@router.get("/metrics")
def get_metrics():
    """Returns cross-validation and training performance benchmarks for ML models."""
    return get_model_evaluation_metrics()


@router.get("/recommendations")
def get_recommendations():
    """Returns real-time recommendation alerts across the inventory catalog."""
    return get_smart_recommendations()
