"""
MedPredict AI - Supplier SQLAlchemy Model
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    contact_person = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    lead_time_days = Column(Integer, default=7)
    reliability_score = Column(Float, default=0.95)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    batches = relationship("Batch", back_populates="supplier")
