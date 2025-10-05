import json
from typing import Dict, Tuple, List

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, recall_score, classification_report, confusion_matrix


def optimize_class_thresholds(
        y_true: np.ndarray,
        y_proba: np.ndarray,
        class_labels: List[str],
        conf_min_recall: float = 0.8,
        cand_range: Tuple[float, float, float] = (0.30, 0.40, 0.02),
        conf_range: Tuple[float, float, float] = (0.45, 0.60, 0.05),
        fp_range: Tuple[float, float, float] = (0.65, 0.75, 0.05),
        save_path: str = "threshold_configs.json"
) -> Dict[str, Dict]:
    """
    Optimize class-specific thresholds for 3-class exoplanet classification
    to improve CANDIDATE recall while maintaining CONFIRMED recall above a threshold.

    Args:
        y_true (np.ndarray): Encoded ground truth labels (0=CANDIDATE, 1=CONFIRMED, 2=FALSE POSITIVE).
        y_proba (np.ndarray): Predicted probabilities from model (n_samples x 3).
        class_labels (List[str]): Class label names in correct order.
        conf_min_recall (float, optional): Minimum allowed CONFIRMED recall. Default is 0.8.
        cand_range (Tuple[float, float, float], optional): (start, stop, step) for CANDIDATE threshold search.
        conf_range (Tuple[float, float, float], optional): (start, stop, step) for CONFIRMED threshold search.
        fp_range (Tuple[float, float, float], optional): (start, stop, step) for FALSE POSITIVE threshold search.
        save_path (str, optional): JSON file path to save threshold configs. Default "threshold_configs.json".

    Returns:
        Dict[str, Dict]:
            {
                "default": {...},
                "optimized": {...}
            }
    """

    def predict_with_thresholds(y_proba, t_cand, t_conf, t_fp):
        """Applies custom thresholds per class instead of argmax."""
        preds = np.argmax(y_proba, axis=1)
        cand_mask = y_proba[:, 0] > t_cand
        conf_mask = y_proba[:, 1] > t_conf
        fp_mask = y_proba[:, 2] > t_fp
        preds[cand_mask] = 0
        preds[conf_mask] = 1
        preds[fp_mask] = 2
        return preds

    print("\n" + "=" * 60)
    print("THRESHOLD OPTIMIZATION FOR CANDIDATE RECALL")
    print("=" * 60)
    print("Searching for optimal thresholds (constraint: CONFIRMED recall > {:.0f}%)".format(conf_min_recall * 100))

    best_result = {"cand_recall": 0, "thresholds": None, "overall_acc": 0, "conf_recall": 0}
    results_list = []

    for cand_t in np.arange(*cand_range):
        for conf_t in np.arange(*conf_range):
            for fp_t in np.arange(*fp_range):
                preds = predict_with_thresholds(y_proba, cand_t, conf_t, fp_t)
                recalls = recall_score(y_true, preds, labels=[0, 1, 2], average=None)
                cand_recall, conf_recall, fp_recall = recalls
                acc = accuracy_score(y_true, preds)

                if conf_recall > conf_min_recall:
                    results_list.append({
                        "cand_t": cand_t,
                        "conf_t": conf_t,
                        "fp_t": fp_t,
                        "cand_recall": cand_recall,
                        "conf_recall": conf_recall,
                        "fp_recall": fp_recall,
                        "accuracy": acc
                    })

                    if cand_recall > best_result["cand_recall"]:
                        best_result.update({
                            "cand_recall": cand_recall,
                            "thresholds": (cand_t, conf_t, fp_t),
                            "overall_acc": acc,
                            "conf_recall": conf_recall
                        })

    if not results_list:
        print("❌ No configurations found that maintain CONFIRMED recall > threshold.")
        return {}

    results_df = pd.DataFrame(results_list).sort_values("cand_recall", ascending=False)

    print("\nTop 5 Threshold Configurations:")
    print(results_df[["cand_t", "conf_t", "fp_t", "cand_recall", "conf_recall", "accuracy"]].head())

    print("\n" + "=" * 60)
    print("BEST THRESHOLD CONFIGURATION")
    print("=" * 60)
    cand_t, conf_t, fp_t = best_result["thresholds"]
    print(f"CANDIDATE threshold: {cand_t:.2f}")
    print(f"CONFIRMED threshold: {conf_t:.2f}")
    print(f"FALSE POSITIVE threshold: {fp_t:.2f}")
    print(f"\nCANDIDATE recall: {best_result['cand_recall']:.4f}")
    print(f"CONFIRMED recall: {best_result['conf_recall']:.4f}")
    print(f"Overall accuracy: {best_result['overall_acc']:.4f}")

    # Apply optimized thresholds for final metrics
    optimal_pred = predict_with_thresholds(y_proba, cand_t, conf_t, fp_t)
    print("\nClassification Report with Optimal Thresholds:")
    print(classification_report(y_true, optimal_pred, target_names=class_labels))

    cm = confusion_matrix(y_true, optimal_pred)
    print("\nConfusion Matrix:")
    print(pd.DataFrame(cm, index=class_labels, columns=class_labels))

    threshold_configs = {
        "default": {
            "mode": "argmax",
            "accuracy": float(accuracy_score(y_true, np.argmax(y_proba, axis=1))),
            "candidate_recall": float(recall_score(y_true, np.argmax(y_proba, axis=1),
                                                   labels=[0, 1, 2], average=None)[0])
        },
        "optimized": {
            "cand_threshold": float(cand_t),
            "conf_threshold": float(conf_t),
            "fp_threshold": float(fp_t),
            "accuracy": float(best_result["overall_acc"]),
            "candidate_recall": float(best_result["cand_recall"])
        }
    }

    with open(save_path, "w") as f:
        json.dump(threshold_configs, f, indent=4)
        print(f"\n💾 Saved threshold configurations → {save_path}")

    return threshold_configs
