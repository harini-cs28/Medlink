"""
MedPredict AI - Shortage Risk Prediction Model Module
Implements classification models to predict shortage risk from integrated and engineered features.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import xgboost as xgb
import lightgbm as lgb

from src.models.model_utils import save_model_artifact


class ShortageRiskClassifier:
    """
    Classification model for estimating shortage risk probability.
    """
    def __init__(self, model_type: str = "random_forest", **model_kwargs):
        self.model_type = model_type.lower()
        self.model_kwargs = model_kwargs
        self.model = self._initialize_model()
        self.feature_names: List[str] = []
        
    def _initialize_model(self):
        if self.model_type == "random_forest":
            return RandomForestClassifier(
                n_estimators=100,
                max_depth=6,
                class_weight='balanced',
                random_state=42,
                **self.model_kwargs
            )
        elif self.model_type == "lightgbm":
            return lgb.LGBMClassifier(
                n_estimators=100,
                learning_rate=0.05,
                class_weight='balanced',
                random_state=42,
                **self.model_kwargs
            )
        elif self.model_type == "xgboost":
            return xgb.XGBClassifier(
                n_estimators=100,
                learning_rate=0.05,
                random_state=42,
                **self.model_kwargs
            )
        elif self.model_type == "logistic_regression":
            return LogisticRegression(class_weight='balanced', max_iter=500, random_state=42, **self.model_kwargs)
        else:
            raise ValueError(f"Unsupported model_type: {self.model_type}")
            
    def fit(self, X_train: pd.DataFrame, y_train: pd.Series):
        """Fits classification model."""
        self.feature_names = list(X_train.columns)
        print(f"[MODEL] Training {self.model_type.upper()} classifier on {len(X_train)} samples across {len(self.feature_names)} features...")
        self.model.fit(X_train, y_train)
        return self
        
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predicts binary shortage risk class."""
        return self.model.predict(X[self.feature_names])
        
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Predicts shortage probability score."""
        return self.model.predict_proba(X[self.feature_names])[:, 1]
        
    def save(self, filename: str):
        """Serializes trained classifier."""
        meta = {
            "model_type": self.model_type,
            "features": self.feature_names
        }
        return save_model_artifact(self.model, filename, meta)
