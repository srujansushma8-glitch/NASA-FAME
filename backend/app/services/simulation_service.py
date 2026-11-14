"""Simulation Service and Integration Adapter for Member 4's Simulation Engine.

Coordinates parameter validation, dispatches execution to Member 4's module
(or physics-based microgravity fallback), and stores structured results.
"""

from datetime import datetime, timezone
import importlib
import logging
import math
import time
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from backend.app.core.exceptions import EntityNotFoundException, ServiceIntegrationException
from backend.app.models.experiment import Experiment
from backend.app.models.simulation import SimulationResult
from backend.app.schemas.common import FlameShape, SimulationStatus
from backend.app.schemas.simulation import (
    SimulationParameters,
    SimulationRequest,
    SimulationResponse,
    SimulationScalarField,
    SimulationTimeSeriesPoint,
)

logger = logging.getLogger(__name__)


def simulation_to_response(sim: SimulationResult) -> SimulationResponse:
    """Transforms SQLAlchemy SimulationResult model into standardized SimulationResponse."""
    time_series = None
    if sim.time_series_data and isinstance(sim.time_series_data, list):
        time_series = [SimulationTimeSeriesPoint(**pt) for pt in sim.time_series_data]

    spatial_field = None
    if sim.spatial_scalar_field and isinstance(sim.spatial_scalar_field, dict):
        spatial_field = SimulationScalarField(**sim.spatial_scalar_field)

    return SimulationResponse(
        id=sim.id,
        experiment_id=sim.experiment_id,
        status=SimulationStatus(sim.status),
        gravity_level_g=sim.gravity_level_g,
        flame_shape=FlameShape(sim.flame_shape),
        flame_radius_mm=sim.flame_radius_mm,
        flame_height_mm=sim.flame_height_mm,
        max_temperature_k=sim.max_temperature_k,
        burn_rate_mg_s=sim.burn_rate_mg_s,
        soot_volume_fraction=sim.soot_volume_fraction,
        extinction_time_s=sim.extinction_time_s,
        time_series=time_series,
        spatial_scalar_field=spatial_field,
        execution_duration_ms=sim.execution_duration_ms,
        error_message=sim.error_message,
        created_at=sim.created_at,
        completed_at=sim.completed_at,
    )


class SimulationService:
    """Orchestrates combustion simulation runs and integrates with Member 4's engine."""

    @staticmethod
    def _try_call_member4_engine(
        experiment_config: Dict[str, Any], sim_params: SimulationParameters
    ) -> Optional[Dict[str, Any]]:
        """Attempts to dynamically call Member 4's external simulation engine if installed."""
        try:
            # Check for candidate entry points in simulation module
            for module_name in ["simulation.engine", "simulation.interface", "simulation"]:
                try:
                    mod = importlib.import_module(module_name)
                    if hasattr(mod, "run_simulation") and callable(getattr(mod, "run_simulation")):
                        logger.info(f"Found Member 4 simulation entrypoint: {module_name}.run_simulation")
                        return mod.run_simulation(
                            config=experiment_config,
                            params=sim_params.model_dump(),
                        )
                except ImportError:
                    continue
        except Exception as exc:
            logger.warning(f"Error attempting Member 4 simulation module call: {exc}. Using internal solver.")
        return None

    @staticmethod
    def _execute_physics_simulation(
        fuel_type: str,
        gravity_g: float,
        pressure_atm: float,
        oxygen_pct: float,
        ambient_temp_k: float,
        burner_diam_mm: Optional[float],
        droplet_diam_mm: Optional[float],
        params: SimulationParameters,
    ) -> Dict[str, Any]:
        """Physics-grounded microgravity vs terrestrial combustion simulation engine.

        Models Burke-Schumann diffusive flame in microgravity (0g) versus
        buoyancy-driven convective plume in 1g.
        """
        start_time = time.perf_counter()

        # Adiabatic flame temperature baseline approximations
        fuel_props = {
            "methane": {"tad": 2226.0, "soot_factor": 1.0, "rate_base": 1.2},
            "ethane": {"tad": 2250.0, "soot_factor": 1.5, "rate_base": 1.4},
            "propane": {"tad": 2250.0, "soot_factor": 2.2, "rate_base": 1.6},
            "hydrogen": {"tad": 2380.0, "soot_factor": 0.0, "rate_base": 3.0},
            "heptane": {"tad": 2290.0, "soot_factor": 2.8, "rate_base": 2.0},
            "methanol": {"tad": 2140.0, "soot_factor": 0.1, "rate_base": 1.1},
        }

        fuel_key = fuel_type.lower().strip()
        prop = fuel_props.get(fuel_key, {"tad": 2200.0, "soot_factor": 1.0, "rate_base": 1.5})

        # Oxygen and pressure scaling
        o2_ratio = max(0.05, oxygen_pct / 21.0)
        p_ratio = max(0.1, pressure_atm)

        # Baseline geometry
        char_len = droplet_diam_mm if droplet_diam_mm else (burner_diam_mm if burner_diam_mm else 5.0)

        # Microgravity vs Buoyant Regime determination
        if gravity_g <= 0.05:
            flame_shape = FlameShape.SPHERICAL.value
            flame_radius = char_len * (1.8 + 0.4 * o2_ratio)
            flame_height = flame_radius * 2.0  # Symmetric sphere
            # Microgravity: increased radiative loss, no buoyant convective heating
            peak_temp = (prop["tad"] - 140.0) * math.sqrt(o2_ratio) * (p_ratio**0.05)
            # Diffusion-controlled burn rate
            burn_rate = prop["rate_base"] * (char_len / 5.0) * math.sqrt(o2_ratio)
            soot_vol_frac = prop["soot_factor"] * 1.5e-6 * (p_ratio**1.2)
        elif gravity_g < 0.5:
            flame_shape = FlameShape.TRANSITIONAL.value
            flame_radius = char_len * (1.5 + 0.3 * o2_ratio)
            flame_height = flame_radius * (2.0 + 2.5 * gravity_g)
            peak_temp = prop["tad"] * math.sqrt(o2_ratio) * (p_ratio**0.05)
            burn_rate = prop["rate_base"] * (char_len / 5.0) * (1.0 + 0.4 * gravity_g)
            soot_vol_frac = prop["soot_factor"] * 2.0e-6 * (p_ratio**1.2)
        else:
            flame_shape = FlameShape.TEARDROP.value
            flame_radius = char_len * (1.1 + 0.2 * o2_ratio)
            # Buoyancy elongates flame upward
            flame_height = flame_radius * (3.5 + 1.2 * math.sqrt(gravity_g))
            peak_temp = prop["tad"] * math.sqrt(o2_ratio) * (p_ratio**0.06)
            burn_rate = prop["rate_base"] * (char_len / 5.0) * (1.0 + 0.8 * math.sqrt(gravity_g))
            soot_vol_frac = prop["soot_factor"] * 3.5e-6 * (p_ratio**1.3)

        # Extinction check for low oxygen
        extinction_time = None
        if oxygen_pct < 13.0:
            flame_shape = FlameShape.EXTINGUISHED.value
            extinction_time = max(0.5, 2.5 * (oxygen_pct / 13.0))
            peak_temp = ambient_temp_k + 200.0

        # Generate Time Series Points
        time_series = []
        n_steps = max(5, int(params.duration_s / params.time_step_s))
        dt = params.time_step_s

        for step in range(n_steps + 1):
            curr_t = round(step * dt, 2)
            if extinction_time and curr_t > extinction_time:
                # Quenched flame
                r_t = 0.0
                t_t = ambient_temp_k
                b_t = 0.0
                s_t = 0.0
            else:
                # Ignition transient curve
                transient = 1.0 - math.exp(-curr_t / 0.4)
                r_t = round(flame_radius * transient, 3)
                t_t = round(ambient_temp_k + (peak_temp - ambient_temp_k) * transient, 1)
                b_t = round(burn_rate * transient, 3)
                s_t = round(soot_vol_frac * transient, 9)

            time_series.append(
                {
                    "time_s": curr_t,
                    "flame_radius_mm": r_t,
                    "max_temperature_k": t_t,
                    "burning_rate_mg_s": b_t,
                    "soot_fraction": s_t,
                }
            )

        # Generate 2D spatial contour field for visualization
        res = min(32, params.grid_resolution)  # Compact grid for rapid rendering
        span_mm = max(20.0, flame_height * 1.5)
        step_mm = (2 * span_mm) / (res - 1)
        grid_x = [round(-span_mm + i * step_mm, 2) for i in range(res)]
        grid_y = [round(-span_mm + j * step_mm, 2) for j in range(res)]

        matrix = []
        for y in grid_y:
            row = []
            for x in grid_x:
                if flame_shape == FlameShape.SPHERICAL.value:
                    # Pure radial spherical symmetry
                    dist = math.sqrt(x**2 + y**2)
                    temp_local = ambient_temp_k + (peak_temp - ambient_temp_k) * math.exp(
                        -((dist - flame_radius) ** 2) / (2 * (flame_radius * 0.45) ** 2)
                    )
                elif flame_shape == FlameShape.TEARDROP.value:
                    # Upward buoyant stretch
                    dist_x = abs(x)
                    dist_y = y - (flame_height * 0.3)
                    temp_local = ambient_temp_k + (peak_temp - ambient_temp_k) * math.exp(
                        -(dist_x**2 / (2 * (flame_radius * 0.5) ** 2))
                        - (dist_y**2 / (2 * (flame_height * 0.6) ** 2))
                    )
                else:
                    # Transitional shape
                    dist_x = abs(x)
                    dist_y = y - (flame_height * 0.2)
                    temp_local = ambient_temp_k + (peak_temp - ambient_temp_k) * math.exp(
                        -(dist_x**2 / (2 * (flame_radius * 0.7) ** 2))
                        - (dist_y**2 / (2 * (flame_height * 0.7) ** 2))
                    )
                row.append(round(temp_local, 1))
            matrix.append(row)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "flame_shape": flame_shape,
            "flame_radius_mm": round(flame_radius, 2),
            "flame_height_mm": round(flame_height, 2),
            "max_temperature_k": round(peak_temp, 1),
            "burn_rate_mg_s": round(burn_rate, 2),
            "soot_volume_fraction": soot_vol_frac,
            "extinction_time_s": extinction_time,
            "time_series_data": time_series,
            "spatial_scalar_field": {
                "grid_x": grid_x,
                "grid_y": grid_y,
                "temperature_matrix": matrix,
            },
            "execution_duration_ms": duration_ms,
        }

    @staticmethod
    def run_simulation(db: Session, req: SimulationRequest) -> SimulationResponse:
        """Executes simulation, saves record, and returns response."""
        params = req.parameters or SimulationParameters()

        # Retrieve or construct experiment configuration
        if req.experiment_id:
            exp = db.query(Experiment).filter(Experiment.id == req.experiment_id).first()
            if not exp:
                raise EntityNotFoundException(entity_name="Experiment", entity_id=req.experiment_id)
            exp_id = exp.id
            fuel_type = exp.fuel_type
            pressure_atm = exp.pressure_atm
            oxygen_pct = exp.oxygen_percentage
            ambient_temp_k = exp.ambient_temperature_k
            gravity_g = (
                params.gravity_level_g if params.gravity_level_g is not None else exp.gravity_level_g
            )
            burner_diam = exp.burner_diameter_mm
            droplet_diam = exp.initial_droplet_diameter_mm
        elif req.adhoc_config:
            # Create a transient or new experiment for this run
            exp = Experiment(
                name=req.adhoc_config.get("name", "Ad-hoc Simulation Experiment"),
                fuel_type=req.adhoc_config.get("fuel_type", "Methane"),
                oxygen_percentage=req.adhoc_config.get("oxygen_percentage", 21.0),
                pressure_atm=req.adhoc_config.get("pressure_atm", 1.0),
                ambient_temperature_k=req.adhoc_config.get("ambient_temperature_k", 298.15),
                gravity_level_g=req.adhoc_config.get("gravity_level_g", 0.0),
                burner_diameter_mm=req.adhoc_config.get("burner_diameter_mm", 10.0),
                initial_droplet_diameter_mm=req.adhoc_config.get("initial_droplet_diameter_mm"),
                status="COMPLETED",
            )
            db.add(exp)
            db.flush()
            exp_id = exp.id
            fuel_type = exp.fuel_type
            pressure_atm = exp.pressure_atm
            oxygen_pct = exp.oxygen_percentage
            ambient_temp_k = exp.ambient_temperature_k
            gravity_g = (
                params.gravity_level_g if params.gravity_level_g is not None else exp.gravity_level_g
            )
            burner_diam = exp.burner_diameter_mm
            droplet_diam = exp.initial_droplet_diameter_mm
        else:
            raise EntityNotFoundException(
                entity_name="Experiment",
                entity_id="Missing both 'experiment_id' and 'adhoc_config'.",
            )

        # 1. Try external Member 4 engine
        sim_output = SimulationService._try_call_member4_engine(
            experiment_config={
                "fuel_type": fuel_type,
                "gravity_level_g": gravity_g,
                "pressure_atm": pressure_atm,
                "oxygen_percentage": oxygen_pct,
                "ambient_temperature_k": ambient_temp_k,
                "burner_diameter_mm": burner_diam,
                "initial_droplet_diameter_mm": droplet_diam,
            },
            sim_params=params,
        )

        # 2. Fall back to internal physics solver if Member 4 module not present
        if not sim_output:
            sim_output = SimulationService._execute_physics_simulation(
                fuel_type=fuel_type,
                gravity_g=gravity_g,
                pressure_atm=pressure_atm,
                oxygen_pct=oxygen_pct,
                ambient_temp_k=ambient_temp_k,
                burner_diam_mm=burner_diam,
                droplet_diam_mm=droplet_diam,
                params=params,
            )

        # Store Simulation Result in Database
        sim_record = SimulationResult(
            experiment_id=exp_id,
            status=SimulationStatus.COMPLETED.value,
            gravity_level_g=gravity_g,
            flame_shape=sim_output.get("flame_shape", FlameShape.SPHERICAL.value),
            flame_radius_mm=sim_output.get("flame_radius_mm"),
            flame_height_mm=sim_output.get("flame_height_mm"),
            max_temperature_k=sim_output.get("max_temperature_k"),
            burn_rate_mg_s=sim_output.get("burn_rate_mg_s"),
            soot_volume_fraction=sim_output.get("soot_volume_fraction"),
            extinction_time_s=sim_output.get("extinction_time_s"),
            time_series_data=sim_output.get("time_series_data"),
            spatial_scalar_field=sim_output.get("spatial_scalar_field"),
            execution_duration_ms=sim_output.get("execution_duration_ms"),
            completed_at=datetime.now(timezone.utc),
        )
        db.add(sim_record)
        db.commit()
        db.refresh(sim_record)

        return simulation_to_response(sim_record)

    @staticmethod
    def get_simulation(db: Session, simulation_id: str) -> SimulationResponse:
        """Retrieves an existing simulation record by ID."""
        sim = db.query(SimulationResult).filter(SimulationResult.id == simulation_id).first()
        if not sim:
            raise EntityNotFoundException(entity_name="SimulationResult", entity_id=simulation_id)
        return simulation_to_response(sim)

    @staticmethod
    def list_simulations_for_experiment(
        db: Session, experiment_id: str
    ) -> List[SimulationResponse]:
        """Lists all simulation runs associated with a given experiment ID."""
        sims = (
            db.query(SimulationResult)
            .filter(SimulationResult.experiment_id == experiment_id)
            .order_by(SimulationResult.created_at.desc())
            .all()
        )
        return [simulation_to_response(s) for s in sims]

