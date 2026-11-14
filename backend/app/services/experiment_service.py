"""Business logic and database persistence for Experiments."""

import logging
from typing import List, Optional, Tuple
from sqlalchemy import or_
from sqlalchemy.orm import Session
from backend.app.core.exceptions import EntityNotFoundException, ValidationException
from backend.app.models.experiment import Experiment, ExperimentMetadata
from backend.app.schemas.common import ExperimentStatus
from backend.app.schemas.experiment import (
    ExperimentRequest,
    ExperimentUpdate,
    ExperimentResponse,
    ExperimentMetadataSchema,
)

logger = logging.getLogger(__name__)


def experiment_to_response(exp: Experiment) -> ExperimentResponse:
    """Transforms SQLAlchemy Experiment model into standardized ExperimentResponse."""
    metadata_schema = None
    if exp.metadata_rel:
        metadata_schema = ExperimentMetadataSchema(
            investigator=exp.metadata_rel.investigator,
            facility=exp.metadata_rel.facility,
            tags=exp.metadata_rel.tags or [],
            notes=exp.metadata_rel.notes,
            extra_attributes=exp.metadata_rel.extra_attributes or {},
        )

    sim_count = len(exp.simulations) if exp.simulations else 0
    ana_count = len(exp.analyses) if exp.analyses else 0

    return ExperimentResponse(
        id=exp.id,
        name=exp.name,
        description=exp.description,
        fuel_type=exp.fuel_type,
        fuel_flow_rate_sccm=exp.fuel_flow_rate_sccm,
        oxidizer=exp.oxidizer,
        oxygen_percentage=exp.oxygen_percentage,
        pressure_atm=exp.pressure_atm,
        ambient_temperature_k=exp.ambient_temperature_k,
        gravity_level_g=exp.gravity_level_g,
        burner_diameter_mm=exp.burner_diameter_mm,
        initial_droplet_diameter_mm=exp.initial_droplet_diameter_mm,
        chamber_volume_liters=exp.chamber_volume_liters,
        status=ExperimentStatus(exp.status),
        metadata=metadata_schema,
        simulations_count=sim_count,
        analyses_count=ana_count,
        created_at=exp.created_at,
        updated_at=exp.updated_at,
    )


class ExperimentService:
    """Service handling Experiment lifecycle operations."""

    @staticmethod
    def create_experiment(db: Session, req: ExperimentRequest) -> ExperimentResponse:
        logger.info(f"Creating experiment: '{req.name}' with fuel={req.fuel_type}, g={req.gravity_level_g}")

        db_exp = Experiment(
            name=req.name,
            description=req.description,
            fuel_type=req.fuel_type,
            fuel_flow_rate_sccm=req.fuel_flow_rate_sccm,
            oxidizer=req.oxidizer,
            oxygen_percentage=req.oxygen_percentage,
            pressure_atm=req.pressure_atm,
            ambient_temperature_k=req.ambient_temperature_k,
            gravity_level_g=req.gravity_level_g,
            burner_diameter_mm=req.burner_diameter_mm,
            initial_droplet_diameter_mm=req.initial_droplet_diameter_mm,
            chamber_volume_liters=req.chamber_volume_liters,
            status=ExperimentStatus.DRAFT.value,
        )
        db.add(db_exp)
        db.flush()

        if req.metadata:
            meta = ExperimentMetadata(
                experiment_id=db_exp.id,
                investigator=req.metadata.investigator,
                facility=req.metadata.facility,
                tags=req.metadata.tags,
                notes=req.metadata.notes,
                extra_attributes=req.metadata.extra_attributes,
            )
            db.add(meta)

        db.commit()
        db.refresh(db_exp)
        return experiment_to_response(db_exp)

    @staticmethod
    def get_experiment_model(db: Session, experiment_id: str) -> Experiment:
        exp = db.query(Experiment).filter(Experiment.id == experiment_id).first()
        if not exp:
            raise EntityNotFoundException(entity_name="Experiment", entity_id=experiment_id)
        return exp

    @staticmethod
    def get_experiment(db: Session, experiment_id: str) -> ExperimentResponse:
        exp = ExperimentService.get_experiment_model(db, experiment_id)
        return experiment_to_response(exp)

    @staticmethod
    def list_experiments(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        status: Optional[ExperimentStatus] = None,
        fuel_type: Optional[str] = None,
        min_gravity: Optional[float] = None,
        max_gravity: Optional[float] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[ExperimentResponse], int]:
        query = db.query(Experiment)

        if status:
            query = query.filter(Experiment.status == status.value)
        if fuel_type:
            query = query.filter(Experiment.fuel_type.ilike(f"%{fuel_type}%"))
        if min_gravity is not None:
            query = query.filter(Experiment.gravity_level_g >= min_gravity)
        if max_gravity is not None:
            query = query.filter(Experiment.gravity_level_g <= max_gravity)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Experiment.name.ilike(search_pattern),
                    Experiment.description.ilike(search_pattern),
                    Experiment.fuel_type.ilike(search_pattern),
                )
            )

        total = query.count()
        offset = (page - 1) * page_size
        experiments = (
            query.order_by(Experiment.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        return [experiment_to_response(e) for e in experiments], total

    @staticmethod
    def update_experiment(
        db: Session, experiment_id: str, req: ExperimentUpdate
    ) -> ExperimentResponse:
        exp = ExperimentService.get_experiment_model(db, experiment_id)

        update_data = req.model_dump(exclude_unset=True)

        metadata_data = update_data.pop("metadata", None)

        for key, value in update_data.items():
            if key == "status" and value is not None:
                setattr(exp, key, value.value if isinstance(value, ExperimentStatus) else str(value))
            elif hasattr(exp, key) and value is not None:
                setattr(exp, key, value)

        if metadata_data is not None:
            if exp.metadata_rel:
                for m_key, m_val in metadata_data.items():
                    if hasattr(exp.metadata_rel, m_key) and m_val is not None:
                        setattr(exp.metadata_rel, m_key, m_val)
            else:
                meta = ExperimentMetadata(
                    experiment_id=exp.id,
                    investigator=metadata_data.get("investigator"),
                    facility=metadata_data.get("facility"),
                    tags=metadata_data.get("tags", []),
                    notes=metadata_data.get("notes"),
                    extra_attributes=metadata_data.get("extra_attributes", {}),
                )
                db.add(meta)

        db.commit()
        db.refresh(exp)
        return experiment_to_response(exp)

    @staticmethod
    def delete_experiment(db: Session, experiment_id: str) -> bool:
        exp = ExperimentService.get_experiment_model(db, experiment_id)
        db.delete(exp)
        db.commit()
        logger.info(f"Experiment '{experiment_id}' deleted successfully.")
        return True

