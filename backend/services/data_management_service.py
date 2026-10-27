"""
MedPredict AI - Data Management Service
Handles secure validation, preview, transactional ingestion, backups,
and version tracking for future dataset uploads.
"""

import io
import re
import json
import shutil
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np

from backend.services.data_service import (
    PROJECT_ROOT,
    SALES_PATH,
    SHORTAGES_PATH,
    INTEGRATED_PATH,
    HOSPITAL_INVENTORY_PATH,
    METADATA_PATH,
    reload_data_cache,
    get_sales_df,
    get_shortages_df,
    get_integrated_df,
    get_hospital_inventory_df,
    get_dataset_metadata,
    update_dataset_metadata
)
from src.data.clean_sales import clean_pharma_sales_data
from src.data.clean_shortages import clean_fda_shortages_data
from src.data.integrate_datasets import integrate_pharma_and_shortages

# Concurrency lock to prevent simultaneous writes to datasets
_upload_lock = threading.Lock()

# Controlled directories
UPLOADS_DIR = PROJECT_ROOT / "data" / "uploads"
BACKUPS_DIR = PROJECT_ROOT / "data" / "backups"
HISTORY_FILE = UPLOADS_DIR / "upload_history.json"

# Maximum allowable upload size: 50 MB
MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024

# Expected Schemas and Synonyms
ATC_COLUMNS = ['M01AB', 'M01AE', 'N02BA', 'N02BE', 'N05B', 'N05C', 'R03', 'R06']


def _ensure_directories():
    """Ensures controlled storage directories exist."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / "pharma_sales").mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / "fda_shortages").mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / "hospital_inventory").mkdir(parents=True, exist_ok=True)


def sanitize_filename(filename: str) -> str:
    """
    Prevents path traversal and unsafe filenames by stripping directories,
    null bytes, and special characters.
    """
    # Extract basename only
    base = Path(filename).name
    # Strip null bytes and directory separators
    base = base.replace("\0", "").replace("/", "").replace("\\", "").replace("..", "")
    # Allow only alphanumeric, dashes, underscores, and dots
    sanitized = re.sub(r'[^a-zA-Z0-9_.-]', '_', base)
    if not sanitized.lower().endswith('.csv'):
        sanitized += '.csv'
    return sanitized if sanitized else "dataset_upload.csv"


def read_csv_safely(file_bytes: bytes) -> Tuple[pd.DataFrame, Optional[str]]:
    """
    Safely reads CSV bytes with encoding detection fallbacks (UTF-8, UTF-8-SIG, ISO-8859-1).
    """
    if len(file_bytes) == 0:
        return pd.DataFrame(), "Uploaded file is completely empty (0 bytes)."
    if len(file_bytes) > MAX_UPLOAD_SIZE_BYTES:
        return pd.DataFrame(), f"File size exceeds limit of {MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB."

    encodings = ['utf-8', 'utf-8-sig', 'latin1', 'cp1252']
    last_err = None

    for enc in encodings:
        try:
            df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc, skip_blank_lines=True)
            # Strip whitespace from columns
            df.columns = [str(c).strip() for c in df.columns]
            return df, None
        except Exception as e:
            last_err = str(e)
            continue

    return pd.DataFrame(), f"Unable to parse CSV content. Error: {last_err}"


def validate_csv_file(file_bytes: bytes, filename: str, dataset_type: str) -> Dict[str, Any]:
    """
    Validates CSV schema against dataset requirements without modifying active data.
    Returns preview rows and structured error/warning messages.
    """
    _ensure_directories()
    safe_name = sanitize_filename(filename)

    if not filename.lower().endswith('.csv'):
        return {
            "valid": False,
            "filename": safe_name,
            "dataset_type": dataset_type,
            "errors": ["Only CSV files (.csv) are accepted."],
            "warnings": [],
            "preview_rows": [],
            "columns": []
        }

    df, read_err = read_csv_safely(file_bytes)
    if read_err:
        return {
            "valid": False,
            "filename": safe_name,
            "dataset_type": dataset_type,
            "errors": [read_err],
            "warnings": [],
            "preview_rows": [],
            "columns": []
        }

    if df.empty:
        return {
            "valid": False,
            "filename": safe_name,
            "dataset_type": dataset_type,
            "errors": ["The CSV file contains no data rows."],
            "warnings": [],
            "preview_rows": [],
            "columns": list(df.columns)
        }

    cols = list(df.columns)
    errors = []
    warnings = []
    required_found = []
    missing_required = []

    if dataset_type == "pharma_sales":
        # Check for date column
        date_candidates = ['datum', 'date', 'Date', 'DATE', 'timestamp']
        date_col = next((c for c in cols if c in date_candidates), None)
        if not date_col:
            # Fallback: check if any string/object column has date-formatted strings (not pure numbers)
            string_cols = df.select_dtypes(include=['object', 'string']).columns.tolist()
            for sc in string_cols:
                sample_vals = df[sc].dropna().astype(str).head(5)
                if any(sep in s for s in sample_vals for sep in ['-', '/']):
                    try:
                        parsed = pd.to_datetime(sample_vals, errors='coerce')
                        if parsed.notna().sum() >= max(1, int(len(sample_vals) * 0.8)):
                            date_col = sc
                            warnings.append(f"Using '{sc}' as the date column.")
                            break
                    except Exception:
                        continue
        if not date_col:
            missing_required.append("Date column ('datum' or 'date')")
            errors.append("Missing required date column ('datum' or 'date').")
        else:
            required_found.append(date_col)

        # Check for ATC therapeutic sales columns or sales volume keywords
        present_atc = [c for c in ATC_COLUMNS if c in cols]
        has_sales_keyword = any(any(k in c.lower() for k in ['sale', 'volume', 'dispense', 'demand', 'unit']) for c in cols)
        if not present_atc and not has_sales_keyword:
            missing_required.append("Pharmaceutical sales columns (ATC classes e.g., M01AB, N02BE)")
            errors.append(f"No pharmaceutical sales or ATC columns detected. Expected categories like {ATC_COLUMNS}.")
        elif present_atc:
            required_found.extend(present_atc)
        else:
            warnings.append("Custom sales volume columns detected instead of standard WHO ATC classifications.")

    elif dataset_type == "fda_shortages":
        # Check for drug name column
        drug_candidates = ['Generic Name', 'Drug Name', 'generic_name', 'drug_name', 'standardized_drug_name']
        drug_col = next((c for c in cols if c in drug_candidates), None)
        if not drug_col:
            # Try case-insensitive matching
            drug_col = next((c for c in cols if any(cand.lower() == c.lower() for cand in drug_candidates)), None)
        
        if not drug_col:
            missing_required.append("Drug/Generic Name column")
            errors.append("Missing drug name column (e.g. 'Generic Name' or 'Drug Name').")
        else:
            required_found.append(drug_col)

        # Check for status column
        status_candidates = ['Status', 'status', 'status_clean', 'Shortage Status']
        status_col = next((c for c in cols if any(cand.lower() == c.lower() for cand in status_candidates)), None)
        if not status_col:
            warnings.append("No explicit 'Status' column found; records will default to 'Current' status.")
        else:
            required_found.append(status_col)

    elif dataset_type == "hospital_inventory":
        # Check for expiry date
        expiry_candidates = ['expiry_date', 'expiration_date', 'Expiry Date', 'Expiration Date', 'expiry']
        expiry_col = next((c for c in cols if any(cand.lower() == c.lower() for cand in expiry_candidates)), None)
        if not expiry_col:
            missing_required.append("Expiry Date column")
            errors.append("Missing expiration date column (e.g. 'expiry_date' or 'Expiration Date').")
        else:
            required_found.append(expiry_col)

        # Check for batch / lot number
        batch_candidates = ['batch_number', 'lot_number', 'batch_id', 'lot_id', 'Batch Number', 'Lot Number', 'batch']
        batch_col = next((c for c in cols if any(cand.lower() == c.lower() for cand in batch_candidates)), None)
        if not batch_col:
            missing_required.append("Batch / Lot Number column")
            errors.append("Missing batch identifier column (e.g. 'batch_number' or 'Lot Number').")
        else:
            required_found.append(batch_col)

        # Check for drug / product name
        drug_candidates = ['drug_name', 'product_name', 'sku', 'Drug Name', 'Generic Name', 'medicine_name']
        drug_col = next((c for c in cols if any(cand.lower() == c.lower() for cand in drug_candidates)), None)
        if not drug_col:
            missing_required.append("Medicine / Drug Name column")
            errors.append("Missing medicine name column (e.g. 'drug_name' or 'Generic Name').")
        else:
            required_found.append(drug_col)

        # Check for quantity
        qty_candidates = ['quantity', 'units', 'stock_quantity', 'Quantity', 'units_in_stock']
        qty_col = next((c for c in cols if any(cand.lower() == c.lower() for cand in qty_candidates)), None)
        if not qty_col:
            missing_required.append("Quantity column")
            errors.append("Missing stock quantity column (e.g. 'quantity' or 'units').")
    elif dataset_type in ["integrated_data", "integrated_matrix"]:
        # Check for date column
        date_candidates = ['datum', 'date', 'Date', 'DATE', 'timestamp']
        date_col = next((c for c in cols if c in date_candidates), None)
        if not date_col:
            missing_required.append("Date column ('datum' or 'date')")
            errors.append("Missing date column ('datum' or 'date').")
        else:
            required_found.append(date_col)

        # Check for ATC therapeutic sales or shortage columns
        present_atc = [c for c in ATC_COLUMNS if c in cols]
        has_shortage_cols = any('shortage' in c.lower() for c in cols)
        if not present_atc and not has_shortage_cols:
            missing_required.append("Analytical integration columns (ATC sales or shortage indicators)")
            errors.append("Missing integration metrics. Expected ATC categories (e.g. M01AB, N02BE) or shortage indicators.")
        else:
            if present_atc:
                required_found.extend(present_atc)
            if has_shortage_cols:
                required_found.append("shortage_indicators")
    else:
        errors.append(f"Unrecognized dataset_type '{dataset_type}'. Supported types: pharma_sales, fda_shortages, hospital_inventory, integrated_data.")

    # Create preview rows (first 10, clean NaN to null/empty string)
    preview_df = df.head(10).fillna("")
    preview_rows = preview_df.to_dict(orient="records")

    return {
        "valid": len(errors) == 0,
        "filename": safe_name,
        "dataset_type": dataset_type,
        "file_size": len(file_bytes),
        "total_rows_detected": len(df),
        "columns": cols,
        "required_columns_found": required_found,
        "missing_required_columns": missing_required,
        "preview_rows": preview_rows,
        "errors": errors,
        "warnings": warnings
    }


def clean_hospital_inventory_data(df: pd.DataFrame, save_processed: bool = True) -> pd.DataFrame:
    """
    Cleans and standardizes raw hospital inventory batches with verified shelf-life tracking.
    """
    cleaned = df.copy()
    cleaned.columns = [str(c).strip() for c in cleaned.columns]

    # Map column synonyms
    col_map = {}
    for c in cleaned.columns:
        clow = c.lower()
        if any(k in clow for k in ['expiry', 'expiration']) and 'expiry_date' not in col_map.values():
            col_map[c] = 'expiry_date'
        elif any(k in clow for k in ['batch', 'lot']) and 'batch_number' not in col_map.values():
            col_map[c] = 'batch_number'
        elif any(k in clow for k in ['drug', 'product', 'medicine', 'generic']) and 'drug_name' not in col_map.values():
            col_map[c] = 'drug_name'
        elif any(k in clow for k in ['qty', 'quantity', 'units', 'stock']) and 'quantity' not in col_map.values():
            col_map[c] = 'quantity'
        elif any(k in clow for k in ['cost', 'price', 'unit_cost']) and 'unit_cost' not in col_map.values():
            col_map[c] = 'unit_cost'

    cleaned = cleaned.rename(columns=col_map)

    # Defaults for missing optional columns
    if 'drug_name' not in cleaned.columns:
        cleaned['drug_name'] = 'Unknown Pharmaceutical'
    if 'batch_number' not in cleaned.columns:
        cleaned['batch_number'] = 'BATCH-UNKNOWN'
    if 'quantity' not in cleaned.columns:
        cleaned['quantity'] = 0
    if 'unit_cost' not in cleaned.columns:
        cleaned['unit_cost'] = 0.0

    # Parse and clean numeric fields
    cleaned['quantity'] = pd.to_numeric(cleaned['quantity'], errors='coerce').fillna(0).clip(lower=0).astype(int)
    cleaned['unit_cost'] = pd.to_numeric(cleaned['unit_cost'], errors='coerce').fillna(0.0).clip(lower=0.0)

    # Parse expiry dates
    cleaned['expiry_date'] = pd.to_datetime(cleaned['expiry_date'], errors='coerce')
    cleaned = cleaned.dropna(subset=['expiry_date'])

    # Compute days until expiry relative to current date
    today = pd.Timestamp.now().normalize()
    cleaned['days_until_expiry'] = (cleaned['expiry_date'] - today).dt.days

    def compute_expiry_risk(days: int) -> str:
        if days < 0:
            return "EXPIRED"
        elif days <= 30:
            return "CRITICAL"
        elif days <= 60:
            return "HIGH"
        elif days <= 90:
            return "MEDIUM"
        return "SAFE"

    cleaned['risk_level'] = cleaned['days_until_expiry'].apply(compute_expiry_risk)
    cleaned['total_batch_value'] = (cleaned['quantity'] * cleaned['unit_cost']).round(2)

    # Deduplicate by drug_name + batch_number
    cleaned = cleaned.drop_duplicates(subset=['drug_name', 'batch_number'], keep='last')
    cleaned['expiry_date_str'] = cleaned['expiry_date'].dt.strftime('%Y-%m-%d')

    if save_processed:
        HOSPITAL_INVENTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
        cleaned.to_csv(HOSPITAL_INVENTORY_PATH, index=False)
        print(f"[INFO] Cleaned hospital inventory saved to {HOSPITAL_INVENTORY_PATH} ({len(cleaned)} rows)")

    return cleaned


def process_and_save_upload(
    file_bytes: bytes,
    filename: str,
    dataset_type: str,
    user: str = "Administrator"
) -> Dict[str, Any]:
    """
    Safely ingests and processes an uploaded CSV file.
    Creates backups of active data and rolls back if processing fails.
    """
    _ensure_directories()
    safe_name = sanitize_filename(filename)

    with _upload_lock:
        # 1. Validation
        val_res = validate_csv_file(file_bytes, filename, dataset_type)
        if not val_res["valid"]:
            _log_upload_history({
                "id": f"upl-{int(datetime.now(timezone.utc).timestamp())}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "dataset_type": dataset_type,
                "filename": safe_name,
                "file_size": len(file_bytes),
                "rows_count": 0,
                "status": "VALIDATION_FAILED",
                "details": "; ".join(val_res["errors"]),
                "user": user
            })
            raise ValueError("; ".join(val_res["errors"]))

        # 2. Save raw backup copy with timestamp
        now_ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        raw_storage_path = UPLOADS_DIR / dataset_type / f"{now_ts}_{safe_name}"
        raw_storage_path.write_bytes(file_bytes)

        # 3. Determine active target file to backup
        target_processed_path = None
        if dataset_type == "pharma_sales":
            target_processed_path = SALES_PATH
        elif dataset_type == "fda_shortages":
            target_processed_path = SHORTAGES_PATH
        elif dataset_type == "hospital_inventory":
            target_processed_path = HOSPITAL_INVENTORY_PATH
        elif dataset_type in ["integrated_data", "integrated_matrix"]:
            target_processed_path = INTEGRATED_PATH

        backup_file_path = None
        if target_processed_path and target_processed_path.exists():
            backup_file_path = BACKUPS_DIR / f"{target_processed_path.stem}_{now_ts}.csv"
            shutil.copy2(target_processed_path, backup_file_path)

        # 4. Process and integrate
        try:
            df, _ = read_csv_safely(file_bytes)
            rows_processed = 0

            if dataset_type == "pharma_sales":
                cleaned_df = clean_pharma_sales_data(df, save_processed=True)
                rows_processed = len(cleaned_df)
                integrate_pharma_and_shortages(save_processed=True)

            elif dataset_type == "fda_shortages":
                cleaned_df = clean_fda_shortages_data(df, save_processed=True)
                rows_processed = len(cleaned_df)
                integrate_pharma_and_shortages(save_processed=True)

            elif dataset_type == "hospital_inventory":
                cleaned_df = clean_hospital_inventory_data(df, save_processed=True)
                rows_processed = len(cleaned_df)

            elif dataset_type in ["integrated_data", "integrated_matrix"]:
                INTEGRATED_PATH.parent.mkdir(parents=True, exist_ok=True)
                df.to_csv(INTEGRATED_PATH, index=False)
                rows_processed = len(df)

            # 5. Invalidate and reload global in-memory cache
            reload_data_cache()

            # 6. Update version metadata
            version_tag = f"v{now_ts}"
            metadata = {
                "versionTag": version_tag,
                "lastUpdated": datetime.now(timezone.utc).isoformat(),
                "lastDatasetUpdated": dataset_type,
                "lastUploadedFile": safe_name,
                "salesRecords": len(get_sales_df()) if SALES_PATH.exists() else 0,
                "shortageRecords": len(get_shortages_df()) if SHORTAGES_PATH.exists() else 0,
                "hospitalBatches": len(get_hospital_inventory_df()) if get_hospital_inventory_df() is not None else 0,
                "pipelineStatus": "Synchronized"
            }
            update_dataset_metadata(metadata)

            # 7. Log success
            history_entry = {
                "id": f"upl-{int(datetime.now(timezone.utc).timestamp())}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "dataset_type": dataset_type,
                "filename": safe_name,
                "file_size": len(file_bytes),
                "rows_count": rows_processed,
                "status": "SUCCESS",
                "version_tag": version_tag,
                "details": f"Processed {rows_processed} records successfully.",
                "user": user
            }
            _log_upload_history(history_entry)

            return {
                "success": True,
                "message": f"Successfully validated, processed, and integrated {dataset_type}.",
                "versionTag": version_tag,
                "rowsProcessed": rows_processed,
                "filename": safe_name,
                "timestamp": history_entry["timestamp"]
            }

        except Exception as proc_err:
            # Roll back backup if cleaning or integration failed
            if backup_file_path and backup_file_path.exists() and target_processed_path:
                shutil.copy2(backup_file_path, target_processed_path)
                reload_data_cache()

            _log_upload_history({
                "id": f"upl-{int(datetime.now(timezone.utc).timestamp())}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "dataset_type": dataset_type,
                "filename": safe_name,
                "file_size": len(file_bytes),
                "rows_count": 0,
                "status": "PROCESSING_FAILED",
                "details": f"Processing error: {str(proc_err)}",
                "user": user
            })
            raise RuntimeError(f"Processing failed: {str(proc_err)}")


def _log_upload_history(entry: Dict[str, Any]):
    """Appends an entry to upload_history.json with limit of 100 historical records."""
    history = []
    if HISTORY_FILE.exists():
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except Exception:
            history = []

    history.insert(0, entry)
    history = history[:100]  # Keep most recent 100

    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)


def get_upload_history() -> List[Dict[str, Any]]:
    """Returns stored upload audit history."""
    if not HISTORY_FILE.exists():
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def get_pipeline_data_status() -> Dict[str, Any]:
    """Returns comprehensive data pipeline status and freshness for all datasets."""
    meta = get_dataset_metadata()

    def get_file_info(p: Path) -> Dict[str, Any]:
        if not p.exists():
            return {"exists": False, "rows": 0, "sizeBytes": 0, "lastModified": None}
        return {
            "exists": True,
            "rows": _count_csv_rows(p),
            "sizeBytes": p.stat().st_size,
            "lastModified": datetime.fromtimestamp(p.stat().st_mtime, tz=timezone.utc).isoformat()
        }

    return {
        "pipelineStatus": meta.get("pipelineStatus", "Synchronized"),
        "activeVersion": meta.get("versionTag", "v1.0.0-initial"),
        "lastUpdated": meta.get("lastUpdated"),
        "datasets": {
            "pharma_sales": get_file_info(SALES_PATH),
            "fda_shortages": get_file_info(SHORTAGES_PATH),
            "hospital_inventory": get_file_info(HOSPITAL_INVENTORY_PATH),
            "integrated_data": get_file_info(INTEGRATED_PATH),
            "integrated_matrix": get_file_info(INTEGRATED_PATH)
        }
    }


def _count_csv_rows(path: Path) -> int:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return max(0, sum(1 for _ in f) - 1)
    except Exception:
        return 0


def trigger_full_pipeline_refresh() -> Dict[str, Any]:
    """Re-runs the end-to-end cleaning and integration pipeline on currently active datasets."""
    with _upload_lock:
        from src.data.load_data import load_all_raw_data

        pharma_df, fda_df = load_all_raw_data()
        refreshed_sales = 0
        refreshed_shortages = 0

        if pharma_df is not None:
            clean_sales = clean_pharma_sales_data(pharma_df, save_processed=True)
            refreshed_sales = len(clean_sales)

        if fda_df is not None:
            clean_short = clean_fda_shortages_data(fda_df, save_processed=True)
            refreshed_shortages = len(clean_short)

        integrate_pharma_and_shortages(save_processed=True)
        reload_data_cache()

        now_ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        version_tag = f"v{now_ts}-refresh"
        meta = {
            "versionTag": version_tag,
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
            "lastDatasetUpdated": "full_pipeline_refresh",
            "salesRecords": refreshed_sales,
            "shortageRecords": refreshed_shortages,
            "hospitalBatches": len(get_hospital_inventory_df()) if get_hospital_inventory_df() is not None else 0,
            "pipelineStatus": "Synchronized"
        }
        update_dataset_metadata(meta)

        _log_upload_history({
            "id": f"ref-{int(datetime.now(timezone.utc).timestamp())}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dataset_type": "all",
            "filename": "pipeline_refresh",
            "file_size": 0,
            "rows_count": refreshed_sales + refreshed_shortages,
            "status": "SUCCESS",
            "version_tag": version_tag,
            "details": "Full cleaning and integration pipeline refreshed by administrator.",
            "user": "Administrator"
        })

        return {
            "success": True,
            "message": "Full analytical pipeline successfully refreshed and synchronized.",
            "versionTag": version_tag,
            "salesRecords": refreshed_sales,
            "shortageRecords": refreshed_shortages,
            "timestamp": meta["lastUpdated"]
        }
