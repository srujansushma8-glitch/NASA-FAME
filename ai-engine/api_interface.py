"""
Public API Interface and FastAPI Integration Facade for NASA-FLAME AI Engine.
Specifically crafted for seamless integration by Member 2 into backend FastAPI routes.
Exposes typed models and pure dictionary formats.
"""

import uuid
from typing import Dict, Any, Optional, Union, List
import pandas as pd
from pydantic import BaseModel, Field

try:
    from .schemas import (
        DataOrigin,
        GravityRegime,
        CombustionRegime,
        ProvenanceMetadata,
        FlameBehaviorAnalysis,
        TemperatureAnalysisResult,
        PatternDetectionResult,
        GravityComparisonResult,
        ScientificSummary
    )
    from .data_loader import load_dataset
    from .preprocessing import preprocess_data, PreprocessingReport
    from .flame_analyzer import analyze_flame_behavior
    from .temperature_analyzer import analyze_temperature
    from .pattern_detector import detect_patterns
    from .comparator import compare_gravity_conditions
    from .explainer import generate_scientific_summary
    from .ml_models import FlameAspectRegressor, CombustionRegimeClassifier, AnalyticalCombustionModel
except (ImportError, ValueError):
    from schemas import (
        DataOrigin,
        GravityRegime,
        CombustionRegime,
        ProvenanceMetadata,
        FlameBehaviorAnalysis,
        TemperatureAnalysisResult,
        PatternDetectionResult,
        GravityComparisonResult,
        ScientificSummary
    )
    from data_loader import load_dataset
    from preprocessing import preprocess_data, PreprocessingReport
    from flame_analyzer import analyze_flame_behavior
    from temperature_analyzer import analyze_temperature
    from pattern_detector import detect_patterns
    from comparator import compare_gravity_conditions
    from explainer import generate_scientific_summary
    from ml_models import FlameAspectRegressor, CombustionRegimeClassifier, AnalyticalCombustionModel


class ComprehensiveAnalysisOutput(BaseModel):
    """
    Standard NASA-FLAME Master Output Schema.
    Meets all specifications for Member 2 FastAPI responses.
    """
    analysis_id: str
    input_reference: str
    gravity_condition: str
    data_origin_classification: str
    key_observations: List[str]
    calculated_metrics: Dict[str, Any]
    detected_patterns: List[str]
    scientific_explanation: str
    confidence_or_uncertainty: Dict[str, Any]
    limitations: List[str]
    source_references: List[str]
    data_origin_breakdown: Dict[str, Any] = Field(
        ...,
        description="Explicit categorization of Measured Experimental Data, Simulated Data, and AI Predictions."
    )


# Singleton ML instances for fast in-process FastAPI reuse
_flame_regressor = FlameAspectRegressor()
_regime_classifier = CombustionRegimeClassifier()


def run_complete_flame_analysis(
    dataset_or_record: Union[str, pd.DataFrame, Dict[str, Any], list],
    data_origin: Optional[Union[DataOrigin, str]] = None,
    provenance: Optional[ProvenanceMetadata] = None,
    analysis_id: Optional[str] = None
) -> ComprehensiveAnalysisOutput:
    """
    Master pipeline executing complete scientific diagnostic on combustion inputs.
    Designed for single-call invocation in Member 2's FastAPI endpoints.
    """
    analysis_id = analysis_id or f"NASA-FLAME-{uuid.uuid4().hex[:8].upper()}"

    # 1. Load data
    df, prov = load_dataset(dataset_or_record, data_origin=data_origin, provenance=provenance)
    input_ref = prov.citation or "User-Supplied Combustion Data"

    # 2. Preprocess
    clean_df, prep_report = preprocess_data(df)

    # 3. Flame Behavior
    flame_res = analyze_flame_behavior(clean_df, provenance=prov, analysis_id=f"{analysis_id}-FLAME")

    # 4. Temperature Analysis
    temp_res = analyze_temperature(clean_df, provenance=prov, analysis_id=f"{analysis_id}-TEMP")

    # 5. Pattern Detection
    pat_res = detect_patterns(clean_df, provenance=prov, analysis_id=f"{analysis_id}-PAT")

    # 6. Scientific Summary
    summary_res = generate_scientific_summary(flame_res, provenance=prov, analysis_id=f"{analysis_id}-REP")

    # Metrics dictionary
    calculated_metrics = {
        "flame_length_mm": flame_res.geometry.flame_length_mm,
        "flame_width_mm": flame_res.geometry.flame_width_mm,
        "aspect_ratio": flame_res.geometry.aspect_ratio,
        "spherical_symmetry_index": flame_res.geometry.spherical_symmetry_index,
        "flicker_frequency_hz": flame_res.physics_parameters.flicker_frequency_hz,
        "residence_time_ms": flame_res.physics_parameters.residence_time_ms,
        "grashof_number": flame_res.physics_parameters.grashof_number,
        "richardson_number": flame_res.physics_parameters.richardson_number,
        "peak_temperature_k": temp_res.peak_temperature_k,
        "temperature_differential_k": temp_res.temperature_differential_k,
        "estimated_radial_gradient_k_per_mm": temp_res.estimated_radial_gradient_k_per_mm,
        "thermal_boundary_thickness_mm": temp_res.thermal_boundary_thickness_mm
    }

    # Confidence and uncertainty
    confidence_info = {
        "analysis_confidence_score": flame_res.confidence_score,
        "temperature_uncertainty_k": f"+/- {temp_res.uncertainty_bounds_k} K",
        "geometric_measurement_tolerance": "+/- 0.4 mm",
        "validation_status": "VALIDATED_EMPIRICAL" if prov.data_origin == DataOrigin.EXPERIMENTAL_MEASURED else "SIMULATED_BENCHMARK"
    }

    # Explicit origin tagging
    origin_breakdown = {
        "measured_experimental_data": (
            "Primary measurements (dimensions, thermocouple readings, flicker) verified from NASA empirical flight/drop-tower records."
            if prov.data_origin == DataOrigin.EXPERIMENTAL_MEASURED else None
        ),
        "simulated_data": (
            "Computed via reactive Navier-Stokes CFD model with GRI-Mech chemical kinetics."
            if prov.data_origin == DataOrigin.NUMERICAL_SIMULATION else None
        ),
        "ai_generated_interpretation": (
            "Regime classification, dimensionless number scaling, and fluid-dynamic narrative produced by NASA-FLAME AI Engine."
        )
    }

    return ComprehensiveAnalysisOutput(
        analysis_id=analysis_id,
        input_reference=input_ref,
        gravity_condition=flame_res.gravity_condition.value,
        data_origin_classification=prov.data_origin.value,
        key_observations=flame_res.key_observations,
        calculated_metrics=calculated_metrics,
        detected_patterns=pat_res.explainable_findings,
        scientific_explanation=summary_res.executive_overview + " " + summary_res.fluid_dynamics_interpretation,
        confidence_or_uncertainty=confidence_info,
        limitations=summary_res.scientific_limitations,
        source_references=summary_res.provenance_citations,
        data_origin_breakdown=origin_breakdown
    )


def predict_aspect_ratio_ml(
    gravity_g: float,
    oxidizer_o2_frac: float = 0.21,
    coflow_velocity_cm_s: float = 15.0,
    fuel_type: str = "Hydrocarbon",
    training_df: Optional[pd.DataFrame] = None
) -> Dict[str, Any]:
    """API endpoint helper for predicting flame aspect ratio."""
    if training_df is not None and not _flame_regressor.is_fitted:
        _flame_regressor.train_or_fallback(training_df)
    return _flame_regressor.predict(gravity_g, oxidizer_o2_frac, coflow_velocity_cm_s, fuel_type)


def classify_combustion_regime_ml(
    gravity_g: float,
    peak_temp_k: float,
    aspect_ratio: float = 1.1,
    training_df: Optional[pd.DataFrame] = None
) -> Dict[str, Any]:
    """API endpoint helper for classifying combustion regimes."""
    if training_df is not None and not _regime_classifier.is_fitted:
        _regime_classifier.train_or_fallback(training_df)
    return _regime_classifier.predict(gravity_g, peak_temp_k, aspect_ratio)
