"""Input parameter definitions, ranges, physical units, and validation logic."""

from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Tuple, Optional
from simulation.core.physical_constants import (
    STANDARD_EARTH_GRAVITY,
    MICROGRAVITY_DEFAULT,
    FUEL_DATABASE,
)


# Physical Parameter Bounds and Units Dictionary
PARAMETER_METADATA = {
    "gravity": {
        "unit": "m/s^2",
        "description": "Gravitational acceleration acting on the combustion domain.",
        "min": 0.0,
        "max": 25.0,
        "default_1g": STANDARD_EARTH_GRAVITY,
        "default_ug": MICROGRAVITY_DEFAULT,
    },
    "condition_type": {
        "unit": "categorical",
        "description": "Gravity experiment condition ('normal_gravity', 'microgravity', or 'custom').",
        "allowed": ["normal_gravity", "microgravity", "custom"],
        "default": "normal_gravity",
    },
    "initial_temperature": {
        "unit": "K",
        "description": "Ambient environmental temperature before ignition.",
        "min": 200.0,
        "max": 500.0,
        "default": 298.15,
    },
    "ambient_pressure": {
        "unit": "Pa",
        "description": "Ambient pressure of the chamber (101325 Pa = 1.0 atm).",
        "min": 20000.0,    # ~0.2 atm (high-altitude or depressurized vessel)
        "max": 300000.0,   # ~3.0 atm
        "default": 101325.0,
    },
    "oxygen_mole_fraction": {
        "unit": "mole fraction (dimensionless)",
        "description": "Atmospheric oxygen fraction (Earth air = 0.21, ISS spacecraft = 0.21 to 0.32).",
        "min": 0.08,  # Below ~8% combustion cannot be sustained
        "max": 0.45,  # Upper safety threshold for combustion experiments
        "default": 0.21,
    },
    "fuel_type": {
        "unit": "categorical",
        "description": "Chemical fuel species injected through the burner.",
        "allowed": list(FUEL_DATABASE.keys()),
        "default": "methane",
    },
    "fuel_flow_rate": {
        "unit": "mg/s",
        "description": "Mass flow rate of gaseous fuel injected into the burner.",
        "min": 0.1,   # 0.1 mg/s
        "max": 50.0,  # 50.0 mg/s (laminar range)
        "default": 2.5,
    },
    "burner_radius": {
        "unit": "mm",
        "description": "Inner radius of the circular fuel injector/burner tube.",
        "min": 0.5,
        "max": 15.0,
        "default": 2.0,
    },
    "duration": {
        "unit": "s",
        "description": "Total duration of the simulated experiment.",
        "min": 0.5,
        "max": 30.0,
        "default": 5.0,
    },
    "time_steps": {
        "unit": "count",
        "description": "Number of temporal discrete points recorded in time-series.",
        "min": 5,
        "max": 100,
        "default": 25,
    },
    "grid_resolution_r": {
        "unit": "cells",
        "description": "Radial discretization grid resolution.",
        "min": 15,
        "max": 80,
        "default": 35,
    },
    "grid_resolution_z": {
        "unit": "cells",
        "description": "Axial discretization grid resolution.",
        "min": 20,
        "max": 100,
        "default": 45,
    },
}


@dataclass
class SimulationParameters:
    """Strongly-typed container for FLAME simulation parameters."""
    gravity: float = STANDARD_EARTH_GRAVITY
    condition_type: str = "normal_gravity"
    initial_temperature: float = 298.15
    ambient_pressure: float = 101325.0
    oxygen_mole_fraction: float = 0.21
    fuel_type: str = "methane"
    fuel_flow_rate: float = 2.5  # mg/s
    burner_radius: float = 2.0   # mm
    duration: float = 5.0        # s
    time_steps: int = 25
    grid_resolution_r: int = 35
    grid_resolution_z: int = 45

    def to_dict(self) -> Dict[str, Any]:
        """Convert parameters to dictionary representation."""
        return asdict(self)


def validate_parameters(params: Optional[Dict[str, Any]] = None) -> Tuple[bool, Dict[str, Any], List[str]]:
    """Validate user-controllable parameters against physical ranges and schema rules.

    Args:
        params: Raw dictionary of input parameters. If None, default normal gravity parameters are used.

    Returns:
        Tuple of:
            - is_valid (bool): True if all parameters are valid or sanitizable.
            - sanitized_params (dict): Validated parameter dictionary with standardized types and values.
            - error_messages (list[str]): List of error explanations if validation failed.
    """
    errors: List[str] = []
    sanitized: Dict[str, Any] = {}

    if params is None:
        params = {}

    # 1. Condition type
    raw_condition = str(params.get("condition_type", "normal_gravity")).lower().strip()
    if raw_condition not in PARAMETER_METADATA["condition_type"]["allowed"]:
        errors.append(
            f"Invalid condition_type '{raw_condition}'. Allowed values: {PARAMETER_METADATA['condition_type']['allowed']}."
        )
        raw_condition = "normal_gravity"
    sanitized["condition_type"] = raw_condition

    # 2. Gravity
    if "gravity" in params:
        try:
            g_val = float(params["gravity"])
            g_meta = PARAMETER_METADATA["gravity"]
            if g_val < g_meta["min"] or g_val > g_meta["max"]:
                errors.append(
                    f"Gravity {g_val} m/s^2 is out of physical bounds [{g_meta['min']}, {g_meta['max']}]."
                )
            sanitized["gravity"] = max(g_meta["min"], min(g_val, g_meta["max"]))
        except (ValueError, TypeError):
            errors.append(f"Gravity parameter '{params['gravity']}' must be a numerical float.")
            sanitized["gravity"] = STANDARD_EARTH_GRAVITY
    else:
        # Default based on condition type
        if sanitized["condition_type"] == "microgravity":
            sanitized["gravity"] = MICROGRAVITY_DEFAULT
        else:
            sanitized["gravity"] = STANDARD_EARTH_GRAVITY

    # 3. Initial Temperature
    try:
        t_val = float(params.get("initial_temperature", 298.15))
        t_meta = PARAMETER_METADATA["initial_temperature"]
        if t_val < t_meta["min"] or t_val > t_meta["max"]:
            errors.append(
                f"Initial temperature {t_val} K is outside reasonable range [{t_meta['min']}, {t_meta['max']}]."
            )
        sanitized["initial_temperature"] = max(t_meta["min"], min(t_val, t_meta["max"]))
    except (ValueError, TypeError):
        errors.append("initial_temperature must be a valid float.")
        sanitized["initial_temperature"] = 298.15

    # 4. Ambient Pressure
    try:
        p_val = float(params.get("ambient_pressure", 101325.0))
        p_meta = PARAMETER_METADATA["ambient_pressure"]
        if p_val < p_meta["min"] or p_val > p_meta["max"]:
            errors.append(
                f"Ambient pressure {p_val} Pa is outside supported chamber range [{p_meta['min']}, {p_meta['max']}]."
            )
        sanitized["ambient_pressure"] = max(p_meta["min"], min(p_val, p_meta["max"]))
    except (ValueError, TypeError):
        errors.append("ambient_pressure must be a valid float.")
        sanitized["ambient_pressure"] = 101325.0

    # 5. Oxygen mole fraction
    try:
        o2_val = float(params.get("oxygen_mole_fraction", 0.21))
        o2_meta = PARAMETER_METADATA["oxygen_mole_fraction"]
        if o2_val < o2_meta["min"] or o2_val > o2_meta["max"]:
            errors.append(
                f"Oxygen mole fraction {o2_val} is outside combustion flammability bounds [{o2_meta['min']}, {o2_meta['max']}]."
            )
        sanitized["oxygen_mole_fraction"] = max(o2_meta["min"], min(o2_val, o2_meta["max"]))
    except (ValueError, TypeError):
        errors.append("oxygen_mole_fraction must be a valid float.")
        sanitized["oxygen_mole_fraction"] = 0.21

    # 6. Fuel Type
    fuel_val = str(params.get("fuel_type", "methane")).lower().strip()
    if fuel_val not in FUEL_DATABASE:
        errors.append(
            f"Unsupported fuel_type '{fuel_val}'. Available fuels: {list(FUEL_DATABASE.keys())}."
        )
        fuel_val = "methane"
    sanitized["fuel_type"] = fuel_val

    # 7. Fuel Flow Rate
    try:
        flow_val = float(params.get("fuel_flow_rate", 2.5))
        flow_meta = PARAMETER_METADATA["fuel_flow_rate"]
        if flow_val < flow_meta["min"] or flow_val > flow_meta["max"]:
            errors.append(
                f"Fuel flow rate {flow_val} mg/s is outside laminar flow regime bounds [{flow_meta['min']}, {flow_meta['max']}]."
            )
        sanitized["fuel_flow_rate"] = max(flow_meta["min"], min(flow_val, flow_meta["max"]))
    except (ValueError, TypeError):
        errors.append("fuel_flow_rate must be a valid float.")
        sanitized["fuel_flow_rate"] = 2.5

    # 8. Burner Radius
    try:
        radius_val = float(params.get("burner_radius", 2.0))
        r_meta = PARAMETER_METADATA["burner_radius"]
        if radius_val < r_meta["min"] or radius_val > r_meta["max"]:
            errors.append(
                f"Burner radius {radius_val} mm is outside standard dimensions [{r_meta['min']}, {r_meta['max']}]."
            )
        sanitized["burner_radius"] = max(r_meta["min"], min(radius_val, r_meta["max"]))
    except (ValueError, TypeError):
        errors.append("burner_radius must be a valid float.")
        sanitized["burner_radius"] = 2.0

    # 9. Duration
    try:
        dur_val = float(params.get("duration", 5.0))
        dur_meta = PARAMETER_METADATA["duration"]
        if dur_val < dur_meta["min"] or dur_val > dur_meta["max"]:
            errors.append(
                f"Duration {dur_val} s is outside simulation bounds [{dur_meta['min']}, {dur_meta['max']}]."
            )
        sanitized["duration"] = max(dur_meta["min"], min(dur_val, dur_meta["max"]))
    except (ValueError, TypeError):
        errors.append("duration must be a valid float.")
        sanitized["duration"] = 5.0

    # 10. Temporal & Spatial Resolution
    try:
        sanitized["time_steps"] = max(5, min(int(params.get("time_steps", 25)), 100))
    except (ValueError, TypeError):
        sanitized["time_steps"] = 25

    try:
        sanitized["grid_resolution_r"] = max(15, min(int(params.get("grid_resolution_r", 35)), 80))
    except (ValueError, TypeError):
        sanitized["grid_resolution_r"] = 35

    try:
        sanitized["grid_resolution_z"] = max(20, min(int(params.get("grid_resolution_z", 45)), 100))
    except (ValueError, TypeError):
        sanitized["grid_resolution_z"] = 45

    is_valid = len(errors) == 0
    return is_valid, sanitized, errors
