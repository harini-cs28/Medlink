"""
Unit tests for data loading modules.
"""

import pytest
import pandas as pd
from src.data.load_data import load_all_raw_data, load_pharma_sales, load_fda_shortages


def test_load_all_raw_data_returns_tuple():
    res = load_all_raw_data()
    assert isinstance(res, tuple)
    assert len(res) == 2


def test_missing_files_handled_gracefully():
    # Calling with non-existent path raises FileNotFoundError
    with pytest.raises(FileNotFoundError):
        load_pharma_sales(filepath="non_existent_file.csv")
