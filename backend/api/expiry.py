"""
MedPredict AI - Expiry API Router
"""

from fastapi import APIRouter
from backend.services.data_service import get_hospital_inventory_df

router = APIRouter(prefix="/api/expiry", tags=["Expiry Risk"])


@router.get("")
def get_expiry_status():
    df = get_hospital_inventory_df()

    if df is not None and not df.empty and 'days_until_expiry' in df.columns:
        total_batches = len(df)
        expired = int((df['days_until_expiry'] < 0).sum())
        critical = int(((df['days_until_expiry'] >= 0) & (df['days_until_expiry'] <= 30)).sum())
        high_risk = int(((df['days_until_expiry'] > 30) & (df['days_until_expiry'] <= 60)).sum())
        safe = int((df['days_until_expiry'] > 90).sum())

        at_risk_df = df[df['days_until_expiry'] <= 30]
        units_at_risk = int(at_risk_df['quantity'].sum()) if 'quantity' in at_risk_df else 0
        val_col = 'total_batch_value' if 'total_batch_value' in at_risk_df else 'quantity'
        financial_exposure = round(float(at_risk_df[val_col].sum()), 2)

        records = df.head(100).to_dict(orient="records")

        return {
            "status": "data_connected",
            "message": "Real hospital inventory batch telemetry loaded and analyzed.",
            "isAvailable": True,
            "metrics": {
                "totalBatches": total_batches,
                "expiredBatches": expired,
                "criticalBatches": critical,
                "highRiskBatches": high_risk,
                "safeBatches": safe,
                "unitsAtRisk": units_at_risk,
                "financialExposure": financial_exposure
            },
            "records": records
        }

    return {
        "status": "data_unavailable",
        "message": "Expiry information is not present in the currently connected datasets (Pharma Sales & FDA Shortages).",
        "prerequisites": [
            "Expiry Date (YYYY-MM-DD)",
            "Batch / Lot Number",
            "Product / SKU Identifier",
            "Unit Acquisition Cost"
        ],
        "isAvailable": False
    }
