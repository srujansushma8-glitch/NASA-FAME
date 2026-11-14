"""SQLAlchemy models for Experiments and ExperimentMetadata."""

from sqlalchemy import Column, String, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.base import TimestampMixin, generate_uuid


class Experiment(Base, TimestampMixin):
    """Core experiment configuration and physical operating conditions."""

    __tablename__ = "experiments"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Physical combustion parameters
    fuel_type = Column(String(64), nullable=False, index=True)  # e.g., Methane, Propane, Hydrogen
    fuel_flow_rate_sccm = Column(Float, nullable=True)
    oxidizer = Column(String(128), default="Air (21% O2, 79% N2)", nullable=False)
    oxygen_percentage = Column(Float, default=21.0, nullable=False)
    pressure_atm = Column(Float, default=1.0, nullable=False)
    ambient_temperature_k = Column(Float, default=298.15, nullable=False)
    gravity_level_g = Column(Float, default=0.0, nullable=False, index=True)  # 0.0g = microgravity

    # Chamber & geometry specifications
    burner_diameter_mm = Column(Float, nullable=True)
    initial_droplet_diameter_mm = Column(Float, nullable=True)
    chamber_volume_liters = Column(Float, nullable=True)

    # Lifecycle status: DRAFT, PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
    status = Column(String(32), default="DRAFT", nullable=False, index=True)

    # Relationships
    metadata_rel = relationship(
        "ExperimentMetadata",
        back_populates="experiment",
        uselist=False,
        cascade="all, delete-orphan",
    )
    simulations = relationship(
        "SimulationResult",
        back_populates="experiment",
        cascade="all, delete-orphan",
        order_by="desc(SimulationResult.created_at)",
    )
    analyses = relationship(
        "AnalysisResult",
        back_populates="experiment",
        cascade="all, delete-orphan",
        order_by="desc(AnalysisResult.created_at)",
    )


class ExperimentMetadata(Base, TimestampMixin):
    """Extended scientific metadata, investigator details, and tags."""

    __tablename__ = "experiment_metadata"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    experiment_id = Column(
        String(64),
        ForeignKey("experiments.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    investigator = Column(String(128), nullable=True)
    facility = Column(String(128), nullable=True)  # e.g., ISS CIR / ACME, Zero-G Drop Tower
    tags = Column(JSON, nullable=True)  # List of string tags
    notes = Column(Text, nullable=True)
    extra_attributes = Column(JSON, nullable=True)  # Flexible key-value pairs

    # Relationship back to experiment
    experiment = relationship("Experiment", back_populates="metadata_rel")

