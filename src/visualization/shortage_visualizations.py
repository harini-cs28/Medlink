"""
MedPredict AI - Shortage Visualizations Module
Creates visual analytics for FDA shortage frequencies, duration, and root cause distributions.
"""

from pathlib import Path
from typing import Optional
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd


def plot_top_shorted_drugs(
    df: pd.DataFrame,
    drug_col: str = 'standardized_drug_name',
    top_n: int = 15,
    save_path: Optional[str | Path] = None
) -> None:
    """Plots bar chart of the most frequently shorted medications."""
    if drug_col not in df.columns:
        return
        
    top_drugs = df[drug_col].value_counts().head(top_n)
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x=top_drugs.values, y=top_drugs.index, palette="mako")
    plt.title(f"Top {top_n} Most Frequently Reported Drug Shortages (FDA)", fontsize=13, fontweight='bold')
    plt.xlabel("Number of Shortage Incidents", fontsize=11)
    plt.ylabel("Drug Name", fontsize=11)
    plt.tight_layout()
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()


def plot_shortage_status_breakdown(
    df: pd.DataFrame,
    status_col: str = 'status',
    save_path: Optional[str | Path] = None
) -> None:
    """Plots donut chart of shortage statuses (Current, Resolved, Discontinued)."""
    if status_col not in df.columns:
        return
        
    counts = df[status_col].value_counts()
    
    plt.figure(figsize=(7, 7))
    plt.pie(counts.values, labels=counts.index, autopct='%1.1f%%', startangle=140, colors=sns.color_palette("pastel"))
    plt.title("Proportion of Drug Shortage Statuses", fontsize=13, fontweight='bold')
    plt.tight_layout()
    
    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
    plt.close()
