"""
Unit tests for models and evaluation metrics.
"""

import numpy as np
import pandas as pd
from src.evaluation.forecasting_metrics import evaluate_forecast
from src.evaluation.classification_metrics import evaluate_classification


def test_forecast_evaluation():
    y_true = np.array([10.0, 20.0, 30.0, 40.0])
    y_pred = np.array([12.0, 18.0, 31.0, 39.0])
    
    metrics = evaluate_forecast(y_true, y_pred)
    assert "MAE" in metrics
    assert "RMSE" in metrics
    assert "R2_Score" in metrics
    assert metrics["MAE"] > 0


def test_classification_evaluation():
    y_true = np.array([1, 0, 1, 1, 0])
    y_pred = np.array([1, 0, 1, 0, 0])
    
    metrics = evaluate_classification(y_true, y_pred)
    assert "Accuracy" in metrics
    assert "Precision" in metrics
    assert "Recall" in metrics
    assert "F1_Score" in metrics
    assert metrics["Accuracy"] == 0.8
