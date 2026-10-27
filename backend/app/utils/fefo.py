"""
MedPredict AI - FEFO (First-Expired, First-Out) Engine
Ensures batches with the nearest expiry dates are consumed first.
"""

from datetime import date
from typing import List, Dict, Any, Tuple


def sort_batches_fefo(batches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sorts available batches in ascending order by expiry date."""
    return sorted(
        [b for b in batches if b.get("quantity", 0) > 0],
        key=lambda x: x.get("expiry_date", date.max)
    )


def allocate_dispense_fefo(
    batches: List[Dict[str, Any]],
    requested_quantity: int
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Allocates units to dispense across batches prioritizing closest expiration date.
    Returns:
      - List of allocations: [{'batch_id': ..., 'quantity_deducted': ..., 'remaining_batch_qty': ...}]
      - Unfulfilled quantity if total stock < requested_quantity
    """
    sorted_batches = sort_batches_fefo(batches)
    remaining_to_fulfill = requested_quantity
    allocations = []

    for batch in sorted_batches:
        if remaining_to_fulfill <= 0:
            break
        available_qty = batch.get("quantity", 0)
        deduct = min(available_qty, remaining_to_fulfill)
        allocations.append({
            "batch_id": batch.get("id") or batch.get("batch_id"),
            "batch_number": batch.get("batch_number"),
            "expiry_date": str(batch.get("expiry_date")),
            "quantity_deducted": deduct,
            "remaining_batch_qty": available_qty - deduct
        })
        remaining_to_fulfill -= deduct

    return allocations, remaining_to_fulfill


def classify_shelf_life(expiry_date: date, today: date = None) -> str:
    """Classifies batch expiry status."""
    if today is None:
        today = date.today()
    days_left = (expiry_date - today).days
    if days_left < 0:
        return "EXPIRED"
    elif days_left <= 60:
        return "EXPIRING_SOON"
    elif days_left <= 180:
        return "MODERATE_SHELF_LIFE"
    else:
        return "SAFE_SHELF_LIFE"
