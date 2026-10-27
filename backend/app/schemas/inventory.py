"""
MedPredict AI - Inventory & Batch Schemas
"""

from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel
from backend.app.schemas.medicine import MedicineResponse


class BatchBase(BaseModel):
    medicine_id: int
    supplier_id: Optional[int] = None
    batch_number: str
    quantity: int
    manufacturing_date: Optional[date] = None
    expiry_date: date
    unit_cost: float = 0.0


class BatchCreate(BatchBase):
    pass


class BatchResponse(BatchBase):
    id: int
    created_at: Optional[datetime] = None
    days_to_expiry: Optional[int] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


class InventoryItem(BaseModel):
    medicine_id: int
    generic_name: str
    brand_name: Optional[str] = None
    category: str
    total_stock: int
    reorder_level: int
    criticality: str
    batches_count: int
    nearest_expiry: Optional[date] = None
    stock_status: str  # IN_STOCK, LOW_STOCK, OUT_OF_STOCK, OVERSTOCKED


class InventoryOverview(BaseModel):
    total_skus: int
    total_units: int
    low_stock_count: int
    expiring_soon_count: int
    items: List[InventoryItem]
