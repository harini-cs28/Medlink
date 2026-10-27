"""
MedPredict AI - Predictions & Recommendations API Router
"""

from typing import Optional, List
from fastapi import APIRouter, Query, Body
from pydantic import BaseModel
from backend.app.schemas.prediction import (
    ShortagePredictionInput,
    ShortagePredictionOutput,
    ExpiryRiskInput,
    ExpiryRiskOutput,
    RecommendationOutput
)
from backend.app.services.prediction_service import (
    predict_medicine_shortage,
    predict_medicine_expiry,
    predict_shortage_by_drug_name
)
from backend.app.services.recommendation_service import evaluate_inventory_recommendation

router = APIRouter(prefix="/predictions", tags=["Predictions & Recommendations"])


class DrugSearchRequest(BaseModel):
    drugName: str


@router.post("/shortage", response_model=ShortagePredictionOutput)
def predict_shortage_risk_endpoint(input_data: ShortagePredictionInput):
    """Predicts shortage probability and runout timeline for a medicine."""
    result = predict_medicine_shortage(input_data.model_dump())
    return result


@router.post("/expiry", response_model=ExpiryRiskOutput)
def predict_expiry_risk_endpoint(input_data: ExpiryRiskInput):
    """Predicts batch expiry risk and financial exposure."""
    result = predict_medicine_expiry(input_data.model_dump())
    return result


@router.post("/drug-shortage-search")
def search_shortage_by_drug_endpoint(req: DrugSearchRequest):
    """Searches FDA dataset history and estimates shortage risk for a named drug."""
    return predict_shortage_by_drug_name(req.drugName)


@router.post("/recommendation", response_model=RecommendationOutput)
def generate_recommendation_endpoint(
    drug_name: str = Body(..., embed=True),
    shortage_risk: str = Body(..., embed=True),
    expiry_risk: str = Body(..., embed=True),
    medicine_id: Optional[int] = Body(None, embed=True),
    current_stock: int = Body(0, embed=True),
    daily_demand: float = Body(1.0, embed=True)
):
    """Generates rule-based recommendations combining shortage and expiry risk."""
    return evaluate_inventory_recommendation(
        drug_name=drug_name,
        shortage_risk=shortage_risk,
        expiry_risk=expiry_risk,
        medicine_id=medicine_id,
        current_stock=current_stock,
        daily_demand=daily_demand
    )
