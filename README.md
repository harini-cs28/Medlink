# MedPredict AI: Intelligent Medicine Inventory Optimization System

> **Data Science & Machine Learning Project**
> An end-to-end data science system combining historical pharmaceutical consumption data with national FDA drug shortages to identify demand patterns, forecast procurement requirements, and predict shortage risks.

---

## 🔬 End-to-End Data Science Lifecycle

```text
Problem Definition
       ↓
Data Collection (Kaggle Pharma Sales & FDA Shortages)
       ↓
Data Understanding & Schema Diagnostics
       ↓
Data Cleaning & Missingness Treatment
       ↓
Exploratory Data Analysis (EDA)
       ↓
Feature Engineering (Lags, Rolling Windows, Seasonality)
       ↓
Dataset Integration & Entity Matching Analysis
       ↓
Model Building (LightGBM, XGBoost, Random Forest, ARIMA)
       ↓
Model Evaluation & Benchmarking (MAE, RMSE, MAPE, F1, ROC-AUC)
       ↓
Explainable AI (SHAP Feature Attribution)
       ↓
Visualization & Decision Support
       ↓
Deployment (Interactive Dashboard & Reports)
```

---

## 📁 Repository Structure

```text
MedPredict-AI/
│
├── data/
│   ├── raw/
│   │   ├── pharma_sales/
│   │   │   └── pharma_sales.csv            <- Downloaded Kaggle dataset (Immutable)
│   │   └── fda_shortages/
│   │       └── fda_drug_shortages.csv      <- Downloaded FDA shortage dataset (Immutable)
│   ├── interim/                            <- Cleaned intermediate data tables
│   └── processed/                          <- Final feature matrices & integrated tables
│
├── notebooks/
│   ├── 01_data_collection_and_understanding.ipynb
│   ├── 02_pharma_sales_eda.ipynb
│   ├── 03_fda_shortage_eda.ipynb
│   ├── 04_data_cleaning.ipynb
│   ├── 05_feature_engineering.ipynb
│   ├── 06_dataset_integration.ipynb
│   ├── 07_demand_analysis_and_forecasting.ipynb
│   ├── 08_shortage_prediction.ipynb
│   ├── 09_model_evaluation.ipynb
│   └── 10_explainable_ai.ipynb
│
├── src/
│   ├── data/                               <- Ingestion, cleaning & integration scripts
│   ├── features/                           <- Demand lags, rolling windows, shortage metrics
│   ├── models/                             <- Forecasters, classifiers, model utils
│   ├── evaluation/                         <- Time-series and classification metrics
│   ├── explainability/                     <- SHAP tree and kernel explainability
│   └── visualization/                      <- Scientific plotting modules
│
├── models/                                 <- Serialized model binaries (.pkl / .joblib)
├── reports/                                <- Generated figures, metrics, and final report
├── dashboard/                              <- Interactive Python/Streamlit user application
├── tests/                                  <- Automated PyTest unit tests
├── docs/                                   <- Problem statements, schemas & methodologies
├── requirements.txt                        <- Python environment dependencies
└── README.md
```

---

## 📥 Data Management & Future Dataset Ingestion

MedPredict AI includes a transactional, schema-validated dataset ingestion engine supporting future file uploads across three key healthcare domains:

### 1. Supported Dataset Schemas

| Dataset Domain | Target Path | Mandatory Columns | Supported Optional Columns | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Pharmaceutical Sales** | `data/processed/cleaned_pharma_sales.csv` | `datum` (or `date`), at least one ATC column (`M01AB`, `M01AE`, `N02BA`, `N02BE`, `N05B`, `N05C`, `R03`, `R06`) | `Year`, `Month`, `Hour`, `Weekday Name` | Daily dispensing time-series across therapeutic classes. |
| **FDA Drug Shortages** | `data/processed/cleaned_fda_shortages.csv` | `Generic Name` (or `Drug Name`), `Status` | `Therapeutic Category`, `Reason for Shortage`, `Initial Posting Date`, `Date of Update`, `Presentation` | National shortage registry incidents and discontinuation notices. |
| **Hospital Batch Inventory** | `data/processed/cleaned_hospital_inventory.csv` | `expiry_date` (YYYY-MM-DD), `batch_number` (Lot ID), `drug_name` (Product SKU), `quantity` (Units) | `unit_cost` ($), `dosage_form`, `storage_condition` | Clinical facility lot numbers and shelf-life tracking for FEFO auditing. |

### 2. Data Integrity & Safety Controls
- **Path Traversal Protection**: Uploaded filenames are sanitized and confined to controlled storage directories (`data/uploads/{dataset_type}/`).
- **Transactional Ingestion**: Active datasets are backed up to `data/backups/` before applying modifications. Any failure rolls back the active dataset immediately.
- **Zero Synthetic Injection**: Datasets are never fabricated. When expiration data is missing from public registries, the system audits boundaries and explicitly prompts for clinical batch uploads.
- **Audited Provenance**: Each prediction records the `datasetVersion` and `lastDataSync` timestamp.

### 3. Dataset Management API Endpoints
- `POST /api/datasets/preview`: Validates CSV schema and returns first 10 rows without modifying active data.
- `POST /api/datasets/upload`: Uploads, validates, cleans, backs up, and integrates new CSV data.
- `GET /api/datasets/history`: Retrieves the audit log of all previous uploads.
- `GET /api/datasets/status`: Returns current dataset freshness, row counts, and pipeline synchronization health.
- `POST /api/datasets/refresh`: Authorized re-execution of full cleaning and integration pipeline.

---

## 🚀 Getting Started

### 1. Environment Setup
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # On Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
npm install
```

### 2. Run Automated Test Suite
```bash
python -m pytest
```

### 3. Launch Backend & Frontend
```bash
# Terminal 1: Launch FastAPI Backend (Port 8000)
python backend/main.py

# Terminal 2: Launch Vite React Frontend (Port 5173)
npm run dev
```
Navigate to `http://localhost:5173` to access the interactive web application.
