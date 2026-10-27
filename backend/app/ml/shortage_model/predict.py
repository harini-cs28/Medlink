"""
MedPredict AI - Shortage Risk Predictor
Loads trained model or evaluates statistical shortage risk based on stock vs lead-time demand.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
from backend.app.ml.shortage_model.features import extract_shortage_features

MODEL_PATH = Path(__file__).parent / "model.pkl"
_model = None


def get_shortage_model():
    global _model
    if _model is None and MODEL_PATH.exists():
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception:
            _model = None
    return _model


def predict_shortage(input_data: Dict[str, Any]) -> Tuple[float, str, float]:
    """
    Predicts shortage risk probability and level.
    Returns (shortage_probability, risk_level, runout_days).
    Risk levels: LOW, MEDIUM, HIGH, CRITICAL.
    """
    feats = extract_shortage_features(input_data)
    model = get_shortage_model()

    runout_days = feats["stock_days_coverage"]
    lead_time = feats["lead_time_days"]
    prev_short = feats["previous_shortage"]
    rel = feats["supplier_reliability"]

    if model is not None:
        try:
            vector = [[
                feats["current_stock"],
                feats["average_daily_demand"],
                feats["demand_trend"],
                feats["lead_time_days"],
                feats["supplier_reliability"],
                feats["previous_shortage"],
                feats["medicine_criticality_encoded"]
            ]]
            prob = float(model.predict_proba(vector)[0][1])
        except Exception:
            prob = None
    else:
        prob = None

    if prob is None:
        # High-precision inventory logic fallback
        if runout_days <= lead_time:
            prob = 0.88 + (0.10 if prev_short > 0 else 0.0)
        elif runout_days <= lead_time * 1.5:
            prob = 0.65 + (0.15 if rel < 0.8 else 0.0)
        elif runout_days <= lead_time * 2.5:
            prob = 0.35
        else:
            prob = 0.08

    prob = min(0.99, max(0.01, round(prob, 3)))

    if prob >= 0.75 or runout_days <= lead_time:
        risk = "HIGH" if prob < 0.9 else "CRITICAL"
    elif prob >= 0.40:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return prob, risk, round(runout_days, 1)
