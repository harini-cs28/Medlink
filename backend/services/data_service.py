"""
MedPredict AI - Backend Data Service
Loads and serves real processed datasets (Pharma Sales & FDA Shortages).
Zero synthetic or fake data.
"""

from pathlib import Path
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SALES_PATH = PROJECT_ROOT / "data" / "processed" / "cleaned_pharma_sales.csv"
SHORTAGES_PATH = PROJECT_ROOT / "data" / "processed" / "cleaned_fda_shortages.csv"
INTEGRATED_PATH = PROJECT_ROOT / "data" / "processed" / "integrated_data.csv"
HOSPITAL_INVENTORY_PATH = PROJECT_ROOT / "data" / "processed" / "cleaned_hospital_inventory.csv"
METADATA_PATH = PROJECT_ROOT / "data" / "processed" / "dataset_metadata.json"

# Global in-memory data cache
_sales_df: Optional[pd.DataFrame] = None
_shortages_df: Optional[pd.DataFrame] = None
_integrated_df: Optional[pd.DataFrame] = None
_hospital_inventory_df: Optional[pd.DataFrame] = None


def reload_data_cache() -> None:
    """Invalidates and re-populates the in-memory cache for all processed datasets."""
    global _sales_df, _shortages_df, _integrated_df, _hospital_inventory_df
    _sales_df = None
    _shortages_df = None
    _integrated_df = None
    _hospital_inventory_df = None
    
    # Reload fresh from disk
    get_sales_df()
    get_shortages_df()
    get_integrated_df()
    get_hospital_inventory_df()


def get_sales_df() -> pd.DataFrame:
    global _sales_df
    if _sales_df is None:
        if SALES_PATH.exists():
            _sales_df = pd.read_csv(SALES_PATH)
        else:
            from src.data.clean_sales import clean_pharma_sales_data
            from src.data.load_data import load_pharma_sales
            _sales_df = clean_pharma_sales_data(load_pharma_sales())
    return _sales_df


def get_shortages_df() -> pd.DataFrame:
    global _shortages_df
    if _shortages_df is None:
        if SHORTAGES_PATH.exists():
            _shortages_df = pd.read_csv(SHORTAGES_PATH)
        else:
            from src.data.clean_shortages import clean_fda_shortages_data
            from src.data.load_data import load_fda_shortages
            _shortages_df = clean_fda_shortages_data(load_fda_shortages())
    return _shortages_df


def get_integrated_df() -> pd.DataFrame:
    global _integrated_df
    if _integrated_df is None:
        if INTEGRATED_PATH.exists():
            _integrated_df = pd.read_csv(INTEGRATED_PATH)
        else:
            from src.data.integrate_datasets import integrate_pharma_and_shortages
            _integrated_df = integrate_pharma_and_shortages()
    return _integrated_df


def get_hospital_inventory_df() -> Optional[pd.DataFrame]:
    global _hospital_inventory_df
    if _hospital_inventory_df is None and HOSPITAL_INVENTORY_PATH.exists():
        try:
            _hospital_inventory_df = pd.read_csv(HOSPITAL_INVENTORY_PATH)
        except Exception:
            _hospital_inventory_df = None
    return _hospital_inventory_df


def get_dataset_metadata() -> Dict[str, Any]:
    """Retrieves current version tag and freshness timestamps for active datasets."""
    import json
    from datetime import datetime, timezone

    if METADATA_PATH.exists():
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # Default metadata if not yet created
    sales_exists = SALES_PATH.exists()
    sales_mtime = datetime.fromtimestamp(SALES_PATH.stat().st_mtime, tz=timezone.utc).isoformat() if sales_exists else None

    return {
        "versionTag": "v1.0.0-initial",
        "lastUpdated": sales_mtime or datetime.now(timezone.utc).isoformat(),
        "salesRecords": len(get_sales_df()) if sales_exists else 0,
        "shortageRecords": len(get_shortages_df()) if SHORTAGES_PATH.exists() else 0,
        "hospitalBatches": len(get_hospital_inventory_df()) if get_hospital_inventory_df() is not None else 0,
        "pipelineStatus": "Synchronized"
    }


def update_dataset_metadata(meta: Dict[str, Any]) -> None:
    """Updates dataset_metadata.json with latest version and counts."""
    import json
    METADATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
