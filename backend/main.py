"""
MedPredict AI - FastAPI Application Server
Serves real-time analytical endpoints derived from Kaggle Pharma Sales and FDA Drug Shortages.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.dashboard import router as dashboard_router
from backend.api.demand import router as demand_router
from backend.api.shortage import router as shortage_router
from backend.api.inventory import router as inventory_router
from backend.api.expiry import router as expiry_router
from backend.api.reports import router as reports_router
from backend.api.data_management import router as data_management_router

app = FastAPI(
    title="MedPredict AI - Data Science Backend",
    description="Intelligent Medicine Inventory Optimization API powering demand forecasting and shortage prediction from real datasets.",
    version="2.0.0"
)

# Enable CORS for React Vite Frontend
@app.on_event("startup")
def startup():
    from backend.app.core.database import engine, Base
    if engine:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as e:
            # Log but do not abort startup; useful in dev when DB may be absent.
            print(f"[Warning] Unable to create DB tables: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Subsystem Routers
app.include_router(dashboard_router)
app.include_router(demand_router)
app.include_router(shortage_router)
app.include_router(inventory_router)
app.include_router(expiry_router)
app.include_router(reports_router)
app.include_router(data_management_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "MedPredict AI Data Science Backend",
        "datasets": [
            "Pharma Sales Dataset (Kaggle)",
            "FDA Drug Shortages Database"
        ],
        "endpoints": [
            "/api/dashboard",
            "/api/demand",
            "/api/forecast",
            "/api/shortages",
            "/api/predict/shortage",
            "/api/inventory",
            "/api/models/metrics",
            "/api/recommendations",
            "/api/reports",
            "/api/expiry"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
