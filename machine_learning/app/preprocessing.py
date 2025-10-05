import pandas as pd


def clean_koi_dataset(df: pd.DataFrame, drop_fpflags: bool = True) -> pd.DataFrame:
    """
    Clean and preprocess the NASA Kepler KOI dataset.

    Args:
        df (pd.DataFrame):
            Raw dataset containing KOI features and the 'koi_disposition' target column.
        drop_fpflags (bool, optional):
            If True, drop the four false-positive flag columns
            ('koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co', 'koi_fpflag_ec').
            If False, keep them and fill missing values with 0. Defaults to True.

    Returns:
        pd.DataFrame: Cleaned DataFrame with identifier and leakage columns removed,
              missing values replaced, and ready for feature engineering.

    Notes:
        Steps performed:
            1. Drop known identifier and target-leaky columns.
            2. Replace numeric columns with median values (robust to outliers).
            3. Remove rows if category is missing.
            4. Encode target labels ('koi_disposition') into numeric form.

        Columns dropped (if present):
            - 'rowid', 'kepid', 'kepoi_name', 'kepler_name'
            - 'koi_pdisposition', 'koi_score', 'koi_tce_delivname'
            - 'koi_teq_err1', 'koi_teq_err2'
            - 'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co', 'koi_fpflag_ec'
    """
    print("\n" + "=" * 60)
    print("PREPROCESSING")
    print("=" * 60)
    print("STEP 1: Removing identifier and leakage columns")

    drop_cols = [
        'rowid',  # identifier
        'kepid',  # identifier
        'kepoi_name',  # identifier
        'kepler_name',  # official confirmed planet name -> leakage
        'koi_pdisposition',  # preliminary disposition -> leakage
        'koi_score',  # internal assessment -> leakage
        'koi_tce_delivname',  # data delivery batch name
        'koi_teq_err1',  # empty column
        'koi_teq_err2'  # empty column
    ]
    # Handle false-positive flags (which leads to leakage) based on parameter
    zero_fill_cols = ["koi_fpflag_nt", "koi_fpflag_ss", "koi_fpflag_co", "koi_fpflag_ec"]
    if drop_fpflags:
        drop_cols.extend(zero_fill_cols)
        print("Dropping false-positive flag columns (leakage).")
    else:
        print("Keeping false-positive flag columns — will fill missing values with 0.")

    cols_to_drop = [c for c in drop_cols if c in df.columns]
    df = df.drop(columns=cols_to_drop)
    print(f"Dropped {len(cols_to_drop)} columns: {cols_to_drop}\n")

    # --- Fill numeric columns ---
    print("=" * 60)
    print("STEP 2: Handling missing numeric values with median")

    # Fill with 0 for kept fpflag columns
    if not drop_fpflags:
        for col in zero_fill_cols:
            if col in df.columns:
                missing_before = df[col].isnull().sum()
                df[col] = df[col].fillna(0)
                print(f"  {col}: filled {missing_before} NaN(s) with 0")

    # Median fill for all other numeric columns
    num_cols = df.select_dtypes(include=["float64", "int64"]).columns
    print(f"\nHandling numeric columns with median values:")

    counter = 0
    for i, col in enumerate(num_cols, start=1):
        missing_before = df[col].isnull().sum()
        if missing_before == 0:
            continue
        counter += 1
        median_val = df[col].median()
        # df[col].fillna(median_val, inplace=True)
        df[col] = df[col].fillna(df[col].median())

        remaining = df[col].isnull().sum()
        if remaining > 0:
            print(
                f"  [{counter}] ⚠️ {col}: "
                f"{missing_before} NaN(s) → {remaining} still remain after fill."
            )
        else:
            print(
                f"  [{counter}] {col}: "
                f"filled {missing_before} NaN(s) with median={median_val:.4f}"
            )

    # --- Fill categorical columns ---
    print("=" * 60)
    cat_cols = df.select_dtypes(include=["object"]).columns
    print(f"\nSTEP 3: Removing rows with missing categorical values "
          f"(total categorical columns: {len(cat_cols)})")
    for i, col in enumerate(cat_cols, start=1):
        missing_count = df[col].isnull().sum()
        if missing_count > 0:
            before = len(df)
            df = df.dropna(subset=[col])
            after = len(df)
            removed = before - after
            print(f"  [{i}/{len(cat_cols)}] {col}: removed {removed} rows with missing values.")
        else:
            print(f"  [{i}/{len(cat_cols)}] {col}: no missing values found.")
    print(f"After removing rows with missing categorical values: {len(df)} rows remain.")

    # # --- Encode target ---
    # if "koi_disposition" not in df.columns:
    #     raise KeyError("Target column 'koi_disposition' not found in dataset.")
    #
    # print("=" * 60)
    # print("STEP 4: Encoding target labels")
    #
    # le_target = LabelEncoder()
    # le_target.fit_transform(df["koi_disposition"])
    #
    # print(f"Encoded target classes: {list(le_target.classes_)}")
    # print(f"Class counts: {df['koi_disposition'].value_counts().to_dict()}")
    # print("=" * 60)
    print("✅ Data cleaning complete!\n")

    return df.copy()
