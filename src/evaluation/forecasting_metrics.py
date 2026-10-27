"""
MedPredict AI - Forecasting Evaluation Metrics Module
Computes standard regression and time-series forecasting performance metrics.
"""

from typing import Dict
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray, epsilon: float = 1e-5) -> float:
    """Computes MAPE while safely handling zero values."""
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    denominator = np.where(y_true == 0, epsilon, y_true)
    return float(np.mean(np.abs((y_true - y_pred) / denominator)) * 100)


def evaluate_forecast(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes standard forecasting evaluation metrics.
    
    Returns:
        Dict: MAE, RMSE, MAPE, R2, and WAPE.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    mae = float(mean_absolute_error(y_true, y_pred))
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_true, y_pred))
    mape = mean_absolute_percentage_error(y_true, y_pred)
    
    # Weighted Absolute Percentage Error (WAPE)
    sum_actual = np.sum(np.abs(y_true))
    wape = float((np.sum(np.abs(y_true - y_pred)) / sum_actual * 100)) if sum_actual > 0 else 0.0
    
    return {
        "MAE": round(mae, 4),
        "RMSE": round(rmse, 4),
        "MAPE_percent": round(mape, 2),
        "WAPE_percent": round(wape, 2),
        "R2_Score": round(r2, 4)
    }


def print_forecast_metrics(metrics: Dict[str, float], model_name: str = "Model") -> None:
    """Prints formatted metrics table."""
    print(f"--- Forecasting Performance: {model_name} ---")
    for k, v in metrics.items():
        print(f"  {k:<15}: {v}")
    print("---------------------------------------------")
