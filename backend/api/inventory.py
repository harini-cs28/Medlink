"""
MedPredict AI - Inventory API Router
"""

from fastapi import APIRouter, Query
from typing import Optional
from backend.services.inventory_service import get_inventory_records

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("")
def get_inventory_endpoint(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50)
):
    return get_inventory_records(category=category, search=search, limit=limit)
