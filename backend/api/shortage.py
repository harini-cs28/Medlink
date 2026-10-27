"""
MedPredict AI - Shortage & Prediction API Router
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from backend.services.data_service import get_shortages_df
from backend.services.prediction_service import predict_shortage_risk

router = APIRouter(tags=["Shortages & Prediction"])


class PredictRequest(BaseModel):
    drugName: str


@router.get("/api/shortages")
def get_shortages_endpoint(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20)
):
    df = get_shortages_df()
    
    records = []
    status_dist = df['status_clean'].value_counts().to_dict() if 'status_clean' in df else {}
    
    filtered = df.copy()
    if status:
        filtered = filtered[filtered['status_clean'].str.lower() == status.lower()]
    if search:
        s = search.lower()
        filtered = filtered[
            filtered['Generic Name'].astype(str).str.lower().str.contains(s, na=False) |
            filtered['standardized_drug_name'].astype(str).str.lower().str.contains(s, na=False)
        ]
        
    for i, (_, row) in enumerate(filtered.head(limit).iterrows()):
        drug = str(row.get('Generic Name', 'Pharmaceutical Product'))
        stat = str(row.get('status_clean', 'Current'))
        risk = "CRITICAL" if stat.lower() in ['to be discontinued', 'discontinued'] else "HIGH" if stat.lower() == 'current' else "LOW"
        
        records.append({
            "id": f"shortage-{i}",
            "drugName": drug,
            "genericName": str(row.get('standardized_drug_name', '')),
            "status": stat,
            "initialPostingDate": str(row.get('initial_posting_date', ''))[:10],
            "updateDate": str(row.get('date_of_update', ''))[:10],
            "reason": str(row.get('reason_clean', 'Not Disclosed')),
            "therapeuticCategory": str(row.get('therapeutic_category_clean', 'General')),
            "dosageForm": str(row.get('Presentation', ''))[:40] if pd_not_na(row.get('Presentation')) else 'Standard Formulation',
            "riskLevel": risk
        })
        
    return {
        "records": records,
        "total": len(df),
        "statusDistribution": status_dist,
        "source": "FDA Drug Shortages Database"
    }


def pd_not_na(val):
    import pandas as pd
    return not pd.isna(val) and str(val).strip() != ''


@router.post("/api/predict/shortage")
def predict_shortage_endpoint(req: PredictRequest):
    return predict_shortage_risk(req.drugName)


@router.get("/api/explainability/shap")
def get_shap_endpoint(drugName: str = Query('Amoxicillin')):
    res = predict_shortage_risk(drugName)
    return res.get("shapExplanations", [])
