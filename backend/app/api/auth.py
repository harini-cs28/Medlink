"""
MedPredict AI - Authentication API Router
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import decode_access_token
from backend.app.schemas.auth import LoginRequest, Token
from backend.app.schemas.user import UserResponse
from backend.app.services.auth_service import authenticate_user
from backend.app.models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """Extracts and validates current authenticated user payload from Bearer JWT token."""
    if not credentials:
        # For testing / unauthenticated fallback, allow access or raise 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return payload


def require_role(allowed_roles: list[str]):
    """Decorator / dependency to enforce role-based access control."""
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {allowed_roles}"
            )
        return current_user
    return role_checker


@router.post("/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates credentials and returns a JWT bearer token."""
    return authenticate_user(db, login_req)


@router.get("/me")
def get_current_user_profile(user: dict = Depends(get_current_user)):
    """Returns the authenticated user's token claims and active profile."""
    return {
        "user_id": user.get("sub"),
        "role": user.get("role"),
        "hospital_id": user.get("hospital_id"),
        "authenticated": True
    }
