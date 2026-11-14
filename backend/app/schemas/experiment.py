"""Pydantic schemas for Experiment requests and responses."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.common import ExperimentStatus


class ExperimentMetadataSchema(BaseModel):
    """Scientific metadata accompanying an experiment."""

    investigator: Optional[str] = Field(None, description="Lead scientist or investigator")
    facility: Optional[str] = Field(None, description="Experiment facility, e.g. ISS CIR / ACME, Drop Tower")
    tags: List[str] = Field(default_factory=list, description="Categorization tags")
    notes: Optional[str] = Field(None, description="Observations or lab notes")
    extra_attributes: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Arbitrary key-value scientific parameters"
    )

    model_config = ConfigDict(from_attributes=True)


class ExperimentBase(BaseModel):
    """Core physical combustion experiment parameters."""

    name: str = Field(..., min_length=1, max_length=255, description="Experiment title")
    description: Optional[str] = Field(None, description="Detailed objective of experiment")
    fuel_type: str = Field(..., description="Fuel chemical species (e.g. Methane, Propane, Hydrogen)")
    fuel_flow_rate_sccm: Optional[float] = Field(
        None, ge=0.0, description="Fuel flow rate in Standard Cubic Centimeters per Minute"
    )
    oxidizer: str = Field("Air (21% O2, 79% N2)", description="Oxidizer mixture description")
    oxygen_percentage: float = Field(
        21.0, ge=0.0, le=100.0, description="Oxygen volume percentage in ambient gas"
    )
    pressure_atm: float = Field(
        1.0, gt=0.0, le=50.0, description="Chamber pressure in atmospheres"
    )
    ambient_temperature_k: float = Field(
        298.15, gt=0.0, le=3000.0, description="Ambient temperature in Kelvin"
    )
    gravity_level_g: float = Field(
        0.0, ge=0.0, le=20.0, description="Gravity level in units of standard Earth gravity (0.0 = microgravity)"
    )
    burner_diameter_mm: Optional[float] = Field(
        None, ge=0.0, description="Burner or porous sphere nozzle diameter in mm"
    )
    initial_droplet_diameter_mm: Optional[float] = Field(
        None, ge=0.0, description="Initial fuel droplet diameter in mm (for droplet combustion)"
    )
    chamber_volume_liters: Optional[float] = Field(
        None, gt=0.0, description="Combustion chamber volume in liters"
    )


class ExperimentRequest(ExperimentBase):
    """Schema for creating a new experiment."""

    metadata: Optional[ExperimentMetadataSchema] = Field(
        default=None, description="Optional scientific metadata and tags"
    )


# Alias for backward-compatible/standard naming
ExperimentCreate = ExperimentRequest


class ExperimentUpdate(BaseModel):
    """Schema for partially updating an existing experiment."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    fuel_type: Optional[str] = None
    fuel_flow_rate_sccm: Optional[float] = Field(None, ge=0.0)
    oxidizer: Optional[str] = None
    oxygen_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    pressure_atm: Optional[float] = Field(None, gt=0.0, le=50.0)
    ambient_temperature_k: Optional[float] = Field(None, gt=0.0, le=3000.0)
    gravity_level_g: Optional[float] = Field(None, ge=0.0, le=20.0)
    burner_diameter_mm: Optional[float] = Field(None, ge=0.0)
    initial_droplet_diameter_mm: Optional[float] = Field(None, ge=0.0)
    chamber_volume_liters: Optional[float] = Field(None, gt=0.0)
    status: Optional[ExperimentStatus] = None
    metadata: Optional[ExperimentMetadataSchema] = None


class ExperimentResponse(ExperimentBase):
    """Standardized response schema for an experiment."""

    id: str = Field(..., description="Unique experiment identifier")
    status: ExperimentStatus = Field(..., description="Current status of the experiment")
    metadata: Optional[ExperimentMetadataSchema] = Field(None, description="Attached metadata")
    simulations_count: int = Field(0, description="Number of associated simulation runs")
    analyses_count: int = Field(0, description="Number of associated AI analyses")
    created_at: datetime = Field(..., description="UTC creation timestamp")
    updated_at: datetime = Field(..., description="UTC last updated timestamp")

    model_config = ConfigDict(from_attributes=True)


class ExperimentListResponse(BaseModel):
    """Paginated list response for experiments."""

    total: int = Field(..., description="Total number of matching experiments")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    items: List[ExperimentResponse] = Field(..., description="List of experiments")

