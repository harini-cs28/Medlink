"""
MedPredict AI - Data Inspection & Understanding Module
Analyzes real Pharma Sales and FDA Drug Shortages datasets without assuming hard-coded schema names.
Produces structured summaries, missingness audits, and exports machine-readable data dictionaries.
"""

import json
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def inspect_dataframe(df: pd.DataFrame, dataset_name: str = "Dataset") -> Dict[str, Any]:
    """
    Performs comprehensive diagnostic inspection on an arbitrary real DataFrame.
    """
    if df is None or df.empty:
        return {"error": "DataFrame is empty or None"}
        
    num_rows, num_cols = df.shape
    duplicate_rows = int(df.duplicated().sum())
    
    # Identify column classifications
    numeric_cols: List[str] = df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols: List[str] = df.select_dtypes(include=['object', 'category', 'string']).columns.tolist()
    datetime_cols: List[str] = df.select_dtypes(include=['datetime', 'datetime64']).columns.tolist()
    
    fields_summary = {}
    for col in df.columns:
        series = df[col]
        col_type = str(series.dtype)
        missing_cnt = int(series.isnull().sum())
        missing_pct = round((missing_cnt / num_rows) * 100, 2)
        unique_cnt = int(series.nunique(dropna=True))
        
        field_info: Dict[str, Any] = {
            "dtype": col_type,
            "missing_count": missing_cnt,
            "missing_percentage": missing_pct,
            "unique_count": unique_cnt,
            "sample_values": [str(x) for x in series.dropna().head(3).tolist()]
        }
        
        if col in numeric_cols:
            field_info["min"] = float(series.min()) if not pd.isna(series.min()) else None
            field_info["max"] = float(series.max()) if not pd.isna(series.max()) else None
            field_info["mean"] = float(round(series.mean(), 2)) if not pd.isna(series.mean()) else None
            field_info["std"] = float(round(series.std(), 2)) if not pd.isna(series.std()) else None
            
        fields_summary[col] = field_info
        
    summary = {
        "dataset": dataset_name,
        "rows": num_rows,
        "columns": num_cols,
        "duplicate_rows": duplicate_rows,
        "duplicate_percentage": round((duplicate_rows / num_rows) * 100, 2) if num_rows > 0 else 0,
        "column_names": list(df.columns),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "datetime_columns": datetime_cols,
        "fields": fields_summary,
        "memory_usage_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)
    }
    
    return summary


def run_inspection_pipeline() -> Dict[str, Any]:
    """
    Executes inspection on both raw datasets and saves reports/data_dictionary.json.
    """
    from src.data.load_data import load_all_raw_data
    pharma_df, fda_df = load_all_raw_data()
    
    full_report = {}
    
    if pharma_df is not None:
        pharma_summary = inspect_dataframe(pharma_df, "pharma_sales")
        full_report["pharma_sales"] = pharma_summary
        print("=" * 70)
        print(" PHARMA SALES REAL DATASET INSPECTION")
        print("=" * 70)
        print(f"Shape: {pharma_summary['rows']} rows, {pharma_summary['columns']} columns")
        print(f"Columns: {pharma_summary['column_names']}")
        print(f"Duplicates: {pharma_summary['duplicate_rows']}")
        print(f"Numerical Columns: {pharma_summary['numeric_columns']}")
        print("=" * 70)
        
    if fda_df is not None:
        fda_summary = inspect_dataframe(fda_df, "fda_drug_shortages")
        full_report["fda_drug_shortages"] = fda_summary
        print("\n" + "=" * 70)
        print(" FDA DRUG SHORTAGES REAL DATASET INSPECTION")
        print("=" * 70)
        print(f"Shape: {fda_summary['rows']} rows, {fda_summary['columns']} columns")
        print(f"Columns: {fda_summary['column_names']}")
        print(f"Duplicates: {fda_summary['duplicate_rows']}")
        print("=" * 70)
        
    # Save machine-readable data dictionary
    out_dir = PROJECT_ROOT / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "data_dictionary.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(full_report, f, indent=2)
    print(f"\n[INFO] Machine-readable data dictionary saved to: {out_path}")
    
    return full_report


if __name__ == "__main__":
    run_inspection_pipeline()
