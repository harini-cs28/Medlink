"""
MedPredict AI - Model Utilities Module
Provides time-series splits, artifact serialization, and evaluation helpers.
"""

from pathlib import Path
from typing import Tuple, Any, Dict
import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = PROJECT_ROOT / "models"


def time_series_train_test_split(
    df: pd.DataFrame,
    test_size: float = 0.2,
    date_col: str = 'date'
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Performs strictly chronological train/test split to prevent temporal data leakage.
    """
    if date_col in df.columns:
        sorted_df = df.sort_values(by=date_col).reset_index(drop=True)
    else:
        sorted_df = df.copy()
        
    split_idx = int(len(sorted_df) * (1 - test_size))
    train_df = sorted_df.iloc[:split_idx].copy()
    test_df = sorted_df.iloc[split_idx:].copy()
    
    print(f"[SPLIT] Chronological Split: Train={len(train_df)} rows, Test={len(test_df)} rows.")
    return train_df, test_df


def save_model_artifact(model: Any, filename: str, metadata: Optional[Dict[str, Any]] = None) -> Path:
    """
    Saves trained model artifact and optional metadata to models/ directory.
    """
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / filename
    joblib.dump(model, model_path)
    print(f"[INFO] Model artifact successfully saved to: {model_path}")
    
    if metadata:
        meta_path = MODELS_DIR / f"{Path(filename).stem}_metadata.json"
        import json
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=2)
            
    return model_path


def load_model_artifact(filename: str) -> Any:
    """
    Loads saved model artifact from models/ directory.
    """
    model_path = MODELS_DIR / filename
    if not model_path.exists():
        raise FileNotFoundError(f"[ERROR] Model file not found at: {model_path}")
    return joblib.load(model_path)
