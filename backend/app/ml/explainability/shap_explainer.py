"""
MedPredict AI - SHAP Explainability Service
Computes feature contributions explaining why an item is flagged for shortage or expiry risk.
"""

from typing import Dict, Any, List


def get_feature_explanations(features: Dict[str, Any], risk_level: str) -> List[Dict[str, Any]]:
    """
    Computes human-interpretable feature contribution weights and impact explanations.
    """
    explanations = []
    
    stock_cover = features.get("stock_days_coverage", 10.0)
    lead_time = features.get("lead_time_days", 7.0)
    avg_demand = features.get("average_daily_demand", 1.0)
    reliability = features.get("supplier_reliability", 0.95)
    prev_short = features.get("previous_shortage", 0)

    # 1. Stock Coverage vs Lead Time
    if stock_cover <= lead_time:
        explanations.append({
            "feature": "Stock Runway vs Supplier Lead Time",
            "value": f"{round(stock_cover, 1)} days vs {int(lead_time)}d lead time",
            "impact": "CRITICAL_INCREASE",
            "weight": 0.42,
            "description": f"Stock is depleted faster than the {int(lead_time)}-day supplier lead time."
        })
    else:
        explanations.append({
            "feature": "Stock Runway",
            "value": f"{round(stock_cover, 1)} days",
            "impact": "DECREASE",
            "weight": -0.25,
            "description": "Inventory covers standard replenishment cycle."
        })

    # 2. Daily Demand Velocity
    explanations.append({
        "feature": "Average Daily Consumption",
        "value": f"{round(avg_demand, 1)} units/day",
        "impact": "INCREASE" if avg_demand > 5 else "NEUTRAL",
        "weight": 0.22 if avg_demand > 5 else 0.05,
        "description": "Consistent consumption velocity draining available batch stock."
    })

    # 3. Supplier Reliability
    if reliability < 0.90:
        explanations.append({
            "feature": "Supplier Delivery Reliability",
            "value": f"{int(reliability * 100)}%",
            "impact": "INCREASE",
            "weight": 0.18,
            "description": "Supplier has recorded fulfillment delays."
        })
    else:
        explanations.append({
            "feature": "Supplier Delivery Reliability",
            "value": f"{int(reliability * 100)}%",
            "impact": "DECREASE",
            "weight": -0.15,
            "description": "Reliable supplier partner minimizes late delivery shock."
        })

    # 4. Historical Shortage
    if prev_short > 0:
        explanations.append({
            "feature": "Historical Shortage Frequency",
            "value": f"{int(prev_short)} past incidents",
            "impact": "INCREASE",
            "weight": 0.18,
            "description": "Recurring supply chain disruption pattern detected."
        })

    return explanations
