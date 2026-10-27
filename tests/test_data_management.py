"""
Unit and Integration Tests for MedPredict AI Data Management & Dataset Upload System
Covers validation, schema compliance, path traversal prevention, deduplication,
transactional safety, upload history, and API endpoints.
"""

import io
import pytest
import pandas as pd
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.data_management_service import (
    sanitize_filename,
    validate_csv_file,
    clean_hospital_inventory_data,
    process_and_save_upload,
    get_upload_history,
    get_pipeline_data_status,
    trigger_full_pipeline_refresh
)
from backend.services.data_service import get_hospital_inventory_df

client = TestClient(app)


# =====================================================================
# 1. Filename Sanitization & Path Traversal Protection Tests
# =====================================================================

def test_sanitize_filename_prevents_path_traversal():
    assert sanitize_filename("../../../etc/passwd.csv") == "passwd.csv"
    assert sanitize_filename("..\\..\\windows\\system32\\cmd.exe.csv") == "cmd.exe.csv"
    assert sanitize_filename("pharma_sales\0evil.csv") == "pharma_salesevil.csv"
    assert sanitize_filename("clean_data.csv") == "clean_data.csv"
    assert sanitize_filename("dataset_no_ext") == "dataset_no_ext.csv"


# =====================================================================
# 2. Schema Validation Tests
# =====================================================================

def test_validate_pharma_sales_valid():
    csv_content = (
        "datum,M01AB,M01AE,N02BA,N02BE,N05B,N05C,R03,R06\n"
        "2024-01-01,10.5,5.2,8.1,25.0,12.0,1.0,4.0,2.0\n"
        "2024-01-02,12.0,4.8,7.5,28.4,14.0,0.0,6.0,3.0\n"
    ).encode("utf-8")

    res = validate_csv_file(csv_content, "pharma_sales.csv", "pharma_sales")
    assert res["valid"] is True
    assert len(res["errors"]) == 0
    assert res["total_rows_detected"] == 2
    assert "datum" in res["required_columns_found"]
    assert "M01AB" in res["required_columns_found"]


def test_validate_pharma_sales_missing_date_fails():
    csv_content = (
        "M01AB,M01AE,N02BE\n"
        "10.5,5.2,25.0\n"
    ).encode("utf-8")

    res = validate_csv_file(csv_content, "invalid_sales.csv", "pharma_sales")
    assert res["valid"] is False
    assert any("date" in err.lower() for err in res["errors"])


def test_validate_pharma_sales_no_numeric_columns_fails():
    csv_content = (
        "date,notes,category\n"
        "2024-01-01,foo,bar\n"
    ).encode("utf-8")

    res = validate_csv_file(csv_content, "no_numbers.csv", "pharma_sales")
    assert res["valid"] is False
    assert any("sales" in err.lower() or "atc" in err.lower() or "numeric" in err.lower() for err in res["errors"])


def test_validate_fda_shortages_valid():
    csv_content = (
        "Generic Name,Status,Therapeutic Category,Reason for Shortage\n"
        "Amoxicillin Oral Suspension,Current,Antibacterial,Demand Increase\n"
        "Albuterol Inhalation Aerosol,Resolved,Pulmonary,Manufacturing Delay\n"
    ).encode("utf-8")

    res = validate_csv_file(csv_content, "shortages.csv", "fda_shortages")
    assert res["valid"] is True
    assert len(res["errors"]) == 0
    assert res["total_rows_detected"] == 2
    assert "Generic Name" in res["required_columns_found"]


def test_validate_fda_shortages_missing_drug_name_fails():
    csv_content = (
        "Company Name,Status,Availability\n"
        "Pfizer,Current,Limited\n"
    ).encode("utf-8")

    res = validate_csv_file(csv_content, "no_drug.csv", "fda_shortages")
    assert res["valid"] is False
    assert any("drug" in err.lower() for err in res["errors"])


def test_validate_hospital_inventory_valid():
    csv_content = (
        "drug_name,batch_number,expiry_date,quantity,unit_cost\n"
        "Amoxicillin 500mg,BATCH-2026A,2026-12-31,500,1.25\n"
        "Ibuprofen 400mg,BATCH-2026B,2026-06-30,250,0.85\n"
    ).encode("utf-8")

    res = validate_csv_file(csv_content, "hospital_batches.csv", "hospital_inventory")
    assert res["valid"] is True
    assert len(res["errors"]) == 0
    assert res["total_rows_detected"] == 2


def test_validate_hospital_inventory_missing_expiry_fails():
    csv_content = (
        "drug_name,batch_number,quantity\n"
        "Amoxicillin 500mg,BATCH-123,100\n"
    ).encode("utf-8")

    res = validate_csv_file(csv_content, "no_expiry.csv", "hospital_inventory")
    assert res["valid"] is False
    assert any("expir" in err.lower() for err in res["errors"])


def test_non_csv_and_empty_file_rejected():
    res_txt = validate_csv_file(b"some text", "document.txt", "pharma_sales")
    assert res_txt["valid"] is False
    assert any("csv" in err.lower() for err in res_txt["errors"])

    res_empty = validate_csv_file(b"", "empty.csv", "pharma_sales")
    assert res_empty["valid"] is False
    assert any("empty" in err.lower() for err in res_empty["errors"])


# =====================================================================
# 3. Hospital Inventory Processing & Expiry Engine Tests
# =====================================================================

def test_clean_hospital_inventory_data_and_risk_computation():
    df = pd.DataFrame({
        'Medicine': ['Drug A', 'Drug B', 'Drug C', 'Drug A'], # Dupe Drug A + Batch 01
        'Lot Number': ['BATCH-01', 'BATCH-02', 'BATCH-03', 'BATCH-01'],
        'Expiration Date': ['2020-01-01', '2026-11-15', '2030-01-01', '2020-01-01'],
        'Units in Stock': [100, 50, 200, 100],
        'Acquisition Cost': [5.0, 10.0, 2.5, 5.0]
    })

    cleaned = clean_hospital_inventory_data(df, save_processed=False)
    # Deduplication test: duplicate batch dropped
    assert len(cleaned) == 3
    assert 'days_until_expiry' in cleaned.columns
    assert 'risk_level' in cleaned.columns

    # 2020 date is in the past -> EXPIRED
    expired_batch = cleaned[cleaned['drug_name'] == 'Drug A'].iloc[0]
    assert expired_batch['risk_level'] == 'EXPIRED'
    assert expired_batch['days_until_expiry'] < 0

    # 2030 date is far in the future -> SAFE
    safe_batch = cleaned[cleaned['drug_name'] == 'Drug C'].iloc[0]
    assert safe_batch['risk_level'] == 'SAFE'
    assert safe_batch['days_until_expiry'] > 90


# =====================================================================
# 4. FastAPI Endpoints Integration Tests (Preview, Upload, History, Status)
# =====================================================================

def test_api_preview_endpoint():
    valid_csv = "datum,M01AB,N02BE\n2024-01-01,10.0,20.0\n2024-01-02,15.0,25.0\n"
    response = client.post(
        "/api/datasets/preview",
        files={"file": ("sales_preview.csv", valid_csv, "text/csv")},
        data={"datasetType": "pharma_sales"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["total_rows_detected"] == 2
    assert len(data["preview_rows"]) == 2


def test_api_preview_endpoint_invalid_columns():
    invalid_csv = "patient_id,blood_pressure,glucose\n1,120,85\n"
    response = client.post(
        "/api/datasets/preview",
        files={"file": ("clinical.csv", invalid_csv, "text/csv")},
        data={"datasetType": "pharma_sales"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False
    assert len(data["errors"]) > 0


def test_api_dataset_status_and_history_endpoints():
    status_res = client.get("/api/datasets/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert "pipelineStatus" in status_data
    assert "datasets" in status_data
    assert "pharma_sales" in status_data["datasets"]
    assert "fda_shortages" in status_data["datasets"]

    history_res = client.get("/api/datasets/history")
    assert history_res.status_code == 200
    assert isinstance(history_res.json(), list)


def test_api_upload_hospital_inventory_and_expiry_integration():
    # Test uploading hospital inventory and verifying expiry endpoint
    hospital_csv = (
        "drug_name,batch_number,expiry_date,quantity,unit_cost\n"
        "Ceftriaxone 1g,BATCH-CEF-01,2027-01-01,300,4.50\n"
        "Dexamethasone 4mg,BATCH-DEX-02,2026-11-20,150,2.10\n"
    )

    upload_res = client.post(
        "/api/datasets/upload",
        files={"file": ("hospital_inventory_test.csv", hospital_csv, "text/csv")},
        data={"datasetType": "hospital_inventory", "user": "Test Auditor"}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["success"] is True
    assert upload_data["rowsProcessed"] == 2

    # Verify /api/expiry now returns isAvailable = True with real batch telemetry
    expiry_res = client.get("/api/expiry")
    assert expiry_res.status_code == 200
    expiry_data = expiry_res.json()
    assert expiry_data["isAvailable"] is True
    assert expiry_data["status"] == "data_connected"
    assert expiry_data["metrics"]["totalBatches"] >= 2
    assert len(expiry_data["records"]) >= 2
