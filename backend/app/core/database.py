"""
MedPredict AI - Database Engine and Session Management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

# Database Engine Configuration
# Supports PostgreSQL with pool pre-ping
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False,
        connect_args={"connect_timeout": 2}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"[Warning] PostgreSQL Engine initialization: {e}")
    engine = None
    SessionLocal = sessionmaker(autocommit=False, autoflush=False)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a SQLAlchemy session per request
    and automatically handles closing.
    """
    if engine is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
