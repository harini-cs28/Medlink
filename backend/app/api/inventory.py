"""
MedPredict AI - Inventory API Router
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.services.inventory_service import get_inventory_items

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])


@router.get("")
def get_inventory(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """Retrieves current inventory stock, status, and batch summaries."""
    return get_inventory_items(db=db, category=category, search=search, limit=limit)
