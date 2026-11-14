"""Initial database schema for NASA-FLAME.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-11-14 11:30:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create 'experiments' table
    op.create_table(
        "experiments",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("fuel_type", sa.String(length=64), nullable=False),
        sa.Column("fuel_flow_rate_sccm", sa.Float(), nullable=True),
        sa.Column("oxidizer", sa.String(length=128), nullable=False, server_default="Air (21% O2, 79% N2)"),
        sa.Column("oxygen_percentage", sa.Float(), nullable=False, server_default="21.0"),
        sa.Column("pressure_atm", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("ambient_temperature_k", sa.Float(), nullable=False, server_default="298.15"),
        sa.Column("gravity_level_g", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("burner_diameter_mm", sa.Float(), nullable=True),
        sa.Column("initial_droplet_diameter_mm", sa.Float(), nullable=True),
        sa.Column("chamber_volume_liters", sa.Float(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="DRAFT"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_experiments_id", "experiments", ["id"])
    op.create_index("ix_experiments_name", "experiments", ["name"])
    op.create_index("ix_experiments_fuel_type", "experiments", ["fuel_type"])
    op.create_index("ix_experiments_gravity_level_g", "experiments", ["gravity_level_g"])
    op.create_index("ix_experiments_status", "experiments", ["status"])

    # 2. Create 'experiment_metadata' table
    op.create_table(
        "experiment_metadata",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column(
            "experiment_id",
            sa.String(length=64),
            sa.ForeignKey("experiments.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("investigator", sa.String(length=128), nullable=True),
        sa.Column("facility", sa.String(length=128), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("extra_attributes", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_experiment_metadata_experiment_id", "experiment_metadata", ["experiment_id"])

    # 3. Create 'simulation_results' table
    op.create_table(
        "simulation_results",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column(
            "experiment_id",
            sa.String(length=64),
            sa.ForeignKey("experiments.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="PENDING"),
        sa.Column("gravity_level_g", sa.Float(), nullable=False),
        sa.Column("flame_shape", sa.String(length=32), nullable=False, server_default="SPHERICAL"),
        sa.Column("flame_radius_mm", sa.Float(), nullable=True),
        sa.Column("flame_height_mm", sa.Float(), nullable=True),
        sa.Column("max_temperature_k", sa.Float(), nullable=True),
        sa.Column("burn_rate_mg_s", sa.Float(), nullable=True),
        sa.Column("soot_volume_fraction", sa.Float(), nullable=True),
        sa.Column("extinction_time_s", sa.Float(), nullable=True),
        sa.Column("time_series_data", sa.JSON(), nullable=True),
        sa.Column("spatial_scalar_field", sa.JSON(), nullable=True),
        sa.Column("execution_duration_ms", sa.Float(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_simulation_results_id", "simulation_results", ["id"])
    op.create_index("ix_simulation_results_experiment_id", "simulation_results", ["experiment_id"])
    op.create_index("ix_simulation_results_status", "simulation_results", ["status"])

    # 4. Create 'analysis_results' table
    op.create_table(
        "analysis_results",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column(
            "experiment_id",
            sa.String(length=64),
            sa.ForeignKey("experiments.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column(
            "simulation_id",
            sa.String(length=64),
            sa.ForeignKey("simulation_results.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="PENDING"),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("regime_classification", sa.String(length=128), nullable=False),
        sa.Column("dimensionless_numbers", sa.JSON(), nullable=True),
        sa.Column("scientific_findings", sa.JSON(), nullable=True),
        sa.Column("recommendations", sa.JSON(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("ai_model_used", sa.String(length=128), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_analysis_results_id", "analysis_results", ["id"])
    op.create_index("ix_analysis_results_experiment_id", "analysis_results", ["experiment_id"])
    op.create_index("ix_analysis_results_status", "analysis_results", ["status"])


def downgrade() -> None:
    op.drop_table("analysis_results")
    op.drop_table("simulation_results")
    op.drop_table("experiment_metadata")
    op.drop_table("experiments")

