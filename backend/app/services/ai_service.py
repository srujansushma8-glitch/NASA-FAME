"""AI Analysis Service and Integration Adapter for Member 3's AI Engine.

Coordinates ingestion of simulation/experimental data, dispatches analysis to
Member 3's module (or internal scientific analysis engine fallback), and stores
explanations, dimensionless numbers, and findings.
"""

from datetime import datetime, timezone
import importlib
import logging
import math
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from backend.app.core.exceptions import EntityNotFoundException
from backend.app.models.analysis import AnalysisResult
from backend.app.models.experiment import Experiment
from backend.app.models.simulation import SimulationResult
from backend.app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    DimensionlessNumbers,
)
from backend.app.schemas.common import AnalysisStatus

logger = logging.getLogger(__name__)


def analysis_to_response(ana: AnalysisResult) -> AnalysisResponse:
    """Transforms SQLAlchemy AnalysisResult model into standardized AnalysisResponse."""
    dimensionless = None
    if ana.dimensionless_numbers and isinstance(ana.dimensionless_numbers, dict):
        dimensionless = DimensionlessNumbers(**ana.dimensionless_numbers)

    findings = ana.scientific_findings if isinstance(ana.scientific_findings, list) else []
    recommendations = ana.recommendations if isinstance(ana.recommendations, list) else []

    return AnalysisResponse(
        id=ana.id,
        experiment_id=ana.experiment_id,
        simulation_id=ana.simulation_id,
        status=AnalysisStatus(ana.status),
        summary=ana.summary,
        regime_classification=ana.regime_classification,
        dimensionless_numbers=dimensionless,
        scientific_findings=findings,
        recommendations=recommendations,
        confidence_score=ana.confidence_score,
        ai_model_used=ana.ai_model_used,
        error_message=ana.error_message,
        created_at=ana.created_at,
        completed_at=ana.completed_at,
    )


class AIService:
    """Orchestrates AI combustion analysis and coordinates with Member 3's AI module."""

    @staticmethod
    def _try_call_member3_engine(
        experiment_data: Optional[Dict[str, Any]],
        simulation_data: Optional[Dict[str, Any]],
        focus: str,
    ) -> Optional[Dict[str, Any]]:
        """Attempts to dynamically call Member 3's AI analysis engine if installed."""
        try:
            for module_name in ["ai_engine.analyzer", "ai_engine.interface", "ai_engine"]:
                try:
                    mod = importlib.import_module(module_name)
                    if hasattr(mod, "analyze_combustion") and callable(getattr(mod, "analyze_combustion")):
                        logger.info(f"Found Member 3 AI entrypoint: {module_name}.analyze_combustion")
                        return mod.analyze_combustion(
                            experiment=experiment_data,
                            simulation=simulation_data,
                            focus=focus,
                        )
                except ImportError:
                    continue
        except Exception as exc:
            logger.warning(f"Error attempting Member 3 AI module call: {exc}. Using internal analyzer.")
        return None

    @staticmethod
    def _compute_dimensionless_numbers(
        gravity_g: float,
        flame_temp_k: float,
        ambient_temp_k: float,
        characteristic_len_m: float,
        flow_velocity_m_s: float = 0.1,
    ) -> DimensionlessNumbers:
        """Computes key fluid dynamic and microgravity combustion dimensionless numbers."""
        g_accel = gravity_g * 9.80665  # m/s^2
        t_film = (flame_temp_k + ambient_temp_k) / 2.0
        beta = 1.0 / max(100.0, t_film)  # thermal expansion coeff for ideal gas (1/K)
        delta_t = max(10.0, flame_temp_k - ambient_temp_k)
        nu = 1.5e-5 * ((t_film / 298.15) ** 1.7)  # kinematic viscosity of air (m^2/s)
        prandtl = 0.71  # air Prandtl number

        # Grashof Number: Gr = g * beta * delta_T * L^3 / nu^2
        grashof = (g_accel * beta * delta_t * (characteristic_len_m**3)) / (nu**2)

        # Reynolds Number: Re = u * L / nu
        reynolds = max(0.01, (flow_velocity_m_s * characteristic_len_m) / nu)

        # Richardson Number: Ri = Gr / Re^2
        richardson = grashof / (reynolds**2)

        # Froude Number: Fr = u / sqrt(g * L)
        if g_accel > 1e-6:
            froude = flow_velocity_m_s / math.sqrt(g_accel * characteristic_len_m)
        else:
            froude = 1e6  # effectively infinite when gravity is microgravity

        # Rayleigh Number: Ra = Gr * Pr
        rayleigh = grashof * prandtl

        return DimensionlessNumbers(
            richardson_number=round(richardson, 4),
            grashof_number=round(grashof, 2),
            froude_number=round(froude, 4),
            rayleigh_number=round(rayleigh, 2),
        )

    @staticmethod
    def _execute_scientific_analysis(
        gravity_g: float,
        fuel_type: str,
        flame_shape: str,
        max_temp_k: float,
        ambient_temp_k: float,
        soot_fraction: Optional[float],
        char_len_mm: float,
        oxygen_pct: float,
        pressure_atm: float,
        focus: str,
    ) -> Dict[str, Any]:
        """Provides rigorous physical and qualitative analysis for microgravity combustion."""
        char_len_m = max(0.001, char_len_mm / 1000.0)
        dim_numbers = AIService._compute_dimensionless_numbers(
            gravity_g=gravity_g,
            flame_temp_k=max_temp_k,
            ambient_temp_k=ambient_temp_k,
            characteristic_len_m=char_len_m,
        )

        findings = []
        recommendations = []

        if gravity_g <= 0.05:
            regime = "Diffusive Spherical Microgravity Regime"
            summary = (
                f"Symmetric spherical diffusion flame observed under near-zero gravity ({gravity_g:.4f}g). "
                f"Buoyancy forces are negligible (Gr = {dim_numbers.grashof_number:.2f}, "
                f"Ri = {dim_numbers.richardson_number:.4f}), eliminating natural convection."
            )
            findings.append(
                "Spherical Symmetry: Absence of buoyancy eliminates upward convective plume and flickering, "
                "yielding a stable spherical reaction front governed purely by Fickian mass diffusion."
            )
            findings.append(
                "Radiative Heat Loss: Due to stagnant gas residence around the reaction zone, radiative emission "
                "from CO2, H2O, and soot represents a dominant heat dissipation mechanism."
            )
            findings.append(
                "Soot Shell Morphology: Soot particles accumulate in an outer spherical shell without buoyant escape, "
                "increasing local radiative extinction vulnerability."
            )
            recommendations.append(
                "Verify oxygen concentration remains above extinction limit (currently at "
                f"{oxygen_pct:.1f}%) to prevent radiative quenching."
            )
            recommendations.append(
                "Utilize high-speed color pyrometry and narrow-band CH* chemiluminescence to measure "
                "flame curvature radius."
            )
        elif gravity_g < 0.6:
            regime = "Transitional Reduced-Gravity Regime (Lunar / Martian Analogue)"
            summary = (
                f"Transitional combustion regime observed under partial gravity ({gravity_g:.2f}g). "
                "Intermediate buoyancy effects perturb spherical symmetry into an oblate/oval geometry."
            )
            findings.append(
                f"Buoyancy Perturbation: Richardson number of {dim_numbers.richardson_number:.2f} indicates "
                "mixed convection-diffusion transport."
            )
            findings.append(
                "Base Widening: The flame base expands horizontally compared to Earth 1g, while a subtle "
                "upward convective drift remains detectable."
            )
            recommendations.append(
                "Compare mass burning rate against pure diffusion d^2 law to quantify the buoyant enhancement factor."
            )
        else:
            regime = "Buoyant Laminar Convective Plume Regime (Terrestrial 1g)"
            summary = (
                f"Strong buoyancy-dominated combustion observed at {gravity_g:.2f}g. "
                f"High Grashof number ({dim_numbers.grashof_number:.1f}) and Richardson number "
                f"({dim_numbers.richardson_number:.2f}) drive steady upward convective acceleration."
            )
            findings.append(
                "Convective Plume: Hot gas expansion creates a buoyancy-induced acceleration that elongates "
                "the flame into a teardrop shape."
            )
            findings.append(
                "Flicker Dynamics: Periodic toroidal vortex shedding creates flame flicker instability at ~10-15 Hz."
            )
            recommendations.append(
                "Compare directly with ISS microgravity test runs to isolate the pure buoyant enhancement on burning rate."
            )

        if oxygen_pct < 15.0:
            findings.append(
                f"Low Oxygen Concentration Warning: Ambient O2 is at {oxygen_pct:.1f}%, approaching the "
                "limiting oxygen index (LOI). Extinction limits must be closely monitored."
            )

        return {
            "summary": summary,
            "regime_classification": regime,
            "dimensionless_numbers": dim_numbers.model_dump(),
            "scientific_findings": findings,
            "recommendations": recommendations,
            "confidence_score": 0.96,
            "ai_model_used": "NASA-FLAME Combustion Physics & AI Engine v1.0",
        }

    @staticmethod
    def run_analysis(db: Session, req: AnalysisRequest) -> AnalysisResponse:
        """Executes AI analysis for an experiment/simulation, persists record, and returns response."""
        exp = None
        sim = None

        if req.simulation_id:
            sim = db.query(SimulationResult).filter(SimulationResult.id == req.simulation_id).first()
            if not sim:
                raise EntityNotFoundException(entity_name="SimulationResult", entity_id=req.simulation_id)
            exp = db.query(Experiment).filter(Experiment.id == sim.experiment_id).first()
        elif req.experiment_id:
            exp = db.query(Experiment).filter(Experiment.id == req.experiment_id).first()
            if not exp:
                raise EntityNotFoundException(entity_name="Experiment", entity_id=req.experiment_id)
            # Find most recent simulation if available
            sim = (
                db.query(SimulationResult)
                .filter(SimulationResult.experiment_id == exp.id)
                .order_by(SimulationResult.created_at.desc())
                .first()
            )

        # Default physical parameters if neither DB record exists
        gravity_g = sim.gravity_level_g if sim else (exp.gravity_level_g if exp else 0.0)
        fuel_type = exp.fuel_type if exp else "Methane"
        flame_shape = sim.flame_shape if sim else "SPHERICAL"
        max_temp_k = sim.max_temperature_k if sim and sim.max_temperature_k else 2100.0
        ambient_temp_k = exp.ambient_temperature_k if exp else 298.15
        soot_fraction = sim.soot_volume_fraction if sim else 1.0e-6
        char_len_mm = (
            exp.initial_droplet_diameter_mm
            if exp and exp.initial_droplet_diameter_mm
            else (exp.burner_diameter_mm if exp and exp.burner_diameter_mm else 5.0)
        )
        oxygen_pct = exp.oxygen_percentage if exp else 21.0
        pressure_atm = exp.pressure_atm if exp else 1.0

        focus = req.analysis_focus or "full"

        # 1. Try external Member 3 AI module
        exp_dict = (
            {
                "fuel_type": fuel_type,
                "gravity_level_g": gravity_g,
                "oxygen_percentage": oxygen_pct,
                "pressure_atm": pressure_atm,
            }
            if exp
            else req.experimental_data
        )

        sim_dict = (
            {
                "flame_shape": flame_shape,
                "max_temperature_k": max_temp_k,
                "flame_radius_mm": sim.flame_radius_mm if sim else None,
                "burn_rate_mg_s": sim.burn_rate_mg_s if sim else None,
            }
            if sim
            else None
        )

        ai_output = AIService._try_call_member3_engine(
            experiment_data=exp_dict,
            simulation_data=sim_dict,
            focus=focus,
        )

        # 2. Fall back to internal scientific combustion physics analyzer
        if not ai_output:
            ai_output = AIService._execute_scientific_analysis(
                gravity_g=gravity_g,
                fuel_type=fuel_type,
                flame_shape=flame_shape,
                max_temp_k=max_temp_k,
                ambient_temp_k=ambient_temp_k,
                soot_fraction=soot_fraction,
                char_len_mm=char_len_mm,
                oxygen_pct=oxygen_pct,
                pressure_atm=pressure_atm,
                focus=focus,
            )

        # Save record to Database
        ana_record = AnalysisResult(
            experiment_id=exp.id if exp else None,
            simulation_id=sim.id if sim else None,
            status=AnalysisStatus.COMPLETED.value,
            summary=ai_output["summary"],
            regime_classification=ai_output["regime_classification"],
            dimensionless_numbers=ai_output.get("dimensionless_numbers"),
            scientific_findings=ai_output.get("scientific_findings", []),
            recommendations=ai_output.get("recommendations", []),
            confidence_score=ai_output.get("confidence_score", 0.95),
            ai_model_used=ai_output.get("ai_model_used", "NASA-FLAME Combustion AI v1"),
            completed_at=datetime.now(timezone.utc),
        )
        db.add(ana_record)
        db.commit()
        db.refresh(ana_record)

        return analysis_to_response(ana_record)

    @staticmethod
    def get_analysis(db: Session, analysis_id: str) -> AnalysisResponse:
        """Retrieves an existing AI analysis record by ID."""
        ana = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
        if not ana:
            raise EntityNotFoundException(entity_name="AnalysisResult", entity_id=analysis_id)
        return analysis_to_response(ana)

    @staticmethod
    def list_analyses_for_experiment(db: Session, experiment_id: str) -> List[AnalysisResponse]:
        """Lists all analyses associated with a given experiment ID."""
        anas = (
            db.query(AnalysisResult)
            .filter(AnalysisResult.experiment_id == experiment_id)
            .order_by(AnalysisResult.created_at.desc())
            .all()
        )
        return [analysis_to_response(a) for a in anas]

