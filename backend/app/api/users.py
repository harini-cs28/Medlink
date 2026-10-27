"""
MedPredict AI - Users API Router
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.user import User, UserRole
from backend.app.schemas.user import UserCreate, UserResponse, UserUpdate
from backend.app.services.auth_service import register_user
from backend.app.api.auth import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["Users Management"])


@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["HOSPITAL_ADMIN"]))
):
    """Admin-only endpoint to list hospital users."""
    if db is None:
        return []
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["HOSPITAL_ADMIN"]))
):
    """Admin-only endpoint to register a new user."""
    if db is None:
        raise HTTPException(status_code=503, detail="Database session not available")
    return register_user(db, user_in)
