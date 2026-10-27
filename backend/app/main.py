"""
MedPredict AI - Main FastAPI Application Server
Intelligent Hospital Medicine Inventory Optimization System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import engine, Base

# Import all models to register with Base metadata
import backend.app.models

# Modular API Routers
from backend.app.api.auth import router as auth_router
from backend.app.api.users import router as users_router
from backend.app.api.medicines import router as medicines_router
from backend.app.api.inventory import router as inventory_router
from backend.app.api.transactions import router as transactions_router
from backend.app.api.predictions import router as predictions_router
from backend.app.api.suppliers import router as suppliers_router
from backend.app.api.reports import router as reports_router

# Analytical Legacy / Data Service Routers
from backend.api.dashboard import router as legacy_dashboard_router
from backend.api.demand import router as legacy_demand_router
from backend.api.shortage import router as legacy_shortage_router
from backend.api.inventory import router as legacy_inventory_router
from backend.api.expiry import router as legacy_expiry_router
from backend.api.reports import router as legacy_reports_router
from backend.api.data_management import router as data_management_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup if engine available
    if engine is not None:
        try:
            Base.metadata.create_all(bind=engine)
            print("[Database] PostgreSQL tables verified/created successfully.")
        except Exception as err:
            print(f"[Database] Table creation skipped or encountered warning: {err}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Hospital Medicine Inventory Optimization System API with ML Demand Forecasting, Shortage & Expiry Risk Analysis, and FEFO Engine.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Modular App Routers
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(medicines_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")
app.include_router(suppliers_router, prefix="/api")
app.include_router(reports_router, prefix="/api")

# Register Analytical / Kaggle + FDA Data Service Routers
app.include_router(legacy_dashboard_router)
app.include_router(legacy_demand_router)
app.include_router(legacy_shortage_router)
app.include_router(legacy_inventory_router)
app.include_router(legacy_expiry_router)
app.include_router(legacy_reports_router)
app.include_router(data_management_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "architecture": "React Frontend + FastAPI + PostgreSQL + ML Pipeline",
        "roles_supported": ["HOSPITAL_ADMIN", "PHARMACY_MANAGER", "PHARMACIST"],
        "endpoints": {
            "auth": "/api/auth/login",
            "dashboard": "/api/dashboard",
            "inventory": "/api/inventory",
            "medicines": "/api/medicines",
            "transactions": "/api/transactions",
            "predictions_shortage": "/api/predictions/shortage",
            "predictions_expiry": "/api/predictions/expiry",
            "recommendations": "/api/predictions/recommendation",
            "reports": "/api/reports",
            "suppliers": "/api/suppliers"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
