import numpy as np
import pandas as pd
from sklearn.metrics import (
    classification_report, confusion_matrix,
    precision_score, recall_score, f1_score,
    roc_auc_score, log_loss
)
from sklearn.preprocessing import LabelEncoder


def evaluate_the_best_model(
        cv_results: dict,
        best_model_name: str,
        y_encoded: np.ndarray,
        le_target: LabelEncoder
) -> dict:
    """
    Generate detailed evaluation metrics for the best model from cross-validation results.

    Args:
        cv_results (dict): Dictionary from train_ensemble_models() containing OOF predictions/probabilities.
        best_model_name (str): Name of the best-performing model.
        y_encoded (np.ndarray): True encoded target values.
        le_target (LabelEncoder): Fitted label encoder to decode target classes.

    Returns:
        dict: Dictionary with summary metrics (accuracy, macro recall, F1, ROC-AUC, log loss, etc.)
    """

    best_oof_pred = cv_results[best_model_name]['oof_pred']
    best_oof_proba = cv_results[best_model_name]['oof_proba']

    # Confusion matrix
    cm = confusion_matrix(y_encoded, best_oof_pred)

    # Per-class metrics
    macro_prec = precision_score(y_encoded, best_oof_pred, average='macro')
    macro_rec = recall_score(y_encoded, best_oof_pred, average='macro')
    macro_f1 = f1_score(y_encoded, best_oof_pred, average='macro')
    if best_oof_proba.shape[1] == 2:
        # Binary classification
        macro_auc = roc_auc_score(y_encoded, best_oof_proba[:, 1])
    else:
        # Multi-class classification
        macro_auc = roc_auc_score(y_encoded, best_oof_proba, multi_class='ovr', average='macro')
    loss = log_loss(y_encoded, best_oof_proba)

    # Planet detection metrics (CONFIRMED + CANDIDATE combined)
    # Handle both binary and multi-class cases
    class_names = list(le_target.classes_)

    if "CANDIDATE" in class_names:
        idx_conf = class_names.index("CONFIRMED")
        idx_cand = class_names.index("CANDIDATE")
        planet_true = np.isin(y_encoded, [idx_conf, idx_cand])
        planet_pred = np.isin(best_oof_pred, [idx_conf, idx_cand])
    else:
        # Binary case: only CONFIRMED and FALSE POSITIVE
        idx_conf = class_names.index("CONFIRMED")
        planet_true = (y_encoded == idx_conf)
        planet_pred = (best_oof_pred == idx_conf)

    planet_recall = np.sum(planet_true & planet_pred) / np.sum(planet_true)
    planet_precision = (
        np.sum(planet_true & planet_pred) / np.sum(planet_pred)
        if np.sum(planet_pred) > 0 else 0
    )

    print("\n" + "=" * 60)
    print(f"DETAILED METRICS FOR {best_model_name}")
    print("=" * 60)

    print("\nClassification Report:")
    print(classification_report(y_encoded, best_oof_pred, target_names=list(le_target.classes_)))

    print("\nConfusion Matrix:")
    print(pd.DataFrame(cm, index=le_target.classes_, columns=le_target.classes_))
    print(f"Order: {', '.join(le_target.classes_)}")

    print("\nPer-Class Recall (Critical for Exoplanet Detection):")
    for i, class_name in enumerate(le_target.classes_):
        class_recall = cm[i, i] / cm[i, :].sum()
        print(f"  {class_name:15s}: {class_recall:.4f} ({cm[i, i]}/{cm[i, :].sum()} detected)")

    print("\nMacro Metrics (Equal Weight to All Classes):")
    print(f"  Precision: {macro_prec:.4f}")
    print(f"  Recall:    {macro_rec:.4f}")
    print(f"  F1:        {macro_f1:.4f}")
    print(f"\nMacro ROC-AUC: {macro_auc:.4f}")
    print(f"Log Loss: {loss:.4f}")

    print("\n" + "=" * 60)
    print("PLANET DETECTION (CONFIRMED + CANDIDATE)")
    print("=" * 60)
    print(f"  Recall:    {planet_recall:.4f}  ← Don't miss real planets")
    print(f"  Precision: {planet_precision:.4f}  ← Minimize false alarms")
    print("=" * 60)

    return {
        "macro_precision": macro_prec,
        "macro_recall": macro_rec,
        "macro_f1": macro_f1,
        "macro_auc": macro_auc,
        "log_loss": loss,
        "planet_recall": planet_recall,
        "planet_precision": planet_precision
    }
