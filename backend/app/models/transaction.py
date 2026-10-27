"""
MedPredict AI - Inventory Transaction SQLAlchemy Model
"""

import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class TransactionType(str, enum.Enum):
    PURCHASE = "PURCHASE"      # Stock increases (+)
    SALE = "SALE"              # Stock decreases (-)
    DISPENSE = "DISPENSE"      # Stock decreases (-)
    ADJUSTMENT = "ADJUSTMENT"  # Positive or negative
    RETURN = "RETURN"          # Stock increases (+)
    DISPOSAL = "DISPOSAL"      # Stock decreases (-) (e.g., expired)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    transaction_type = Column(Enum(TransactionType), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, default=0.0)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    medicine = relationship("Medicine", back_populates="transactions")
    batch = relationship("Batch", back_populates="transactions")
    hospital = relationship("Hospital", back_populates="transactions")
    user = relationship("User", back_populates="transactions")
