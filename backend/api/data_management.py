"""
MedPredict AI - Data Management & Ingestion API Router
Exposes endpoints for previewing, validating, ingesting, and auditing
future dataset uploads (Pharma Sales, FDA Shortages, Hospital Inventory).
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional, Dict, Any, List
from backend.services.data_management_service import (
    validate_csv_file,
    process_and_save_upload,
    get_upload_history,
    get_pipeline_data_status,
    trigger_full_pipeline_refresh
)

router = APIRouter(prefix="/api/datasets", tags=["Dataset Management"])


@router.post("/preview")
async def preview_dataset_endpoint(
    file: UploadFile = File(...),
    datasetType: str = Form(...)
):
    """
    Validates CSV schema and returns detected columns, validation errors,
    and preview rows without modifying the active dataset.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided or filename is empty.")

    try:
        content = await file.read()
    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Failed to read file payload: {err}")

    result = validate_csv_file(content, file.filename, datasetType)
    return result


@router.post("/upload")
async def upload_dataset_endpoint(
    file: UploadFile = File(...),
    datasetType: str = Form(...),
    user: Optional[str] = Form("Administrator")
):
    """
    Safely uploads, validates, backs up, and processes a new dataset into the active pipeline.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided or filename is empty.")

    try:
        content = await file.read()
    except Exception as err:
        raise HTTPException(status_code=400, detail=f"Failed to read file payload: {err}")

    try:
        result = process_and_save_upload(content, file.filename, datasetType, user=user or "Administrator")
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as proc_err:
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(proc_err)}")


@router.get("/history")
def get_upload_history_endpoint():
    """Returns the historical audit trail of all uploaded files and pipeline runs."""
    return get_upload_history()


@router.get("/status")
def get_dataset_status_endpoint():
    """Returns active dataset freshness, row counts, and pipeline synchronization state."""
    return get_pipeline_data_status()


@router.post("/refresh")
def refresh_pipeline_endpoint():
    """Triggers an authorized re-run of the full cleaning and integration pipeline."""
    try:
        return trigger_full_pipeline_refresh()
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Pipeline refresh failed: {str(err)}")
