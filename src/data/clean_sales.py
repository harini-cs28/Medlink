"""
MedPredict AI - Pharma Sales Data Cleaning Pipeline
Cleans and standardizes raw pharma sales data without mutating original source files.
Saves reproducible outputs to data/processed/cleaned_pharma_sales.csv.
"""

from pathlib import Path
from typing import Optional
import pandas as pd
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def clean_pharma_sales_data(
    df: pd.DataFrame,
    save_processed: bool = True,
    save_interim: Optional[bool] = None,
    **kwargs
) -> pd.DataFrame:
    """
    Cleans raw pharmaceutical sales DataFrame strictly using observed columns.
    
    Steps:
    1. Deduplicate records.
    2. Strip whitespace from headers.
    3. Parse 'datum' column to ISO datetime (YYYY-MM-DD).
    4. Ensure numerical columns (M01AB, M01AE, N02BA, N02BE, N05B, N05C, R03, R06) are non-negative floats.
    5. Chronologically sort by date.
    6. Persist cleaned data to data/processed/cleaned_pharma_sales.csv.
    """
    cleaned_df = df.copy()
    
    # Check save flags
    if save_interim is False and 'save_processed' not in kwargs:
        save_processed = False

    # Strip header whitespace
    cleaned_df.columns = [col.strip() for col in cleaned_df.columns]
    
    # Parse date column
    date_col = 'datum' if 'datum' in cleaned_df.columns else 'Date' if 'Date' in cleaned_df.columns else cleaned_df.columns[0]
    
    # Deduplicate records by date column or full row
    initial_rows = len(cleaned_df)
    if date_col in cleaned_df.columns:
        cleaned_df = cleaned_df.drop_duplicates(subset=[date_col], keep='last')
    else:
        cleaned_df = cleaned_df.drop_duplicates()
    dropped = initial_rows - len(cleaned_df)
    if dropped > 0:
        print(f"[CLEANING] Dropped {dropped} duplicate rows.")
        
    print(f"[CLEANING] Parsing date column '{date_col}'...")
    cleaned_df['date'] = pd.to_datetime(cleaned_df[date_col], format='%m/%d/%Y', errors='coerce')
    # Fallback to general parsing if format mismatch
    if cleaned_df['date'].isna().sum() > 0:
        cleaned_df['date'] = pd.to_datetime(cleaned_df[date_col], errors='coerce')
        
    cleaned_df = cleaned_df.sort_values(by='date').reset_index(drop=True)
    
    # Known ATC therapeutic columns
    atc_cols = ['M01AB', 'M01AE', 'N02BA', 'N02BE', 'N05B', 'N05C', 'R03', 'R06']
    present_atc = [c for c in atc_cols if c in cleaned_df.columns]
    
    for col in present_atc:
        cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='coerce').fillna(0).clip(lower=0)
        
    # Standardize calendar fields
    cleaned_df['year'] = cleaned_df['date'].dt.year
    cleaned_df['month'] = cleaned_df['date'].dt.month
    cleaned_df['day'] = cleaned_df['date'].dt.day
    cleaned_df['weekday_name'] = cleaned_df['date'].dt.day_name()
    
    # Save output to processed
    if save_processed:
        out_dir = PROJECT_ROOT / "data" / "processed"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "cleaned_pharma_sales.csv"
        cleaned_df.to_csv(out_path, index=False)
        print(f"[INFO] Cleaned Pharma Sales saved to: {out_path} ({cleaned_df.shape[0]} rows)")
        
    return cleaned_df


if __name__ == "__main__":
    from src.data.load_data import load_pharma_sales
    raw_df = load_pharma_sales()
    clean_df = clean_pharma_sales_data(raw_df)
    print("Processed Pharma Sales Shape:", clean_df.shape)
