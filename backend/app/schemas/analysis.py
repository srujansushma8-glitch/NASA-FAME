"""Pydantic schemas for AI Analysis requests and responses."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.common import AnalysisStatus


class DimensionlessNumbers(BaseModel):
    """Aerospace & combustion fluid dynamic dimensionless numbers."""

    richardson_number: float = Field(
        ..., description="Ri = Gr / Re^2: ratio of buoyancy to flow shear forces"
    )
    grashof_number: float = Field(
        ..., description="Gr: ratio of buoyant force to viscous force"
    )
    froude_number: float = Field(
        ..., description="Fr: ratio of flow inertia to external gravity field"
    )
    rayleigh_number: float = Field(
        ..., description="Ra = Gr * Pr: buoyancy-driven heat transfer regime"
    )


class AnalysisRequest(BaseModel):
    """Request payload to initiate AI analysis on simulation or experiment data."""

    experiment_id: Optional[str] = Field(
        None, description="Experiment ID to analyze"
    )
    simulation_id: Optional[str] = Field(
        None, description="Simulation ID to analyze"
    )
    experimental_data: Optional[Dict[str, Any]] = Field(
        None, description="Optional raw or external laboratory sensor data"
    )
    analysis_focus: Optional[str] = Field(
        "full",
        description="Analysis scope: 'full', 'extinction_limits', 'buoyancy_effects', 'soot_dynamics'",
    )


class AnalysisResponse(BaseModel):
    """Structured AI analysis response with explanations and scientific numbers."""

    id: str = Field(..., description="Unique analysis record identifier")
    experiment_id: Optional[str] = Field(None, description="Associated experiment ID")
    simulation_id: Optional[str] = Field(None, description="Associated simulation ID")
    status: AnalysisStatus = Field(..., description="Analysis status")
    summary: str = Field(..., description="Executive scientific summary")
    regime_classification: str = Field(
        ..., description="Combustion regime (e.g., Diffusive Spherical, Buoyant Plume)"
    )
    dimensionless_numbers: Optional[DimensionlessNumbers] = Field(
        None, description="Computed fluid dynamic dimensionless scaling metrics"
    )
    scientific_findings: List[str] = Field(
        default_factory=list, description="Key scientific discoveries and physics insights"
    )
    recommendations: List[str] = Field(
        default_factory=list, description="Operational recommendations for flight or test matrix"
    )
    confidence_score: float = Field(
        1.0, ge=0.0, le=1.0, description="Confidence score of AI analysis"
    )
    ai_model_used: Optional[str] = Field(
        None, description="AI engine or model version utilized"
    )
    error_message: Optional[str] = Field(None, description="Error diagnostics if failed")
    created_at: datetime = Field(..., description="UTC creation timestamp")
    completed_at: Optional[datetime] = Field(None, description="UTC completion timestamp")

    model_config = ConfigDict(from_attributes=True)

