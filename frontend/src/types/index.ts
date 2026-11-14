export type ExperimentStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type FlameShape =
  | "SPHERICAL"
  | "TEARDROP"
  | "TRANSITIONAL"
  | "FLAT"
  | "EXTINCT"
  | "IRREGULAR";

export type SimulationStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  clearance_level: string;
  station: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: UserProfile;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ExperimentMetadata {
  investigator?: string;
  facility?: string;
  tags?: string[];
  notes?: string;
  extra_attributes?: Record<string, unknown>;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  fuel_type: string;
  fuel_flow_rate_sccm?: number;
  oxidizer: string;
  oxygen_percentage: number;
  pressure_atm: number;
  ambient_temperature_k: number;
  gravity_level_g: number;
  burner_diameter_mm?: number;
  initial_droplet_diameter_mm?: number;
  chamber_volume_liters?: number;
  status: ExperimentStatus;
  metadata?: ExperimentMetadata;
  simulations_count: number;
  analyses_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExperimentRequest {
  name: string;
  description?: string;
  fuel_type: string;
  fuel_flow_rate_sccm?: number;
  oxidizer?: string;
  oxygen_percentage?: number;
  pressure_atm?: number;
  ambient_temperature_k?: number;
  gravity_level_g: number;
  burner_diameter_mm?: number;
  initial_droplet_diameter_mm?: number;
  chamber_volume_liters?: number;
  metadata?: ExperimentMetadata;
}

export interface ExperimentListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Experiment[];
}

export interface SimulationParameters {
  gravity_level_g?: number;
  duration_s?: number;
  time_step_s?: number;
  grid_resolution?: number;
  radiation_model?: boolean;
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
  temperature_matrix: number[][];
}

export interface SimulationRequest {
  experiment_id?: string;
  parameters?: SimulationParameters;
  adhoc_config?: Record<string, unknown>;
}

export interface SimulationResponse {
  id: string;
  experiment_id: string;
  status: SimulationStatus;
  gravity_level_g: number;
  flame_shape: FlameShape;
  flame_radius_mm?: number;
  flame_height_mm?: number;
  max_temperature_k?: number;
  burn_rate_mg_s?: number;
  soot_volume_fraction?: number;
  extinction_time_s?: number;
  time_series?: SimulationTimeSeriesPoint[];
  spatial_scalar_field?: SimulationScalarField;
  execution_duration_ms?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface DimensionlessNumbers {
  richardson_number: number;
  grashof_number: number;
  froude_number: number;
  rayleigh_number: number;
}

export interface AnalysisRequest {
  experiment_id?: string;
  simulation_id?: string;
  experimental_data?: Record<string, unknown>;
  analysis_focus?: "full" | "extinction_limits" | "buoyancy_effects" | "soot_dynamics";
}

export interface AnalysisResponse {
  id: string;
  experiment_id?: string;
  simulation_id?: string;
  status: AnalysisStatus;
  summary: string;
  regime_classification: string;
  dimensionless_numbers?: DimensionlessNumbers;
  scientific_findings: string[];
  recommendations: string[];
  confidence_score: number;
  ai_model_used?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  environment: string;
  database: {
    status: string;
    engine: string;
  };
}
