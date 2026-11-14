"""
Gravity Conditions Comparison Engine.
Compares normal gravity (1g) and microgravity (mu-g) combustion data,
computing quantitative shifts and providing fluid-dynamic and kinetic attributions.
"""

import uuid
from typing import Union, Dict, Any, List, Optional
import numpy as np
import pandas as pd

try:
    from .schemas import (
        GravityComparisonResult,
        MetricComparison,
        DataOrigin,
        ProvenanceMetadata
    )
except (ImportError, ValueError):
    from schemas import (
        GravityComparisonResult,
        MetricComparison,
        DataOrigin,
        ProvenanceMetadata
    )


def _to_record(data: Union[pd.DataFrame, Dict[str, Any], pd.Series]) -> Dict[str, Any]:
    if isinstance(data, pd.DataFrame):
        return data.mean(numeric_only=True).to_dict()
    elif isinstance(data, pd.Series):
        return data.to_dict()
    elif isinstance(data, dict):
        return data.copy()
    else:
        raise ValueError(f"Unsupported record format: {type(data)}")


def compare_gravity_conditions(
    data_1g: Union[pd.DataFrame, Dict[str, Any], pd.Series],
    data_mug: Union[pd.DataFrame, Dict[str, Any], pd.Series],
    fuel_or_config: Optional[str] = None,
    provenance: Optional[ProvenanceMetadata] = None,
    comparison_id: Optional[str] = None
) -> GravityComparisonResult:
    """
    Quantitatively compare identical or matched combustion conditions between
    terrestrial 1g and microgravity.
    """
    comparison_id = comparison_id or f"CMP-{uuid.uuid4().hex[:8].upper()}"
    rec_1g = _to_record(data_1g)
    rec_mug = _to_record(data_mug)

    config_label = fuel_or_config or str(rec_1g.get("fuel_type", rec_mug.get("fuel_type", "Hydrocarbon Flame Benchmark")))

    metrics_to_compare = [
        (
            "aspect_ratio",
            "Aspect Ratio (L/W)",
            "Absence of upward buoyant acceleration allows flame to expand spherically rather than stretching vertically."
        ),
        (
            "flame_width_mm",
            "Flame Width (mm)",
            "Molecular diffusion expands radially in all directions unhindered by inward convective entrainment."
        ),
        (
            "flame_length_mm",
            "Flame Length (mm)",
            "In laminar diffusion flames, Burke-Schumann length is primarily fuel-flow controlled; minor change reflects diffusion boundary expansion."
        ),
        (
            "peak_temperature_k",
            "Peak Flame Temperature (K)",
            "Molecular diffusion limits local oxygen replenishment rate while long residence time causes elevated radiative heat loss."
        ),
        (
            "flicker_frequency_hz",
            "Flicker Frequency (Hz)",
            "Elimination of buoyant shear layer and Rayleigh-Taylor vortex shedding produces absolute visual steadiness (0 Hz)."
        ),
        (
            "soot_volume_fraction_ppm",
            "Soot Volume Fraction (ppm)",
            "Drastically lengthened gas residence time allows extensive PAH inception and fractal soot agglomeration."
        ),
        (
            "radiative_loss_fraction",
            "Radiative Heat Loss Fraction",
            "Larger radiating flame volume and high soot concentration dramatically elevate the proportion of heat lost via thermal radiation."
        ),
        (
            "burning_rate_k_mm2_s",
            "Burning Rate K (mm^2/s)",
            "Diffusive boundary layer around fuel source thickens, reducing the oxidizer gradient and mass burning rate."
        )
    ]

    metric_comparisons: List[MetricComparison] = []
    differences_summary: List[str] = []

    for key, display_name, physical_cause in metrics_to_compare:
        v1 = float(rec_1g.get(key, 0.0))
        vm = float(rec_mug.get(key, 0.0))

        if v1 == 0.0 and vm == 0.0:
            continue

        abs_diff = vm - v1
        pct_diff = ((vm - v1) / v1 * 100.0) if abs(v1) > 1e-4 else 0.0
        direction = "INCREASED" if abs_diff > 0 else ("DECREASED" if abs_diff < 0 else "UNCHANGED")

        metric_comparisons.append(MetricComparison(
            metric_name=display_name,
            value_1g=round(v1, 3),
            value_microgravity=round(vm, 3),
            absolute_difference=round(abs_diff, 3),
            percentage_change=round(pct_diff, 2),
            direction=direction,
            physical_driver=physical_cause
        ))

        differences_summary.append(
            f"{display_name}: Changed from {v1:.2f} (1g) to {vm:.2f} (microgravity) "
            f"({pct_diff:+.1f}%). Driver: {physical_cause}"
        )

    key_mechanisms = [
        "Buoyancy Suppression: Grashof number Gr drops from ~10^5 to < 10^-2, shutting down natural convection.",
        "Transport Mode Switch: Convective advection replaced entirely by Fickian molecular diffusion and Fourier conduction.",
        "Residence Time Inflation: Particle residence time increases from tens of milliseconds to hundreds of milliseconds.",
        "Thermal Radiation Dominance: Radiative cooling replaces buoyant plume advection as the primary energy loss pathway."
    ]

    conclusions = (
        f"Microgravity fundamental shifts observed for {config_label}: "
        f"Flame geometry transitions from a narrow, buoyant, flickering plume (aspect ratio ~{rec_1g.get('aspect_ratio', 4.5):.2f}) "
        f"to an exceptionally stable, broad, spherical diffusion envelope (aspect ratio ~{rec_mug.get('aspect_ratio', 1.1):.2f}). "
        f"Peak temperatures drop by ~{abs(rec_mug.get('peak_temperature_k', 1800) - rec_1g.get('peak_temperature_k', 2050)):.0f} K "
        f"due to diffusion-limited oxygen flux and strong radiative cooling from accumulated soot."
    )

    limitations = [
        "Comparison assumes matched ambient oxygen concentration and fuel composition.",
        "Microgravity data may incorporate residual g-jitter (~10^-5 g) characteristic of orbital platforms.",
        "Sensor radiation corrections for thermocouples must be accounted for across both regimes."
    ]

    data_origin = provenance.data_origin if provenance else DataOrigin.EXPERIMENTAL_MEASURED

    return GravityComparisonResult(
        comparison_id=comparison_id,
        fuel_or_configuration=config_label,
        data_origin=data_origin,
        metrics_comparison=metric_comparisons,
        summary_of_differences=differences_summary,
        key_physical_mechanisms=key_mechanisms,
        scientific_conclusions=conclusions,
        limitations=limitations
    )
