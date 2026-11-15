/**
 * NASA-FLAME: Scientific Combustion Physics Formulas and Utilities
 * Derived from NASA GRC research, Burke-Schumann diffusion theory, and buoyancy scaling.
 */

export interface PhysicsParams {
  gravity_g: number;
  burner_diameter_mm: number;
  peak_temperature_k: number;
  ambient_temperature_k?: number;
  flame_height_mm?: number;
  gas_velocity_m_s?: number;
}

/**
 * Calculates theoretical flicker frequency for buoyant diffusion flames.
 * In 1g, buoyant toroidal vortex shedding creates ~10-18 Hz flicker.
 * In 0g (microgravity), vortex shedding ceases completely: f = 0 Hz.
 */
export function calculateFlickerFrequency(gravity_g: number, burner_diam_mm: number): number {
  if (gravity_g <= 0.05 || burner_diam_mm <= 0) {
    return 0.0; // Quiescent steady microgravity flame
  }
  // Empirical hydrodynamic scaling: f ≈ 1.5 * sqrt(g / g0) / sqrt(D_burner_m)
  const d_m = burner_diam_mm / 1000.0;
  const g_factor = Math.sqrt(Math.max(0, gravity_g));
  const freq = (1.5 / Math.sqrt(d_m)) * g_factor;
  return Number(freq.toFixed(2));
}

/**
 * Calculates dimensionless Grashof Number (Gr): ratio of buoyancy force to viscous force.
 * Gr = g * beta * (T_f - T_inf) * L^3 / nu^2
 */
export function calculateGrashofNumber(
  gravity_g: number,
  delta_T_k: number,
  characteristic_len_m: number
): number {
  const g_m_s2 = gravity_g * 9.80665;
  const beta = 1.0 / 300.0; // 1/T_ambient
  const nu = 1.5e-5; // Kinematic viscosity of air at ~300K (m^2/s)
  const l3 = Math.pow(Math.max(0.001, characteristic_len_m), 3);
  const gr = (g_m_s2 * beta * delta_T_k * l3) / (nu * nu);
  return Math.max(0, gr);
}

/**
 * Calculates Richardson Number (Ri): ratio of natural convection to forced flow shear.
 * Ri = Gr / Re^2
 */
export function calculateRichardsonNumber(
  gravity_g: number,
  delta_T_k: number,
  characteristic_len_m: number,
  velocity_m_s: number
): number {
  if (velocity_m_s <= 0.001) {
    // Quiescent ambient: if g > 0, buoyancy heavily dominates
    return gravity_g > 0.05 ? 999.0 : 0.0;
  }
  const g_m_s2 = gravity_g * 9.80665;
  const beta = 1.0 / 300.0;
  const ri = (g_m_s2 * beta * delta_T_k * characteristic_len_m) / Math.pow(velocity_m_s, 2);
  return Number(ri.toFixed(2));
}

/**
 * Calculates buoyant upward convective draft velocity (m/s).
 * u_draft ≈ sqrt(2 * g * H * (T_f - T_inf) / T_inf)
 */
export function calculateBuoyantDraftVelocity(
  gravity_g: number,
  flame_height_mm: number,
  peak_temp_k: number,
  ambient_temp_k: number = 298.15
): number {
  if (gravity_g <= 0.01 || flame_height_mm <= 0) return 0.0;
  const g_m_s2 = gravity_g * 9.80665;
  const h_m = flame_height_mm / 1000.0;
  const delta_t = Math.max(0, peak_temp_k - ambient_temp_k);
  const u2 = 2.0 * g_m_s2 * h_m * (delta_t / ambient_temp_k);
  return Number(Math.sqrt(Math.max(0, u2)).toFixed(2));
}

/**
 * Computes 1D radial temperature profile according to spherical diffusion (Burke-Schumann).
 * T(r) = T_ambient + (T_peak - T_ambient) * exp(-(r - r_flame)^2 / (2 * sigma^2))
 */
export function calculateRadialTemperature(
  r_mm: number,
  flame_radius_mm: number,
  peak_temp_k: number,
  ambient_temp_k: number = 298.15
): number {
  if (r_mm < 0) return ambient_temp_k;
  const sigma = Math.max(0.5, flame_radius_mm * 0.45);
  const diff = r_mm - flame_radius_mm;
  const factor = Math.exp(-(diff * diff) / (2 * sigma * sigma));
  const temp = ambient_temp_k + (peak_temp_k - ambient_temp_k) * factor;
  return Number(Math.max(ambient_temp_k, temp).toFixed(2));
}
