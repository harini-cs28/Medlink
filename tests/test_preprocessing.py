"""
Unit tests for data cleaning and preprocessing pipelines.
"""

import pandas as pd
import numpy as np
from src.data.clean_sales import clean_pharma_sales_data
from src.data.clean_shortages import clean_fda_shortages_data, normalize_drug_name


def test_normalize_drug_name():
    assert normalize_drug_name("Amoxicillin 500mg Oral Tablets") == "amoxicillin"
    assert normalize_drug_name("Ibuprofen 400 mg Capsule") == "ibuprofen"
    assert normalize_drug_name("Paracetamol") == "paracetamol"
    assert normalize_drug_name("") == "unknown"


def test_clean_pharma_sales_basic():
    df = pd.DataFrame({
        'Date': ['2023-01-01', '2023-01-02', '2023-01-02'], # dupe
        'M01AB': [10.5, np.nan, 12.0],
        'N02BE': [-5, 20.0, 20.0]
    })
    
    cleaned = clean_pharma_sales_data(df, save_interim=False)
    assert len(cleaned) == 2 # dupe dropped
    assert cleaned['M01AB'].isna().sum() == 0 # imputed
    assert (cleaned['N02BE'] >= 0).all() # clipped lower bound
