import numpy as np
import pandas as pd


def create_advanced_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Perform feature engineering on Kepler KOI data.

    Args:
        df (pd.DataFrame):
            Cleaned KOI dataset.

    Returns:
        pd.DataFrame:
            DataFrame with original + engineered features.

    Features created
    ----------------
    • Ratios & interaction terms:
        - period_radius_ratio, period_prad_product
        - depth_duration_ratio, prad_srad_ratio, prad_srad_ratio_squared
        - detectability, snr_per_depth
    • Polynomial transforms:
        - log, sqrt, squared versions of key continuous variables
    • Stellar and orbital descriptors:
        - stellar_class, temp_ratio, estimated_distance,
          insolation_distance_check, impact_centrality,
          is_grazing_transit, is_multiplanet, planet_position_log
    • Quality and geometric measures:
        - total_uncertainty, duration_fraction, is_long_transit, transit_duration_ratio, log_snr
    • Error measures:
        - period_relative_error, depth_relative_error
    """

    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING: Creating derived and astrophysical features")
    print("=" * 60)

    df_eng = df.copy()
    added_features = []

    # --- 1. Astronomical ratios & interactions ---
    if {"koi_period", "koi_prad"} <= set(df.columns):
        # Period/Radius ratio (captures density hints)
        df_eng["period_radius_ratio"] = np.log1p(df_eng["koi_period"]) / (
                np.log1p(df_eng["koi_prad"]) + 1e-8
        )
        # Period × Radius product (system scale)
        df_eng["period_prad_product"] = df_eng["koi_period"] * df_eng["koi_prad"]
        added_features += ["period_radius_ratio", "period_prad_product"]

    # --- 2. Polynomial/log features for key continuous variables ---
    key_features = ["koi_period", "koi_prad", "koi_depth"]
    for feat in key_features:
        if feat in df.columns:
            v = pd.to_numeric(df_eng[feat], errors="coerce").fillna(0)
            df_eng[f"{feat}_log"] = np.log1p(np.abs(v))  # Log: compress large values
            df_eng[f"{feat}_sqrt"] = np.sqrt(np.abs(v))  # Sqrt: less aggressive compression
            df_eng[f"{feat}_squared"] = v ** 2  # Square: capture non-linearity
            added_features += [f"{feat}_log", f"{feat}_sqrt", f"{feat}_squared"]

    # --- 3. Transit shape indicator ---
    if {"koi_depth", "koi_duration"} <= set(df.columns):
        # Shallow + long = grazing transit (low impact parameter)
        # Deep + short = central transit (high impact parameter)
        df_eng["depth_duration_ratio"] = df_eng["koi_depth"] / (
                df_eng["koi_duration"] + 1e-8
        )
        added_features.append("depth_duration_ratio")

    # --- 4. Impact parameter features ---
    if "koi_impact" in df.columns:
        # impact near 0 or 1 are more suspicious
        df_eng["impact_centrality"] = 1 - np.abs(df_eng["koi_impact"])
        df_eng["is_grazing_transit"] = (df_eng["koi_impact"] > 0.7).astype(int)
        added_features += ["impact_centrality", "is_grazing_transit"]

    # --- 5. Planet-to-star radius ratio ---
    if {"koi_prad", "koi_srad"} <= set(df.columns):
        df_eng["prad_srad_ratio"] = df_eng["koi_prad"] / (df_eng["koi_srad"] + 1e-8)
        df_eng["prad_srad_ratio_squared"] = df_eng["prad_srad_ratio"] ** 2
        added_features += ["prad_srad_ratio", "prad_srad_ratio_squared"]

        # Todo: this should correlate with koi_depth
        # If inconsistent → possible false positive

    # --- 6. Stellar classification & temperature ratio ---
    # Hot stars vs cool stars have different characteristics
    if "koi_steff" in df.columns:
        def classify_star(temp):
            if temp < 3500:
                return 0  # M dwarf (red)
            elif temp < 5200:
                return 1  # K dwarf (orange)
            elif temp < 6000:
                return 2  # G dwarf (yellow, like Sun)
            elif temp < 7500:
                return 3  # F dwarf (white)
            return 4  # A dwarf (hot blue-white)

        df_eng["stellar_class"] = df_eng["koi_steff"].apply(classify_star)
        added_features.append("stellar_class")

        if "koi_teq" in df.columns:
            # planet equilibrium temp / stellar temp
            df_eng["temp_ratio"] = df_eng["koi_teq"] / (df_eng["koi_steff"] + 1e-8)
            added_features.append("temp_ratio")

    # --- 7. Estimated orbital distance and insolation consistency ---
    # Can estimate distance from period and stellar mass
    if {"koi_period", "koi_srad"} <= set(df.columns):
        # Approximate semi-major axis (AU) using period and star radius as mass proxy
        # a ≈ (period²)^(1/3) for solar-mass stars
        df_eng["estimated_distance"] = np.cbrt(df_eng["koi_period"] ** 2)
        added_features.append("estimated_distance")

        if "koi_insol" in df.columns:
            # Cross-check with insolation, insolation should scale as 1/distance²
            df_eng["insolation_distance_check"] = (
                    df_eng["koi_insol"] * df_eng["estimated_distance"] ** 2
            )
            added_features.append("insolation_distance_check")

    # --- 8. Detectability score ---
    # Larger, closer planets are easier to detect
    if {"koi_prad", "koi_period"} <= set(df.columns):
        df_eng["detectability"] = df_eng["koi_prad"] / np.log1p(df_eng["koi_period"])
        added_features.append("detectability")

    # --- 9. SNR consistency with physical parameters ---
    if {"koi_model_snr", "koi_depth"} <= set(df.columns):
        # High depth should correlate with high SNR
        # If SNR is low despite high depth → suspicious
        df_eng["snr_per_depth"] = df_eng["koi_model_snr"] / (
                df_eng["koi_depth"] + 1e-8
        )
        added_features.append("snr_per_depth")

    # --- 10. Measurement uncertainty features ---
    # Combine all error terms into quality scores
    error_cols = [c for c in df.columns if "err1" in c or "err2" in c]
    if error_cols:
        # Overall measurement precision (smaller = better)
        df_eng["total_uncertainty"] = df[error_cols].abs().sum(axis=1)
        added_features.append("total_uncertainty")

        # Relative errors for key parameters
        if {"koi_period_err1", "koi_period_err2", "koi_period"} <= set(df.columns):
            df_eng["period_relative_error"] = (
                                                      df_eng["koi_period_err1"].abs() + df_eng["koi_period_err2"].abs()
                                              ) / (df_eng["koi_period"] + 1e-8)
            added_features.append("period_relative_error")

        if {"koi_depth_err1", "koi_depth_err2", "koi_depth"} <= set(df.columns):
            df_eng["depth_relative_error"] = (
                                                     df_eng["koi_depth_err1"].abs() + df_eng["koi_depth_err2"].abs()
                                             ) / (df_eng["koi_depth"] + 1e-8)
            added_features.append("depth_relative_error")

    # --- 11. Transit duration & geometry ---
    # Transit duration should be consistent with period and geometry
    if {"koi_duration", "koi_period"} <= set(df.columns):
        # Duration as fraction of period
        df_eng["duration_fraction"] = df_eng["koi_duration"] / (
                df_eng["koi_period"] * 24 + 1e-8
        )
        # Long transit relative to period is unusual
        df_eng["is_long_transit"] = (df_eng["duration_fraction"] > 0.15).astype(int)
        df_eng["transit_duration_ratio"] = df_eng["koi_duration"] / (
                df_eng["koi_period"] * 24 + 1e-8
        )
        added_features += [
            "duration_fraction",
            "is_long_transit",
            "transit_duration_ratio",
        ]

    # --- 12. Multi-planet system indicators ---
    if "koi_tce_plnt_num" in df.columns:
        # Enhance the planet number feature
        df_eng["is_multiplanet"] = (df_eng["koi_tce_plnt_num"] > 1).astype(int)
        # Planet position (inner vs outer)
        df_eng["planet_position_log"] = np.log1p(df_eng["koi_tce_plnt_num"])
        added_features += ["is_multiplanet", "planet_position_log"]

    # --- 13. Log of SNR (normalization) ---
    if "koi_model_snr" in df.columns:
        df_eng["log_snr"] = np.log1p(df_eng["koi_model_snr"])
        added_features.append("log_snr")

    print(f"✅ Feature engineering complete. Added {len(added_features)} new features.")
    print(f"Total features before engineering: {df.shape[1] - 1}")  # -1 for category column
    print(f"Total features after engineering: {df_eng.shape[1] - 1}")  # -1 for category column
    print(f"New features:\n  {', '.join(added_features)}\n")

    return df_eng
