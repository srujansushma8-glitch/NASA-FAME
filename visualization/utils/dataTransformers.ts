/**
 * NASA-FLAME: Data Transformers & Safe Adapters
 * Safely sanitizes incoming raw data from Member 2 (FastAPI) and Member 4 (AI Engine).
 */

import {
  SimulationResponseData,
  SimulationTimeSeriesPoint,
  SimulationScalarField,
  ProvenanceMetadata,
} from "../types/index.ts";

/**
 * Validates and sanitizes simulation time series.
 * Returns empty array if data is missing or corrupted.
 */
export function sanitizeTimeSeries(raw?: any[]): SimulationTimeSeriesPoint[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .filter((pt) => pt && typeof pt === "object")
    .map((pt) => ({
      time_s: Number(pt.time_s) || 0,
      flame_radius_mm: Math.max(0, Number(pt.flame_radius_mm) || 0),
      max_temperature_k: Math.max(0, Number(pt.max_temperature_k) || 298.15),
      burning_rate_mg_s: Math.max(0, Number(pt.burning_rate_mg_s) || 0),
      soot_fraction: Math.max(0, Number(pt.soot_fraction) || 0),
    }))
    .sort((a, b) => a.time_s - b.time_s);
}

/**
 * Validates and sanitizes 2D scalar contour grid data.
 */
export function sanitizeScalarField(raw?: any): SimulationScalarField | null {
  if (!raw || typeof raw !== "object") return null;
  const grid_x = Array.isArray(raw.grid_x) ? raw.grid_x.map(Number).filter((v: number) => !isNaN(v)) : [];
  const grid_y = Array.isArray(raw.grid_y) ? raw.grid_y.map(Number).filter((v: number) => !isNaN(v)) : [];
  const temperature_matrix = Array.isArray(raw.temperature_matrix)
    ? raw.temperature_matrix.map((row: any) =>
        Array.isArray(row) ? row.map((v: any) => (isNaN(Number(v)) ? 298.15 : Number(v))) : []
      )
    : [];

  if (grid_x.length === 0 || grid_y.length === 0 || temperature_matrix.length === 0) {
    return null;
  }

  return { grid_x, grid_y, temperature_matrix };
}

/**
 * Extracts gravity regime from a gravity acceleration number in g units.
 */
export function classifyGravityRegime(g_level: number): "MICROGRAVITY" | "PARTIAL_GRAVITY" | "NORMAL_1G" {
  if (g_level <= 0.05) return "MICROGRAVITY";
  if (g_level < 0.9) return "PARTIAL_GRAVITY";
  return "NORMAL_1G";
}

/**
 * Builds safe fallback provenance metadata.
 */
export function createDefaultProvenance(origin?: string): ProvenanceMetadata {
  return {
    dataOrigin: (origin as any) || "VISUALIZATION_MODEL",
    facilityOrMission: "NASA-FLAME Numerical & Experimental Laboratory",
    citation: "NASA TM-107386 / ISS Combustion Integrated Rack (CIR)",
    investigators: ["NASA Glenn Research Center Combustion Science Group"],
    sensorTolerances: {
      temperature: "±25 K (thin-filament pyrometry / thermocouple)",
      flame_radius: "±0.15 mm (orthographic intensified camera)",
    },
    scientificLimitations: [
      "Quiescent ambient condition assumes negligible ventilation draft unless coflow specified.",
      "Optically thin approximation applies to radiation model.",
    ],
  };
}

/**
 * Normalizes full simulation response.
 */
export function normalizeSimulationData(input: any): SimulationResponseData {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid simulation payload: data must be an object.");
  }

  const g_level = typeof input.gravity_level_g === "number" ? input.gravity_level_g : 1.0;
  return {
    id: String(input.id || "SIM-UNSAVED"),
    experiment_id: String(input.experiment_id || "EXP-UNKNOWN"),
    status: input.status || "COMPLETED",
    gravity_level_g: g_level,
    flame_shape: input.flame_shape || (g_level <= 0.05 ? "SPHERICAL" : "TEARDROP"),
    flame_radius_mm: input.flame_radius_mm ?? 5.0,
    flame_height_mm: input.flame_height_mm ?? (g_level <= 0.05 ? 10.0 : 18.0),
    max_temperature_k: input.max_temperature_k ?? 1750.0,
    burn_rate_mg_s: input.burn_rate_mg_s ?? 2.5,
    soot_volume_fraction: input.soot_volume_fraction ?? 1.5e-6,
    extinction_time_s: input.extinction_time_s ?? null,
    time_series: sanitizeTimeSeries(input.time_series || input.time_series_data),
    spatial_scalar_field: sanitizeScalarField(input.spatial_scalar_field) ?? undefined,
    execution_duration_ms: input.execution_duration_ms ?? 0,
    error_message: input.error_message || null,
    provenance: input.provenance || createDefaultProvenance(input.data_origin),
  };
}
