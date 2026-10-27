"""
MedPredict AI - Transactions API Router
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.transaction import Transaction
from backend.app.schemas.transaction import TransactionCreate, TransactionResponse
from backend.app.services.stock_service import record_transaction
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Inventory Transactions"])


@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    medicine_id: Optional[int] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """Lists recorded inventory transactions."""
    if db is None:
        return []
    query = db.query(Transaction)
    if medicine_id:
        query = query.filter(Transaction.medicine_id == medicine_id)
    return query.order_by(Transaction.transaction_date.desc()).limit(limit).all()


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction_entry(
    trans_in: TransactionCreate,
    db: Session = Depends(get_db)
):
    """Records a purchase, sale, or dispense transaction updating inventory balances."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database session not available")
    return record_transaction(db=db, trans_in=trans_in)
