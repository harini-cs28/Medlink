"""
MedPredict AI - User SQLAlchemy Model with Role-Based Access Control
"""

import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class UserRole(str, enum.Enum):
    HOSPITAL_ADMIN = "HOSPITAL_ADMIN"
    PHARMACY_MANAGER = "PHARMACY_MANAGER"
    PHARMACIST = "PHARMACIST"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.PHARMACIST, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    hospital = relationship("Hospital", back_populates="users")
    transactions = relationship("Transaction", back_populates="user")
