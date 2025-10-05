import json
import os
import warnings
from typing import Dict

from data_loading import load_koi_dataset
from data_splitting import prepare_data_for_training
from feature_extraction import create_advanced_features
from plotting import analyze_feature_importance
from prediction import run_prediction
from preprocessing import clean_koi_dataset
from training_binary import train_binary_planet_model
from training_ensemble import train_ensemble_models
from training_multistep import train_multistep_nn_xgb
from training_stacking_ensemble import train_stacking_ensemble

DATASET_PATH = "../dataset/kepler_koi.csv"
N_SPLITS = 5
TARGET_COLUMN = "koi_disposition"
OUTPUT_FOLDER = "../outputs/"


def ensemble_pipeline(input_rows: list[Dict] = None, class_weight_penalizing: bool = True, drop_fpflags: bool = True):
    df_raw = load_koi_dataset(path=DATASET_PATH, input_rows=input_rows, sep=",", target_column=TARGET_COLUMN)
    df_clean = clean_koi_dataset(df_raw, drop_fpflags=drop_fpflags)
    df_engineered = create_advanced_features(df_clean)
    X, y_encoded, groups, cv, df_engineered, le_target = prepare_data_for_training(
        df_engineered=df_engineered,
        df_original=df_raw,
        target_column=TARGET_COLUMN,
        n_splits=N_SPLITS,
        save_columns_path=OUTPUT_FOLDER + "features.json"
    )
    cv_results, models, trained_models, best_model_metrics_summary = train_ensemble_models(
        X_scaled=X,
        y_encoded=y_encoded,
        groups=groups,
        cv=cv,
        le_target=le_target,
        class_weight_penalizing=class_weight_penalizing,
        save_prefix=OUTPUT_FOLDER,
    )
    top_features = analyze_feature_importance(
        model=trained_models["XGBoost"],
        X_scaled=X,
        top_n=25,
        model_label="XGBoost (Full Data)",
        plot=False
    )
    # threshold_configs = optimize_class_thresholds(
    #     y_true=y_encoded,
    #     y_proba=cv_results['XGBoost']["oof_proba"],
    #     class_labels=list(le_target.classes_),
    #     conf_min_recall=0.8,
    #     cand_range=(0.30, 0.40, 0.02),
    #     conf_range=(0.45, 0.60, 0.05),
    #     fp_range=(0.65, 0.75, 0.05),
    #     save_path=OUTPUT_FOLDER + "threshold_configs.json"
    # )

    # best_model_tuned, best_params, tuning_results = tune_xgboost_hyperparameters(
    #     X_data=X,
    #     y_encoded=y_encoded,
    #     groups=groups,
    #     cv=cv
    # )

    stacking_results, stacking_clf = train_stacking_ensemble(
        X_scaled=X,
        y_encoded=y_encoded,
        groups=groups,
        cv=cv,
        le_target=le_target,
        cv_results=cv_results,
        best_model_name='XGBoost',
        models=models,
        save_path=OUTPUT_FOLDER + "stacking_model.pkl"
    )


def binary_categories_pipeline(input_rows: list[Dict] = None, drop_fpflags: bool = True):
    df_raw = load_koi_dataset(path=DATASET_PATH, input_rows=input_rows, sep=",", target_column=TARGET_COLUMN)
    df_clean = clean_koi_dataset(df_raw, drop_fpflags=drop_fpflags)
    df_engineered = create_advanced_features(df_clean)
    X, y_encoded, groups, cv, df_engineered, le_target = prepare_data_for_training(
        df_engineered=df_engineered,
        df_original=df_raw,
        target_column=TARGET_COLUMN,
        n_splits=N_SPLITS,
        save_columns_path=OUTPUT_FOLDER + "features.json"
    )
    cv_results, models, trained_models, best_model_metrics_summary, le_target = train_binary_planet_model(
        df_engineered=df_engineered,
        groups=groups,
        cv=cv,
        target_column=TARGET_COLUMN,
        save_path=OUTPUT_FOLDER + "binary_categories_model.pkl"
    )
    top_features = analyze_feature_importance(
        model=trained_models["XGBoost"],
        X_scaled=X,
        top_n=25,
        model_label="XGBoost (Full Data)",
        plot=False
    )


def multistep_pipeline(input_rows: list[Dict] = None, drop_fpflags: bool = True):
    df_raw = load_koi_dataset(path=DATASET_PATH, input_rows=input_rows, sep=",", target_column=TARGET_COLUMN)
    df_clean = clean_koi_dataset(df_raw, drop_fpflags=drop_fpflags)
    df_engineered = create_advanced_features(df_clean)
    X, y_encoded, groups, cv, df_engineered, le_target = prepare_data_for_training(
        df_engineered=df_engineered,
        df_original=df_raw,
        target_column=TARGET_COLUMN,
        n_splits=N_SPLITS,
        save_columns_path=OUTPUT_FOLDER + "features.json"
    )

    cv_results, models, trained_models, best_model_metrics_summary = train_multistep_nn_xgb(
        X_data=X,
        y_encoded=y_encoded,
        groups=groups,
        cv=cv,
        le_target=le_target,
        save_prefix=OUTPUT_FOLDER + "multistep_nn_xgb"
    )

    top_features = analyze_feature_importance(
        model=trained_models["Stage2_XGB"],
        X_scaled=X,
        top_n=25,
        model_label="XGBoost (Full Data)",
        plot=False
    )


def predict(dataset_path: str | None, input_rows: list[Dict], model_path: str):
    df_raw = load_koi_dataset(path=dataset_path, input_rows=input_rows, sep=",",
                              target_column=TARGET_COLUMN, verbose=False)
    df_clean = clean_koi_dataset(df_raw, drop_fpflags=True)
    df_engineered = create_advanced_features(df_clean)

    # Load the expected feature list from training
    with open(OUTPUT_FOLDER + "features.json", "r") as f:
        expected_features = json.load(f)
    # Align columns (important!)
    missing_cols = [c for c in expected_features if c not in df_engineered.columns]
    extra_cols = [c for c in df_engineered.columns if c not in expected_features]
    # Add missing columns as zeros and drop extras
    for c in missing_cols:
        df_engineered[c] = 0
    # Keep koi_disposition if it exists, drop all other extras
    cols_to_keep = expected_features.copy()
    if "koi_disposition" in df_engineered.columns:
        cols_to_keep.append("koi_disposition")  # preserve target only
    df_engineered = df_engineered[cols_to_keep]

    results = run_prediction(
        model_path=model_path,
        df_engineered=df_engineered,
        target_column=TARGET_COLUMN
    )

    print("\nReturned results:")
    print(results["decoded_predictions"][:5])
    print(results["metrics"])
    print(results["model_info"])
    print(results["row_results"][:3])


# input_row always needs to be trained by appending to existing data,
#  otherwise not enough data for cross validation

if __name__ == "__main__":
    warnings.filterwarnings("ignore", category=RuntimeWarning)
    warnings.filterwarnings("ignore", category=UserWarning)
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    input_rows = [
        {
            "rowid": 1,
            "kepid": 10797460,
            "kepoi_name": "K00752.01",
            "kepler_name": "Kepler-227 b",
            "koi_disposition": "CONFIRMED",
            "koi_pdisposition": "CANDIDATE",
            "koi_score": 1.0000,
            "koi_fpflag_nt": 0,
            "koi_fpflag_ss": 0,
            "koi_fpflag_co": 0,
            "koi_fpflag_ec": 0,
            "koi_period": 9.488035570,
            "koi_period_err1": 2.7750000e-05,
            "koi_period_err2": -2.7750000e-05,
            "koi_time0bk": 170.5387500,
            "koi_time0bk_err1": 2.160000e-03,
            "koi_time0bk_err2": -2.160000e-03,
            "koi_impact": 0.1460,
            "koi_impact_err1": 0.3180,
            "koi_impact_err2": -0.1460,
            "koi_duration": 2.95750,
            "koi_duration_err1": 0.08190,
            "koi_duration_err2": -0.08190,
            "koi_depth": 6.1580e+02,
            "koi_depth_err1": 1.950e+01,
            "koi_depth_err2": -1.950e+01,
            "koi_prad": 2.26,
            "koi_prad_err1": 2.600e-01,
            "koi_prad_err2": -1.500e-01,
            "koi_teq": 793.0,
            "koi_teq_err1": None,
            "koi_teq_err2": None,
            "koi_insol": 93.59,
            "koi_insol_err1": 29.45,
            "koi_insol_err2": -16.65,
            "koi_model_snr": 35.80,
            "koi_tce_plnt_num": 1,
            "koi_tce_delivname": "q1_q17_dr25_tce",
            "koi_steff": 5455.00,
            "koi_steff_err1": 81.00,
            "koi_steff_err2": -81.00,
            "koi_slogg": 4.467,
            "koi_slogg_err1": 0.064,
            "koi_slogg_err2": -0.096,
            "koi_srad": 0.9270,
            "koi_srad_err1": 0.1050,
            "koi_srad_err2": -0.0610,
            "ra": 291.934230,
            "dec": 48.141651,
            "koi_kepmag": 15.347
        }
    ]

    # TRAINING
    # multistep_pipeline(input_rows, drop_fpflags=True)
    # ensemble_pipeline(input_rows, class_weight_penalizing=True, drop_fpflags=True)
    # binary_categories_pipeline(input_rows, drop_fpflags=True)

    # PREDICTION
    predict(dataset_path=DATASET_PATH, input_rows=input_rows, model_path=OUTPUT_FOLDER + "stacking_model.pkl")

    warnings.filterwarnings("default", category=RuntimeWarning)
    warnings.filterwarnings("default", category=UserWarning)
