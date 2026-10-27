"""
MedPredict AI - Suppliers API Router
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.supplier import Supplier

router = APIRouter(prefix="/suppliers", tags=["Suppliers Management"])


class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lead_time_days: int = 7
    reliability_score: float = 0.95


class SupplierCreate(SupplierBase):
    pass


class SupplierResponse(SupplierBase):
    id: int

    class Config:
        from_attributes = True


@router.get("", response_model=List[SupplierResponse])
def get_suppliers(limit: int = Query(50), db: Session = Depends(get_db)):
    """Lists registered suppliers with delivery lead times and reliability scores."""
    if db is None:
        return []
    return db.query(Supplier).limit(limit).all()


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(supplier_in: SupplierCreate, db: Session = Depends(get_db)):
    """Registers a new pharmaceutical supplier partner."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database session not available")
    supplier = Supplier(**supplier_in.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier
