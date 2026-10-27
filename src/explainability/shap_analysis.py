"""
MedPredict AI - Explainable AI (SHAP Analysis) Module
Provides model-agnostic and tree-based SHAP feature attribution.
Exposes why models make specific demand forecasts or shortage predictions.
"""

from pathlib import Path
from typing import Any, List, Optional
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import shap


PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


def compute_tree_shap_values(
    model: Any,
    X_sample: pd.DataFrame
) -> Tuple[shap.Explainer, np.ndarray]:
    """
    Computes SHAP values using TreeExplainer for tree-based estimators.
    """
    print(f"[XAI] Initializing SHAP TreeExplainer for {len(X_sample)} instances...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_sample)
    return explainer, shap_values


def plot_shap_summary(
    shap_values: np.ndarray,
    X_sample: pd.DataFrame,
    save_path: Optional[str | Path] = None,
    plot_type: str = "dot",
    max_display: int = 15
) -> None:
    """
    Generates and optionally saves SHAP summary feature importance plot.
    """
    plt.figure(figsize=(10, 6))
    shap.summary_plot(
        shap_values,
        X_sample,
        plot_type=plot_type,
        max_display=max_display,
        show=False
    )
    plt.tight_layout()
    
    if save_path:
        out_path = Path(save_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(out_path, dpi=300, bbox_inches='tight')
        print(f"[XAI] SHAP summary plot saved to: {out_path}")
        
    plt.close()


def get_top_feature_contributions(
    shap_values: np.ndarray,
    X_sample: pd.DataFrame,
    instance_idx: int = 0,
    top_k: int = 5
) -> pd.DataFrame:
    """
    Extracts top positive and negative contributing features for a single sample instance.
    """
    feature_names = X_sample.columns
    if isinstance(shap_values, list): # Multi-class
        instance_shap = shap_values[1][instance_idx]
    elif len(shap_values.shape) == 3: # 3D array
        instance_shap = shap_values[instance_idx, :, 1]
    else:
        instance_shap = shap_values[instance_idx]
        
    instance_values = X_sample.iloc[instance_idx].values
    
    df = pd.DataFrame({
        "Feature": feature_names,
        "Value": instance_values,
        "SHAP_Attribution": instance_shap,
        "Absolute_Impact": np.abs(instance_shap)
    }).sort_values(by="Absolute_Impact", ascending=False).head(top_k)
    
    return df.reset_index(drop=True)
