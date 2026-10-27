"""
MedPredict AI - Rule-Based Recommendation Engine
Generates actionable inventory guidance combining Shortage Risk and Expiry Risk.
Rules:
1. SHORTAGE HIGH + EXPIRY LOW  -> Increase Reorder / Expedite Procurement
2. SHORTAGE LOW + EXPIRY HIGH  -> Reduce Ordering / Prioritize FEFO Dispensing
3. SHORTAGE HIGH + EXPIRY HIGH -> Urgent Inventory Review / Rebalance Batches
4. SHORTAGE LOW + EXPIRY LOW   -> Monitor Inventory / Standard Operations
"""

from typing import Dict, Any, List, Optional
from backend.app.schemas.prediction import RecommendationOutput


def evaluate_inventory_recommendation(
    drug_name: str,
    shortage_risk: str,
    expiry_risk: str,
    medicine_id: Optional[int] = None,
    current_stock: int = 0,
    daily_demand: float = 1.0,
    lead_time_days: int = 7
) -> RecommendationOutput:
    """
    Rule-based recommendation matrix.
    """
    s_risk = shortage_risk.upper()
    e_risk = expiry_risk.upper()

    # Rule 1: High Shortage + Low Expiry -> Increase Reorder
    if (s_risk in ["HIGH", "CRITICAL"]) and (e_risk == "LOW"):
        suggested_qty = max(50, int(daily_demand * lead_time_days * 2.5))
        return RecommendationOutput(
            medicine_id=medicine_id,
            drug_name=drug_name,
            shortage_risk=s_risk,
            expiry_risk=e_risk,
            primary_action="Increase Reorder & Buffer Stock",
            action_details=f"High risk of stockout with low risk of batch expiration. Place purchase order for {suggested_qty} units with supplier.",
            priority_level="HIGH",
            suggested_order_quantity=suggested_qty,
            fefo_priority=False
        )

    # Rule 2: Low Shortage + High Expiry -> Reduce Ordering / Prioritize FEFO
    elif (s_risk == "LOW") and (e_risk in ["HIGH", "MEDIUM"]):
        return RecommendationOutput(
            medicine_id=medicine_id,
            drug_name=drug_name,
            shortage_risk=s_risk,
            expiry_risk=e_risk,
            primary_action="Pause Reordering & Enforce Strict FEFO",
            action_details="Excess stock relative to daily consumption rate. Suspend new purchase orders and dispense nearest-expiry batches first.",
            priority_level="HIGH",
            suggested_order_quantity=0,
            fefo_priority=True
        )

    # Rule 3: High Shortage + High Expiry -> Urgent Review / Rebalance
    elif (s_risk in ["HIGH", "CRITICAL"]) and (e_risk in ["HIGH", "MEDIUM"]):
        return RecommendationOutput(
            medicine_id=medicine_id,
            drug_name=drug_name,
            shortage_risk=s_risk,
            expiry_risk=e_risk,
            primary_action="Urgent Inventory Review & Batch Rebalancing",
            action_details="Critical condition: existing batches are expiring soon while replenishment supply is restricted. Expedite near-expiry units immediately while securing small fresh replenishment batches.",
            priority_level="URGENT",
            suggested_order_quantity=int(daily_demand * lead_time_days),
            fefo_priority=True
        )

    # Rule 4: Low Shortage + Low Expiry -> Monitor
    else:
        return RecommendationOutput(
            medicine_id=medicine_id,
            drug_name=drug_name,
            shortage_risk=s_risk,
            expiry_risk=e_risk,
            primary_action="Monitor Inventory",
            action_details="Stock balance is optimal. Consumption velocity and batch shelf-life remain within healthy operating thresholds.",
            priority_level="NORMAL",
            suggested_order_quantity=0,
            fefo_priority=False
        )
