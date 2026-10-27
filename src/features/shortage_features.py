"""
MedPredict AI - Shortage Feature Engineering Module
Derives empirical shortage risk indicators from real FDA shortage records.
"""

from typing import Optional
import pandas as pd
import numpy as np


def extract_shortage_duration(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes duration (in days) between initial shortage posting and latest update/resolution.
    """
    data = df.copy()
    
    # Identify initial date and update date columns
    initial_date_col = None
    update_date_col = None
    
    for col in data.columns:
        if 'initial' in col or 'posting' in col:
            initial_date_col = col
        elif 'update' in col or 'resolved' in col:
            update_date_col = col
            
    if initial_date_col and update_date_col:
        data[initial_date_col] = pd.to_datetime(data[initial_date_col], errors='coerce')
        data[update_date_col] = pd.to_datetime(data[update_date_col], errors='coerce')
        data['shortage_duration_days'] = (data[update_date_col] - data[initial_date_col]).dt.days
        data['shortage_duration_days'] = data['shortage_duration_days'].clip(lower=0)
    else:
        data['shortage_duration_days'] = np.nan
        
    return data


def compute_drug_shortage_frequency(df: pd.DataFrame, drug_col: str = 'standardized_drug_name') -> pd.DataFrame:
    """
    Computes historical shortage frequency count per standardized drug entity.
    """
    if drug_col not in df.columns:
        return df
        
    freq_map = df[drug_col].value_counts().to_dict()
    data = df.copy()
    data['historical_shortage_count'] = data[drug_col].map(freq_map)
    return data


def compute_reason_distribution(df: pd.DataFrame, reason_col: Optional[str] = None) -> pd.DataFrame:
    """
    Encodes primary reported shortage reasons if available in the schema.
    """
    data = df.copy()
    if reason_col is None:
        for col in ['reason_for_shortage', 'reason', 'cause']:
            if col in data.columns:
                reason_col = col
                break
                
    if reason_col and reason_col in data.columns:
        # Standardize reasons
        data['shortage_reason_cleaned'] = data[reason_col].astype(str).str.strip().str.title()
    return data
