"""Structured simulation output data structures, serialization, and schema definition."""

from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Optional
import json


@dataclass
class FlameGeometryData:
    """Flame geometrical morphology and surface metrics."""
    height_mm: float
    width_mm: float
    aspect_ratio: float
    base_radius_mm: float
    flame_volume_cm3: float
    surface_area_cm2: float
    shape_classification: str  # "teardrop_slender" (1g) vs "spherical_expanded" (ug)
    contour_2d: List[Dict[str, float]]  # List of {r_mm, z_mm} defining stoichiometric flame boundary
    mesh_3d: Optional[Dict[str, Any]] = None  # 3D vertices, normals, and triangle indices for Member 5


@dataclass
class TemperatureDistribution:
    """Axisymmetric 2D temperature field and 1D cross-sectional profiles."""
    peak_temperature_K: float
    ambient_temperature_K: float
    mean_flame_temperature_K: float
    grid_r_mm: List[float]
    grid_z_mm: List[float]
    temperature_grid_K: List[List[float]]  # 2D array [z_index][r_index]
    axial_profile: List[Dict[str, float]]  # {z_mm, temperature_K} along centerline r=0
    radial_profile_mid: List[Dict[str, float]]  # {r_mm, temperature_K} at mid-flame height


@dataclass
class PhysicalQuantities:
    """Dimensionless groups, transport velocities, and energy balance metrics."""
    richardson_number: float
    grashof_number: float
    froude_number: float
    reynolds_number: float
    peclet_number_convective: float
    peclet_number_diffusive: float
    convective_velocity_max_m_s: float
    diffusive_velocity_scale_m_s: float
    buoyant_acceleration_m_s2: float
    heat_release_rate_W: float
    radiative_loss_rate_W: float
    radiative_fraction: float
    combustion_efficiency: float
    soot_yield_index: float
    flicker_frequency_hz: float
    dominant_transport_regime: str  # "Buoyancy-Driven Convection" vs "Molecular Diffusion Dominated"


@dataclass
class TimeSeriesData:
    """Time-dependent evolution of flame metrics from ignition to steady-state."""
    time_points_s: List[float]
    height_history_mm: List[float]
    width_history_mm: List[float]
    peak_temperature_history_K: List[float]
    convective_velocity_history_m_s: List[float]


@dataclass
class ValidationStatus:
    """Numerical checks and physical consistency verification."""
    is_valid: bool
    cfl_stable: bool
    energy_conserved: bool
    quenched: bool
    quenching_reason: Optional[str]
    numerical_residual: float
    verification_notes: List[str]


@dataclass
class SimulationResult:
    """Complete root structured result object produced by FLAME simulation engine."""
    simulation_id: str
    gravity_condition: str  # "normal_gravity", "microgravity", "custom"
    input_parameters: Dict[str, Any]
    simulation_duration_s: float
    flame_geometry: FlameGeometryData
    temperature_distribution: TemperatureDistribution
    physical_quantities: PhysicalQuantities
    time_series: TimeSeriesData
    model_assumptions: List[str]
    model_limitations: List[str]
    validation_status: ValidationStatus

    def to_dict(self) -> Dict[str, Any]:
        """Convert result object into a pure dictionary suitable for JSON serialization."""
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        """Serialize result object to formatted JSON string."""
        return json.dumps(self.to_dict(), indent=indent)
