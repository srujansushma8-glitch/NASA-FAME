"""
Pydantic Schemas and Data Models for NASA-FLAME AI Engine.
Provides strict typing and API-ready data contracts for Member 2 (FastAPI integration).
"""

from enum import Enum
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field


class DataOrigin(str, Enum):
    """Origin of the combustion data."""
    EXPERIMENTAL_MEASURED = "EXPERIMENTAL_MEASURED"
    NUMERICAL_SIMULATION = "NUMERICAL_SIMULATION"
    AI_PREDICTION = "AI_PREDICTION"
    UNKNOWN = "UNKNOWN"


class GravityRegime(str, Enum):
    """Categorized gravity regime."""
    NORMAL_1G = "NORMAL_1G"
    MICROGRAVITY = "MICROGRAVITY"
    PARTIAL_GRAVITY = "PARTIAL_GRAVITY"
    VARIABLE = "VARIABLE"


class CombustionRegime(str, Enum):
    """Identified combustion regime."""
    BUOYANT_LAMINAR = "BUOYANT_LAMINAR"
    BUOYANT_TURBULENT = "BUOYANT_TURBULENT"
    DIFFUSION_CONTROLLED_STEADY = "DIFFUSION_CONTROLLED_STEADY"
    MICROGRAVITY_COOL_FLAME_TRANSITION = "MICROGRAVITY_COOL_FLAME_TRANSITION"
    STATIONARY_FLAME_BALL = "STATIONARY_FLAME_BALL"
    EXTINGUISHED = "EXTINGUISHED"
    UNKNOWN = "UNKNOWN"


class ProvenanceMetadata(BaseModel):
    """Data provenance and citation tracking."""
    data_origin: DataOrigin = Field(default=DataOrigin.UNKNOWN, description="Source nature of data")
    facility_or_mission: Optional[str] = Field(default=None, description="e.g. ISS CIR / ACME or GRC Drop Tower")
    citation: Optional[str] = Field(default=None, description="DOI, NASA TM number, or publication reference")
    investigators: Optional[List[str]] = Field(default=None, description="Principal investigators")
    sensor_tolerances: Optional[Dict[str, str]] = Field(default_factory=dict, description="Known sensor error bounds")
    scientific_limitations: Optional[List[str]] = Field(default_factory=list, description="Known experimental or physical limits")


class DescriptiveStats(BaseModel):
    """Descriptive statistics for a numeric parameter."""
    mean: float
    std: float
    median: float
    min_val: float
    max_val: float
    iqr: float
    snr_db: Optional[float] = None


class FlameGeometryMetrics(BaseModel):
    """Quantitative flame geometry metrics."""
    flame_length_mm: float
    flame_width_mm: float
    aspect_ratio: float
    spherical_symmetry_index: float = Field(
        ..., description="Deviation from sphere: 1.0 = perfect sphere, >1.5 = elongated buoyant"
    )
    standoff_ratio: Optional[float] = None
    flame_surface_area_est_mm2: Optional[float] = None


class CombustionPhysicsMetrics(BaseModel):
    """Extracted dimensionless and physical combustion parameters."""
    grashof_number: Optional[float] = Field(None, description="Gr: buoyant to viscous forces")
    richardson_number: Optional[float] = Field(None, description="Ri: natural to forced convection")
    froude_number: Optional[float] = Field(None, description="Fr: inertial to gravitational forces")
    rayleigh_number: Optional[float] = Field(None, description="Ra = Gr * Pr")
    flicker_frequency_hz: float = Field(..., description="Estimated or measured flicker frequency (0 in microgravity)")
    residence_time_ms: Optional[float] = Field(None, description="Estimated gas residence time in reaction zone")
    burning_rate_mm2_s: Optional[float] = Field(None, description="d^2-law burning rate K for droplets")
    soot_volume_fraction_ppm: Optional[float] = None
    radiative_loss_fraction: Optional[float] = None


class FlameBehaviorAnalysis(BaseModel):
    """Results from flame behavior analysis."""
    analysis_id: str
    gravity_condition: GravityRegime
    data_origin: DataOrigin
    geometry: FlameGeometryMetrics
    physics_parameters: CombustionPhysicsMetrics
    classified_regime: CombustionRegime
    key_observations: List[str]
    confidence_score: float = Field(..., ge=0.0, le=1.0)


class TemperatureAnalysisResult(BaseModel):
    """Results from temperature distribution analysis."""
    analysis_id: str
    peak_temperature_k: float
    ambient_temperature_k: float = 298.15
    temperature_differential_k: float
    estimated_radial_gradient_k_per_mm: Optional[float] = None
    thermal_boundary_thickness_mm: Optional[float] = None
    radiative_cooling_impact: str
    temperature_stability_description: str
    uncertainty_bounds_k: float = 25.0


class AnomalyItem(BaseModel):
    """Detected anomaly or unexpected observation."""
    record_index: Union[int, str]
    parameter: str
    observed_value: float
    expected_range: List[float]
    severity: str = "INFO"
    scientific_hypothesis: str


class ParameterCorrelation(BaseModel):
    """Observed parameter correlation."""
    param_x: str
    param_y: str
    correlation_coefficient: float
    relationship_description: str


class PatternDetectionResult(BaseModel):
    """Results from pattern and relationship detection."""
    analysis_id: str
    total_records_evaluated: int
    anomalies_detected: List[AnomalyItem]
    significant_correlations: List[ParameterCorrelation]
    clustering_summary: Optional[Dict[str, Any]] = None
    explainable_findings: List[str]


class MetricComparison(BaseModel):
    """Comparison of a single metric across gravity regimes."""
    metric_name: str
    value_1g: float
    value_microgravity: float
    absolute_difference: float
    percentage_change: float
    direction: str
    physical_driver: str


class GravityComparisonResult(BaseModel):
    """Comprehensive comparison between 1g and microgravity conditions."""
    comparison_id: str
    fuel_or_configuration: str
    data_origin: DataOrigin
    metrics_comparison: List[MetricComparison]
    summary_of_differences: List[str]
    key_physical_mechanisms: List[str]
    scientific_conclusions: str
    limitations: List[str]


class ScientificSummary(BaseModel):
    """Structured, publishable scientific summary report."""
    analysis_id: str
    title: str
    data_origin: DataOrigin
    provenance_reference: Optional[str] = None
    executive_overview: str
    fluid_dynamics_interpretation: str
    heat_and_mass_transfer_explanation: str
    soot_and_radiation_mechanisms: str
    combustion_regime_verdict: str
    assumptions_made: List[str]
    scientific_limitations: List[str]
    provenance_citations: List[str]
