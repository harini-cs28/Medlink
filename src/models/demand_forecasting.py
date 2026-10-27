"""
MedPredict AI - Demand Forecasting Model Module
Implements statistical baselines and gradient boosted tree models for pharmaceutical demand forecasting.
"""

from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
import xgboost as xgb
import lightgbm as lgb

from src.models.model_utils import save_model_artifact


class DemandForecaster:
    """
    Modular demand forecasting model wrapper supporting baseline, tree-based, and ensemble algorithms.
    """
    def __init__(self, model_type: str = "lightgbm", **model_kwargs):
        self.model_type = model_type.lower()
        self.model_kwargs = model_kwargs
        self.model = self._initialize_model()
        self.feature_names: List[str] = []
        self.target_name: str = ""
        
    def _initialize_model(self):
        if self.model_type == "lightgbm":
            return lgb.LGBMRegressor(
                n_estimators=150,
                learning_rate=0.05,
                random_state=42,
                **self.model_kwargs
            )
        elif self.model_type == "xgboost":
            return xgb.XGBRegressor(
                n_estimators=150,
                learning_rate=0.05,
                random_state=42,
                **self.model_kwargs
            )
        elif self.model_type == "random_forest":
            return RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                **self.model_kwargs
            )
        elif self.model_type == "ridge":
            return Ridge(alpha=1.0, **self.model_kwargs)
        else:
            raise ValueError(f"Unsupported model_type: {self.model_type}")
            
    def fit(self, X_train: pd.DataFrame, y_train: pd.Series, target_name: str = "demand"):
        """Trains the forecasting model on training feature matrix."""
        self.feature_names = list(X_train.columns)
        self.target_name = target_name
        print(f"[MODEL] Training {self.model_type.upper()} on {len(X_train)} samples across {len(self.feature_names)} features...")
        self.model.fit(X_train, y_train)
        return self
        
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Generates point forecasts with non-negative lower bounds."""
        raw_preds = self.model.predict(X[self.feature_names])
        # Demand volume cannot be negative
        return np.clip(raw_preds, a_min=0, a_max=None)
        
    def save(self, filename: str):
        """Serializes trained model to disk."""
        meta = {
            "model_type": self.model_type,
            "target_name": self.target_name,
            "features": self.feature_names
        }
        return save_model_artifact(self.model, filename, meta)
