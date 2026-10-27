"""
MedPredict AI - Medicine Catalog SQLAlchemy Model
"""

import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class CriticalityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    generic_name = Column(String(255), nullable=False, index=True)
    brand_name = Column(String(255), nullable=True, index=True)
    atc_code = Column(String(50), nullable=True, index=True)
    category = Column(String(100), nullable=False, default="General")
    dosage_form = Column(String(100), nullable=True)
    strength = Column(String(100), nullable=True)
    criticality = Column(Enum(CriticalityLevel), default=CriticalityLevel.MEDIUM, nullable=False)
    reorder_level = Column(Integer, default=50)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    batches = relationship("Batch", back_populates="medicine", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="medicine")
