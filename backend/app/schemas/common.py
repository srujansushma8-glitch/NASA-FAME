"""Common enumerations, health response, and shared schemas."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExperimentStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class SimulationStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AnalysisStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class FlameShape(str, Enum):
    SPHERICAL = "SPHERICAL"
    TEARDROP = "TEARDROP"
    TRANSITIONAL = "TRANSITIONAL"
    EXTINGUISHED = "EXTINGUISHED"


class FuelType(str, Enum):
    METHANE = "Methane"
    ETHANE = "Ethane"
    PROPANE = "Propane"
    HYDROGEN = "Hydrogen"
    HEPTANE = "Heptane"
    METHANOL = "Methanol"
    ETHANOL = "Ethanol"
    CUSTOM = "Custom"


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail
    status: int
    timestamp: str
    path: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = Field(..., description="Overall service status (healthy, degraded, unhealthy)")
    service: str = Field("nasa-flame-backend", description="Service identifier")
    version: str = Field(..., description="Application version")
    environment: str = Field(..., description="Runtime environment")
    database: Dict[str, Any] = Field(..., description="Database connectivity status and details")
    timestamp: datetime = Field(..., description="Timestamp of health check")
    uptime_seconds: float = Field(..., description="Seconds since application startup")

