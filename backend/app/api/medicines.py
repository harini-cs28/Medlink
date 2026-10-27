"""
MedPredict AI - Medicines Master API Router
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.medicine import Medicine
from backend.app.schemas.medicine import MedicineCreate, MedicineResponse, MedicineUpdate
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/medicines", tags=["Medicines Master"])


@router.get("", response_model=List[MedicineResponse])
def get_medicines(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """Lists medicines matching filter query."""
    if db is None:
        return []
    query = db.query(Medicine)
    if search:
        query = query.filter(
            (Medicine.generic_name.ilike(f"%{search}%")) |
            (Medicine.brand_name.ilike(f"%{search}%"))
        )
    if category:
        query = query.filter(Medicine.category == category)
    return query.limit(limit).all()


@router.post("", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(
    medicine_in: MedicineCreate,
    db: Session = Depends(get_db)
):
    """Creates a new medicine master entry."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database session not available")
    med = Medicine(**medicine_in.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    return med
