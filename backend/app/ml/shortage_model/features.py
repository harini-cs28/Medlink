"""
MedPredict AI - Shortage Feature Extraction
Prepares features for the Shortage Risk Classification Model.
"""

from typing import Dict, Any
import numpy as np


def extract_shortage_features(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts numerical and categorical mapped features for shortage prediction.
    Features:
    - current_stock
    - quantity_sold
    - average_daily_demand
    - demand_trend
    - lead_time_days
    - supplier_reliability
    - previous_shortage
    - medicine_criticality_encoded
    """
    crit_map = {"LOW": 1.0, "MEDIUM": 2.0, "HIGH": 3.0, "CRITICAL": 4.0}
    criticality = str(data.get("medicine_criticality", "MEDIUM")).upper()
    crit_encoded = crit_map.get(criticality, 2.0)

    stock = float(data.get("current_stock", 0))
    avg_demand = max(0.01, float(data.get("average_daily_demand", 1.0)))
    days_cover = stock / avg_demand

    return {
        "current_stock": stock,
        "quantity_sold": float(data.get("quantity_sold", 0)),
        "average_daily_demand": avg_demand,
        "demand_trend": float(data.get("demand_trend", 0.0)),
        "lead_time_days": float(data.get("lead_time_days", 7)),
        "supplier_reliability": float(data.get("supplier_reliability", 0.95)),
        "previous_shortage": float(data.get("previous_shortage", 0)),
        "medicine_criticality_encoded": crit_encoded,
        "stock_days_coverage": days_cover
    }
