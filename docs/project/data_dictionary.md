# Data Dictionary — MedPredict AI

This dictionary defines schemas, expected data types, and business definitions for the datasets used in MedPredict AI. Field availability is verified against the actual downloaded schemas during ingestion.

---

## 1. Pharma Sales Schema (Typical Kaggle Structure)

| Column Name | Type | Description | Example Values |
| :--- | :--- | :--- | :--- |
| `datum` / `Date` | Date / String | Date of recorded pharmaceutical sales transactions | `2014-01-02`, `2019-10-31` |
| `M01AB` | Float / Integer | Anti-inflammatory and antirheumatic products (Acetic acid derivatives) | `0.0`, `4.67` |
| `M01AE` | Float / Integer | Anti-inflammatory and antirheumatic products (Propionic acid derivatives e.g., Ibuprofen) | `2.1`, `7.5` |
| `N02BA` | Float / Integer | Analgesics and antipyretics (Salicylic acid and derivatives e.g., Aspirin) | `1.0`, `3.2` |
| `N02BE` | Float / Integer | Analgesics and antipyretics (Pyrazolones & Anilides e.g., Paracetamol) | `15.0`, `32.4` |
| `N05B` | Float / Integer | Psycholeptics (Anxiolytics) | `5.0`, `12.0` |
| `N05C` | Float / Integer | Psycholeptics (Hypnotics and sedatives) | `0.0`, `1.5` |
| `R03` | Float / Integer | Drugs for obstructive airway diseases (e.g., Asthma/COPD) | `3.0`, `8.0` |
| `R06` | Float / Integer | Antihistamines for systemic use | `4.0`, `11.2` |
| *Product / Medicine Name* | String | Specific commercial or generic name (if granular transaction table) | `Amoxicillin 500mg` |
| *Quantity / Sales* | Float / Integer | Volume sold during recording interval | `120` |

---

## 2. FDA Drug Shortages Schema (Typical Public FDA Structure)

| Column Name | Type | Description | Example Values |
| :--- | :--- | :--- | :--- |
| `Generic Name` / `Drug Name` | String | Active pharmaceutical ingredient or generic formulation | `Amoxicillin`, `Cisplatin` |
| `Dosage Form` / `Strength` | String | Formulation type and concentration | `Injection, 10mg/mL`, `Oral Capsule` |
| `Status` | String | Current shortage status | `Current`, `Resolved`, `Discontinued` |
| `Initial Posting Date` | Date / String | Date shortage was first reported to the FDA | `2022-10-28` |
| `Update Date` | Date / String | Most recent status modification date | `2023-04-15` |
| `Reason for Shortage` | String | Reported supply-side disruption cause | `Demand Increase`, `Manufacturing Delay` |
| `Therapeutic Category` | String | Medical application area | `Antimicrobial`, `Oncology` |

---

## 3. Derived & Feature-Engineered Variables

| Feature Name | Derived From | Computation Method | Purpose |
| :--- | :--- | :--- | :--- |
| `demand_lag_1` | `sales_volume` | Value at $t-1$ | Captures short-term auto-correlation |
| `demand_lag_7` | `sales_volume` | Value at $t-7$ | Captures weekly cyclical patterns |
| `rolling_mean_7d` | `sales_volume` | 7-day trailing arithmetic mean | Smooths daily volatility |
| `rolling_std_7d` | `sales_volume` | 7-day trailing standard deviation | Measures demand volatility |
| `day_of_week` | `Date` | Integer 0 (Monday) – 6 (Sunday) | Captures day-of-week seasonality |
| `month` | `Date` | Integer 1 – 12 | Captures annual/seasonal demand cycles |
| `is_weekend` | `Date` | Binary indicator (0/1) | Distinct weekend purchasing behavior |
| `shortage_active` | `Status` / `Dates` | Binary flag indicating active shortage | Target variable for classification |
