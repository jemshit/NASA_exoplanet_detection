import pandas as pd


def load_koi_dataset(
        path: str,
        sep: str = ",",
        target_column: str = "koi_disposition",
        verbose: bool = True
) -> pd.DataFrame:
    """
    Load the Kepler KOI dataset and print dataset diagnostics.

    Args:
        path (str): Path to the CSV file containing the dataset.
        sep (str): Field delimiter in the file. Defaults to ",".
        target_column (str): category
        verbose (bool): Prints logs or not. Defaults to True.

    Returns:
        pd.DataFrame: The loaded dataset.

    Prints:
        - Dataset shape
        - Column list (limited to 40)
        - Missing value summary (top 10)
        - 'koi_disposition' class distribution
    """
    if verbose:
        print("\n" + "=" * 60)
        print("DATA LOADING")
        print("=" * 60)

    df = pd.read_csv(path, sep=sep)

    # Basic info
    if verbose:
        print(f"✅ Dataset loaded from: {path}")
        print(f"📦 Shape: {df.shape[0]:,} rows × {df.shape[1]:,} columns")
        # 9,566 rows × 50 columns

    # Optional: only print column names if small enough
    if verbose:
        if len(df.columns) <= 40:
            print(f"🧭 Columns:\n{df.columns.tolist()}")
        else:
            print(f"🧭 Columns: {len(df.columns)} total "
                  f"(showing first 10)\n{df.columns[:10].tolist()} ...")

    # Missing values
    missing = df.isnull().sum().sort_values(ascending=False)
    top_missing = missing.head(10)
    if verbose:
        print(f"🚨 Top 10 columns with missing values:\n{top_missing[top_missing > 0]}")
        #   'koi_teq_err1' and 'koi_teq_err2' are totally empty
        #   'koi_score' 1512/9566
        #   rest is ~470/9566
    if top_missing.max() == 0 and verbose:
        print("✅ No missing values detected.")

    # Target distribution
    if verbose:
        if target_column in df.columns:
            print(f"🎯 Target variable distribution ('{target_column}'):")
            print(df[target_column].value_counts())
        else:
            print(f"⚠️ Warning: '{target_column}' column not found.")
        #   FALSE POSITIVE    5023
        #   CONFIRMED         2293
        #   CANDIDATE         2248

    return df
