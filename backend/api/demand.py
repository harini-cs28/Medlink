"""
MedPredict AI - Demand API Router
"""

from fastapi import APIRouter, Query
from backend.services.demand_service import get_demand_time_series, get_forecast_points

router = APIRouter(tags=["Demand"])


@router.get("/api/demand")
def get_demand_endpoint(
    drugOrCategory: str = Query('M01AB', description="ATC code or drug category"),
    timeframe: str = Query('30D', description="Timeframe: 7D, 30D, 90D, Custom")
):
    return get_demand_time_series(drug_or_category=drugOrCategory, timeframe=timeframe)


@router.get("/api/forecast")
def get_forecast_endpoint(
    drugOrCategory: str = Query('M01AB', description="ATC code or drug category"),
    horizonDays: int = Query(30, description="Forecast horizon in days")
):
    return get_forecast_points(drug_or_category=drugOrCategory, horizon_days=horizonDays)
