"""SQLAlchemy model for SimulationResults."""

from sqlalchemy import Column, String, Float, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import TimestampMixin, generate_uuid


class SimulationResult(Base, TimestampMixin):
    """Stores structured outputs, physics metrics, and fields from combustion simulations."""

    __tablename__ = "simulation_results"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    experiment_id = Column(
        String(64),
        ForeignKey("experiments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Simulation lifecycle status: PENDING, RUNNING, COMPLETED, FAILED
    status = Column(String(32), default="PENDING", nullable=False, index=True)

    # Effective simulation gravity condition
    gravity_level_g = Column(Float, nullable=False, index=True)

    # Primary qualitative flame morphology: SPHERICAL, TEARDROP, TRANSITIONAL, EXTINGUISHED
    flame_shape = Column(String(32), default="SPHERICAL", nullable=False)

    # Key scalar physical metrics
    flame_radius_mm = Column(Float, nullable=True)
    flame_height_mm = Column(Float, nullable=True)
    max_temperature_k = Column(Float, nullable=True)
    burn_rate_mg_s = Column(Float, nullable=True)
    soot_volume_fraction = Column(Float, nullable=True)
    extinction_time_s = Column(Float, nullable=True)

    # Structured time-series and spatial field data (for charts & 2D/3D visualization)
    time_series_data = Column(JSON, nullable=True)  # List of points [t, radius, temp, etc.]
    spatial_scalar_field = Column(JSON, nullable=True)  # Grid temperature/soot profile

    # Performance and diagnostics
    execution_duration_ms = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    experiment = relationship("Experiment", back_populates="simulations")
    analyses = relationship(
        "AnalysisResult",
        back_populates="simulation",
        cascade="all, delete-orphan",
    )

