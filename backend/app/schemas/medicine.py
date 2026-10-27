"""
MedPredict AI - Medicine Schemas
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from backend.app.models.medicine import CriticalityLevel


class MedicineBase(BaseModel):
    generic_name: str
    brand_name: Optional[str] = None
    atc_code: Optional[str] = None
    category: str = "General"
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    criticality: CriticalityLevel = CriticalityLevel.MEDIUM
    reorder_level: int = 50


class MedicineCreate(MedicineBase):
    pass


class MedicineUpdate(BaseModel):
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    atc_code: Optional[str] = None
    category: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    criticality: Optional[CriticalityLevel] = None
    reorder_level: Optional[int] = None


class MedicineResponse(MedicineBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
