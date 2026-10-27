"""
MedPredict AI - ML Dataset Preprocessing Script
Loads and standardizes raw datasets into processed format.
"""

from pathlib import Path
import pandas as pd
import numpy as np

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"


def preprocess_all_data():
    print("[Preprocessing] Starting data cleaning and feature pipeline...")
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    
    # Process Pharma Sales if present
    sales_raw_files = list(RAW_DIR.glob("**/*sales*.csv")) + list(RAW_DIR.glob("**/*pharma*.csv"))
    if sales_raw_files:
        print(f"[Preprocessing] Processing {sales_raw_files[0].name}...")
        df_sales = pd.read_csv(sales_raw_files[0])
        # Clean date column
        if 'datum' in df_sales.columns:
            df_sales['date'] = pd.to_datetime(df_sales['datum'])
        df_sales.to_csv(PROCESSED_DIR / "cleaned_pharma_sales.csv", index=False)
        print("[Preprocessing] Saved cleaned_pharma_sales.csv")

    # Process FDA Shortages if present
    shortage_raw_files = list(RAW_DIR.glob("**/*shortage*.csv"))
    if shortage_raw_files:
        print(f"[Preprocessing] Processing {shortage_raw_files[0].name}...")
        df_shortages = pd.read_csv(shortage_raw_files[0])
        df_shortages.to_csv(PROCESSED_DIR / "cleaned_fda_shortages.csv", index=False)
        print("[Preprocessing] Saved cleaned_fda_shortages.csv")

    print("[Preprocessing] Data preprocessing complete.")


if __name__ == "__main__":
    preprocess_all_data()
