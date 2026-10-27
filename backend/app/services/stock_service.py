"""
MedPredict AI - Stock & Transaction Service
Processes purchases (increasing batch stock) and sales/dispenses (reducing batch stock via FEFO).
All actions strictly update inventory according to:
current_stock = previous_stock + quantity_received - quantity_sold
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.transaction import Transaction, TransactionType
from backend.app.models.batch import Batch
from backend.app.models.medicine import Medicine
from backend.app.schemas.transaction import TransactionCreate
from backend.app.utils.fefo import allocate_dispense_fefo


def record_transaction(
    db: Session,
    trans_in: TransactionCreate,
    user_id: Optional[int] = None
) -> Transaction:
    """
    Executes an inventory transaction and updates batch inventory accordingly.
    """
    medicine = db.query(Medicine).filter(Medicine.id == trans_in.medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicine ID {trans_in.medicine_id} not found."
        )

    # 1. Purchase Transaction -> Increases stock in target batch
    if trans_in.transaction_type == TransactionType.PURCHASE:
        if trans_in.batch_id:
            batch = db.query(Batch).filter(Batch.id == trans_in.batch_id).first()
            if batch:
                batch.quantity += trans_in.quantity

    # 2. Sale / Dispense Transaction -> Decreases stock via FEFO
    elif trans_in.transaction_type in [TransactionType.SALE, TransactionType.DISPENSE]:
        if trans_in.batch_id:
            batch = db.query(Batch).filter(Batch.id == trans_in.batch_id).first()
            if not batch:
                raise HTTPException(status_code=404, detail="Specified batch not found")
            if batch.quantity < trans_in.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient batch quantity. Available: {batch.quantity}")
            batch.quantity -= trans_in.quantity
        else:
            # Auto-allocate via FEFO
            batches = db.query(Batch).filter(
                Batch.medicine_id == trans_in.medicine_id,
                Batch.quantity > 0
            ).order_by(Batch.expiry_date.asc()).all()

            batch_dicts = [
                {"id": b.id, "batch_number": b.batch_number, "quantity": b.quantity, "expiry_date": b.expiry_date}
                for b in batches
            ]
            allocations, unfulfilled = allocate_dispense_fefo(batch_dicts, trans_in.quantity)
            if unfulfilled > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient overall stock for FEFO dispense. Short by {unfulfilled} units."
                )

            for alloc in allocations:
                b_match = next((b for b in batches if b.id == alloc["batch_id"]), None)
                if b_match:
                    b_match.quantity -= alloc["quantity_deducted"]

    # Record the transaction entry
    transaction = Transaction(
        medicine_id=trans_in.medicine_id,
        batch_id=trans_in.batch_id,
        hospital_id=trans_in.hospital_id,
        user_id=user_id,
        transaction_type=trans_in.transaction_type,
        quantity=trans_in.quantity,
        unit_price=trans_in.unit_price,
        notes=trans_in.notes
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction
