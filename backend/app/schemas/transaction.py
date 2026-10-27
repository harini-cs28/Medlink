"""
MedPredict AI - Transaction Schemas
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from backend.app.models.transaction import TransactionType


class TransactionBase(BaseModel):
    medicine_id: int
    batch_id: Optional[int] = None
    hospital_id: Optional[int] = None
    transaction_type: TransactionType
    quantity: int
    unit_price: float = 0.0
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    user_id: Optional[int] = None
    transaction_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
