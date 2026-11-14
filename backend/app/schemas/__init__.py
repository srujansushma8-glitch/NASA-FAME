"""Export shared Pydantic data contracts for NASA-FLAME."""

from backend.app.schemas.common import (
    ExperimentStatus,
    SimulationStatus,
    AnalysisStatus,
    FlameShape,
    FuelType,
    ErrorDetail,
    ErrorResponse,
    HealthResponse,
)
from backend.app.schemas.experiment import (
    ExperimentMetadataSchema,
    ExperimentBase,
    ExperimentRequest,
    ExperimentCreate,
    ExperimentUpdate,
    ExperimentResponse,
    ExperimentListResponse,
)
from backend.app.schemas.simulation import (
    SimulationParameters,
    SimulationTimeSeriesPoint,
    SimulationScalarField,
    SimulationRequest,
    SimulationResponse,
)
from backend.app.schemas.analysis import (
    DimensionlessNumbers,
    AnalysisRequest,
    AnalysisResponse,
)

__all__ = [
    # Enums
    "ExperimentStatus",
    "SimulationStatus",
    "AnalysisStatus",
    "FlameShape",
    "FuelType",
    # Common
    "ErrorDetail",
    "ErrorResponse",
    "HealthResponse",
    # Experiment
    "ExperimentMetadataSchema",
    "ExperimentBase",
    "ExperimentRequest",
    "ExperimentCreate",
    "ExperimentUpdate",
    "ExperimentResponse",
    "ExperimentListResponse",
    # Simulation
    "SimulationParameters",
    "SimulationTimeSeriesPoint",
    "SimulationScalarField",
    "SimulationRequest",
    "SimulationResponse",
    # Analysis
    "DimensionlessNumbers",
    "AnalysisRequest",
    "AnalysisResponse",
]

