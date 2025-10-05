import json
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.preprocessing import LabelEncoder


def prepare_data_for_training(
        df_engineered: pd.DataFrame,
        df_original: pd.DataFrame,
        target_column: str = "koi_disposition",
        n_splits: int = 5,
        save_columns_path: str = "features.json"
) -> Tuple[pd.DataFrame, np.ndarray, np.ndarray, StratifiedGroupKFold, pd.DataFrame, LabelEncoder]:
    """
    Split engineered KOI dataset into features, target, and groups for cross-validation.
    Also encodes target labels and ensures matching row alignment with original dataset.

    Args:
        df_engineered (pd.DataFrame):
            DataFrame after feature engineering.
        df_original (pd.DataFrame):
            DataFrame after feature engineering.
        target_column (str, optional):
            Target column name. Defaults to 'koi_disposition'.
        n_splits (int, optional):
            Number of CV splits for StratifiedGroupKFold. Defaults to 5.
        save_columns_path (str, optional):
            Path to save JSON list of feature column names.

    Returns:
        Tuple[pd.DataFrame, np.ndarray, np.ndarray, StratifiedGroupKFold, pd.DataFrame, LabelEncoder]:
            (X, y_encoded, groups, cv, df_engineered, label_encoder)
    """

    print("\n" + "=" * 60)
    print("DATA SPLITTING & SCALING")
    print("=" * 60)

    # 1. Separate features and target
    if target_column not in df_engineered.columns:
        raise KeyError(f"Target column '{target_column}' not found in dataset.")

    X = df_engineered.drop(columns=[target_column])
    y = df_engineered[target_column]

    # 2. Encode target labels
    le_target = LabelEncoder()
    y_encoded = le_target.fit_transform(y.astype(str))

    print(f"\n✅ Dataset shape: {X.shape}")
    print(f"🎯 Target classes: {list(le_target.classes_)}")
    print("📊 Class distribution:")
    for cls, count in zip(le_target.classes_, np.bincount(y_encoded)):
        print(f"  - {cls}: {count}")

    # 3. original dataset to get grouping IDs (kepid)
    if "kepid" not in df_original.columns:
        raise KeyError("Column 'kepid' not found in original dataset.")

    missing_kepid = df_original["kepid"].isnull().sum()
    df_original = df_original.dropna(subset=["kepid"]).reset_index(drop=True)
    print(f"\n🔍 Missing 'kepid' values in raw dataset: {missing_kepid}")
    print(f"✅ Valid KOIs remaining: {len(df_original)}")

    # 4. Align indices
    if len(df_engineered) != len(df_original):
        diff = len(df_engineered) - len(df_original)
        if diff > 0:
            print(f"⚠️ Detected {diff} appended input row(s); assigning temporary kepid(s).")  # <<< CHANGED
            max_kepid = int(df_original["kepid"].max())
            new_ids = np.arange(max_kepid + 1, max_kepid + diff + 1)
            df_extra = df_engineered.iloc[-diff:].copy()
            df_extra["kepid"] = new_ids
            df_original = pd.concat([df_original, df_extra[["kepid"]]], ignore_index=True)
        else:
            raise Exception(
                f"⚠️ Unexpected mismatch detected: df_engineered({len(df_engineered)}) < df_original({len(df_original)})")
    groups = df_original["kepid"].astype(int).values

    # Sanity check
    if len(X) != len(groups):
        raise ValueError("Row mismatch between engineered features and group identifiers (kepid).")

    unique_stars = len(np.unique(groups))
    print(f"\n🧩 Using StratifiedGroupKFold CV with {n_splits} splits")
    print(f"  Total KOIs: {len(X)}")
    print(f"  Unique stars (kepid): {unique_stars}")
    print(f"  Avg KOIs per star: {len(X) / unique_stars:.2f}")
    print("  → Ensures all planets from the same star remain in one fold.")

    cv = StratifiedGroupKFold(n_splits=n_splits, shuffle=True, random_state=42)

    # 5. Save feature column list for inference
    train_columns = X.columns.tolist()
    with open(save_columns_path, "w") as f:
        json.dump(train_columns, f)
        print(f"\n💾 Saved {len(train_columns)} feature names → {save_columns_path}")
        print("✅ Data ready for model training.\n")

    return X, y_encoded, groups, cv, df_engineered, le_target
