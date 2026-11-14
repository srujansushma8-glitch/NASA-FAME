"""Governing equations, dimensionless scaling, and physical calculations for laminar flames."""

import math
from typing import Dict, Any, Tuple
from simulation.core.physical_constants import (
    UNIVERSAL_GAS_CONSTANT,
    STEFAN_BOLTZMANN_CONSTANT,
    AIR_MOLAR_MASS,
    AIR_HEAT_CAPACITY_CP,
    AIR_REFERENCE_VISCOSITY,
    AIR_REFERENCE_CONDUCTIVITY,
    AIR_REFERENCE_DIFFUSIVITY,
    FUEL_DATABASE,
    STANDARD_EARTH_GRAVITY,
    MICROGRAVITY_DEFAULT,
)
from simulation.core.num_math import clip, sqrt, exp


def compute_air_density(pressure_pa: float, temperature_k: float) -> float:
    """Calculate air density using the ideal gas law: rho = P * M / (R_u * T)."""
    return (pressure_pa * AIR_MOLAR_MASS) / (UNIVERSAL_GAS_CONSTANT * temperature_k)


def compute_kinematic_viscosity(pressure_pa: float, temperature_k: float) -> float:
    """Calculate kinematic viscosity nu(T) with Sutherland-like temperature power scaling."""
    rho = compute_air_density(pressure_pa, temperature_k)
    # Dynamic viscosity power law: mu(T) = mu_0 * (T / T_0)^0.7
    mu = AIR_REFERENCE_VISCOSITY * math.pow(temperature_k / 298.15, 0.7)
    return mu / rho


def compute_diffusion_coefficient(pressure_pa: float, temperature_k: float) -> float:
    """Calculate binary mass diffusion coefficient D(T, P) ~ T^1.75 / P."""
    d_0 = AIR_REFERENCE_DIFFUSIVITY
    p_ratio = 101325.0 / max(1000.0, pressure_pa)
    t_ratio = temperature_k / 298.15
    return d_0 * p_ratio * math.pow(t_ratio, 1.75)


def calculate_flame_physics(
    gravity_m_s2: float,
    initial_temp_k: float,
    pressure_pa: float,
    oxygen_mole_frac: float,
    fuel_name: str,
    fuel_flow_rate_mg_s: float,
    burner_radius_mm: float,
) -> Dict[str, Any]:
    """Evaluate combustion physics, dimensionless numbers, geometry, and thermal parameters.

    Integrates the Roper buoyant laminar jet model with microgravity spherical diffusion theory.
    """
    fuel = FUEL_DATABASE.get(fuel_name, FUEL_DATABASE["methane"])

    # Basic unit conversions
    r_burner_m = (burner_radius_mm * 1e-3)
    d_burner_m = 2.0 * r_burner_m
    burner_area_m2 = math.pi * (r_burner_m ** 2)
    m_dot_f_kg_s = (fuel_flow_rate_mg_s * 1e-6)

    # Densities & initial transport properties
    rho_ambient = compute_air_density(pressure_pa, initial_temp_k)
    rho_fuel = (pressure_pa * fuel["molar_mass"]) / (UNIVERSAL_GAS_CONSTANT * initial_temp_k)
    nu_ambient = compute_kinematic_viscosity(pressure_pa, initial_temp_k)
    diff_coeff = compute_diffusion_coefficient(pressure_pa, initial_temp_k)

    # Burner exit injection velocity u_0
    u_0 = m_dot_f_kg_s / (rho_fuel * burner_area_m2)
    vol_flow_rate_m3_s = m_dot_f_kg_s / rho_fuel

    # Stoichiometry
    # S: stoichiometric molar air-to-fuel ratio; s: stoichiometric mass ratio
    s_mass = fuel["stoichiometric_mass_ratio"]
    s_molar = fuel["stoichiometric_molar_ratio"]
    
    # Effective oxidizer mass fraction Y_O2_ambient
    # Conversion from mole fraction X_O2: Y_O2 = X_O2 * M_O2 / M_air
    m_o2 = 0.032  # kg/mol
    y_o2_ambient = (oxygen_mole_frac * m_o2) / AIR_MOLAR_MASS
    # Stoichiometric mixture fraction Z_st
    z_st = y_o2_ambient / (s_mass + y_o2_ambient)

    # Check for oxygen starvation / quench limit
    quench_threshold = fuel["quench_limit_o2"]
    is_oxygen_starved = oxygen_mole_frac < quench_threshold

    # Thermal expansion coefficient beta = 1 / T_ambient
    beta = 1.0 / initial_temp_k

    # Adiabatic Flame Temperature estimate (corrected for oxygen dilution)
    # T_ad_diluted = T_0 + (T_ad_std - T_0) * (X_O2 / 0.21)^0.5
    t_ad_std = fuel["adiabatic_flame_temp_air"]
    dilution_factor = sqrt(oxygen_mole_frac / 0.21)
    t_ad_estimated = initial_temp_k + (t_ad_std - initial_temp_k) * dilution_factor

    # Characteristic length scale (burner diameter)
    l_c = d_burner_m

    # Buoyancy acceleration ratio
    g_ratio = gravity_m_s2 / STANDARD_EARTH_GRAVITY
    is_microgravity = gravity_m_s2 <= 1.0e-3

    # Buoyant convective velocity scale: u_buoy ~ sqrt(2 * g * L * delta_T / T_0)
    delta_t_ref = max(100.0, t_ad_estimated - initial_temp_k)
    if gravity_m_s2 > 1.0e-5:
        u_buoy = sqrt(2.0 * gravity_m_s2 * max(0.01, 2.0 * d_burner_m) * (delta_t_ref / initial_temp_k))
    else:
        u_buoy = 0.0

    # Effective characteristic flow velocity
    u_eff = max(u_0, u_buoy)

    # Flame Geometry Modeling
    # A. Roper Buoyant Jet Model for Normal Gravity (1g):
    # Standard Roper correlation calibrated for small laminar jet burners:
    # L_f_1g ~ C_roper * [Q_F * (T_0 / T_f) / (4 * pi * D_0 * ln(1 + 1/S))]
    # Calibrated against NASA Glenn Drop Tower & Sundarland et al. data
    roper_c = fuel["roper_scale_factor"]
    stoich_log_term = math.log(1.0 + (1.0 / max(0.1, s_molar)))
    temp_ratio = initial_temp_k / max(1000.0, t_ad_estimated)

    # Roper height in 1g (m): produces ~20-35 mm for typical 2.5 mg/s laminar burner
    height_1g_m = roper_c * (vol_flow_rate_m3_s * temp_ratio) / (4.0 * math.pi * diff_coeff * max(0.1, stoich_log_term))
    # Empirical buoyancy necking correction
    height_1g_m = clip(height_1g_m * 12.0, 0.015, 0.060)

    # Normal gravity width (m): inward air entrainment constrains width to ~6-9 mm
    width_1g_m = d_burner_m * 1.5 + 0.003 * math.pow(fuel_flow_rate_mg_s / 2.5, 0.3)

    # B. Microgravity Spherical Diffusion Model (ug):
    # In microgravity, absence of buoyant sweep means isotropic radial molecular diffusion
    # Forms spherical flame ball / dome with diameter ~15-22 mm
    radius_ug_m = 0.008 + 0.003 * math.pow(fuel_flow_rate_mg_s / 2.5, 0.4) * (0.21 / max(0.08, oxygen_mole_frac))
    radius_ug_m = clip(radius_ug_m, 0.006, 0.020)

    # Height and width in microgravity (near-spherical shell)
    height_ug_m = radius_ug_m * 1.8   # Slight axial extension from fuel injection momentum
    width_ug_m = radius_ug_m * 2.0    # Full spherical diameter

    # Smooth blending across gravity levels from 0 to 1g:
    g_blend = math.pow(clip(g_ratio, 0.0, 1.0), 0.35)

    flame_height_m = (1.0 - g_blend) * height_ug_m + g_blend * height_1g_m
    flame_width_m = (1.0 - g_blend) * width_ug_m + g_blend * width_1g_m

    aspect_ratio = flame_height_m / max(1e-4, flame_width_m)

    # Characteristic length scale for buoyant acceleration: flame height L_f
    l_buoyant = flame_height_m

    # Dimensionless numbers
    # 1. Richardson number Ri = g * beta * delta_T * L_buoyant / u_0^2
    # In combustion science, Ri > 1.0 indicates natural buoyancy forces dominate over momentum
    u_0_safe = max(1e-4, u_0)
    richardson = (gravity_m_s2 * beta * delta_t_ref * l_buoyant) / (u_0_safe ** 2)

    # 2. Grashof number Gr = g * beta * delta_T * L^3 / nu^2
    grashof = (gravity_m_s2 * beta * delta_t_ref * (l_buoyant ** 3)) / (nu_ambient ** 2)

    # 3. Froude number Fr = u_0 / sqrt(g * L_c)
    if gravity_m_s2 > 1.0e-5:
        froude = u_0 / sqrt(gravity_m_s2 * l_c)
    else:
        froude = 1e6  # effectively infinite when g -> 0

    # 4. Reynolds number Re = u_0 * L_c / nu
    reynolds = (u_0 * l_c) / nu_ambient

    # 5. Péclet numbers (Convective and Diffusive)
    peclet_conv = (u_eff * l_buoyant) / diff_coeff
    u_diff = diff_coeff / max(1e-4, l_buoyant)
    peclet_diff = (u_diff * l_buoyant) / diff_coeff  # = 1.0 by definition

    # Flame shape classification
    if aspect_ratio >= 1.8:
        shape_class = "teardrop_slender"
    elif aspect_ratio <= 1.25:
        shape_class = "spherical_expanded"
    else:
        shape_class = "transitional_ellipsoid"

    # Surface area and volume estimation (using spheroid approximation)
    a = flame_width_m / 2.0  # semi-major or semi-minor radial
    c = flame_height_m / 2.0  # semi-vertical
    flame_volume_m3 = (4.0 / 3.0) * math.pi * (a ** 2) * c
    # Approximation of spheroid surface area
    p_knudsen = 1.6075
    flame_surface_area_m2 = 4.0 * math.pi * math.pow(
        (math.pow(a * a, p_knudsen) + 2.0 * math.pow(a * c, p_knudsen)) / 3.0,
        1.0 / p_knudsen
    )

    # Residence Time & Sooting Behavior:
    # tau_res = L_c / u_eff. In 1g, tau_res ~ 0.02 s (rapid convective removal).
    # In ug, u_eff ~ u_diff, tau_res ~ 0.2 - 0.4 s (10x longer!).
    residence_time_s = flame_height_m / max(0.01, u_eff)
    soot_index = fuel["soot_propensity"] * (1.0 + 1.8 * (1.0 - g_blend))

    # Thermal Radiation Fraction:
    # In normal gravity: ~12-18%. In microgravity: ~30-45% due to accumulation of CO2/H2O and soot shells.
    chi_rad_1g = 0.14 + 0.04 * fuel["soot_propensity"]
    chi_rad_ug = 0.34 + 0.08 * soot_index
    chi_radiation = (1.0 - g_blend) * chi_rad_ug + g_blend * chi_rad_1g

    # Total Heat Release Rate
    # Q_chem = m_dot * LHV * combustion_efficiency
    combustion_eff = 0.98 if not is_oxygen_starved else 0.40
    heat_release_w = m_dot_f_kg_s * fuel["heat_of_combustion"] * combustion_eff
    radiative_loss_w = heat_release_w * chi_radiation

    # Peak flame temperature determination
    # In microgravity, enhanced radiative loss and lack of convective heating causes flame to be 100K-250K cooler
    temp_drop_rad = 350.0 * (chi_radiation - 0.14)
    peak_temp_k = t_ad_estimated - temp_drop_rad - (500.0 if is_oxygen_starved else 0.0)
    peak_temp_k = max(initial_temp_k, peak_temp_k)

    # Extinction check:
    # Quenched if temperature falls below minimum flame sustain temperature (~1300 K) or severe starvation
    is_quenched = is_oxygen_starved or (peak_temp_k < 1350.0)
    quench_reason = None
    if is_quenched:
        if is_oxygen_starved:
            quench_reason = f"Oxygen mole fraction ({oxygen_mole_frac:.2f}) below flammability limit ({quench_threshold:.2f})."
        else:
            quench_reason = "Radiative extinguishment: radiative loss exceeds critical heat release threshold."

    # Flickering instability frequency (Kelvin-Helmholtz buoyant puffing):
    # In Earth gravity, periodic toroidal vortices shed at f_flicker ~ 1.5 * sqrt(g / D_plume)
    # Using buoyant neck diameter D_plume ~ 0.015-0.025 m gives classical 10-15 Hz candle flicker
    if gravity_m_s2 > 0.1:
        d_plume_m = max(0.012, width_1g_m * 2.0)
        flicker_freq_hz = 1.5 * sqrt(gravity_m_s2 / d_plume_m)
    else:
        flicker_freq_hz = 0.0  # Quiescent diffusion flame in near-zero g

    # Transport regime label
    if richardson > 5.0:
        regime_label = "Buoyancy-Driven Convection"
    elif richardson < 0.1:
        regime_label = "Molecular Diffusion Dominated"
    else:
        regime_label = "Mixed Convection / Diffusion"

    return {
        "fuel_data": fuel,
        "u_0_m_s": u_0,
        "u_buoy_m_s": u_buoy,
        "u_eff_m_s": u_eff,
        "u_diff_m_s": u_diff,
        "richardson_number": richardson,
        "grashof_number": grashof,
        "froude_number": froude,
        "reynolds_number": reynolds,
        "peclet_conv": peclet_conv,
        "peclet_diff": peclet_diff,
        "flame_height_mm": flame_height_m * 1000.0,
        "flame_width_mm": flame_width_m * 1000.0,
        "aspect_ratio": aspect_ratio,
        "flame_volume_cm3": flame_volume_m3 * 1.0e6,
        "surface_area_cm2": flame_surface_area_m2 * 1.0e4,
        "shape_classification": shape_class,
        "soot_index": soot_index,
        "residence_time_s": residence_time_s,
        "chi_radiation": chi_radiation,
        "heat_release_w": heat_release_w,
        "radiative_loss_w": radiative_loss_w,
        "peak_temperature_k": peak_temp_k,
        "flicker_frequency_hz": flicker_freq_hz,
        "dominant_transport_regime": regime_label,
        "is_quenched": is_quenched,
        "quench_reason": quench_reason,
        "z_st": z_st,
    }
