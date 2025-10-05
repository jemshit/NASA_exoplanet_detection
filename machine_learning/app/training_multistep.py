import pickle
import time
import warnings
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    classification_report
)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier


def train_multistep_nn_xgb(
        X_data: pd.DataFrame,
        y_encoded: np.ndarray,
        groups: np.ndarray,
        cv: StratifiedGroupKFold,
        le_target,
        save_prefix: str = None
) -> Tuple[Dict, Dict, Dict, Dict]:
    """
    Multi-step hierarchical classification:
        Stage 1 -> (high recall) Neural network distinguishes PLANET (CONFIRMED|CANDIDATE) vs FALSE POSITIVE.
        Stage 2 -> (high precision) XGBoost separates CONFIRMED vs CANDIDATE within PLANET-like samples.

    Args:
        X_data (pd.DataFrame): Feature matrix.
        y_encoded (np.ndarray): Encoded 3-class labels (CANDIDATE=0, CONFIRMED=1, FALSE POSITIVE=2).
        groups (np.ndarray): Group identifiers (kepid).
        cv (StratifiedGroupKFold): Group-aware CV splitter.
        le_target: LabelEncoder used for target decoding.
        save_prefix: models save path prefix.

    Returns:
    Tuple[Dict, Dict, Dict, Dict]:
        - cv_results: OOF predictions & metrics for each stage.
        - models: unfitted base definitions.
        - trained_models: fitted models (stage1 & stage2) on full data.
        - metrics_summary: global accuracy/recall summary.
    """

    print("\n" + "=" * 60)
    print("MULTI-STEP CLASSIFICATION — MLP + XGBoost")
    print("=" * 60)

    models, trained_models, cv_results = {}, {}, {}

    # ------------------- Stage 1 -------------------
    print("\nStage 1: Neural Network — PLANET vs FALSE POSITIVE (High Recall)")

    y_stage1 = ((y_encoded == 0) | (y_encoded == 1)).astype(int)

    warnings.filterwarnings("ignore", category=RuntimeWarning)
    stage1_pipeline = make_pipeline(
        StandardScaler(),
        MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation="relu",
            alpha=0.001,
            learning_rate_init=0.001,
            max_iter=500,
            early_stopping=True,
            validation_fraction=0.15,
            random_state=42
        )
    )

    models["Stage1_MLP"] = stage1_pipeline
    stage1_oof_pred = np.empty(len(y_encoded), dtype=int)
    stage1_oof_proba = np.zeros((len(y_encoded), 2))

    start = time.time()
    for fold, (tr, va) in enumerate(cv.split(X_data, y_stage1, groups=groups), 1):
        model_fold = clone(stage1_pipeline)
        model_fold.fit(X_data.iloc[tr], y_stage1[tr])

        val_proba = model_fold.predict_proba(X_data.iloc[va])
        stage1_oof_proba[va] = val_proba
        val_pred = (val_proba[:, 1] > 0.25).astype(int)  # threshold tuned for high recall
        stage1_oof_pred[va] = val_pred

        if fold <= 5:
            r = recall_score(y_stage1[va], val_pred)
            print(f"  Fold {fold}: Recall={r:.4f}")

    stage1_recall = recall_score(y_stage1, stage1_oof_pred)
    stage1_precision = precision_score(y_stage1, stage1_oof_pred)
    print(f"\nStage 1 Final: Recall={stage1_recall:.4f}, Precision={stage1_precision:.4f}")
    print(f"Time: {time.time() - start:.1f}s")

    # Train full Stage1 model
    trained_stage1 = clone(stage1_pipeline).fit(X_data, y_stage1)
    trained_models["Stage1_MLP"] = trained_stage1
    cv_results["Stage1_MLP"] = {"oof_pred": stage1_oof_pred, "oof_proba": stage1_oof_proba}

    # ------------------- Stage 2 -------------------
    print("\nStage 2: XGBoost — CANDIDATE vs CONFIRMED (High Precision)")

    planet_mask = (y_encoded == 0) | (y_encoded == 1)
    X_planets = X_data[planet_mask]
    y_planets = y_encoded[planet_mask]
    groups_planets = groups[planet_mask]

    stage2_model = XGBClassifier(
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

    models["Stage2_XGB"] = stage2_model
    stage2_oof_pred = np.empty(len(y_planets), dtype=int)

    for fold, (tr, va) in enumerate(cv.split(X_planets, y_planets, groups=groups_planets), 1):
        m = clone(stage2_model)
        m.fit(X_planets.iloc[tr], y_planets[tr])
        val_pred = m.predict(X_planets.iloc[va])
        stage2_oof_pred[va] = val_pred

        if fold <= 5:
            acc = accuracy_score(y_planets[va], val_pred)
            print(f"  Fold {fold}: Accuracy={acc:.4f}")

    stage2_acc = accuracy_score(y_planets, stage2_oof_pred)
    cand_recall = recall_score(y_planets, stage2_oof_pred, pos_label=0)
    conf_recall = recall_score(y_planets, stage2_oof_pred, pos_label=1)
    print(f"\nStage 2 Final: Accuracy={stage2_acc:.4f}")
    print(f"  CANDIDATE recall: {cand_recall:.4f}")
    print(f"  CONFIRMED recall: {conf_recall:.4f}")

    trained_stage2 = clone(stage2_model).fit(X_planets, y_planets)
    trained_models["Stage2_XGB"] = trained_stage2
    cv_results["Stage2_XGB"] = {"oof_pred": stage2_oof_pred}

    # ------------------- Combine both stages -------------------
    print("\nCombining both stages...")

    multistep_pred = np.full(len(y_encoded), 2, dtype=int)  # default = FALSE POSITIVE
    planet_indices = np.where(planet_mask)[0]
    planet_preds = stage2_oof_pred
    stage1_planet_indices = np.where(stage1_oof_pred == 1)[0]
    for idx in stage1_planet_indices:
        if idx in planet_indices:
            p2_pos = np.where(planet_indices == idx)[0][0]
            multistep_pred[idx] = planet_preds[p2_pos]

    multistep_acc = accuracy_score(y_encoded, multistep_pred)
    warnings.filterwarnings("default", category=RuntimeWarning)

    # ==========================================================
    # Evaluation
    # ==========================================================
    print("\n" + "=" * 60)
    print("MULTI-STEP PIPELINE RESULTS")
    print("=" * 60)
    print(f"Overall Accuracy: {multistep_acc:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_encoded, multistep_pred, target_names=le_target.classes_))

    print("\nComparison:")
    print(f"Multi-step NN→XGBoost: {multistep_acc:.4f}")

    metrics_summary = {
        "accuracy": acc,
        "stage1_recall": recall_score(((y_encoded == 0) | (y_encoded == 1)).astype(int), stage1_oof_pred),
        "stage1_precision": precision_score(((y_encoded == 0) | (y_encoded == 1)).astype(int), stage1_oof_pred),
        "stage2_accuracy": accuracy_score(y_planets, stage2_oof_pred),
    }

    cv_results["Combined"] = {"pred": multistep_pred}

    # ==========================================================
    # Save trained models separately
    # ==========================================================
    if save_prefix:
        with open(f"{save_prefix}_stage1.pkl", "wb") as f:
            pickle.dump(trained_stage1, f)
            print(f"\n💾 Saved Stage1 → {save_prefix}_stage1.pkl")
        with open(f"{save_prefix}_stage2.pkl", "wb") as f:
            pickle.dump(trained_stage2, f)
            print(f"💾 Saved Stage2 → {save_prefix}_stage2.pkl")

    # ==========================================================
    # Save trained models together
    # ==========================================================
    if save_prefix:
        multistep_package = {
            "models": models,  # unfitted definitions
            "trained_models": trained_models,  # fitted stage1 & stage2
            "cv_results": cv_results,  # OOF predictions
            "metrics_summary": metrics_summary,  # key metrics
            "label_encoder": le_target,  # so inference can decode
            "model_type": "multi-step_nn_xgb",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        }

        file_name = f"{save_prefix}_multistep.pkl"
        with open(file_name, "wb") as f:
            pickle.dump(multistep_package, f)
            print(f"\n💾 Saved full multi-step model package → {file_name}")

    print("✅ Multi-step training complete.")

    return cv_results, models, trained_models, metrics_summary
