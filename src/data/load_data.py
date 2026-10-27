"""
MedPredict AI - Data Loading Module
Loads raw real datasets (Pharma Sales and FDA Drug Shortages) into Pandas DataFrames.
Maintains raw data immutability.
"""

import os
from pathlib import Path
from typing import Tuple, Optional
import pandas as pd


# Resolve workspace project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Default dataset paths
RAW_PHARMA_SALES_PATH = PROJECT_ROOT / "data" / "raw" / "pharma_sales" / "pharma_sales.csv"
RAW_FDA_SHORTAGES_PATH = PROJECT_ROOT / "data" / "raw" / "fda_shortages" / "fda_drug_shortages.csv"


def load_pharma_sales(filepath: Optional[str | Path] = None) -> pd.DataFrame:
    """
    Loads the real Pharma Sales dataset from CSV into a pandas DataFrame.
    
    Args:
        filepath: Optional path to the pharma sales CSV file. Defaults to data/raw/pharma_sales/pharma_sales.csv
        
    Returns:
        pd.DataFrame: Loaded raw pharma sales data.
        
    Raises:
        FileNotFoundError: If the raw dataset does not exist.
    """
    path = Path(filepath) if filepath else RAW_PHARMA_SALES_PATH
    if not path.exists():
        # Check alternative common filenames in the same directory
        parent_dir = path.parent
        alt_files = list(parent_dir.glob("*.csv"))
        if alt_files:
            path = alt_files[0]
            print(f"[INFO] Using detected CSV file in pharma_sales directory: {path}")
        else:
            raise FileNotFoundError(
                f"[ERROR] Pharma sales dataset not found at '{path}'. "
                f"Please place your downloaded 'pharma_sales.csv' in '{parent_dir}'."
            )
            
    print(f"[INFO] Loading Pharma Sales dataset from: {path}")
    df = pd.read_csv(path)
    print(f"[INFO] Loaded Pharma Sales: {df.shape[0]} rows, {df.shape[1]} columns.")
    return df


def load_fda_shortages(filepath: Optional[str | Path] = None) -> pd.DataFrame:
    """
    Loads the real FDA Drug Shortages dataset from CSV into a pandas DataFrame.
    
    Args:
        filepath: Optional path to the FDA shortages CSV file. Defaults to data/raw/fda_shortages/fda_drug_shortages.csv
        
    Returns:
        pd.DataFrame: Loaded raw FDA drug shortages data.
        
    Raises:
        FileNotFoundError: If the raw dataset does not exist.
    """
    path = Path(filepath) if filepath else RAW_FDA_SHORTAGES_PATH
    if not path.exists():
        parent_dir = path.parent
        alt_files = list(parent_dir.glob("*.csv"))
        if alt_files:
            path = alt_files[0]
            print(f"[INFO] Using detected CSV file in fda_shortages directory: {path}")
        else:
            raise FileNotFoundError(
                f"[ERROR] FDA shortages dataset not found at '{path}'. "
                f"Please place your downloaded 'fda_drug_shortages.csv' in '{parent_dir}'."
            )
            
    print(f"[INFO] Loading FDA Shortages dataset from: {path}")
    df = pd.read_csv(path)
    print(f"[INFO] Loaded FDA Shortages: {df.shape[0]} rows, {df.shape[1]} columns.")
    return df


def load_all_raw_data() -> Tuple[Optional[pd.DataFrame], Optional[pd.DataFrame]]:
    """
    Convenience loader for both raw datasets with graceful status reporting.
    
    Returns:
        Tuple of (pharma_sales_df, fda_shortages_df)
    """
    pharma_df = None
    fda_df = None
    
    try:
        pharma_df = load_pharma_sales()
    except FileNotFoundError as e:
        print(f"[WARNING] {e}")
        
    try:
        fda_df = load_fda_shortages()
    except FileNotFoundError as e:
        print(f"[WARNING] {e}")
        
    return pharma_df, fda_df


if __name__ == "__main__":
    print("Testing data loading pipeline...")
    load_all_raw_data()
