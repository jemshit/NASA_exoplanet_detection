import time
from typing import Tuple, Dict

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.model_selection import StratifiedGroupKFold, cross_validate, cross_val_predict
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

from summarizing import evaluate_the_best_model


def train_binary_planet_model(
        df_engineered: pd.DataFrame,
        groups: np.ndarray,
        cv: StratifiedGroupKFold,
        target_column: str = "koi_disposition"
) -> Tuple[Dict, Dict, Dict, Dict, LabelEncoder]:
    """
    Train a binary CONFIRMED vs FALSE POSITIVE classifier from the engineered KOI dataset, using XGBoost

    Steps
    -----
    1. Filter out CANDIDATE class.
    2. Encode labels → CONFIRMED=1, FALSE POSITIVE=0.
    3. Evaluate XGBoost using StratifiedGroupKFold CV (grouped by kepid).
    4. Print metrics (accuracy, precision, recall, F1, train accuracy).

    Returns
    -------
    Tuple[Dict, Dict, Dict, LabelEncoder]:
        - cv_results: metrics per model
        - models: models
        - trained_models: fitted models on full dataset
        - best_model_metrics_summary: metrics summary for best model (accuracy, macro recall, F1, ROC-AUC, log loss, etc.)
        - binary le_target
    """

    print("\n" + "=" * 60)
    print("BINARY CLASSIFICATION EXPERIMENT")
    print("Removing CANDIDATE class to test performance")
    print("=" * 60)

    # --- 1. Filter dataset ---
    mask = df_engineered[target_column].isin(["CONFIRMED", "FALSE POSITIVE"])
    df_bin = df_engineered[mask].copy()
    X_bin = df_bin.drop(columns=[target_column])
    y_bin = (df_bin[target_column] == "CONFIRMED").astype(int)
    groups_bin = groups[mask]

    print(f"\nBinary dataset:")
    print(f"  Total samples: {len(X_bin)} (removed {df_engineered.shape[0] - len(df_bin)} CANDIDATE samples)")
    print(f"  CONFIRMED: {(y_bin == 1).sum()}")
    print(f"  FALSE POSITIVE: {(y_bin == 0).sum()}")

    # --- 2. Define model ---
    best_model_name = "XGBoost"
    model = XGBClassifier(
        n_estimators=500,
        learning_rate=0.03,
        max_depth=5,
        subsample=0.7,
        colsample_bytree=0.7,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.3,
        reg_lambda=1.5,
        random_state=42,
        verbosity=0
    )
    models = {"XGBoost": model}
    trained_models = {}
    model_clone = clone(model)

    # --- 3. Group-aware CV evaluation ---
    print(f"\nEvaluating with StratifiedGroupKFold({cv.get_n_splits()})...")
    start = time.time()
    scores = cross_validate(
        model_clone,
        X_bin,
        y_bin,
        groups=groups_bin,
        cv=cv,
        scoring=["accuracy", "precision", "recall", "f1"],
        return_train_score=True
    )
    elapsed = time.time() - start

    # --- 4. Summarize ---
    print("\nBinary Classification Results:")
    print(f"  Accuracy:  {scores['test_accuracy'].mean():.4f} ± {scores['test_accuracy'].std():.4f}")
    print(f"  Precision: {scores['test_precision'].mean():.4f} (CONFIRMED)")
    print(f"  Recall:    {scores['test_recall'].mean():.4f} (CONFIRMED)")
    print(f"  F1:        {scores['test_f1'].mean():.4f}")
    print(f"  Train acc: {scores['train_accuracy'].mean():.4f}")
    print(f"  Time:      {elapsed:.1f}s")

    print("\n" + "=" * 60)
    print(f"Binary (without CANDIDATE):   {scores['test_accuracy'].mean():.4f}")

    # --- Final training on full data ---
    print("\n" + "=" * 60)
    print("FINAL TRAINING ON FULL DATASET")
    print("=" * 60)
    model_clone.fit(X_bin, y_bin)
    trained_models["XGBoost"] = model_clone
    print("\n✅ All models trained successfully.")

    # Detailed Report
    print("\nGenerating out-of-fold predictions for detailed report...")
    y_oof_pred = cross_val_predict(
        model_clone,
        X_bin,
        y_bin,
        groups=groups_bin,
        cv=cv,
        method="predict"
    )
    y_oof_proba = cross_val_predict(
        model_clone,
        X_bin,
        y_bin,
        groups=groups_bin,
        cv=cv,
        method="predict_proba"
    )
    cv_results = {
        "XGBoost": {
            "oof_pred": y_oof_pred,
            "oof_proba": y_oof_proba
        }
    }
    le_target = LabelEncoder()
    le_target.fit(["FALSE POSITIVE", "CONFIRMED"])
    y_encoded = y_bin.to_numpy()

    best_model_metrics_summary = evaluate_the_best_model(
        cv_results=cv_results,
        best_model_name=best_model_name,
        y_encoded=y_encoded,
        le_target=le_target
    )

    return cv_results, models, trained_models, best_model_metrics_summary, le_target
