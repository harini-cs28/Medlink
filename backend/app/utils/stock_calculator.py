"""
MedPredict AI - Stock Calculation Utilities
Calculates running inventory balances, runout timelines, and reorder levels.
"""

from typing import List, Dict, Any


def calculate_current_stock(
    previous_stock: int,
    quantity_received: int,
    quantity_sold: int,
    adjustments: int = 0
) -> int:
    """
    Standard inventory equation:
    current_stock = previous_stock + quantity_received - quantity_sold + adjustments
    """
    return max(0, previous_stock + quantity_received - quantity_sold + adjustments)


def calculate_runout_days(current_stock: float, average_daily_demand: float) -> float:
    """Estimates the days until stock is completely depleted at current burn rate."""
    if average_daily_demand <= 0:
        return 999.0
    return round(current_stock / average_daily_demand, 1)


def calculate_reorder_point(
    average_daily_demand: float,
    lead_time_days: int,
    safety_stock: int = 10
) -> int:
    """Reorder Point = (Lead Time Demand) + Safety Stock"""
    return int((average_daily_demand * lead_time_days) + safety_stock)
