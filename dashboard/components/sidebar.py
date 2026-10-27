"""
MedPredict AI - Dashboard Sidebar Component
Provides modular navigation and dataset connection status.
"""

import streamlit as st
from pathlib import Path


def render_sidebar():
    """Renders the navigation sidebar and dataset health monitors."""
    with st.sidebar:
        st.markdown("### 💊 MedPredict AI")
        st.caption("Intelligent Medicine Inventory Optimization")
        st.divider()
        
        # Navigation
        menu_options = [
            "Executive Dashboard",
            "Inventory Telemetry",
            "Shortage Risk Prediction",
            "Expiry & Quarantines",
            "Demand Time-Series Analysis",
            "Smart Recommendations",
            "Scientific Evaluation Reports"
        ]
        
        selected_view = st.radio("Navigation Module", menu_options, index=0)
        
        st.divider()
        
        # Real Dataset Status Indicators
        st.markdown("##### 📁 Data Source Status")
        
        root = Path(__file__).resolve().parent.parent.parent
        pharma_file = root / "data" / "raw" / "pharma_sales" / "pharma_sales.csv"
        fda_file = root / "data" / "raw" / "fda_shortages" / "fda_drug_shortages.csv"
        
        if pharma_file.exists():
            st.success("🟢 Pharma Sales: Connected")
        else:
            st.info("⚪ Pharma Sales: Pending CSV")
            
        if fda_file.exists():
            st.success("🟢 FDA Shortages: Connected")
        else:
            st.info("⚪ FDA Shortages: Pending CSV")
            
        st.caption("MedPredict AI Engine v2.0 • Data Science Edition")
        
    return selected_view
