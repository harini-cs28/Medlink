"""
MedPredict AI - Model Comparison Module
Generates side-by-side performance benchmarking tables and summary reports across candidate algorithms.
"""

from typing import Dict, List, Any
import pandas as pd


def compare_forecasting_models(results_dict: Dict[str, Dict[str, float]]) -> pd.DataFrame:
    """
    Transforms a dictionary of forecasting metrics into a comparison DataFrame.
    
    Args:
        results_dict: e.g. {"LightGBM": {"MAE": 2.1, ...}, "RandomForest": {"MAE": 2.4, ...}}
    """
    df = pd.DataFrame(results_dict).T
    df = df.sort_values(by="RMSE", ascending=True)
    return df


def compare_classification_models(results_dict: Dict[str, Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms a dictionary of classification metrics into a comparison DataFrame.
    """
    cleaned = {}
    for model, metrics in results_dict.items():
        row = {k: v for k, v in metrics.items() if k != "Confusion_Matrix"}
        cleaned[model] = row
    df = pd.DataFrame(cleaned).T
    if "F1_Score" in df.columns:
        df = df.sort_values(by="F1_Score", ascending=False)
    return df
