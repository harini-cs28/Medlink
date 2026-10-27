"""
MedPredict AI - Inventory Service
Queries real inventory records from PostgreSQL database, with fallback to processed Pharma Sales dataset.
"""

from typing import Dict, Any, List, Optional
from datetime import date
from sqlalchemy.orm import Session
from backend.app.models.medicine import Medicine
from backend.app.models.batch import Batch
from backend.app.utils.fefo import classify_shelf_life

ATC_DESCRIPTIONS = {
    'M01AB': 'Anti-inflammatory (Acetic acid e.g., Diclofenac)',
    'M01AE': 'Anti-inflammatory (Propionic acid e.g., Ibuprofen)',
    'N02BA': 'Analgesics (Salicylic acid e.g., Aspirin)',
    'N02BE': 'Analgesics (Anilides e.g., Paracetamol)',
    'N05B':  'Anxiolytics / Psycholeptics (Diazepam, Lorazepam)',
    'N05C':  'Hypnotics / Sedatives (Zolpidem)',
    'R03':   'Airway / Asthma (Salbutamol, Budesonide)',
    'R06':   'Antihistamines for systemic use (Cetirizine)'
}


def get_inventory_items(
    db: Optional[Session] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Returns inventory items with batch summaries and stock status.
    Uses PostgreSQL if available, otherwise falls back to processed data.
    """
    items = []

    if db is not None:
        try:
            query = db.query(Medicine)
            if category:
                query = query.filter(Medicine.category == category)
            if search:
                query = query.filter(
                    (Medicine.generic_name.ilike(f"%{search}%")) |
                    (Medicine.brand_name.ilike(f"%{search}%")) |
                    (Medicine.atc_code.ilike(f"%{search}%"))
                )
            medicines = query.limit(limit).all()

            if medicines:
                for med in medicines:
                    total_stock = sum(b.quantity for b in med.batches) if med.batches else 0
                    batches_count = len(med.batches) if med.batches else 0
                    nearest_exp = min((b.expiry_date for b in med.batches if b.quantity > 0), default=None) if med.batches else None

                    if total_stock == 0:
                        stock_status = "OUT_OF_STOCK"
                    elif total_stock <= med.reorder_level:
                        stock_status = "LOW_STOCK"
                    elif total_stock > med.reorder_level * 3:
                        stock_status = "OVERSTOCKED"
                    else:
                        stock_status = "IN_STOCK"

                    items.append({
                        "medicine_id": med.id,
                        "generic_name": med.generic_name,
                        "brand_name": med.brand_name or med.generic_name,
                        "atc_code": med.atc_code,
                        "category": med.category,
                        "dosage_form": med.dosage_form or "Tablet",
                        "total_stock": total_stock,
                        "reorder_level": med.reorder_level,
                        "criticality": med.criticality.value if hasattr(med.criticality, 'value') else str(med.criticality),
                        "batches_count": batches_count,
                        "nearest_expiry": str(nearest_exp) if nearest_exp else None,
                        "stock_status": stock_status
                    })

                return {
                    "records": items,
                    "total": len(items),
                    "source": "PostgreSQL Database"
                }
        except Exception as e:
            print(f"[Warning] Inventory DB query: {e}")

    # Fallback to analytical data
    from backend.services.data_service import get_sales_df
    try:
        df = get_sales_df()
        atc_cols = [c for c in ATC_DESCRIPTIONS if c in df.columns]
        target_atc = [category] if category and category in atc_cols else atc_cols

        recent_slice = df.tail(limit // len(target_atc) + 5).copy()
        for _, row in recent_slice.iterrows():
            date_val = str(row.get('date', row.get('datum', '')))
            for atc in target_atc:
                vol = round(float(row[atc]), 2)
                trend = "Increasing" if vol > 15 else "Decreasing" if vol < 2 else "Stable"
                if search and search.lower() not in atc.lower() and search.lower() not in ATC_DESCRIPTIONS[atc].lower():
                    continue
                items.append({
                    "id": f"{atc}-{date_val}",
                    "date": date_val,
                    "categoryOrDrug": atc,
                    "atcDescription": ATC_DESCRIPTIONS.get(atc, 'Therapeutic Class'),
                    "volume": vol,
                    "demandTrend": trend,
                    "shortageStatus": "SHORTAGE" if atc in ['N02BE', 'R03'] and vol > 20 else "SAFE"
                })
        items.sort(key=lambda r: r.get('date', ''), reverse=True)
        return {
            "records": items[:limit],
            "total": len(items),
            "source": "Pharma Sales Dataset (Kaggle)"
        }
    except Exception as err:
        return {"records": [], "total": 0, "source": "Awaiting Data"}
