"""
MedPredict AI - Expiry Risk Model Training Script
Trains Expiry Risk Classification Model and exports artifacts.
"""

from pathlib import Path
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

ML_DIR = Path(__file__).resolve().parent.parent
OUTPUT_MODEL_DIR = ML_DIR / "outputs" / "models"
BACKEND_MODEL_DIR = ML_DIR.parent / "backend" / "app" / "ml" / "expiry_model"


def train_expiry():
    print("[Training] Initiating expiry risk prediction model training pipeline...")
    OUTPUT_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    BACKEND_MODEL_DIR.mkdir(parents=True, exist_ok=True)

    np.random.seed(42)
    n_samples = 1500

    # Features: [current_stock, average_daily_demand, days_to_expiry, remaining_shelf_life, demand_trend, medicine_criticality_encoded]
    current_stock = np.random.uniform(10, 500, n_samples)
    avg_demand = np.random.uniform(0.5, 30, n_samples)
    days_to_expiry = np.random.choice([15, 30, 45, 60, 90, 180, 365], n_samples)
    remaining_shelf_life = days_to_expiry / 365.0
    demand_trend = np.random.normal(0, 1, n_samples)
    crit = np.random.choice([1.0, 2.0, 3.0, 4.0], n_samples)

    expected_demand = avg_demand * days_to_expiry
    y = (current_stock > expected_demand * 1.3).astype(int)

    X = np.column_stack([
        current_stock,
        avg_demand,
        days_to_expiry,
        remaining_shelf_life,
        demand_trend,
        crit
    ])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_prob)

    print(f"[Training] Expiry model trained. Test ROC-AUC: {auc:.4f}")
    print(classification_report(y_test, y_pred))

    joblib.dump(model, OUTPUT_MODEL_DIR / "expiry_rf_model.pkl")
    joblib.dump(model, BACKEND_MODEL_DIR / "model.pkl")
    print(f"[Training] Expiry model saved to {OUTPUT_MODEL_DIR} and {BACKEND_MODEL_DIR}")


if __name__ == "__main__":
    train_expiry()
