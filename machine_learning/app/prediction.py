import pickle
import time

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, \
    classification_report


def run_prediction(
        model_path: str,
        df_engineered: pd.DataFrame | None = None,
        target_column: str = "koi_disposition"
) -> dict:
    """
    Universal prediction / evaluation function for trained KOI models.

    Args:
        model_path (str): Path to a saved .pkl model package.
        df_engineered (pd.DataFrame, optional): Optional dataset
        target_column (str, optional): Target column name (if present). Defaults to 'koi_disposition'.

    Returns:
        dict: {
            'predictions': np.ndarray,
            'metrics': dict (if ground truth present),
            'model_info': dict
        }
    """
    print("\n" + "=" * 60)
    print("LOADING MODEL PACKAGE")
    print("=" * 60)

    with open(model_path, "rb") as f:
        package = pickle.load(f)

    if isinstance(package, dict):
        model_type = package.get("model_type", "unknown")
        le = package.get("label_encoder")
        trained_models = package.get("trained_models")
    else:
        model_type = type(package).__name__  # e.g., "XGBClassifier"
        le = None
        trained_models = {"BaseModel": package}
    print(f"Loaded model type: {model_type}")

    # ------------------------------------------
    # Check dataset (if provided)
    # ------------------------------------------
    df = df_engineered
    if df.empty:
        raise ValueError("No input data provided.")

    X = df.copy()
    y_true = None
    if target_column in X.columns:
        y_true = X.pop(target_column).values
        print(f"Found target column '{target_column}' for evaluation.")

    # ------------------------------------------
    # Prediction logic per model type
    # ------------------------------------------
    print("\n" + "=" * 60)
    print("RUNNING PREDICTION")
    print("=" * 60)
    start = time.time()

    if model_type == "multi-step_nn_xgb":
        s1 = trained_models["Stage1_MLP"]
        s2 = trained_models["Stage2_XGB"]
        print("→ Multi-step pipeline detected (Stage1 + Stage2)")

        stage1_pred = (s1.predict_proba(X)[:, 1] > 0.25).astype(int)
        preds = np.full(len(X), 2, dtype=int)  # Default = FALSE POSITIVE
        planet_idx = np.where(stage1_pred == 1)[0]
        if len(planet_idx) > 0:
            preds[planet_idx] = s2.predict(X.iloc[planet_idx])
    else:
        # handle single-model pickles and ensemble/stacking/binary packages
        if isinstance(package, dict):
            # check for dict types like stacking_ensemble, binary_xgboost, etc.
            if "trained_models" in package and isinstance(package["trained_models"], dict):
                model = list(package["trained_models"].values())[0]
                print(f"→ Using first trained model from package: {type(model).__name__}")
            elif "model" in package:
                model = package["model"]
                print(f"→ Using model from package: {type(model).__name__}")
            else:
                raise ValueError("⚠️ No valid model found inside the provided package dictionary.")
        else:
            # raw model object
            model = package
            print(f"→ Using raw model: {type(model).__name__}")

        preds = model.predict(X)

    elapsed = time.time() - start
    print(f"Inference completed in {elapsed:.2f}s")
    decoded_preds = le.inverse_transform(preds) if le is not None else preds

    # ------------------------------------------
    # Evaluation (if ground truth available)
    # ------------------------------------------
    metrics = {}
    row_results = []
    if y_true is not None:
        y_enc = le.transform(y_true) if le else y_true
        acc = accuracy_score(y_enc, preds)
        prec = precision_score(y_enc, preds, average="weighted", zero_division=0)
        rec = recall_score(y_enc, preds, average="weighted", zero_division=0)
        f1 = f1_score(y_enc, preds, average="weighted", zero_division=0)
        cm = confusion_matrix(y_enc, preds)

        print("\n" + "=" * 60)
        print("EVALUATION METRICS")
        print("=" * 60)
        print(f"Accuracy : {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall   : {rec:.4f}")
        print(f"F1 Score : {f1:.4f}")
        if len(np.unique(y_enc)) > 1:
            print("\nConfusion Matrix:")
            print(pd.DataFrame(cm, index=le.classes_, columns=le.classes_))
            print("\nClassification Report:")
            print(classification_report(y_enc, preds, target_names=list(le.classes_)))

        df_with_preds = df.copy()
        df_with_preds["predicted_label"] = decoded_preds
        if target_column in df.columns:
            df_with_preds["true_label"] = df[target_column]
        print("\nPer-row predictions:")
        print(df_with_preds[["predicted_label"] + (["true_label"] if y_true is not None else [])].head())
        row_results = df_with_preds.to_dict(orient="records")

        metrics = {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1": f1,
            "confusion_matrix": cm.tolist(),
        }

    # ------------------------------------------
    # Return results
    # ------------------------------------------
    results = {
        "decoded_predictions": decoded_preds.tolist(),
        "metrics": metrics,
        "model_info": {
            "model_path": model_path,
            "model_type": model_type,
            "elapsed_s": elapsed,
        },
        "row_results": row_results
    }

    print(f"\n✅ Inference complete. Total samples processed: {len(df)}")
    return results
