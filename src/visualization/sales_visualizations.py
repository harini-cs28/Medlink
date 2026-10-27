"""
MedPredict AI - Pharma Sales Visualizations Module
Creates scientific EDA plots for pharmaceutical sales demand distributions and time-series trends.
"""

from pathlib import Path
from typing import List, Optional
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd


def plot_sales_time_series(
    df: pd.DataFrame,
    date_col: str = 'date',
    value_cols: Optional[List[str]] = None,
    title: str = "Pharmaceutical Sales Demand Over Time",
    save_path: Optional[str | Path] = None
) -> None:
    """Plots multi-product or category sales volume over time."""
    plt.figure(figsize=(12, 6))
    sns.set_theme(style="whitegrid")
    
    if value_cols is None:
        value_cols = df.select_dtypes(include=['number']).columns.tolist()
        
    for col in value_cols:
        plt.plot(df[date_col], df[col], label=col, alpha=0.85, linewidth=1.5)
        
    plt.title(title, fontsize=14, fontweight='bold', pad=12)
    plt.xlabel("Timeline Date", fontsize=11)
    plt.ylabel("Sales Volume (Units)", fontsize=11)
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_demand_distributions(
    df: pd.DataFrame,
    value_cols: Optional[List[str]] = None,
    save_path: Optional[str | Path] = None
) -> None:
    """Generates boxplots showing consumption spread and outlier densities."""
    if value_cols is None:
        value_cols = df.select_dtypes(include=['number']).columns.tolist()
        
    plt.figure(figsize=(12, 6))
    sns.boxplot(data=df[value_cols], palette="Set2")
    plt.title("Distribution of Pharmaceutical Sales Volumes Across Categories", fontsize=13, fontweight='bold')
    plt.xticks(rotation=45, ha='right')
    plt.ylabel("Sales Volume")
    plt.tight_layout()
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
