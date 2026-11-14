"""API endpoints for AI Combustion Analysis and Scientific Findings."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
)
from backend.app.services.ai_service import AIService

router = APIRouter(prefix="/analysis", tags=["AI Analysis"])


@router.post(
    "/run",
    response_model=AnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Run AI Analysis",
    description="Invokes Member 3's AI Analysis engine to classify combustion regimes and compute dimensionless numbers.",
)
def run_analysis(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
) -> AnalysisResponse:
    return AIService.run_analysis(db, payload)


@router.get(
    "/{analysis_id}",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve AI Analysis",
    description="Fetches stored scientific explanations, dimensionless numbers (Gr, Ri, Fr, Ra), and recommendations.",
)
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
) -> AnalysisResponse:
    return AIService.get_analysis(db, analysis_id)


@router.get(
    "/experiment/{experiment_id}",
    response_model=List[AnalysisResponse],
    status_code=status.HTTP_200_OK,
    summary="List Analyses for Experiment",
    description="Retrieves all historical AI analysis reports linked to a specific experiment ID.",
)
def list_analyses_for_experiment(
    experiment_id: str,
    db: Session = Depends(get_db),
) -> List[AnalysisResponse]:
    return AIService.list_analyses_for_experiment(db, experiment_id)

