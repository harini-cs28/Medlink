# Dataset Documentation — MedPredict AI

This document details the source, structure, acquisition method, and integrity rules for the real datasets utilized in MedPredict AI.

---

## 1. Pharma Sales Dataset (Kaggle)

- **Source**: Kaggle Pharmaceutical Sales / Pharmacy Transaction Records
- **Storage Location**: `data/raw/pharma_sales/pharma_sales.csv`
- **Domain**: Historical pharmaceutical sales transactions, daily/weekly/monthly sales volumes across various therapeutic categories (such as ATC classes: M01AB, M01AE, N02BA, N02BE, N05B, N05C, R03, R06, or individual product lines).
- **Format**: CSV format with UTF-8 encoding.
- **Handling Protocol**:
  - The raw CSV is treated as **read-only and immutable**.
  - All date transformations, handling of zeros/missing values, aggregation from daily to weekly/monthly, and outlier detections are executed via reproducible pipelines in `src/data/` saving to `data/interim/` and `data/processed/`.

---

## 2. FDA Drug Shortages Dataset (FDA)

- **Source**: U.S. Food and Drug Administration (FDA) Drug Shortage Database
- **Storage Location**: `data/raw/fda_shortages/fda_drug_shortages.csv`
- **Domain**: Public registry tracking current and resolved pharmaceutical shortages, therapeutic categories, dosage forms, reasons for shortage, and status timestamps.
- **Format**: CSV export.
- **Handling Protocol**:
  - The raw dataset is treated as **read-only and immutable**.
  - Cleaning pipelines standardize drug names, active ingredients, timestamps, and status categories before analytical evaluation.

---

## 3. Data Integrity & Reproducibility Standard
- **No Mock or Synthetic Injections**: No artificial records, fake IDs, or random medical data are introduced into the pipelines.
- **Traceable Transformations**: Every cleaning step (missing value imputation, deduplication, string trimming, case normalization) is explicitly logged and documented.
