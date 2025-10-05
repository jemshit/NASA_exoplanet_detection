import pickle
import time
import warnings
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, precision_score, f1_score, recall_score
)
from sklearn.model_selection import StratifiedGroupKFold


def train_stacking_ensemble(
        X_scaled: pd.DataFrame,
        y_encoded: np.ndarray,
        groups: np.ndarray,
        cv: StratifiedGroupKFold,
        le_target,
        cv_results: Dict[str, Dict],
        best_model_name: str,
        models: Dict[str, object],
        save_path: str = None
) -> Tuple[Dict, StackingClassifier]:
    """
    Train a stacking ensemble using base models and a Logistic Regression meta-learner.

    Steps
    -----
    1. Build a StackingClassifier from existing trained models.
    2. Perform group-aware CV to collect OOF predictions.
    3. Compute metrics (accuracy, precision, recall, F1).
    4. Compare with best individual model.
    5. Fit final stacking model on the full dataset and save.

    Args:
        X_scaled (pd.DataFrame): Scaled feature matrix.
        y_encoded (np.ndarray): Encoded target labels.
        groups (np.ndarray): Group identifiers (kepid).
        cv (StratifiedGroupKFold): Group-aware cross-validator.
        le_target: LabelEncoder for target names.
        cv_results (Dict): CV results from previous ensemble step.
        best_model_name (str): Name of the best individual model.
        models (Dict): Dictionary of trained base learners.
        save_path (str, optional): Path to save the stacking model pickle.

    Returns:
        Tuple[Dict, StackingClassifier]:
            - stacking_results: metrics dictionary for the stacking ensemble.
            - stacking_clf: trained stacking classifier fitted on full dataset.
    """

    print("\n" + "=" * 60)
    print("STACKING ENSEMBLE WITH GROUP-AWARE CV")
    print("=" * 60)

    # --- 1. Define Stacking Classifier ---
    stacking_clf = StackingClassifier(
        estimators=[
            ("xgb", models["XGBoost"]),
            ("lgb", models["LightGBM"]),
            ("cat", models["CatBoost"]),
            ("rf", models["RandomForest"])
        ],
        final_estimator=LogisticRegression(max_iter=1000, random_state=42),
        cv=3,  # internal CV for meta-features
        stack_method="predict_proba",
        n_jobs=-1,
        passthrough=False
    )

    # --- 2. Manual Group-Aware CV Loop ---
    print("\nTraining stacking ensemble with StratifiedGroupKFold...")
    start = time.time()

    n_classes = len(np.unique(y_encoded))
    stacking_oof_pred = np.empty(len(y_encoded), dtype=int)
    stacking_oof_proba = np.zeros((len(y_encoded), n_classes))
    fold_metrics = {"acc": [], "prec": [], "rec": [], "f1": [], "train_acc": []}

    for fold, (train_idx, val_idx) in enumerate(cv.split(X_scaled, y_encoded, groups=groups), 1):
        warnings.filterwarnings("ignore", category=RuntimeWarning)

        stacking_fold = clone(stacking_clf)
        X_train, X_val = X_scaled.iloc[train_idx], X_scaled.iloc[val_idx]
        y_train, y_val = y_encoded[train_idx], y_encoded[val_idx]

        stacking_fold.fit(X_train, y_train)
        val_proba = stacking_fold.predict_proba(X_val)
        val_pred = val_proba.argmax(axis=1)

        stacking_oof_pred[val_idx] = val_pred
        stacking_oof_proba[val_idx] = val_proba

        # Metrics per fold
        fold_metrics["acc"].append(accuracy_score(y_val, val_pred))
        fold_metrics["prec"].append(precision_score(y_val, val_pred, average="weighted", zero_division=0))
        fold_metrics["rec"].append(recall_score(y_val, val_pred, average="weighted", zero_division=0))
        fold_metrics["f1"].append(f1_score(y_val, val_pred, average="weighted", zero_division=0))
        fold_metrics["train_acc"].append(accuracy_score(y_train, stacking_fold.predict(X_train)))

        if fold <= 5:
            print(f"  Fold {fold}: Val={fold_metrics['acc'][-1]:.4f}, Train={fold_metrics['train_acc'][-1]:.4f}")
    elapsed = time.time() - start

    # --- 3. Aggregate Results ---
    stacking_results = {
        "accuracy": np.mean(fold_metrics["acc"]),
        "accuracy_std": np.std(fold_metrics["acc"]),
        "precision": np.mean(fold_metrics["prec"]),
        "recall": np.mean(fold_metrics["rec"]),
        "f1": np.mean(fold_metrics["f1"]),
        "train_accuracy": np.mean(fold_metrics["train_acc"]),
        "time": elapsed,
        "oof_pred": stacking_oof_pred,
        "oof_proba": stacking_oof_proba
    }

    print(f"\nStacking Results:")
    print(f"  Accuracy: {stacking_results['accuracy']:.4f} ± {stacking_results['accuracy_std']:.4f}")
    print(f"  Train Accuracy: {stacking_results['train_accuracy']:.4f}")
    print(f"  Time: {elapsed:.1f}s")

    # --- 4. Compare with best individual model ---
    print("\n" + "=" * 60)
    print("INDIVIDUAL vs STACKING COMPARISON")
    print("=" * 60)
    print(f"Best individual ({best_model_name}): {cv_results[best_model_name]['accuracy']:.4f}")
    print(f"Stacking Ensemble:                   {stacking_results['accuracy']:.4f}")
    improvement = (stacking_results["accuracy"] - cv_results[best_model_name]["accuracy"]) * 100
    print(f"Improvement: {improvement:+.2f}%")

    # --- 5. Detailed Metrics ---
    print("\nStacking Classification Report:")
    print(classification_report(y_encoded, stacking_oof_pred, target_names=list(le_target.classes_)))

    cm = confusion_matrix(y_encoded, stacking_oof_pred)
    print("\nConfusion Matrix:")
    print(pd.DataFrame(cm, index=le_target.classes_, columns=le_target.classes_))

    print("\nPer-Class Recall:")
    for i, class_name in enumerate(le_target.classes_):
        recall = cm[i, i] / cm[i, :].sum()
        print(f"  {class_name:15s}: {recall:.4f}")

    # --- 6. Store Results ---
    cv_results["Stacking"] = stacking_results

    # --- 7. Train Final Model on Full Dataset ---
    print("\n" + "=" * 60)
    print("TRAINING FINAL STACKING MODEL ON FULL DATASET")
    print("=" * 60)
    stacking_final = clone(stacking_clf)
    stacking_final.fit(X_scaled, y_encoded)

    stacking_package = {
        "model": stacking_final,
        "label_encoder": le_target,
        "model_type": "stacking",
        "cv_accuracy": stacking_results["accuracy"],
        "cv_std": stacking_results["accuracy_std"]
    }
    warnings.filterwarnings("default", category=RuntimeWarning)

    if save_path:
        with open(save_path, "wb") as f:
            pickle.dump(stacking_package, f)
            print(f"💾 Saved stacking model to: {save_path}")

    return stacking_results, stacking_final
