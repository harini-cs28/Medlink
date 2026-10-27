"""
Unit tests for feature engineering pipelines.
"""

import pandas as pd
import numpy as np
from src.features.demand_features import create_calendar_features, create_lag_features, create_rolling_features


def test_calendar_features():
    df = pd.DataFrame({'date': pd.date_range(start='2023-01-01', periods=10, freq='D')})
    res = create_calendar_features(df, date_col='date')
    assert 'day_of_week' in res.columns
    assert 'is_weekend' in res.columns
    assert 'month' in res.columns


def test_lag_and_rolling_features():
    df = pd.DataFrame({
        'date': pd.date_range(start='2023-01-01', periods=35, freq='D'),
        'demand': np.arange(35, dtype=float)
    })
    lagged = create_lag_features(df, target_cols=['demand'], lags=[1, 7])
    assert 'demand_lag_1' in lagged.columns
    assert 'demand_lag_7' in lagged.columns
    
    rolled = create_rolling_features(df, target_cols=['demand'], windows=[7])
    assert 'demand_rolling_mean_7d' in rolled.columns
