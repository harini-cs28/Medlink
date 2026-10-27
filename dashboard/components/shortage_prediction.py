"""
MedPredict AI - Shortage Risk Prediction Component
"""

import streamlit as st
import pandas as pd


def render_shortage_prediction():
    st.title("🚨 Shortage Risk Prediction & XAI Attribution")
    st.markdown("Machine learning classification of pharmaceutical shortage vulnerability.")
    st.info("Shortage predictions are calculated by `src/models/shortage_prediction.py` and explained via SHAP.")
