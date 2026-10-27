"""
MedPredict AI - Model Visualizations Module
Renders regression forecast fit curves, residual diagnostics, and classification confusion matrices.
"""

from pathlib import Path
from typing import Optional, List
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd


def plot_actual_vs_predicted(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    dates: Optional[pd.Series] = None,
    title: str = "Actual vs. Predicted Pharmaceutical Demand",
    save_path: Optional[str | Path] = None
) -> None:
    """Plots actual versus forecasted demand time-series trajectory."""
    plt.figure(figsize=(12, 6))
    sns.set_theme(style="whitegrid")
    
    x_axis = dates if dates is not None else np.arange(len(y_true))
    
    plt.plot(x_axis, y_true, label="Actual Ground Truth Demand", color="#1f77b4", linewidth=2)
    plt.plot(x_axis, y_pred, label="Model Forecast", color="#ff7f0e", linestyle="--", linewidth=2)
    
    plt.title(title, fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Timeline", fontsize=11)
    plt.ylabel("Demand Units", fontsize=11)
    plt.legend(loc='upper right')
    plt.tight_layout()
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_confusion_matrix_heatmap(
    cm: List[List[int]],
    labels: List[str] = ["No Shortage", "Shortage Risk"],
    save_path: Optional[str | Path] = None
) -> None:
    """Renders annotated confusion matrix heatmap."""
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap="Blues", xticklabels=labels, yticklabels=labels)
    plt.title("Shortage Prediction Confusion Matrix", fontsize=12, fontweight='bold')
    plt.ylabel("Actual Condition")
    plt.xlabel("Predicted Condition")
    plt.tight_layout()
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
