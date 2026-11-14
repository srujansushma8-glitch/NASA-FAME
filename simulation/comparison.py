"""Side-by-side comparative analysis between normal gravity and microgravity combustion."""

from typing import Dict, Any, List


def compare_simulations(normal_sim: Dict[str, Any], micro_sim: Dict[str, Any]) -> Dict[str, Any]:
    """Perform rigorous quantitative and physical comparison between 1g and microgravity results.

    Args:
        normal_sim: Result dictionary from normal gravity simulation.
        micro_sim: Result dictionary from microgravity simulation.

    Returns:
        Structured comparison metrics, differences, ratios, and scientific commentary.
    """
    g_1g = normal_sim.get("input_parameters", {}).get("gravity", 9.81)
    g_ug = micro_sim.get("input_parameters", {}).get("gravity", 1.0e-6)

    # Flame Geometry Comparison
    geom_1g = normal_sim.get("flame_geometry", {})
    geom_ug = micro_sim.get("flame_geometry", {})

    h_1g = geom_1g.get("height_mm", 0.0)
    h_ug = geom_ug.get("height_mm", 0.0)
    delta_height_mm = h_ug - h_1g
    pct_height_change = ((h_ug - h_1g) / max(1e-4, h_1g)) * 100.0

    w_1g = geom_1g.get("width_mm", 0.0)
    w_ug = geom_ug.get("width_mm", 0.0)
    delta_width_mm = w_ug - w_1g
    pct_width_change = ((w_ug - w_1g) / max(1e-4, w_1g)) * 100.0

    ar_1g = geom_1g.get("aspect_ratio", 0.0)
    ar_ug = geom_ug.get("aspect_ratio", 0.0)
    delta_aspect_ratio = ar_ug - ar_1g
    pct_ar_change = ((ar_ug - ar_1g) / max(1e-4, ar_1g)) * 100.0

    vol_1g = geom_1g.get("flame_volume_cm3", 0.0)
    vol_ug = geom_ug.get("flame_volume_cm3", 0.0)
    vol_expansion_ratio = vol_ug / max(1e-4, vol_1g)

    # Thermal & Energetics Comparison
    temp_1g = normal_sim.get("temperature_distribution", {})
    temp_ug = micro_sim.get("temperature_distribution", {})

    peak_t_1g = temp_1g.get("peak_temperature_K", 0.0)
    peak_t_ug = temp_ug.get("peak_temperature_K", 0.0)
    delta_peak_temp_k = peak_t_ug - peak_t_1g

    phys_1g = normal_sim.get("physical_quantities", {})
    phys_ug = micro_sim.get("physical_quantities", {})

    chi_rad_1g = phys_1g.get("radiative_fraction", 0.0)
    chi_rad_ug = phys_ug.get("radiative_fraction", 0.0)
    delta_chi_rad = chi_rad_ug - chi_rad_1g

    v_conv_1g = phys_1g.get("convective_velocity_max_m_s", 0.0)
    v_conv_ug = phys_ug.get("convective_velocity_max_m_s", 0.0)
    velocity_reduction_factor = v_conv_1g / max(1e-4, v_conv_ug)

    flicker_1g = phys_1g.get("flicker_frequency_hz", 0.0)
    flicker_ug = phys_ug.get("flicker_frequency_hz", 0.0)

    soot_1g = phys_1g.get("soot_yield_index", 0.0)
    soot_ug = phys_ug.get("soot_yield_index", 0.0)

    ri_1g = phys_1g.get("richardson_number", 0.0)
    ri_ug = phys_ug.get("richardson_number", 0.0)

    # Scientific Narrative Synthesis
    scientific_insights: List[str] = [
        (
            f"Aspect Ratio Transition: Normal gravity produces a slender, elongated flame "
            f"(AR = {ar_1g:.2f}) driven by upward buoyant acceleration. In microgravity, absence "
            f"of buoyant draft causes isotropic diffusion, collapsing the aspect ratio to {ar_ug:.2f} "
            f"({pct_ar_change:+.1f}% shift towards spherical symmetry)."
        ),
        (
            f"Thermal Field & Radiative Cooling: Microgravity peak temperature is "
            f"{abs(delta_peak_temp_k):.1f} K {'cooler' if delta_peak_temp_k < 0 else 'hotter'} "
            f"than 1g. Because hot exhaust products linger around the flame ball rather than being "
            f"swept aloft, the radiative heat loss fraction increases from {chi_rad_1g * 100:.1f}% to "
            f"{chi_rad_ug * 100:.1f}%, raising the risk of radiative extinction."
        ),
        (
            f"Fluid Dynamics & Instability: Convective velocity drops by a factor of "
            f"{velocity_reduction_factor:.1f}x (from {v_conv_1g:.2f} m/s to {v_conv_ug:.3f} m/s). "
            f"The buoyant Kelvin-Helmholtz flicker frequency drops from {flicker_1g:.1f} Hz to "
            f"{flicker_ug:.1f} Hz, resulting in a completely steady, silent, quiescent flame."
        ),
        (
            f"Soot Dynamics: Extended residence time in microgravity enhances soot precursor "
            f"agglomeration (soot yield index increases from {soot_1g:.2f} to {soot_ug:.2f}), "
            f"forming characteristic soot shells as documented in NASA FLEX and CIR experiments."
        ),
    ]

    return {
        "summary": {
            "title": "Side-by-Side Comparison: Normal Gravity (1g) vs Microgravity (μg)",
            "gravity_1g_m_s2": g_1g,
            "gravity_ug_m_s2": g_ug,
            "primary_difference": "Transition from Buoyancy-Convective Plume to Isotropic Molecular Diffusion",
        },
        "geometry_comparison": {
            "normal_gravity": {
                "height_mm": h_1g,
                "width_mm": w_1g,
                "aspect_ratio": ar_1g,
                "volume_cm3": vol_1g,
                "shape": geom_1g.get("shape_classification", "teardrop_slender"),
            },
            "microgravity": {
                "height_mm": h_ug,
                "width_mm": w_ug,
                "aspect_ratio": ar_ug,
                "volume_cm3": vol_ug,
                "shape": geom_ug.get("shape_classification", "spherical_expanded"),
            },
            "differences": {
                "delta_height_mm": round(delta_height_mm, 2),
                "percent_height_change": round(pct_height_change, 1),
                "delta_width_mm": round(delta_width_mm, 2),
                "percent_width_change": round(pct_width_change, 1),
                "delta_aspect_ratio": round(delta_aspect_ratio, 2),
                "percent_aspect_ratio_change": round(pct_ar_change, 1),
                "volume_expansion_ratio": round(vol_expansion_ratio, 2),
            },
        },
        "energetics_and_transport": {
            "peak_temperature_difference_K": round(delta_peak_temp_k, 2),
            "radiative_fraction_1g": round(chi_rad_1g, 3),
            "radiative_fraction_ug": round(chi_rad_ug, 3),
            "convective_velocity_1g_m_s": round(v_conv_1g, 3),
            "convective_velocity_ug_m_s": round(v_conv_ug, 4),
            "richardson_number_1g": round(ri_1g, 2),
            "richardson_number_ug": round(ri_ug, 6),
            "flicker_frequency_1g_hz": round(flicker_1g, 1),
            "flicker_frequency_ug_hz": round(flicker_ug, 1),
            "soot_yield_1g": round(soot_1g, 3),
            "soot_yield_ug": round(soot_ug, 3),
        },
        "scientific_insights": scientific_insights,
    }
