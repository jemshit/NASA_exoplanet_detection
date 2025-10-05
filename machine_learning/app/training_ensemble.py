import time
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
from sklearn.base import clone
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score
)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight
from xgboost import XGBClassifier

from summarizing import evaluate_the_best_model


def train_ensemble_models(
        X_scaled: pd.DataFrame,
        y_encoded: np.ndarray,
        groups: np.ndarray,
        cv: StratifiedGroupKFold,
        le_target: LabelEncoder,
        class_weight_penalizing: bool = False,
        save_prefix: str = None
) -> Tuple[Dict, Dict, Dict, Dict]:
    """
    Train multiple ensemble models (XGBoost, LightGBM, CatBoost, RandomForest)
    using group-aware cross-validation.

    Args:
        X_scaled (pd.DataFrame): Scaled training features.
        y_encoded (np.ndarray): Encoded target labels.
        groups (np.ndarray): Group identifiers (e.g., kepid) for StratifiedGroupKFold CV.
        cv (StratifiedGroupKFold): Cross-validation splitter.
        le_target (LabelEncoder): Label encoder.
        class_weight_penalizing (bool, optional): Weight penalizing (default: False).
        save_prefix (str, optional): Save path. Defaults to None.

    Returns:
        Tuple[Dict, Dict, Dict]:
            - cv_results: metrics per model
            - models: models
            - trained_models: fitted models on full dataset
            - best_model_metrics_summary: metrics summary for best model (accuracy, macro recall, F1, ROC-AUC, log loss, etc.)
    """

    print("\n" + "=" * 60)
    print("TRAINING MODELS WITH GROUP-AWARE CROSS-VALIDATION")
    print("=" * 60)

    # Compute balanced class weights
    if class_weight_penalizing:
        class_weights = compute_class_weight(
            class_weight="balanced",
            classes=np.unique(y_encoded),
            y=y_encoded
        )
        class_weights_dict = dict(zip(np.unique(y_encoded), class_weights))
        class_weights_dict = {int(k): float(v) for k, v in class_weights_dict.items()}
        print(f"Class weights: {class_weights_dict}")

    # Define models
    models = {
        "XGBoost": XGBClassifier(
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
            verbosity=0,
            # XGBoost handles imbalance via sample_weight
            scale_pos_weight=1.0 if class_weight_penalizing else None
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=500,
            max_depth=5,
            learning_rate=0.03,
            subsample=0.7,
            colsample_bytree=0.7,
            reg_alpha=1.0,
            reg_lambda=2.5,
            min_child_samples=20,
            random_state=42,
            verbose=-1
        ),
        "CatBoost": CatBoostClassifier(
            iterations=700,
            depth=7,
            learning_rate=0.05,
            l2_leaf_reg=3,
            random_state=42,
            verbose=False,
            class_weights=class_weights.tolist() if class_weight_penalizing else None
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=700,
            max_depth=14,
            min_samples_split=7,
            min_samples_leaf=3,
            max_features="sqrt",
            random_state=42,
            n_jobs=-1
        )
    }

    cv_results = {}
    trained_models = {}

    # Iterate through models
    for name, model in models.items():
        print(f"\nTraining {name} with {cv.get_n_splits()}-fold StratifiedGroupKFold CV...")

        start_time = time.time()

        fold_metrics = {"acc": [], "prec": [], "rec": [], "f1": [], "train_acc": []}
        oof_pred = np.empty(len(y_encoded), dtype=int)
        oof_proba = np.zeros((len(y_encoded), len(np.unique(y_encoded))))

        for fold, (train_idx, val_idx) in enumerate(cv.split(X_scaled, y_encoded, groups=groups), 1):
            m = clone(model)
            X_train, X_val = X_scaled.iloc[train_idx], X_scaled.iloc[val_idx]
            y_train, y_val = y_encoded[train_idx], y_encoded[val_idx]

            # Fit with per-sample weights for class imbalance
            if class_weight_penalizing:
                sample_weights = np.array([class_weights_dict[y] for y in y_train])
                m.fit(X_train, y_train, sample_weight=sample_weights)
            else:
                m.fit(X_train, y_train)

            val_proba = m.predict_proba(X_val)
            val_pred = val_proba.argmax(axis=1)
            train_pred = m.predict(X_train)

            oof_pred[val_idx] = val_pred
            oof_proba[val_idx] = val_proba

            # Fold metrics
            fold_metrics["acc"].append(accuracy_score(y_val, val_pred))
            fold_metrics["prec"].append(precision_score(y_val, val_pred, average="weighted", zero_division=0))
            fold_metrics["rec"].append(recall_score(y_val, val_pred, average="weighted", zero_division=0))
            fold_metrics["f1"].append(f1_score(y_val, val_pred, average="weighted", zero_division=0))
            fold_metrics["train_acc"].append(accuracy_score(y_train, train_pred))

            if fold <= 5:
                print(f"  Fold {fold}: val_acc={fold_metrics['acc'][-1]:.4f}")

        elapsed = time.time() - start_time
        cv_results[name] = {
            "accuracy": np.mean(fold_metrics["acc"]),
            "accuracy_std": np.std(fold_metrics["acc"]),
            "precision": np.mean(fold_metrics["prec"]),
            "recall": np.mean(fold_metrics["rec"]),
            "f1": np.mean(fold_metrics["f1"]),
            "train_accuracy": np.mean(fold_metrics["train_acc"]),
            "time": elapsed,
            "oof_pred": oof_pred,
            "oof_proba": oof_proba
        }

        print(
            f"  ✅ {name}: "
            f"Acc={cv_results[name]['accuracy']:.4f} ± {cv_results[name]['accuracy_std']:.4f} | "
            f"Prec={cv_results[name]['precision']:.4f} | "
            f"Rec={cv_results[name]['recall']:.4f} | "
            f"F1={cv_results[name]['f1']:.4f} | "
            f"TrainAcc={cv_results[name]['train_accuracy']:.4f} | "
            f"Time={elapsed:.1f}s"
        )

    # --- Summary ---
    print("\n" + "=" * 60)
    print("GROUP-AWARE CV RESULTS SUMMARY")
    print("=" * 60)
    summary = pd.DataFrame(cv_results).T[
        ["accuracy", "accuracy_std", "precision", "recall", "f1"]
    ]
    print(summary)

    best_model_name = max(cv_results, key=lambda x: cv_results[x]["accuracy"])
    print(f"\n🏆 Best model: {best_model_name} "
          f"({cv_results[best_model_name]['accuracy']:.4f})")

    # --- Final training on full data ---
    print("\n" + "=" * 60)
    print("FINAL TRAINING ON FULL DATASET")
    print("=" * 60)

    for name, model in models.items():
        m = clone(model)
        print(f"Training {name} on full dataset...")
        m.fit(X_scaled, y_encoded)
        trained_models[name] = m

    best_model_metrics_summary = evaluate_the_best_model(
        cv_results=cv_results,
        best_model_name=best_model_name,
        y_encoded=y_encoded,
        le_target=le_target
    )

    if save_prefix:
        import pickle

        # --- Save each model separately ---
        for name, m in trained_models.items():
            fname = save_prefix + f"trained_{name.lower()}.pkl"
            with open(fname, "wb") as f:
                pickle.dump({
                    "model": m,
                    "label_encoder": le_target,
                    "model_name": name,
                    "model_type": "single_ensemble",
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }, f)
            print(f"💾 Saved individual model → {fname}")

    print("\n✅ All models trained successfully.")

    return cv_results, models, trained_models, best_model_metrics_summary
