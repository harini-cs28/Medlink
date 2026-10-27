"""
MedPredict AI - Expiry Feature Extraction
Prepares features for Expiry Risk Prediction.
"""

from typing import Dict, Any


def extract_expiry_features(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Features:
    - current_stock
    - average_daily_demand
    - days_to_expiry
    - remaining_shelf_life
    - demand_trend
    - medicine_criticality_encoded
    """
    crit_map = {"LOW": 1.0, "MEDIUM": 2.0, "HIGH": 3.0, "CRITICAL": 4.0}
    criticality = str(data.get("medicine_criticality", "MEDIUM")).upper()
    crit_encoded = crit_map.get(criticality, 2.0)

    stock = float(data.get("current_stock", 0))
    avg_demand = max(0.01, float(data.get("average_daily_demand", 1.0)))
    days_to_expiry = max(1, int(data.get("days_to_expiry", 90)))
    
    expected_sales_before_expiry = avg_demand * days_to_expiry
    expected_unsold = max(0.0, stock - expected_sales_before_expiry)

    return {
        "current_stock": stock,
        "average_daily_demand": avg_demand,
        "days_to_expiry": float(days_to_expiry),
        "remaining_shelf_life": float(data.get("remaining_shelf_life", days_to_expiry / 365.0)),
        "demand_trend": float(data.get("demand_trend", 0.0)),
        "medicine_criticality_encoded": crit_encoded,
        "expected_sales_before_expiry": expected_sales_before_expiry,
        "expected_unsold_units": expected_unsold
    }
