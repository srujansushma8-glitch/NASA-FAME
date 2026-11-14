"""API endpoints for Simulation Execution and Results Retrieval."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
)
from backend.app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post(
    "/run",
    response_model=SimulationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Run Simulation",
    description="Validates parameters, invokes the simulation engine (Member 4), and stores structured outputs.",
)
def run_simulation(
    payload: SimulationRequest,
    db: Session = Depends(get_db),
) -> SimulationResponse:
    return SimulationService.run_simulation(db, payload)


@router.get(
    "/{simulation_id}",
    response_model=SimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Simulation Result",
    description="Fetches stored simulation metrics, time series points, and spatial temperature contours by ID.",
)
def get_simulation(
    simulation_id: str,
    db: Session = Depends(get_db),
) -> SimulationResponse:
    return SimulationService.get_simulation(db, simulation_id)


@router.get(
    "/experiment/{experiment_id}",
    response_model=List[SimulationResponse],
    status_code=status.HTTP_200_OK,
    summary="List Simulations for Experiment",
    description="Retrieves all historical simulation runs linked to a specific experiment ID.",
)
def list_simulations_for_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
) -> List[SimulationResponse]:
    return SimulationService.list_simulations_for_experiment(db, experiment_id)

