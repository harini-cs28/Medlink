"""
MedPredict AI - ML Prediction & Recommendation Schemas
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ShortagePredictionInput(BaseModel):
    drug_name: Optional[str] = None
    medicine_id: Optional[int] = None
    current_stock: float
    quantity_sold: float = 0.0
    average_daily_demand: float
    demand_trend: float = 0.0
    lead_time_days: int = 7
    supplier_reliability: float = 0.95
    previous_shortage: int = 0
    medicine_criticality: str = "MEDIUM"


class ShortagePredictionOutput(BaseModel):
    drug_name: str
    shortage_probability: float
    shortage_risk: str  # LOW, MEDIUM, HIGH, CRITICAL
    runout_days_estimated: float
    confidence_score: float
    features_used: Dict[str, Any]
    shap_explanations: List[Dict[str, Any]] = []


class ExpiryRiskInput(BaseModel):
    medicine_id: Optional[int] = None
    drug_name: Optional[str] = None
    current_stock: float
    average_daily_demand: float
    days_to_expiry: int
    remaining_shelf_life: float
    demand_trend: float = 0.0
    medicine_criticality: str = "MEDIUM"


class ExpiryRiskOutput(BaseModel):
    drug_name: str
    expiry_probability: float
    expiry_risk: str  # LOW, MEDIUM, HIGH
    expected_unsold_units: float
    estimated_financial_loss: float
    action_recommendation: str


class RecommendationOutput(BaseModel):
    medicine_id: Optional[int] = None
    drug_name: str
    shortage_risk: str
    expiry_risk: str
    primary_action: str
    action_details: str
    priority_level: str  # URGENT, HIGH, NORMAL, LOW
    suggested_order_quantity: int = 0
    fefo_priority: bool = False
