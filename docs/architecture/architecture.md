# Architecture — MedPredict AI

```
MedPredict-AI/
├── data/
│   ├── raw/                 <- Immutable source datasets (Pharma Sales + FDA Shortages)
│   ├── interim/             <- Intermediate transformed datasets
│   └── processed/           <- Cleaned, integrated feature matrices
├── src/
│   ├── data/                <- Ingestion, inspection, cleaning & integration pipelines
│   ├── features/            <- Demand & shortage feature engineering transforms
│   ├── models/              <- Time-series forecasting & shortage classification models
│   ├── evaluation/          <- Metrics computation, backtesting & comparison
│   ├── explainability/      <- SHAP explainability & feature attribution
│   └── visualization/       <- Plotting utilities (Matplotlib, Seaborn, Plotly)
├── notebooks/               <- Interactive, reproducible Jupyter notebooks (01–10)
├── dashboard/               <- Interactive web deployment interface (Streamlit / Python)
├── reports/                 <- Generated evaluation figures, metrics & summaries
├── docs/                    <- Problem statements, schemas, architecture & limitations
└── tests/                   <- PyTest validation suite for data and model pipelines
```

### Key Subsystems:
1. **Data Pipeline Subsystem (`src/data/`)**: Handles schema-safe loading, inspection, cleaning, and entity resolution between datasets.
2. **Feature Store Subsystem (`src/features/`)**: Produces temporal lags, rolling statistics, and cross-dataset risk indicators.
3. **Model & Inference Subsystem (`src/models/`, `src/evaluation/`)**: Executes cross-validated time-series training and classification.
4. **Explainability Engine (`src/explainability/`)**: Extracts model explanations for each prediction.
5. **Interactive Dashboard (`dashboard/`)**: Visualizes forecasting charts, inventory risk tables, and model diagnostics.
