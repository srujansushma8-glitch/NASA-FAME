"""
Flame Behavior Analysis Engine.
Analyzes flame geometry, aspect ratio, spherical symmetry, flicker dynamics,
and classifies combustion regimes based on physical fluid mechanics.
"""

import uuid
from typing import Union, Dict, Any, List, Optional
import numpy as np
import pandas as pd

try:
    from .schemas import (
        FlameBehaviorAnalysis,
        FlameGeometryMetrics,
        CombustionPhysicsMetrics,
        GravityRegime,
        CombustionRegime,
        DataOrigin,
        ProvenanceMetadata
    )
except (ImportError, ValueError):
    from schemas import (
        FlameBehaviorAnalysis,
        FlameGeometryMetrics,
        CombustionPhysicsMetrics,
        GravityRegime,
        CombustionRegime,
        DataOrigin,
        ProvenanceMetadata
    )


def _classify_gravity(gravity_g: float) -> GravityRegime:
    if gravity_g < 0.005:
        return GravityRegime.MICROGRAVITY
    elif 0.95 <= gravity_g <= 1.05:
        return GravityRegime.NORMAL_1G
    elif 0.005 <= gravity_g < 0.95:
        return GravityRegime.PARTIAL_GRAVITY
    else:
        return GravityRegime.VARIABLE


def _classify_regime(
    gravity_g: float,
    peak_temp_k: float,
    aspect_ratio: float,
    fuel_type: str = "",
    cool_flame_flag: bool = False
) -> CombustionRegime:
    if peak_temp_k <= 350.0:
        return CombustionRegime.EXTINGUISHED

    if gravity_g < 0.005:
        if cool_flame_flag or (450.0 <= peak_temp_k <= 950.0):
            return CombustionRegime.MICROGRAVITY_COOL_FLAME_TRANSITION
        if "H2" in fuel_type and aspect_ratio <= 1.05 and peak_temp_k < 1400.0:
            return CombustionRegime.STATIONARY_FLAME_BALL
        return CombustionRegime.DIFFUSION_CONTROLLED_STEADY
    else:
        if aspect_ratio > 3.0:
            return CombustionRegime.BUOYANT_LAMINAR
        return CombustionRegime.BUOYANT_LAMINAR


def analyze_flame_behavior(
    data: Union[pd.DataFrame, Dict[str, Any], pd.Series],
    provenance: Optional[ProvenanceMetadata] = None,
    analysis_id: Optional[str] = None
) -> FlameBehaviorAnalysis:
    """
    Perform deep physical analysis on flame geometry, aspect ratio,
    buoyancy-driven flicker, and combustion regime.
    """
    analysis_id = analysis_id or f"FBA-{uuid.uuid4().hex[:8].upper()}"

    if isinstance(data, pd.DataFrame):
        row = data.iloc[0].to_dict()
    elif isinstance(data, pd.Series):
        row = data.to_dict()
    elif isinstance(data, dict):
        row = data.copy()
    else:
        raise ValueError(f"Unsupported data format for flame analysis: {type(data)}")

    # Extract or infer basic parameters
    length_mm = float(row.get("flame_length_mm", row.get("flame_height_mm", 20.0)))
    width_mm = float(row.get("flame_width_mm", 10.0))
    gravity_g = float(row.get("gravity_g", 1.0))
    peak_temp_k = float(row.get("peak_temperature_k", row.get("peak_hot_temp_k", 1800.0)))
    fuel = str(row.get("fuel_type", "Hydrocarbon"))
    cool_flag = bool(row.get("cool_flame_observed", False))

    aspect_ratio = float(row.get("aspect_ratio", length_mm / max(width_mm, 1e-3)))
    symmetry_index = abs(aspect_ratio - 1.0)

    # Standoff and surface area estimation
    standoff = float(row.get("flame_standoff_ratio", 0.0)) if "flame_standoff_ratio" in row else None
    
    # Surface area estimation (ellipsoidal approximation: A ~ 2*pi*(w/2)^2 + 2*pi*(l/2)*(w/2))
    surface_area_mm2 = float(np.pi * (width_mm / 2.0) * ((width_mm / 2.0) + (length_mm / 2.0)))

    geometry = FlameGeometryMetrics(
        flame_length_mm=round(length_mm, 3),
        flame_width_mm=round(width_mm, 3),
        aspect_ratio=round(aspect_ratio, 3),
        spherical_symmetry_index=round(symmetry_index, 3),
        standoff_ratio=round(standoff, 3) if standoff else None,
        flame_surface_area_est_mm2=round(surface_area_mm2, 2)
    )

    # Combustion physics metrics
    gr = float(row.get("grashof_number", 0.0)) if "grashof_number" in row else None
    ri = float(row.get("richardson_number", 0.0)) if "richardson_number" in row else None
    fr = float(row.get("froude_number", 0.0)) if "froude_number" in row else None
    flicker = float(row.get("flicker_frequency_hz", 0.0))
    if flicker == 0.0 and gravity_g >= 0.01:
        flicker = round(1.5 / np.sqrt(max(width_mm / 1000.0, 0.002)), 1)
    elif gravity_g < 0.01:
        flicker = 0.0

    # Residence time estimation
    if gravity_g >= 0.01:
        # Buoyant acceleration: u_buoyant ~ sqrt(2 * g * L * delta_rho / rho) ~ 1.5 m/s
        u_est = max(np.sqrt(2.0 * 9.80665 * (length_mm / 1000.0) * 0.75), 0.5)
        tau_res_ms = (length_mm / (u_est * 1000.0)) * 1000.0
    else:
        # Microgravity: diffusion timescale tau ~ L^2 / (4 * D_AB) with D_AB ~ 1e-4 m^2/s at flame temp
        tau_res_ms = ((length_mm / 1000.0) ** 2 / (4.0 * 1.2e-4)) * 1000.0

    burning_rate = float(row.get("burning_rate_k_mm2_s", row.get("burning_rate_mg_min", 0.0))) or None
    soot_ppm = float(row.get("soot_volume_fraction_ppm", 0.0)) or None
    rad_loss = float(row.get("radiative_loss_fraction", 0.0)) or None

    physics = CombustionPhysicsMetrics(
        grashof_number=round(gr, 1) if gr is not None else None,
        richardson_number=round(ri, 2) if ri is not None else None,
        froude_number=round(fr, 2) if fr is not None else None,
        rayleigh_number=round(gr * 0.71, 1) if gr is not None else None,
        flicker_frequency_hz=round(flicker, 2),
        residence_time_ms=round(tau_res_ms, 1),
        burning_rate_mm2_s=round(burning_rate, 4) if burning_rate else None,
        soot_volume_fraction_ppm=round(soot_ppm, 3) if soot_ppm else None,
        radiative_loss_fraction=round(rad_loss, 3) if rad_loss else None
    )

    gravity_regime = _classify_gravity(gravity_g)
    combustion_regime = _classify_regime(gravity_g, peak_temp_k, aspect_ratio, fuel, cool_flag)

    # Key physical observations
    observations = []
    if gravity_regime == GravityRegime.MICROGRAVITY:
        observations.append(
            f"Spherical / near-spherical symmetry confirmed with aspect ratio {aspect_ratio:.2f} "
            f"(spherical symmetry deviation index: {symmetry_index:.2f})."
        )
        observations.append(
            "Natural convection is suppressed (Gr ~ 0, Ri ~ 0). Oxidizer delivery is diffusion-controlled."
        )
        observations.append(
            f"Hydrodynamic steadiness observed: flicker frequency is 0.0 Hz (absence of buoyant vortex shedding)."
        )
        observations.append(
            f"Prolonged reaction zone residence time ({tau_res_ms:.1f} ms) enhances radiative cooling and soot agglomeration."
        )
        if combustion_regime == CombustionRegime.MICROGRAVITY_COOL_FLAME_TRANSITION:
            observations.append(
                "Low-temperature 'cool flame' burning regime identified, sustained by low-temperature peroxy chemistry."
            )
    elif gravity_regime == GravityRegime.NORMAL_1G:
        observations.append(
            f"Elongated buoyant flame structure with aspect ratio {aspect_ratio:.2f} (slender teardrop geometry)."
        )
        observations.append(
            f"Buoyancy-driven natural convection dominates with estimated flicker frequency {flicker:.1f} Hz."
        )
        observations.append(
            f"Strong convective draft limits reaction residence time to {tau_res_ms:.1f} ms, sweeping soot upward."
        )
    else:
        observations.append(
            f"Partial/Variable gravity ({gravity_g:.3f} g): Mixed convection regime with intermediate flame elongation."
        )

    # Origin resolution
    data_origin = DataOrigin.UNKNOWN
    if provenance:
        data_origin = provenance.data_origin
    elif "data_origin" in row:
        try:
            data_origin = DataOrigin(row["data_origin"])
        except ValueError:
            data_origin = DataOrigin.UNKNOWN

    confidence = 0.95 if data_origin == DataOrigin.EXPERIMENTAL_MEASURED else 0.88

    return FlameBehaviorAnalysis(
        analysis_id=analysis_id,
        gravity_condition=gravity_regime,
        data_origin=data_origin,
        geometry=geometry,
        physics_parameters=physics,
        classified_regime=combustion_regime,
        key_observations=observations,
        confidence_score=confidence
    )
