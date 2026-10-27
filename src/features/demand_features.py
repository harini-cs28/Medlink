"""
MedPredict AI - Demand Feature Engineering Module
Derives time-series features strictly from empirical pharmaceutical sales data.
Avoids fabricating unrecorded features.
"""

from typing import List, Optional
import numpy as np
import pandas as pd


def create_calendar_features(df: pd.DataFrame, date_col: str = 'date') -> pd.DataFrame:
    """
    Extracts calendar and seasonal features from a verified datetime column.
    """
    data = df.copy()
    if date_col not in data.columns:
        return data
        
    data[date_col] = pd.to_datetime(data[date_col])
    
    # Calendar properties
    data['day_of_week'] = data[date_col].dt.dayofweek
    data['day_of_month'] = data[date_col].dt.day
    data['month'] = data[date_col].dt.month
    data['quarter'] = data[date_col].dt.quarter
    data['year'] = data[date_col].dt.year
    data['is_weekend'] = data['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
    data['day_of_year'] = data[date_col].dt.dayofyear
    
    # Cyclical encodings (Day of Week & Month)
    data['sin_day_of_week'] = np.sin(2 * np.pi * data['day_of_week'] / 7)
    data['cos_day_of_week'] = np.cos(2 * np.pi * data['day_of_week'] / 7)
    data['sin_month'] = np.sin(2 * np.pi * data['month'] / 12)
    data['cos_month'] = np.cos(2 * np.pi * data['month'] / 12)
    
    return data


def create_lag_features(
    df: pd.DataFrame,
    target_cols: List[str],
    lags: List[int] = [1, 2, 3, 7, 14, 30]
) -> pd.DataFrame:
    """
    Creates temporal lag features for specified target demand series.
    """
    data = df.copy()
    for col in target_cols:
        if col in data.columns:
            for lag in lags:
                data[f"{col}_lag_{lag}"] = data[col].shift(lag)
    return data


def create_rolling_features(
    df: pd.DataFrame,
    target_cols: List[str],
    windows: List[int] = [7, 14, 30]
) -> pd.DataFrame:
    """
    Creates rolling moving averages, rolling volatility (std), min, and max features.
    """
    data = df.copy()
    for col in target_cols:
        if col in data.columns:
            for w in windows:
                # Rolling statistics (using shift(1) to avoid target leakage during forecasting)
                shifted_series = data[col].shift(1)
                data[f"{col}_rolling_mean_{w}d"] = shifted_series.rolling(window=w, min_periods=1).mean()
                data[f"{col}_rolling_std_{w}d"] = shifted_series.rolling(window=w, min_periods=1).std().fillna(0)
                data[f"{col}_rolling_max_{w}d"] = shifted_series.rolling(window=w, min_periods=1).max()
                data[f"{col}_rolling_min_{w}d"] = shifted_series.rolling(window=w, min_periods=1).min()
                
                # Exponential Moving Average
                data[f"{col}_ema_{w}d"] = shifted_series.ewm(span=w, adjust=False).mean()
    return data


def create_demand_momentum_features(
    df: pd.DataFrame,
    target_cols: List[str]
) -> pd.DataFrame:
    """
    Computes demand velocity and rate of change features.
    """
    data = df.copy()
    for col in target_cols:
        if col in data.columns:
            lag1 = data[col].shift(1)
            lag7 = data[col].shift(7)
            data[f"{col}_demand_diff_1d"] = lag1 - data[col].shift(2)
            data[f"{col}_demand_growth_7d"] = (lag1 - lag7) / (lag7 + 1e-5)
    return data
