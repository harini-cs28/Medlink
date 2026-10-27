# Methodology — MedPredict AI

MedPredict AI executes an end-to-end Data Science lifecycle strictly anchored on verifiable datasets:

```
[Raw Data Collection]
        │
[Data Understanding & Schema Verification]
        │
[Data Cleaning & Missing Value Treatment]
        │
[Exploratory Data Analysis (EDA)]
        │
[Feature Engineering & Lag Construction]
        │
[Dataset Integration & Matching Analysis]
        │
[Model Training & Baselines]
        │
[Evaluation & Hyperparameter Optimization]
        │
[Explainable AI (SHAP)]
        │
[Dashboard & Production Reporting]
```

---

## 1. Data Cleaning Protocol
- **Missing Value Handling**: Forward-fill for continuous time series where appropriate, median imputation for skewed numerical attributes, or explicit `Unknown` categorizations.
- **Date Standardization**: Conversion of date formats to `pd.to_datetime` (ISO-8601 `YYYY-MM-DD`).
- **Text Normalization**: Lowercase normalization, whitespace stripping, and regex-based removal of special dosage symbols for pharmaceutical matching.

---

## 2. Feature Engineering Protocol
- **Temporal Features**: Day of week, day of month, month, quarter, week of year, cyclical sine/cosine encodings.
- **Lag & Rolling Windows**: $t-1, t-7, t-14, t-30$ sales lags; 7-day, 14-day, and 30-day moving averages, rolling volatility (standard deviation), and exponential moving averages (EMA).
- **Shortage Indicators**: Aggregated historical shortage incidence by therapeutic class or standardized drug entity.

---

## 3. Machine Learning Modeling
- **Demand Forecasting**:
  - Statistical Baselines: Naive / Historical Average, Exponential Smoothing (Holt-Winters), ARIMA / SARIMAX.
  - Machine Learning Regressors: Ridge/Lasso Regression, Random Forest Regressor, LightGBM / XGBoost Regressor.
  - Evaluation: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), Mean Absolute Percentage Error (MAPE), $R^2$.
- **Shortage Risk Prediction**:
  - Classifiers: Logistic Regression, Random Forest Classifier, LightGBM / XGBoost Classifier.
  - Evaluation: Precision, Recall, F1-Score, ROC-AUC, Precision-Recall AUC, Confusion Matrix.

---

## 4. Explainable AI (XAI)
- Compute **SHAP (SHapley Additive exPlanations)** values using `TreeExplainer` or `KernelExplainer`.
- Generate Summary Plots, Feature Importance rankings, and individual Waterfall plots to explain predictions to inventory managers.
