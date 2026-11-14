"""
NASA-FLAME AI Engine Package
Member 3: AI/ML Engineer & Combustion Research Analyst

Provides intelligent, scientifically rigorous combustion analysis across normal gravity and microgravity.
"""

try:
    from .schemas import (
        DataOrigin,
        GravityRegime,
        CombustionRegime,
        ProvenanceMetadata,
        DescriptiveStats,
        FlameGeometryMetrics,
        CombustionPhysicsMetrics,
        FlameBehaviorAnalysis,
        TemperatureAnalysisResult,
        PatternDetectionResult,
        GravityComparisonResult,
        ScientificSummary
    )

    from .data_loader import (
        load_dataset,
        standardize_columns,
        CombustionDataLoadError
    )

    from .preprocessing import (
        preprocess_data,
        detect_invalid_records,
        handle_missing_values,
        compute_combustion_physics_parameters,
        calculate_descriptive_statistics,
        normalize_features,
        PreprocessingReport
    )

    from .flame_analyzer import analyze_flame_behavior
    from .temperature_analyzer import analyze_temperature
    from .pattern_detector import detect_patterns
    from .comparator import compare_gravity_conditions
    from .explainer import generate_scientific_summary

    from .ml_models import (
        FlameAspectRegressor,
        CombustionRegimeClassifier,
        AnalyticalCombustionModel
    )

    from .api_interface import (
        run_complete_flame_analysis,
        predict_aspect_ratio_ml,
        classify_combustion_regime_ml,
        ComprehensiveAnalysisOutput
    )
except (ImportError, ValueError):
    from schemas import (
        DataOrigin,
        GravityRegime,
        CombustionRegime,
        ProvenanceMetadata,
        DescriptiveStats,
        FlameGeometryMetrics,
        CombustionPhysicsMetrics,
        FlameBehaviorAnalysis,
        TemperatureAnalysisResult,
        PatternDetectionResult,
        GravityComparisonResult,
        ScientificSummary
    )

    from data_loader import (
        load_dataset,
        standardize_columns,
        CombustionDataLoadError
    )

    from preprocessing import (
        preprocess_data,
        detect_invalid_records,
        handle_missing_values,
        compute_combustion_physics_parameters,
        calculate_descriptive_statistics,
        normalize_features,
        PreprocessingReport
    )

    from flame_analyzer import analyze_flame_behavior
    from temperature_analyzer import analyze_temperature
    from pattern_detector import detect_patterns
    from comparator import compare_gravity_conditions
    from explainer import generate_scientific_summary

    from ml_models import (
        FlameAspectRegressor,
        CombustionRegimeClassifier,
        AnalyticalCombustionModel
    )

    from api_interface import (
        run_complete_flame_analysis,
        predict_aspect_ratio_ml,
        classify_combustion_regime_ml,
        ComprehensiveAnalysisOutput
    )

__version__ = "1.0.0"
__all__ = [
    # Core prompt-specified functions
    "load_dataset",
    "preprocess_data",
    "analyze_flame_behavior",
    "compare_gravity_conditions",
    "analyze_temperature",
    "detect_patterns",
    "generate_scientific_summary",
    # Facade and ML functions
    "run_complete_flame_analysis",
    "predict_aspect_ratio_ml",
    "classify_combustion_regime_ml",
    # Schemas
    "DataOrigin",
    "GravityRegime",
    "CombustionRegime",
    "ProvenanceMetadata",
    "FlameBehaviorAnalysis",
    "TemperatureAnalysisResult",
    "PatternDetectionResult",
    "GravityComparisonResult",
    "ScientificSummary",
    "ComprehensiveAnalysisOutput",
    "PreprocessingReport",
    "AnalyticalCombustionModel"
]
