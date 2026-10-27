# Limitations & Constraints — MedPredict AI

To maintain scientific rigor and operational honesty, this document explicitly lists the boundaries, dataset limitations, and structural constraints of MedPredict AI.

---

## 1. Dataset Limitations

### A. Pharma Sales Dataset
- **Geographic & Institutional Context**: Aggregated pharmacy transaction datasets typically represent regional sales or pharmacy point-of-sale systems rather than global multi-hospital inpatient consumption.
- **Missing Clinical Metadata**: Diagnosis codes, physician specialties, or patient demographics are not recorded in transactional sales logs.
- **Stockout Censoring**: When a pharmacy runs out of stock, sales drop to zero; unrecorded true demand may exceed observed sales (censored demand).

### B. FDA Drug Shortages Dataset
- **Reporting Granularity**: FDA shortage notifications operate at national/manufacturer levels with status timestamps (e.g., Initial Posting Date, Update Date), rather than real-time daily stock telemetry at local dispensing facilities.
- **Entity Matching**: Drug names across public health databases and commercial sales tables may use differing nomenclatures (ATC classification codes vs. generic INN names vs. brand names). Naming normalizations must be evaluated with string similarity and ATC mapping rules without forced inaccurate joins.

---

## 2. Modeling & Methodological Boundaries
- **No Hallucinated Variables**: Internal hospital metrics (e.g., internal lead times, batch numbers, specific shelf expiry dates) are not fabricated if absent from the raw CSVs.
- **Non-Stationarity**: Pharmaceutical demand patterns may shift rapidly during epidemics or supply crises; models require periodic retraining with fresh data.
- **Decision Support Role**: Predictions provide statistical risk estimates to aid pharmacists and inventory analysts; they do not replace regulatory guidelines or clinical assessments.
