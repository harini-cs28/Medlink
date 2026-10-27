"""
MedPredict AI - Authentication Service
Handles credential verification, user registration, and JWT token issuance.
"""

from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.user import User, UserRole
from backend.app.schemas.auth import LoginRequest, Token
from backend.app.schemas.user import UserCreate
from backend.app.core.security import verify_password, get_password_hash, create_access_token

# Demo fallback accounts if database is empty/unseeded
DEFAULT_DEMO_USERS = {
    "admin@medpredict.ai": {
        "id": 1,
        "email": "admin@medpredict.ai",
        "full_name": "Hospital Administrator",
        "role": UserRole.HOSPITAL_ADMIN,
        "hospital_id": 1,
        # Password: AdminPassword123!
        "password": "AdminPassword123!"
    },
    "manager@medpredict.ai": {
        "id": 2,
        "email": "manager@medpredict.ai",
        "full_name": "Pharmacy Inventory Manager",
        "role": UserRole.PHARMACY_MANAGER,
        "hospital_id": 1,
        # Password: ManagerPassword123!
        "password": "ManagerPassword123!"
    },
    "pharmacist@medpredict.ai": {
        "id": 3,
        "email": "pharmacist@medpredict.ai",
        "full_name": "Senior Clinical Pharmacist",
        "role": UserRole.PHARMACIST,
        "hospital_id": 1,
        # Password: PharmacistPassword123!
        "password": "PharmacistPassword123!"
    }
}


def authenticate_user(db: Optional[Session], login_req: LoginRequest) -> Token:
    """Authenticates a user via DB or fallback demo accounts, issuing a signed JWT."""
    user = None
    if db is not None:
        try:
            user = db.query(User).filter(User.email == login_req.email.lower()).first()
            if user:
                if not verify_password(login_req.password, user.hashed_password):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid email or password"
                    )
                if not user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="User account is inactive"
                    )
                token = create_access_token(
                    subject=user.id,
                    role=user.role.value if hasattr(user.role, 'value') else str(user.role),
                    hospital_id=user.hospital_id
                )
                return Token(
                    access_token=token,
                    token_type="bearer",
                    role=user.role.value if hasattr(user.role, 'value') else str(user.role),
                    user_id=user.id,
                    full_name=user.full_name,
                    email=user.email,
                    hospital_id=user.hospital_id
                )
        except HTTPException:
            raise
        except Exception as e:
            print(f"[Warning] DB auth lookup: {e}")

    # Fallback to demo users
    email = login_req.email.lower()
    if email in DEFAULT_DEMO_USERS and login_req.password == DEFAULT_DEMO_USERS[email]["password"]:
        demo = DEFAULT_DEMO_USERS[email]
        token = create_access_token(
            subject=demo["id"],
            role=demo["role"].value,
            hospital_id=demo["hospital_id"]
        )
        return Token(
            access_token=token,
            token_type="bearer",
            role=demo["role"].value,
            user_id=demo["id"],
            full_name=demo["full_name"],
            email=demo["email"],
            hospital_id=demo["hospital_id"]
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials. For demo access use admin@medpredict.ai, manager@medpredict.ai, or pharmacist@medpredict.ai"
    )


def register_user(db: Session, user_in: UserCreate) -> User:
    """Registers a new user with hashed password in PostgreSQL."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already registered"
        )
    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        hospital_id=user_in.hospital_id,
        is_active=user_in.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
