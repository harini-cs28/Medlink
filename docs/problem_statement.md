# Problem Statement — MedPredict AI

## 1. Problem
Traditional healthcare inventory management systems are predominantly reactive. Healthcare providers and pharmacy distributors typically trigger procurement orders only after inventory reaches critically low levels or stockouts have already occurred. In critical therapeutic categories (such as antibiotics, analgesics, cardiovascular treatments, and emergency supplies), stockouts directly compromise patient care, delay interventions, and elevate operational costs.

## 2. Motivation
Supply chain disruptions, volatile clinical demand, manufacturing delays, and regulatory recalls frequently trigger medication shortages. By combining empirical pharmaceutical sales patterns with national shortage monitoring registries (e.g., FDA Drug Shortage notifications), data-driven systems can shift inventory operations from reactive replenishments to proactive, predictive optimization.

## 3. Objectives
1. **Empirical Demand Analysis**: Analyze historical pharmaceutical sales transactions to identify trends, seasonal variations, consumption velocity, and category-level demand dynamics.
2. **Shortage Pattern Recognition**: Mine FDA drug shortage registries to understand historical shortage frequencies, duration factors, therapeutic vulnerability, and manufacturing triggers.
3. **Forecasting & Classification**: Develop statistical and machine learning models for demand forecasting and shortage risk classification based purely on verifiable dataset features.
4. **Transparent Explainability**: Apply Explainable AI (XAI) techniques (e.g., SHAP) to expose the key drivers behind each risk prediction, ensuring clinical and supply chain decision-makers understand the rationale.
5. **Operational Projections**: Translate analytical predictions into actionable reorder guidelines without fabricating unrecorded parameters.

## 4. Scope
- Analysis of historical pharmaceutical sales records across product lines and therapeutic classes.
- Investigation of public FDA Drug Shortage registry records.
- Development of time-series forecasting models (baseline, autoregressive, and tree-based gradient boosting).
- Binary or multi-class shortage likelihood modeling based on empirical data features.
- Model evaluation with standard statistical and classification metrics.
- Visualizations and an interactive data science dashboard interface.

## 5. Research & Operational Gap
Most existing pharmacy inventory tools either rely on static safety stock rules (e.g., fixed min/max thresholds) or assume ideal replenishment conditions without incorporating macro-level supply disruptions. Furthermore, many predictive solutions operate as "black boxes" without interpretable feature attribution, limiting adoption by risk-averse medical administrators.

## 6. Expected Outcomes
- Robust, reproducible data pipelines from raw ingestion to model deployment.
- Accurate demand forecasts with quantifiable confidence and error intervals (RMSE, MAE, MAPE).
- Shortage classification metrics evaluated with Precision, Recall, F1-Score, and ROC-AUC.
- Transparent SHAP feature attribution reports for supply chain transparency.

## 7. Limitations & Ethical Guardrails
- **Data Reality Principle**: All models and analyses are constrained strictly by the attributes present in the real Kaggle Pharma Sales and FDA Drug Shortages datasets.
- **No Fabricated Data**: Unmeasured parameters (such as live hospital-specific shelf stock, unrecorded vendor lead times, or unverified batch expiry dates) are never hallucinated or hard-coded as fake ground truth.
- **Decision Support**: Predictions serve as decision-support insights for supply chain managers and clinicians, not autonomous clinical directives.
