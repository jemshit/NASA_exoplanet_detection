from typing import Union, List

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier


def analyze_feature_importance(
        model: Union[XGBClassifier, LGBMClassifier, RandomForestClassifier],
        X_scaled: pd.DataFrame,
        top_n: int = 25,
        model_label: str = "XGBoost",
        plot: bool = True,
) -> List[str]:
    """
    Analyze feature importance for a trained model, visualize top features,
    and optionally retrain using only the most important ones.

    Args:
        model (Union[XGBClassifier, LGBMClassifier, RandomForestClassifier]):
            A fitted model exposing the `feature_importances_` attribute.
        X_scaled (pd.DataFrame):
            Scaled feature matrix used for training.
        top_n (int, optional):
            Number of top-ranked features to print and visualize. Defaults to 30.
        model_label (str, optional):
            Label for logging/plot titles. Defaults to "XGBoost".
        plot (bool, optional): Defaults to True.

    Returns:
        List[str]: elected_features
    """

    print("\n" + "=" * 60)
    print(f"FEATURE IMPORTANCE ANALYSIS — {model_label}")
    print("=" * 60)

    # --- 1. Compute importance ---
    importance: np.ndarray = model.feature_importances_
    feature_names: np.ndarray = np.array(X_scaled.columns)
    sorted_idx = np.argsort(importance)[::-1]

    # --- 2. Display top features ---
    top_n = min(top_n, len(feature_names))
    print(f"\nTop {top_n} Most Important Features:")
    for i, idx in enumerate(sorted_idx[:top_n], 1):
        print(f"{i:2d}. {feature_names[idx]:30s}: {importance[idx]:.4f}")

    # --- 3. Visualization ---
    if plot:
        plt.figure(figsize=(12, 8))
        plt.barh(range(top_n), importance[sorted_idx[:top_n]][::-1])
        plt.yticks(range(top_n), feature_names[sorted_idx[:top_n]][::-1])
        plt.xlabel("Feature Importance")
        plt.title(f"Top {top_n} Features — {model_label}")
        plt.tight_layout()
        plt.show()

    return feature_names[sorted_idx[:top_n]].tolist()
