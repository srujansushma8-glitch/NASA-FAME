"""
Temperature Distribution and Thermal Analysis Engine.
Analyzes peak flame temperatures, thermal gradients, boundary layer thickness,
radiative heat loss impacts, and cool-flame transitions.
"""

import uuid
from typing import Union, Dict, Any, Optional
import numpy as np
import pandas as pd

try:
    from .schemas import TemperatureAnalysisResult, DataOrigin, ProvenanceMetadata
except (ImportError, ValueError):
    from schemas import TemperatureAnalysisResult, DataOrigin, ProvenanceMetadata


ADENOMINATIONAL_ADIABATIC_TEMPS = {
    "CH4": 2226.0,
    "C2H4": 2369.0,
    "C3H8": 2267.0,
    "H2": 2380.0,
    "n-Heptane": 2290.0,
    "n-Decane": 2280.0
}


def analyze_temperature(
    data: Union[pd.DataFrame, Dict[str, Any], pd.Series],
    ambient_temp_k: float = 298.15,
    provenance: Optional[ProvenanceMetadata] = None,
    analysis_id: Optional[str] = None
) -> TemperatureAnalysisResult:
    """
    Perform thermodynamic and heat transfer analysis on flame temperature records.
    """
    analysis_id = analysis_id or f"TMP-{uuid.uuid4().hex[:8].upper()}"

    if isinstance(data, pd.DataFrame):
        row = data.iloc[0].to_dict()
    elif isinstance(data, pd.Series):
        row = data.to_dict()
    elif isinstance(data, dict):
        row = data.copy()
    else:
        raise ValueError(f"Unsupported data format for temperature analysis: {type(data)}")

    peak_t = float(row.get("peak_temperature_k", row.get("peak_hot_temp_k", 1850.0)))
    gravity_g = float(row.get("gravity_g", 1.0))
    fuel = str(row.get("fuel_type", "Hydrocarbon"))
    width_mm = float(row.get("flame_width_mm", 10.0))
    rad_loss_fraction = float(row.get("radiative_loss_fraction", 0.20))

    delta_t = max(peak_t - ambient_temp_k, 0.0)

    # Thermal boundary layer thickness estimation:
    # 1g: thin due to buoyant entrainment shear: delta ~ L / sqrt(Gr) ~ 2.5 mm
    # microgravity: thick pure conduction/diffusion zone: delta ~ 8 - 14 mm
    if gravity_g < 0.01:
        boundary_thickness_mm = max(width_mm * 0.45, 6.0)
    else:
        boundary_thickness_mm = max(width_mm * 0.20, 2.0)

    radial_gradient = delta_t / boundary_thickness_mm

    # Evaluate radiative cooling effect
    adiabatic_t = ADENOMINATIONAL_ADIABATIC_TEMPS.get(fuel, 2250.0)
    thermal_deficit = adiabatic_t - peak_t

    if peak_t <= 950.0 and peak_t >= 450.0:
        rad_impact = (
            f"LOW-TEMPERATURE COOL FLAME: Peak temperature ({peak_t:.1f} K) is governed by "
            f"peroxy radical isomerization with minimal radiative soot emissions."
        )
        stability_desc = "Stable low-temperature kinetic regime with low thermal gradients."
    elif gravity_g < 0.01:
        rad_impact = (
            f"ELEVATED RADIATIVE DRAIN: Extended residence time and soot accumulation drive "
            f"substantial radiant cooling (rad fraction ~ {rad_loss_fraction:.2f}), creating a "
            f"{thermal_deficit:.1f} K deficit below adiabatic flame temperature."
        )
        stability_desc = (
            f"Broad, diffuse thermal field with gentle radial gradient ({radial_gradient:.1f} K/mm). "
            f"Thermal boundary layer expanded to ~{boundary_thickness_mm:.1f} mm."
        )
    else:
        rad_impact = (
            f"CONVECTIVE HEAT REMOVAL: Buoyant convection carries ~80% of heat into rising plume; "
            f"radiative fraction is moderate (~ {rad_loss_fraction:.2f})."
        )
        stability_desc = (
            f"Steep radial thermal gradient ({radial_gradient:.1f} K/mm) compressed by buoyant draft. "
            f"Thermal boundary layer remains thin (~{boundary_thickness_mm:.1f} mm)."
        )

    # Sensor uncertainty bounds
    uncertainty = 25.0
    if provenance and provenance.sensor_tolerances:
        tol_str = provenance.sensor_tolerances.get("temperature_K", "25")
        try:
            # parse out digits if possible
            digits = "".join([c for c in tol_str if c.isdigit()])
            if digits:
                uncertainty = float(digits)
        except Exception:
            uncertainty = 25.0

    return TemperatureAnalysisResult(
        analysis_id=analysis_id,
        peak_temperature_k=round(peak_t, 1),
        ambient_temperature_k=ambient_temp_k,
        temperature_differential_k=round(delta_t, 1),
        estimated_radial_gradient_k_per_mm=round(radial_gradient, 1),
        thermal_boundary_thickness_mm=round(boundary_thickness_mm, 2),
        radiative_cooling_impact=rad_impact,
        temperature_stability_description=stability_desc,
        uncertainty_bounds_k=uncertainty
    )
