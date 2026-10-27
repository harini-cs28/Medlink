"""
MedPredict AI - Classification Evaluation Metrics Module
Computes precision, recall, F1, ROC-AUC, and confusion matrices for shortage prediction.
"""

from typing import Dict, Any, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)


def evaluate_classification(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_proba: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """
    Computes comprehensive classification metrics.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    
    cm = confusion_matrix(y_true, y_pred).tolist()
    
    metrics = {
        "Accuracy": round(acc, 4),
        "Precision": round(prec, 4),
        "Recall": round(rec, 4),
        "F1_Score": round(f1, 4),
        "Confusion_Matrix": cm
    }
    
    if y_proba is not None:
        try:
            auc = float(roc_auc_score(y_true, y_proba))
            metrics["ROC_AUC"] = round(auc, 4)
        except Exception:
            metrics["ROC_AUC"] = None
            
    return metrics
