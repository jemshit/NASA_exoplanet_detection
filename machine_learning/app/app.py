from data_loading import load_koi_dataset
from data_splitting import prepare_data_for_training
from feature_extraction import create_advanced_features
from plotting import analyze_feature_importance
from preprocessing import clean_koi_dataset
from threshold_optimization import optimize_class_thresholds
from training_binary import train_binary_planet_model
from training_ensemble import train_ensemble_models
from training_multistep import train_multistep_nn_xgb
from training_stacking_ensemble import train_stacking_ensemble
from xgboost_tuning import tune_xgboost_hyperparameters

DATASET_PATH = "../dataset/kepler_koi.csv"
N_SPLITS = 5
TARGET_COLUMN = "koi_disposition"
OUTPUT_FOLDER = "../outputs/"


def ensemble_pipeline(class_weight_penalizing: bool, drop_fpflags: bool = True):
    df_raw = load_koi_dataset(path=DATASET_PATH, sep=",", target_column=TARGET_COLUMN)
    df_clean = clean_koi_dataset(df_raw, drop_fpflags=drop_fpflags)
    df_engineered = create_advanced_features(df_clean)
    X, y_encoded, groups, cv, df_engineered, le_target = prepare_data_for_training(
        df_engineered=df_engineered,
        dataset_path=DATASET_PATH,
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
    threshold_configs = optimize_class_thresholds(
        y_true=y_encoded,
        y_proba=cv_results['XGBoost']["oof_proba"],
        class_labels=list(le_target.classes_),
        conf_min_recall=0.8,
        cand_range=(0.30, 0.40, 0.02),
        conf_range=(0.45, 0.60, 0.05),
        fp_range=(0.65, 0.75, 0.05),
        save_path=OUTPUT_FOLDER + "threshold_configs.json"
    )

    best_model_tuned, best_params, tuning_results = tune_xgboost_hyperparameters(
        X_data=X,
        y_encoded=y_encoded,
        groups=groups,
        cv=cv
    )

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


def binary_categories_pipeline(drop_fpflags: bool = True):
    df_raw = load_koi_dataset(path=DATASET_PATH, sep=",", target_column=TARGET_COLUMN)
    df_clean = clean_koi_dataset(df_raw, drop_fpflags=drop_fpflags)
    df_engineered = create_advanced_features(df_clean)
    X, y_encoded, groups, cv, df_engineered, le_target = prepare_data_for_training(
        df_engineered=df_engineered,
        dataset_path=DATASET_PATH,
        target_column=TARGET_COLUMN,
        n_splits=N_SPLITS,
        save_columns_path=OUTPUT_FOLDER + "features.json"
    )
    cv_results, models, trained_models, best_model_metrics_summary, le_target = train_binary_planet_model(
        df_engineered=df_engineered,
        groups=groups,
        cv=cv,
        target_column=TARGET_COLUMN
    )
    top_features = analyze_feature_importance(
        model=trained_models["XGBoost"],
        X_scaled=X,
        top_n=25,
        model_label="XGBoost (Full Data)",
        plot=False
    )


def multistep_pipeline(drop_fpflags: bool = True):
    df_raw = load_koi_dataset(path=DATASET_PATH, sep=",", target_column=TARGET_COLUMN)
    df_clean = clean_koi_dataset(df_raw, drop_fpflags=drop_fpflags)
    df_engineered = create_advanced_features(df_clean)
    X, y_encoded, groups, cv, df_engineered, le_target = prepare_data_for_training(
        df_engineered=df_engineered,
        dataset_path=DATASET_PATH,
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

    # top_features = analyze_feature_importance(
    #     model=trained_models["Stage2_XGB"],
    #     X_scaled=X,
    #     top_n=25,
    #     model_label="XGBoost (Full Data)",
    #     plot=False
    # )


if __name__ == "__main__":
    # binary_categories_pipeline(drop_fpflags=True)
    # ensemble_pipeline(class_weight_penalizing=True, drop_fpflags=True)
    multistep_pipeline(drop_fpflags=True)
