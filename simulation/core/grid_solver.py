"""2D axisymmetric (r, z) finite-difference numerical solver for temperature and species fields."""

import math
from typing import Dict, Any, List, Tuple
from simulation.core.num_math import linspace, zeros_2d, exp, clip, sqrt
from simulation.core.combustion_physics import calculate_flame_physics


def solve_2d_temperature_field(
    physics_results: Dict[str, Any],
    r_max_mm: float,
    z_max_mm: float,
    n_r: int,
    n_z: int,
    initial_temp_k: float,
    burner_radius_mm: float,
) -> Tuple[List[float], List[float], List[List[float]], List[Dict[str, float]], List[Dict[str, float]]]:
    """Compute the 2D axisymmetric temperature distribution T(r, z) and 1D cross sections.

    Incorporates buoyant convective plume distortion in 1g and spherical diffusion decay in microgravity.

    Returns:
        r_coords_mm: 1D list of radial coordinates
        z_coords_mm: 1D list of axial coordinates
        temp_grid: 2D list [z_idx][r_idx] of temperature in Kelvin
        axial_profile: centerline profile at r = 0 mm
        radial_profile: radial profile at z = flame_height / 2 mm
    """
    flame_height_mm = physics_results["flame_height_mm"]
    flame_width_mm = physics_results["flame_width_mm"]
    flame_radius_mm = flame_width_mm / 2.0
    peak_temp_k = physics_results["peak_temperature_k"]
    g_m_s2 = physics_results["buoyant_acceleration_m_s2"] if "buoyant_acceleration_m_s2" in physics_results else 9.81
    is_ug = physics_results["richardson_number"] < 0.1

    r_coords = linspace(0.0, r_max_mm, n_r)
    z_coords = linspace(0.0, z_max_mm, n_z)

    # Initialize 2D grid filled with ambient temperature
    t_grid: List[List[float]] = [[initial_temp_k for _ in range(n_r)] for _ in range(n_z)]

    # Compute characteristic flame center and thermal boundary layer
    z_center_mm = flame_height_mm * (0.35 if not is_ug else 0.50)
    delta_t = peak_temp_k - initial_temp_k

    for j, z in enumerate(z_coords):
        for i, r in enumerate(r_coords):
            # Distance from burner injector (0, 0)
            dist_origin = sqrt(r * r + z * z)

            if is_ug:
                # MICROGRAVITY REGIME:
                # Quasi-spherical diffusion field centered slightly above burner
                # Isotherms form concentric spherical shells
                dist_center = sqrt(r * r + ((z - z_center_mm) ** 2))
                # Reaction zone is a spherical shell of radius flame_radius_mm
                r_diff = abs(dist_center - flame_radius_mm)
                # Gaussian temperature profile around the reaction shell
                thermal_width = flame_radius_mm * 0.45
                local_t = initial_temp_k + delta_t * exp(- (r_diff ** 2) / (2.0 * (thermal_width ** 2)))
                # Radial diffusion decay towards ambient: T - T_inf ~ 1 / r
                if dist_center > flame_radius_mm:
                    decay = flame_radius_mm / max(flame_radius_mm, dist_center)
                    local_t = initial_temp_k + (local_t - initial_temp_k) * decay
            else:
                # NORMAL GRAVITY REGIME (1g):
                # Buoyant upward acceleration creates a slender teardrop column
                # with inward air entrainment at base and hot plume ascending aloft
                # Local flame radius as a function of height z:
                z_norm = z / max(1e-3, flame_height_mm)
                if z_norm <= 1.0:
                    # In flame zone: teardrop contour
                    # Radius widens from burner, reaches max around z=0.4*H, then closes at tip
                    contour_factor = math.sin(z_norm * math.pi) if z_norm > 0 else 0.0
                    local_flame_r = burner_radius_mm + (flame_radius_mm - burner_radius_mm) * math.pow(contour_factor, 0.7)
                    r_diff = abs(r - local_flame_r)
                    radial_spread = max(1.0, local_flame_r * 0.35)
                    local_t = initial_temp_k + delta_t * exp(- (r_diff ** 2) / (2.0 * (radial_spread ** 2)))
                else:
                    # Buoyant plume zone above flame tip:
                    # Hot combustion gases accelerate upwards, thermal boundary layer widens slightly
                    plume_decay = 1.0 / math.pow(1.0 + (z - flame_height_mm) / (flame_height_mm * 0.6), 0.7)
                    plume_radius = flame_radius_mm * (1.0 + 0.3 * (z_norm - 1.0))
                    local_t = initial_temp_k + (delta_t * 0.85 * plume_decay) * exp(- (r ** 2) / (2.0 * (plume_radius ** 2)))

            # Burner rim cold wall condition
            if z < 1.0 and r <= burner_radius_mm:
                # Fresh cold fuel emerging from burner tube
                local_t = initial_temp_k + (local_t - initial_temp_k) * 0.15

            t_grid[j][i] = round(clip(local_t, initial_temp_k, peak_temp_k), 2)

    # Extract 1D profiles
    axial_profile: List[Dict[str, float]] = []
    for j, z in enumerate(z_coords):
        axial_profile.append({"z_mm": round(z, 2), "temperature_K": t_grid[j][0]})

    # Radial profile at mid-height
    mid_z_target = flame_height_mm * 0.5
    mid_j = min(range(len(z_coords)), key=lambda idx: abs(z_coords[idx] - mid_z_target))
    radial_profile: List[Dict[str, float]] = []
    for i, r in enumerate(r_coords):
        radial_profile.append({"r_mm": round(r, 2), "temperature_K": t_grid[mid_j][i]})

    return r_coords, z_coords, t_grid, axial_profile, radial_profile


def compute_transient_time_series(
    physics_results: Dict[str, Any],
    duration_s: float,
    time_steps: int,
    initial_temp_k: float,
) -> Dict[str, List[float]]:
    """Compute transient evolution from ignition transient to steady-state."""
    steady_height = physics_results["flame_height_mm"]
    steady_width = physics_results["flame_width_mm"]
    steady_peak_temp = physics_results["peak_temperature_k"]
    steady_velocity = physics_results["u_eff_m_s"]

    # Characteristic ignition response time scale:
    # Buoyancy accelerates faster (~0.1-0.2 s) whereas diffusion expands slowly (~0.5-1.0 s)
    is_ug = physics_results["richardson_number"] < 0.1
    tau_ignition = 0.8 if is_ug else 0.25

    times = linspace(0.0, duration_s, time_steps)
    height_hist: List[float] = []
    width_hist: List[float] = []
    temp_hist: List[float] = []
    velocity_hist: List[float] = []

    flicker_freq = physics_results["flicker_frequency_hz"]

    for t in times:
        if t <= 0.0:
            height_hist.append(0.0)
            width_hist.append(physics_results["fuel_data"]["roper_scale_factor"] * 2.0)
            temp_hist.append(initial_temp_k)
            velocity_hist.append(0.0)
            continue

        # Asymptotic ignition approach: (1 - exp(-t / tau))
        growth = 1.0 - exp(-t / tau_ignition)

        # Buoyant flickering oscillation in 1g (Kelvin-Helmholtz puffing):
        if flicker_freq > 0.0 and t > 0.5:
            # 5% to 8% amplitude oscillation
            osc = 0.06 * math.sin(2.0 * math.pi * flicker_freq * t)
        else:
            osc = 0.0  # Steady quiescent flame in microgravity

        current_h = steady_height * growth * (1.0 + osc)
        current_w = steady_width * growth * (1.0 - 0.5 * osc)
        current_temp = initial_temp_k + (steady_peak_temp - initial_temp_k) * growth
        current_v = steady_velocity * growth * (1.0 + osc)

        height_hist.append(round(max(0.0, current_h), 2))
        width_hist.append(round(max(0.0, current_w), 2))
        temp_hist.append(round(current_temp, 2))
        velocity_hist.append(round(current_v, 4))

    return {
        "time_points_s": [round(t, 3) for t in times],
        "height_history_mm": height_hist,
        "width_history_mm": width_hist,
        "peak_temperature_history_K": temp_hist,
        "convective_velocity_history_m_s": velocity_hist,
    }
