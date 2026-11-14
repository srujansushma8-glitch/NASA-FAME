"""Pydantic schemas for Simulation requests and responses."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.common import FlameShape, SimulationStatus


class SimulationParameters(BaseModel):
    """Runtime parameters and numerical constraints for simulation execution."""

    gravity_level_g: Optional[float] = Field(
        None, ge=0.0, le=20.0, description="Optional override for gravity level"
    )
    duration_s: float = Field(
        10.0, gt=0.0, le=60.0, description="Physical duration of simulation in seconds"
    )
    time_step_s: float = Field(
        0.1, gt=0.0, le=1.0, description="Time step delta for discrete integration"
    )
    grid_resolution: int = Field(
        64, ge=16, le=256, description="Spatial computational grid points per axis"
    )
    radiation_model: bool = Field(
        True, description="Whether optically thin radiation model is activated"
    )


class SimulationTimeSeriesPoint(BaseModel):
    """Single discrete timestamp record in simulation time-series."""

    time_s: float
    flame_radius_mm: float
    max_temperature_k: float
    burning_rate_mg_s: float
    soot_fraction: float


class SimulationScalarField(BaseModel):
    """2D spatial distribution grid for temperature and reaction zones."""

    grid_x: List[float] = Field(..., description="1D coordinate array along X axis in mm")
    grid_y: List[float] = Field(..., description="1D coordinate array along Y axis in mm")
    temperature_matrix: List[List[float]] = Field(
        ..., description="2D temperature field (Kelvin) for contour plotting"
    )


class SimulationRequest(BaseModel):
    """Request payload to initiate a combustion simulation run."""

    experiment_id: Optional[str] = Field(
        None, description="Existing experiment ID to load combustion parameters from"
    )
    parameters: Optional[SimulationParameters] = Field(
        default_factory=SimulationParameters,
        description="Numerical and computational parameters for solver",
    )
    # Allows ad-hoc execution with inline experiment parameters without prior saving
    adhoc_config: Optional[Dict[str, Any]] = Field(
        None,
        description="Optional ad-hoc experiment parameters if no experiment_id is supplied",
    )


class SimulationResponse(BaseModel):
    """Structured simulation result response conforming to data contract."""

    id: str = Field(..., description="Unique simulation run identifier")
    experiment_id: str = Field(..., description="Associated experiment ID")
    status: SimulationStatus = Field(..., description="Simulation status")
    gravity_level_g: float = Field(..., description="Effective gravity level used in simulation")
    flame_shape: FlameShape = Field(..., description="Morphology of simulated flame")

    # Scalar metrics
    flame_radius_mm: Optional[float] = Field(None, description="Mean or spherical flame radius in mm")
    flame_height_mm: Optional[float] = Field(None, description="Flame height in mm (for buoyant plumes)")
    max_temperature_k: Optional[float] = Field(None, description="Peak flame temperature in Kelvin")
    burn_rate_mg_s: Optional[float] = Field(None, description="Fuel mass consumption rate in mg/s")
    soot_volume_fraction: Optional[float] = Field(None, description="Peak soot volume fraction (ppm or fraction)")
    extinction_time_s: Optional[float] = Field(None, description="Extinction time if flame quenched")

    # Detailed structured time-series & spatial fields
    time_series: Optional[List[SimulationTimeSeriesPoint]] = Field(
        None, description="Temporal trajectory of flame metrics"
    )
    spatial_scalar_field: Optional[SimulationScalarField] = Field(
        None, description="Spatial temperature contour grid for visualization"
    )

    execution_duration_ms: Optional[float] = Field(None, description="Solver execution duration in ms")
    error_message: Optional[str] = Field(None, description="Error diagnostics if failed")
    created_at: datetime = Field(..., description="UTC creation timestamp")
    completed_at: Optional[datetime] = Field(None, description="UTC completion timestamp")

    model_config = ConfigDict(from_attributes=True)

