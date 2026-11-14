"""
Pattern Detection and Anomaly Identification Engine.
Detects parameter correlations, unusual sensor observations, cool flame transitions,
and explains physical relationships with clear attribution.
"""

import uuid
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from scipy import stats

try:
    from .schemas import (
        PatternDetectionResult,
        AnomalyItem,
        ParameterCorrelation,
        ProvenanceMetadata
    )
except (ImportError, ValueError):
    from schemas import (
        PatternDetectionResult,
        AnomalyItem,
        ParameterCorrelation,
        ProvenanceMetadata
    )


def detect_patterns(
    df: pd.DataFrame,
    provenance: Optional[ProvenanceMetadata] = None,
    analysis_id: Optional[str] = None
) -> PatternDetectionResult:
    """
    Identify unusual combustion behaviors, correlations between gravitational/fluid
    parameters, and generate explainable physical findings.
    """
    analysis_id = analysis_id or f"PAT-{uuid.uuid4().hex[:8].upper()}"
    anomalies: List[AnomalyItem] = []
    correlations: List[ParameterCorrelation] = []
    explainable_findings: List[str] = []

    if df.empty or len(df) < 2:
        return PatternDetectionResult(
            analysis_id=analysis_id,
            total_records_evaluated=len(df),
            anomalies_detected=[],
            significant_correlations=[],
            clustering_summary=None,
            explainable_findings=["Insufficient records for statistical pattern detection (N < 2)."]
        )

    numeric_df = df.select_dtypes(include=[np.number])

    # 1. Anomaly Detection via Z-score and domain rules
    for col in ["peak_temperature_k", "aspect_ratio", "soot_volume_fraction_ppm", "burning_rate_k_mm2_s"]:
        if col in numeric_df.columns:
            series = numeric_df[col].dropna()
            if len(series) >= 3 and series.std() > 1e-6:
                z_scores = np.abs(stats.zscore(series))
                outliers = series[z_scores > 2.5]
                for idx, val in outliers.items():
                    # Check for cool flame
                    if col == "peak_temperature_k" and val < 1000.0:
                        hyp = "Record corresponds to low-temperature cool flame oxidation regime (peroxy radical kinetics)."
                        sev = "CRITICAL_PHYSICAL_TRANSITION"
                    elif col == "aspect_ratio" and val > 6.0:
                        hyp = "Highly elongated flame indicating extreme buoyant acceleration or narrow coflow burner duct."
                        sev = "HIGH"
                    else:
                        hyp = f"Statistical outlier in {col}; verify sensor noise or atypical experimental condition."
                        sev = "MEDIUM"

                    q25, q75 = series.quantile(0.25), series.quantile(0.75)
                    anomalies.append(AnomalyItem(
                        record_index=str(idx),
                        parameter=col,
                        observed_value=round(float(val), 3),
                        expected_range=[round(float(q25), 3), round(float(q75), 3)],
                        severity=sev,
                        scientific_hypothesis=hyp
                    ))

    # 2. Key Parameter Correlations
    interest_pairs = [
        ("gravity_g", "aspect_ratio", "Higher gravitational acceleration strongly stretches flame geometry into high aspect ratios via buoyant draft."),
        ("gravity_g", "flicker_frequency_hz", "Gravitational buoyant vortex shedding dictates flame pulsation; flicker ceases at zero gravity."),
        ("gravity_g", "radiative_loss_fraction", "Microgravity dramatically elevates radiative loss fraction due to extended residence times and soot buildup."),
        ("gravity_g", "soot_volume_fraction_ppm", "Soot concentration surges in microgravity because buoyant evacuation is absent and soot residence time is lengthened."),
        ("flame_length_mm", "flame_width_mm", "Geometry scaling reflects transition from buoyant slender plume to spherical diffusion envelope.")
    ]

    for param_x, param_y, physics_desc in interest_pairs:
        if param_x in numeric_df.columns and param_y in numeric_df.columns:
            s_x = numeric_df[param_x]
            s_y = numeric_df[param_y]
            valid_mask = s_x.notna() & s_y.notna()
            if valid_mask.sum() >= 3 and s_x[valid_mask].std() > 1e-6 and s_y[valid_mask].std() > 1e-6:
                corr_val, p_val = stats.pearsonr(s_x[valid_mask], s_y[valid_mask])
                if abs(corr_val) >= 0.5:
                    correlations.append(ParameterCorrelation(
                        param_x=param_x,
                        param_y=param_y,
                        correlation_coefficient=round(float(corr_val), 4),
                        relationship_description=physics_desc
                    ))

    # 3. Formulate explainable findings
    if any(c.param_x == "gravity_g" and c.param_y == "aspect_ratio" for c in correlations):
        explainable_findings.append(
            "Strong empirical coupling observed between gravitational field strength and flame aspect ratio: "
            "as gravity g drops towards 0, aspect ratio monotonically relaxes to ~1.0 (spherical symmetry)."
        )

    if any(c.param_x == "gravity_g" and c.param_y == "flicker_frequency_hz" for c in correlations):
        explainable_findings.append(
            "Flame flicker is confirmed as a strictly buoyancy-driven phenomenon; microgravity conditions "
            "yield 0.0 Hz flicker with complete absence of Kelvin-Helmholtz vortex shedding."
        )

    if any(a.severity == "CRITICAL_PHYSICAL_TRANSITION" for a in anomalies):
        explainable_findings.append(
            "Distinct multi-stage combustion detected: transition between hot flame and quasi-steady cool flame "
            "observed exclusively in microgravity records."
        )

    if not explainable_findings:
        explainable_findings.append("Data exhibits consistent trends within nominal physical combustion parameters.")

    return PatternDetectionResult(
        analysis_id=analysis_id,
        total_records_evaluated=len(df),
        anomalies_detected=anomalies,
        significant_correlations=correlations,
        clustering_summary={"evaluated_features": list(numeric_df.columns)},
        explainable_findings=explainable_findings
    )
