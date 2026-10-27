"""
MedPredict AI - Main Dashboard Application
Streamlit multi-page interface connecting models, explainability, and real-time inventory diagnostics.
"""

import streamlit as st
from dashboard.components.sidebar import render_sidebar
from dashboard.components.dashboard import render_dashboard
from dashboard.components.inventory import render_inventory
from dashboard.components.shortage_prediction import render_shortage_prediction
from dashboard.components.expiry_risk import render_expiry_risk
from dashboard.components.demand_analysis import render_demand_analysis
from dashboard.components.recommendations import render_recommendations
from dashboard.components.reports import render_reports

# Page Configuration
st.set_page_config(
    page_title="MedPredict AI — Intelligent Medicine Inventory Optimization",
    page_icon="💊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Render Sidebar Navigation
active_view = render_sidebar()

# Route to Active Component
if active_view == "Executive Dashboard":
    render_dashboard()
elif active_view == "Inventory Telemetry":
    render_inventory()
elif active_view == "Shortage Risk Prediction":
    render_shortage_prediction()
elif active_view == "Expiry & Quarantines":
    render_expiry_risk()
elif active_view == "Demand Time-Series Analysis":
    render_demand_analysis()
elif active_view == "Smart Recommendations":
    render_recommendations()
elif active_view == "Scientific Evaluation Reports":
    render_reports()
