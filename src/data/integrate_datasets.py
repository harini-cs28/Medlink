"""
MedPredict AI - Dataset Integration Module
Integrates cleaned Pharma Sales and FDA Drug Shortages datasets based on legitimate matching criteria.
Evaluates ATC therapeutic class mappings (e.g. Paracetamol -> N02BE, Ibuprofen -> M01AE) and exports integrated_data.csv.
"""

from pathlib import Path
from typing import Dict, Any
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Standard WHO ATC Classification Mapping for Pharmaceutical Sales Categories
ATC_CLASS_MAPPING = {
    'M01AB': {'name': 'Anti-inflammatory (Acetic)', 'keywords': ['diclofenac', 'aceclofenac', 'indomethacin', 'ketorolac']},
    'M01AE': {'name': 'Anti-inflammatory (Propionic)', 'keywords': ['ibuprofen', 'naproxen', 'ketoprofen', 'flurbiprofen']},
    'N02BA': {'name': 'Analgesics (Salicylic)', 'keywords': ['aspirin', 'acetylsalicylic']},
    'N02BE': {'name': 'Analgesics (Anilides)', 'keywords': ['paracetamol', 'acetaminophen']},
    'N05B':  {'name': 'Anxiolytics', 'keywords': ['diazepam', 'lorazepam', 'alprazolam', 'clonazepam']},
    'N05C':  {'name': 'Hypnotics / Sedatives', 'keywords': ['zolpidem', 'zopiclone', 'temazepam']},
    'R03':   {'name': 'Airway / Asthma', 'keywords': ['albuterol', 'salbutamol', 'budesonide', 'fluticasone', 'ipratropium']},
    'R06':   {'name': 'Antihistamines', 'keywords': ['cetirizine', 'loratadine', 'fexofenadine', 'diphenhydramine']}
}


def integrate_pharma_and_shortages(save_processed: bool = True) -> pd.DataFrame:
    """
    Constructs the integrated analytical matrix linking Pharma Sales time-series with FDA shortages incidence.
    """
    sales_path = PROJECT_ROOT / "data" / "processed" / "cleaned_pharma_sales.csv"
    shortages_path = PROJECT_ROOT / "data" / "processed" / "cleaned_fda_shortages.csv"
    
    if not sales_path.exists() or not shortages_path.exists():
        raise FileNotFoundError("Cleaned processed datasets not found. Run clean_sales.py and clean_shortages.py first.")
        
    sales_df = pd.read_csv(sales_path)
    shortages_df = pd.read_csv(shortages_path)
    
    # Calculate active shortages per ATC class
    shortage_drugs = shortages_df['standardized_drug_name'].dropna().str.lower().tolist()
    
    atc_shortage_flags = {}
    for atc, meta in ATC_CLASS_MAPPING.items():
        matched_count = sum(
            1 for d in shortage_drugs if any(kw in d for kw in meta['keywords'])
        )
        atc_shortage_flags[f"{atc}_national_shortage_count"] = matched_count
        atc_shortage_flags[f"{atc}_has_active_shortage"] = 1 if matched_count > 0 else 0
        
    integrated_df = sales_df.copy()
    for col, val in atc_shortage_flags.items():
        integrated_df[col] = val
        
    if save_processed:
        out_path = PROJECT_ROOT / "data" / "processed" / "integrated_data.csv"
        integrated_df.to_csv(out_path, index=False)
        print(f"[INFO] Integrated dataset saved to: {out_path} ({integrated_df.shape[0]} rows, {integrated_df.shape[1]} cols)")
        
    return integrated_df


if __name__ == "__main__":
    integrate_pharma_and_shortages()
