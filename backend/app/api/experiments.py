"""API endpoints for Combustion Experiment Management (CRUD)."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.common import ExperimentStatus
from backend.app.schemas.experiment import (
    ExperimentRequest,
    ExperimentResponse,
    ExperimentUpdate,
    ExperimentListResponse,
)
from backend.app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/experiments", tags=["Experiments"])


@router.post(
    "",
    response_model=ExperimentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Experiment",
    description="Configures and records a new physical combustion experiment.",
)
def create_experiment(
    payload: ExperimentRequest,
    db: Session = Depends(get_db),
) -> ExperimentResponse:
    return ExperimentService.create_experiment(db, payload)


@router.get(
    "",
    response_model=ExperimentListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Experiments",
    description="Retrieves a paginated list of experiments with optional filters for status, fuel, and gravity.",
)
def list_experiments(
    page: int = Query(1, ge=1, description="Page index"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[ExperimentStatus] = Query(None, description="Filter by status"),
    fuel_type: Optional[str] = Query(None, description="Filter by fuel type"),
    min_gravity: Optional[float] = Query(None, ge=0.0, description="Minimum gravity level (g)"),
    max_gravity: Optional[float] = Query(None, ge=0.0, description="Maximum gravity level (g)"),
    search: Optional[str] = Query(None, description="Search term for name or description"),
    db: Session = Depends(get_db),
) -> ExperimentListResponse:
    items, total = ExperimentService.list_experiments(
        db=db,
        page=page,
        page_size=page_size,
        status=status,
        fuel_type=fuel_type,
        min_gravity=min_gravity,
        max_gravity=max_gravity,
        search=search,
    )
    return ExperimentListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=items,
    )


@router.get(
    "/{experiment_id}",
    response_model=ExperimentResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Experiment",
    description="Fetches full details of a specific experiment by ID.",
)
def get_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
) -> ExperimentResponse:
    return ExperimentService.get_experiment(db, experiment_id)


@router.put(
    "/{experiment_id}",
    response_model=ExperimentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Experiment",
    description="Modifies parameters or metadata of an existing experiment.",
)
def update_experiment(
    experiment_id: str,
    payload: ExperimentUpdate,
    db: Session = Depends(get_db),
) -> ExperimentResponse:
    return ExperimentService.update_experiment(db, experiment_id, payload)


@router.patch(
    "/{experiment_id}",
    response_model=ExperimentResponse,
    status_code=status.HTTP_200_OK,
    summary="Partially Update Experiment",
    description="Partially modifies parameters or metadata of an existing experiment.",
)
def patch_experiment(
    experiment_id: str,
    payload: ExperimentUpdate,
    db: Session = Depends(get_db),
) -> ExperimentResponse:
    return ExperimentService.update_experiment(db, experiment_id, payload)


@router.delete(
    "/{experiment_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Experiment",
    description="Removes an experiment along with its associated simulation and analysis history.",
)
def delete_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
) -> dict:
    ExperimentService.delete_experiment(db, experiment_id)
    return {"deleted": True, "experiment_id": experiment_id}

