"""
MedPredict AI - Core Configuration
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[3]
# Load .env from project root (one level above backend)
load_dotenv(BASE_DIR / ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "MedPredict AI"
    API_V1_STR: str = "/api"
    VERSION: str = "2.0.0"
    
    # Database
    DATABASE_URL: str = Field(
        default=os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/medlink_db")
    )
    
    # JWT Security
    JWT_SECRET: str = Field(
        default=os.getenv("JWT_SECRET", "medpredict_super_secret_jwt_key_replace_in_production_2026")
    )
    JWT_ALGORITHM: str = Field(default=os.getenv("JWT_ALGORITHM", "HS256"))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    )
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "*"]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
