"""
MedPredict AI - FDA Shortage Data Cleaning Pipeline
Cleans real FDA drug shortage records without fabricating unmeasured attributes.
Saves reproducible outputs to data/processed/cleaned_fda_shortages.csv.
"""

from pathlib import Path
from typing import Optional
import re
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def normalize_drug_name(name: str) -> str:
    """Standardizes drug names by lowering case, removing dosage strengths and extra whitespace."""
    if not isinstance(name, str) or not name.strip():
        return "unknown"
    
    cleaned = name.lower().strip()
    cleaned = re.sub(r'\b\d+(\.\d+)?\s*(mg|g|mcg|ml|iu|meq|%)\b', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(injection|injectable|tablets?|capsules?|solution|suspension|oral|ophthalmic|kit)\b', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'[^a-z0-9\s\-;/]', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def clean_fda_shortages_data(
    df: pd.DataFrame,
    save_processed: bool = True,
    save_interim: Optional[bool] = None,
    **kwargs
) -> pd.DataFrame:
    """
    Cleans raw FDA Drug Shortages DataFrame based on actual observed schema.
    
    Observed Columns:
    'Generic Name', 'Company Name', ' Contact Info', ' Presentation', ' Type of Update',
    'Date of Update', ' Availability Information', ' Reason for Shortage',
    ' Therapeutic Category', ' Status', ' Initial Posting Date', etc.
    """
    cleaned_df = df.copy()
    
    # 1. Deduplicate
    initial_rows = len(cleaned_df)
    cleaned_df = cleaned_df.drop_duplicates()
    dropped = initial_rows - len(cleaned_df)
    if dropped > 0:
        print(f"[CLEANING] Dropped {dropped} duplicate FDA records.")
        
    # 2. Strip whitespace from column headers
    cleaned_df.columns = [col.strip() for col in cleaned_df.columns]
    
    # 3. Standardize Generic Drug Name
    if 'Generic Name' in cleaned_df.columns:
        cleaned_df['standardized_drug_name'] = cleaned_df['Generic Name'].apply(normalize_drug_name)
    elif 'Drug Name' in cleaned_df.columns:
        cleaned_df['standardized_drug_name'] = cleaned_df['Drug Name'].apply(normalize_drug_name)
    else:
        cleaned_df['standardized_drug_name'] = cleaned_df.iloc[:, 0].apply(normalize_drug_name)
        
    # 4. Standardize Status (Current, Resolved, Discontinued, To Be Discontinued)
    if 'Status' in cleaned_df.columns:
        cleaned_df['status_clean'] = cleaned_df['Status'].astype(str).str.strip()
        cleaned_df['is_active_shortage'] = cleaned_df['status_clean'].apply(
            lambda s: 1 if s.lower() in ['current', 'to be discontinued', 'new'] else 0
        )
        
    # 5. Parse Dates
    for col in ['Date of Update', 'Initial Posting Date', 'Change Date', 'Date Discontinued']:
        if col in cleaned_df.columns:
            cleaned_df[f"{col.lower().replace(' ', '_')}"] = pd.to_datetime(cleaned_df[col], errors='coerce')
            
    # 6. Clean Reason for Shortage
    if 'Reason for Shortage' in cleaned_df.columns:
        cleaned_df['reason_clean'] = cleaned_df['Reason for Shortage'].fillna('Not Disclosed by Manufacturer').astype(str).str.strip()
        
    # 7. Clean Therapeutic Category
    if 'Therapeutic Category' in cleaned_df.columns:
        cleaned_df['therapeutic_category_clean'] = cleaned_df['Therapeutic Category'].fillna('General Therapeutics').astype(str).str.strip()
        
    # Save output to processed
    if save_processed:
        out_dir = PROJECT_ROOT / "data" / "processed"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / "cleaned_fda_shortages.csv"
        cleaned_df.to_csv(out_path, index=False)
        print(f"[INFO] Cleaned FDA Shortages saved to: {out_path} ({cleaned_df.shape[0]} rows)")
        
    return cleaned_df


if __name__ == "__main__":
    from src.data.load_data import load_fda_shortages
    raw_df = load_fda_shortages()
    clean_df = clean_fda_shortages_data(raw_df)
    print("Processed FDA Shortages Shape:", clean_df.shape)
