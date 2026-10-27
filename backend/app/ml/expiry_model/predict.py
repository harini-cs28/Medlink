"""
MedPredict AI - Expiry Risk Predictor
Evaluates whether current stock is likely to expire before it can be dispensed.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
from backend.app.ml.expiry_model.features import extract_expiry_features

MODEL_PATH = Path(__file__).parent / "model.pkl"
_model = None


def get_expiry_model():
    global _model
    if _model is None and MODEL_PATH.exists():
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception:
            _model = None
    return _model


def predict_expiry_risk(input_data: Dict[str, Any]) -> Tuple[float, str, float]:
    """
    Returns (expiry_probability, expiry_risk, expected_unsold_units).
    Risk levels: LOW, MEDIUM, HIGH.
    """
    feats = extract_expiry_features(input_data)
    model = get_expiry_model()

    stock = feats["current_stock"]
    expected_sales = feats["expected_sales_before_expiry"]
    unsold = feats["expected_unsold_units"]

    if model is not None:
        try:
            vector = [[
                feats["current_stock"],
                feats["average_daily_demand"],
                feats["days_to_expiry"],
                feats["remaining_shelf_life"],
                feats["demand_trend"],
                feats["medicine_criticality_encoded"]
            ]]
            prob = float(model.predict_proba(vector)[0][1])
        except Exception:
            prob = None
    else:
        prob = None

    if prob is None:
        if stock > 0 and expected_sales > 0:
            ratio = unsold / stock
            if ratio > 0.4:
                prob = min(0.98, 0.70 + (ratio * 0.25))
            elif ratio > 0.15:
                prob = 0.45 + (ratio * 0.2)
            else:
                prob = 0.08
        else:
            prob = 0.10

    prob = min(0.99, max(0.01, round(prob, 3)))

    if prob >= 0.65 or (unsold > 0 and unsold / max(1, stock) > 0.35):
        risk = "HIGH"
    elif prob >= 0.35:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return prob, risk, round(unsold, 1)
