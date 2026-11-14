/**
 * NASA-FLAME: Core Visualization TypeScript Definitions
 * Aligned with Member 2 (FastAPI Backend schemas) and Member 4 (AI Engine schemas)
 */

export type DataOrigin = 
  | "EXPERIMENTAL_MEASURED" 
  | "NUMERICAL_SIMULATION" 
  | "AI_PREDICTION" 
  | "VISUALIZATION_MODEL"
  | "UNKNOWN";

export type GravityRegime = 
  | "NORMAL_1G" 
  | "MICROGRAVITY" 
  | "PARTIAL_GRAVITY" 
  | "VARIABLE";

export type FlameShapeType = 
  | "SPHERICAL" 
  | "TEARDROP" 
  | "TRANSITIONAL" 
  | "EXTINGUISHED";

export type CombustionRegimeType = 
  | "BUOYANT_LAMINAR"
  | "BUOYANT_TURBULENT"
  | "DIFFUSION_CONTROLLED_STEADY"
  | "MICROGRAVITY_COOL_FLAME_TRANSITION"
  | "STATIONARY_FLAME_BALL"
  | "EXTINGUISHED"
  | "UNKNOWN";

export interface ProvenanceMetadata {
  dataOrigin: DataOrigin;
  facilityOrMission?: string;
  citation?: string;
  investigators?: string[];
  sensorTolerances?: Record<string, string>;
  scientificLimitations?: string[];
}

export interface SimulationTimeSeriesPoint {
  time_s: number;
  flame_radius_mm: number;
  max_temperature_k: number;
  burning_rate_mg_s: number;
  soot_fraction: number;
}

export interface SimulationScalarField {
  grid_x: number[];
  grid_y: number[];
  temperature_matrix: number[][]; // [y_index][x_index] in Kelvin
}

export interface DimensionlessNumbers {
  richardson_number?: number;
  grashof_number?: number;
  froude_number?: number;
  rayleigh_number?: number;
  flicker_frequency_hz?: number;
  residence_time_ms?: number;
}

export interface FlameGeometryMetrics {
  flame_length_mm: number;
  flame_width_mm: number;
  aspect_ratio: number;
  spherical_symmetry_index: number; // 1.0 = perfect sphere, >1.5 = elongated buoyant
  standoff_ratio?: number;
  flame_surface_area_est_mm2?: number;
}

export interface SimulationResponseData {
  id: string;
  experiment_id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  gravity_level_g: number;
  flame_shape: FlameShapeType;
  flame_radius_mm?: number;
  flame_height_mm?: number;
  max_temperature_k?: number;
  burn_rate_mg_s?: number;
  soot_volume_fraction?: number;
  extinction_time_s?: number | null;
  time_series?: SimulationTimeSeriesPoint[];
  spatial_scalar_field?: SimulationScalarField;
  execution_duration_ms?: number;
  error_message?: string | null;
  provenance?: ProvenanceMetadata;
}

export interface MetricComparisonItem {
  metric_name: string;
  value_1g: number;
  value_microgravity: number;
  unit: string;
  absolute_difference: number;
  percentage_change: number;
  direction: "INCREASED" | "DECREASED" | "IDENTICAL";
  physical_driver: string;
}

export interface GravityComparisonData {
  comparison_id: string;
  fuel_or_configuration: string;
  data_origin: DataOrigin;
  metrics: MetricComparisonItem[];
  summary_of_differences: string[];
  key_physical_mechanisms: string[];
  scientific_conclusions: string;
  limitations: string[];
}

export interface ExperimentMetadata {
  id: string;
  title: string;
  fuel_type: string;
  oxidizer: string;
  oxygen_percentage: number;
  pressure_atm: number;
  ambient_temperature_k: number;
  burner_diameter_mm?: number;
  droplet_initial_diameter_mm?: number;
  gravity_level_g: number;
  provenance: ProvenanceMetadata;
}

export interface AIAnalysisSummary {
  id: string;
  summary: string;
  regime_classification: string;
  confidence_score: number;
  dimensionless_numbers?: DimensionlessNumbers;
  scientific_findings: string[];
  recommendations: string[];
}
