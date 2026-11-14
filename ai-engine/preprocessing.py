"""
Data Preprocessing and Combustion Physics Parameter Extraction Pipeline.
Handles missing values, invalid record detection, normalization, descriptive statistics,
and dimensionless number calculations (Gr, Ri, Fr, aspect ratio, flicker).
"""

import math
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from scipy import stats

try:
    from .schemas import DescriptiveStats
except (ImportError, ValueError):
    from schemas import DescriptiveStats


PHYSICAL_BOUNDS = {
    "peak_temperature_k": (300.0, 3500.0),
    "flame_length_mm": (0.1, 1000.0),
    "flame_width_mm": (0.1, 500.0),
    "gravity_g": (0.0, 100.0),
    "oxidizer_o2_mole_fraction": (0.0, 1.0),
    "radiative_loss_fraction": (0.0, 1.0),
    "soot_volume_fraction_ppm": (0.0, 500.0),
    "burning_rate_k_mm2_s": (0.0, 10.0),
    "flicker_frequency_hz": (0.0, 100.0)
}


class PreprocessingReport:
    """Summary of data preprocessing transformations and validation."""
    def __init__(self):
        self.initial_records: int = 0
        self.valid_records: int = 0
        self.invalid_records_dropped: int = 0
        self.invalid_reasons: List[str] = []
        self.imputed_fields: Dict[str, int] = {}
        self.extracted_features: List[str] = []
        self.descriptive_stats: Dict[str, DescriptiveStats] = {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "initial_records": self.initial_records,
            "valid_records": self.valid_records,
            "invalid_records_dropped": self.invalid_records_dropped,
            "invalid_reasons": self.invalid_reasons,
            "imputed_fields": self.imputed_fields,
            "extracted_features": self.extracted_features,
            "descriptive_stats": {
                k: v.model_dump() for k, v in self.descriptive_stats.items()
            }
        }


def detect_invalid_records(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Validate records against fundamental physical bounds.
    Returns cleaned dataframe and list of rejection diagnostic messages.
    """
    valid_mask = pd.Series(True, index=df.index)
    rejection_reasons = []

    for col, (min_val, max_val) in PHYSICAL_BOUNDS.items():
        if col in df.columns:
            col_series = pd.to_numeric(df[col], errors="coerce")
            invalid_indices = col_series[(col_series < min_val) | (col_series > max_val)].index
            if len(invalid_indices) > 0:
                for idx in invalid_indices:
                    val = col_series.loc[idx]
                    msg = f"Row {idx}: {col}={val} violates physical limits [{min_val}, {max_val}]"
                    rejection_reasons.append(msg)
                valid_mask &= (col_series >= min_val) & (col_series <= max_val)

    clean_df = df[valid_mask].copy()
    return clean_df, rejection_reasons


def handle_missing_values(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """
    Impute missing values using domain-specific combustion rules and robust statistical methods.
    """
    imputed_counts = {}
    df_imputed = df.copy()

    # Rule 1: Flicker frequency in microgravity (gravity_g < 0.001) is physically 0.0 Hz
    if "gravity_g" in df_imputed.columns and "flicker_frequency_hz" in df_imputed.columns:
        microg_mask = (df_imputed["gravity_g"] < 0.001) & df_imputed["flicker_frequency_hz"].isna()
        num_zeroed = microg_mask.sum()
        if num_zeroed > 0:
            df_imputed.loc[microg_mask, "flicker_frequency_hz"] = 0.0
            imputed_counts["flicker_frequency_hz_microg_zeroed"] = int(num_zeroed)

    # Rule 2: Compute aspect ratio from length and width if missing
    if "flame_length_mm" in df_imputed.columns and "flame_width_mm" in df_imputed.columns:
        if "aspect_ratio" not in df_imputed.columns:
            df_imputed["aspect_ratio"] = np.nan
        missing_ar = df_imputed["aspect_ratio"].isna() & df_imputed["flame_length_mm"].notna() & df_imputed["flame_width_mm"].notna()
        if missing_ar.sum() > 0:
            df_imputed.loc[missing_ar, "aspect_ratio"] = (
                df_imputed.loc[missing_ar, "flame_length_mm"] / df_imputed.loc[missing_ar, "flame_width_mm"]
            )
            imputed_counts["aspect_ratio_computed"] = int(missing_ar.sum())

    # Rule 3: Numeric median imputation for any remaining numerical missing data
    numeric_cols = df_imputed.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        num_missing = df_imputed[col].isna().sum()
        if num_missing > 0:
            median_val = df_imputed[col].median()
            if pd.isna(median_val):
                median_val = 0.0
            df_imputed[col] = df_imputed[col].fillna(median_val)
            imputed_counts[col] = int(num_missing)

    return df_imputed, imputed_counts


def compute_combustion_physics_parameters(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Calculate dimensionless combustion parameters:
    Aspect ratio, Grashof (Gr), Richardson (Ri), Froude (Fr), and theoretical flicker.
    """
    df_calc = df.copy()
    extracted = []

    # Aspect Ratio
    if "flame_length_mm" in df_calc.columns and "flame_width_mm" in df_calc.columns:
        df_calc["aspect_ratio"] = df_calc["flame_length_mm"] / np.maximum(df_calc["flame_width_mm"], 1e-4)
        # Spherical symmetry index: absolute deviation from unity (1.0 = sphere)
        df_calc["spherical_symmetry_index"] = np.abs(df_calc["aspect_ratio"] - 1.0)
        extracted.extend(["aspect_ratio", "spherical_symmetry_index"])

    # Physical constants for air at ~1000 K film temp
    T_inf = 298.15  # K
    beta = 1.0 / T_inf  # 1/K

    # Grashof Number and Richardson Number
    if "gravity_g" in df_calc.columns and "peak_temperature_k" in df_calc.columns:
        g_accel = df_calc["gravity_g"] * 9.80665  # m/s^2
        delta_T = np.maximum(df_calc["peak_temperature_k"] - T_inf, 0.0)
        
        # Characteristic length in meters (default to burner/flame width or 0.01 m)
        if "flame_width_mm" in df_calc.columns:
            L_char = (df_calc["flame_width_mm"] / 1000.0).clip(lower=0.001)
        else:
            L_char = 0.01

        # Temperature-dependent kinematic viscosity: nu_air(T_film) ~ 1.5e-5 * (T_film / 300)^1.7
        T_film = (df_calc["peak_temperature_k"] + T_inf) / 2.0
        nu_air = 1.5e-5 * (T_film / 300.0) ** 1.7  # m^2/s

        Gr = (g_accel * beta * delta_T * (L_char ** 3)) / (nu_air ** 2)
        df_calc["grashof_number"] = Gr
        extracted.append("grashof_number")

        # Characteristic velocity (from coflow or buoyant velocity)
        if "coflow_velocity_cm_s" in df_calc.columns:
            u_flow = (df_calc["coflow_velocity_cm_s"] / 100.0).clip(lower=0.01)
        else:
            u_flow = 0.15  # standard quiescent/low-speed assumption

        # Richardson number: Ri = Gr / Re^2 = g * beta * delta_T * L / u^2
        Ri = (g_accel * beta * delta_T * L_char) / (u_flow ** 2)
        df_calc["richardson_number"] = Ri
        extracted.append("richardson_number")

        # Froude number: Fr = u^2 / (g * L) (avoid div by zero when g->0)
        Fr = np.where(g_accel > 1e-4, (u_flow ** 2) / (g_accel * L_char), 1e6)
        df_calc["froude_number"] = Fr
        extracted.append("froude_number")

    # Estimated Flicker frequency in 1g vs microgravity
    if "flicker_frequency_hz" not in df_calc.columns and "gravity_g" in df_calc.columns:
        if "flame_width_mm" in df_calc.columns:
            D_m = (df_calc["flame_width_mm"] / 1000.0).clip(lower=0.002)
            # Hamins et al. formula: f ~ 1.5 / sqrt(D) in 1g, 0.0 in microgravity
            calc_flicker = np.where(df_calc["gravity_g"] >= 0.01, 1.5 / np.sqrt(D_m), 0.0)
            df_calc["flicker_frequency_hz"] = calc_flicker
            extracted.append("flicker_frequency_hz")

    return df_calc, extracted


def calculate_descriptive_statistics(df: pd.DataFrame) -> Dict[str, DescriptiveStats]:
    """Calculate summary statistics including mean, std, median, IQR, and SNR."""
    stats_dict = {}
    numeric_cols = df.select_dtypes(include=[np.number]).columns

    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) == 0:
            continue
        
        mean_val = float(series.mean())
        std_val = float(series.std(ddof=1)) if len(series) > 1 else 0.0
        median_val = float(series.median())
        min_val = float(series.min())
        max_val = float(series.max())
        q75, q25 = np.percentile(series, [75, 25])
        iqr_val = float(q75 - q25)
        
        # Signal to noise ratio (dB)
        snr_db = None
        if std_val > 1e-6 and abs(mean_val) > 1e-6:
            snr_db = float(20.0 * np.log10(abs(mean_val) / std_val))

        stats_dict[col] = DescriptiveStats(
            mean=round(mean_val, 4),
            std=round(std_val, 4),
            median=round(median_val, 4),
            min_val=round(min_val, 4),
            max_val=round(max_val, 4),
            iqr=round(iqr_val, 4),
            snr_db=round(snr_db, 2) if snr_db is not None else None
        )

    return stats_dict


def normalize_features(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None,
    method: str = "minmax"
) -> pd.DataFrame:
    """Normalize specified columns using minmax or standard scaling."""
    df_norm = df.copy()
    target_cols = columns or df_norm.select_dtypes(include=[np.number]).columns

    for col in target_cols:
        if col not in df_norm.columns:
            continue
        col_vals = df_norm[col].values
        if method == "minmax":
            c_min, c_max = np.min(col_vals), np.max(col_vals)
            if c_max > c_min:
                df_norm[f"{col}_norm"] = (col_vals - c_min) / (c_max - c_min)
            else:
                df_norm[f"{col}_norm"] = 0.0
        elif method == "zscore":
            mean_v, std_v = np.mean(col_vals), np.std(col_vals)
            if std_v > 1e-6:
                df_norm[f"{col}_norm"] = (col_vals - mean_v) / std_v
            else:
                df_norm[f"{col}_norm"] = 0.0

    return df_norm


def preprocess_data(
    df: pd.DataFrame,
    normalize: bool = False,
    norm_method: str = "minmax"
) -> Tuple[pd.DataFrame, PreprocessingReport]:
    """
    Complete end-to-end preprocessing pipeline for combustion analysis.
    
    Returns:
    --------
    Tuple[pd.DataFrame, PreprocessingReport]
    """
    report = PreprocessingReport()
    report.initial_records = len(df)

    # 1. Detect and filter physically invalid records
    cleaned_df, drop_reasons = detect_invalid_records(df)
    report.valid_records = len(cleaned_df)
    report.invalid_records_dropped = report.initial_records - report.valid_records
    report.invalid_reasons = drop_reasons

    if cleaned_df.empty:
        return cleaned_df, report

    # 2. Impute missing values with domain rules
    imputed_df, imputed_counts = handle_missing_values(cleaned_df)
    report.imputed_fields = imputed_counts

    # 3. Compute derived combustion physics parameters
    featured_df, extracted_features = compute_combustion_physics_parameters(imputed_df)
    report.extracted_features = extracted_features

    # 4. Compute descriptive statistics
    report.descriptive_stats = calculate_descriptive_statistics(featured_df)

    # 5. Optional normalization
    if normalize:
        featured_df = normalize_features(featured_df, method=norm_method)

    return featured_df, report
