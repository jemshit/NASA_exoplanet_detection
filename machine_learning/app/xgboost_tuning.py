import pickle
import time
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import GridSearchCV, StratifiedGroupKFold
from xgboost import XGBClassifier


# increases accuracy by 0.5% but also increases Train accuracy to 0.99!
def tune_xgboost_hyperparameters(
        X_data: pd.DataFrame,
        y_encoded: np.ndarray,
        groups: np.ndarray,
        cv: StratifiedGroupKFold,
        save_path: str = None
) -> Tuple[XGBClassifier, Dict, pd.DataFrame]:
    """
    Perform group-aware hyperparameter tuning for XGBoost using GridSearchCV.

    Args:
        X_data (pd.DataFrame):
            Feature matrix for tuning.
        y_encoded (np.ndarray):
            Encoded target labels.
        groups (np.ndarray):
            Group identifiers (kepid) to ensure grouped CV.
        cv (StratifiedGroupKFold): Cross-validation splitter.
        save_path (str, optional):
            Path to save the tuned model package. Defaults to None.

    Returns:
        Tuple[XGBClassifier, Dict, pd.DataFrame]:
            (best_estimator, best_params, results_dataframe)
    """

    print("\n" + "=" * 60)
    print("HYPERPARAMETER TUNING (GRIDSEARCHCV)")
    print("=" * 60)

    # --- Parameter grid ---
    param_grid = {
        "n_estimators": [500, 1000],
        "max_depth": [4, 5, 6, 7],
        "learning_rate": [0.01, 0.03, 0.05],
        "subsample": [0.7, 0.8],
        "colsample_bytree": [0.7, 0.8]
    }

    n_combinations = np.prod([len(v) for v in param_grid.values()])
    print(f"\nTesting {n_combinations} parameter combinations "
          f"with StratifiedGroupKFold({cv.get_n_splits()}) = {n_combinations * cv.get_n_splits()} total model trainings")

    # --- GridSearchCV setup ---
    base_model = XGBClassifier(
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.3,
        reg_lambda=1.5,
        random_state=42,
        verbosity=0,
        eval_metric="logloss"
    )

    grid_search = GridSearchCV(
        estimator=base_model,
        param_grid=param_grid,
        cv=cv,
        scoring="accuracy",
        n_jobs=-1,
        verbose=1,
        return_train_score=True
    )

    # --- Fit GridSearch ---
    print("\nFitting GridSearchCV...")
    start_time = time.time()
    grid_search.fit(X_data, y_encoded, groups=groups)
    elapsed = time.time() - start_time

    print("\n" + "=" * 60)
    print(f"GRIDSEARCH COMPLETED IN {elapsed / 60:.1f} MINUTES")
    print("=" * 60)

    # --- Results summary ---
    best_params = grid_search.best_params_
    best_score = grid_search.best_score_
    print("\nBest parameters found:")
    for param, value in best_params.items():
        print(f"  {param}: {value}")
    print(f"\nBest CV accuracy: {best_score:.4f}")

    # --- Results DataFrame ---
    results_df = pd.DataFrame(grid_search.cv_results_)

    # --- Save best model package ---
    best_model = grid_search.best_estimator_

    if save_path:
        tuned_package = {
            "model": best_model,
            "best_params": best_params,
            "cv_accuracy": best_score
        }
        with open(save_path, "wb") as f:
            pickle.dump(tuned_package, f)
            print(f"\n💾 Saved tuned model to: {save_path}")

    return best_model, best_params, results_df
