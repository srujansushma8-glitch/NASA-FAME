import {
  AnalysisRequest,
  AnalysisResponse,
  AuthTokenResponse,
  Experiment,
  ExperimentListResponse,
  ExperimentRequest,
  HealthResponse,
  LoginRequest,
  LogoutResponse,
  SimulationRequest,
  SimulationResponse,
  UserProfile,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "nasa_flame_auth_token";
const LEGACY_TOKEN_KEY = "nasa_flame_session_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    sessionStorage.getItem(LEGACY_TOKEN_KEY)
  );
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem("nasa_flame_user_profile");
  sessionStorage.removeItem("nasa_flame_user_profile");
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch {
        // Fallback
      }
      throw new Error(errorDetail);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Network error connecting to NASA-FLAME Backend");
  }
}

export const api = {
  // Authentication & Security
  async login(payload: LoginRequest): Promise<AuthTokenResponse> {
    const res = await request<AuthTokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.access_token) {
      setStoredToken(res.access_token);
    }
    return res;
  },

  async getCurrentUser(): Promise<UserProfile> {
    return request<UserProfile>("/api/auth/me");
  },

  async logout(): Promise<LogoutResponse> {
    try {
      const res = await request<LogoutResponse>("/api/auth/logout", {
        method: "POST",
      });
      clearStoredToken();
      return res;
    } catch {
      clearStoredToken();
      return { success: true, message: "Logged out locally" };
    }
  },

  // Health
  async getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>("/health");
  },

  // Experiments
  async listExperiments(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    fuel_type?: string;
    min_gravity?: number;
    max_gravity?: number;
    search?: string;
  }): Promise<ExperimentListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.page_size) searchParams.set("page_size", params.page_size.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.fuel_type) searchParams.set("fuel_type", params.fuel_type);
    if (params?.min_gravity !== undefined)
      searchParams.set("min_gravity", params.min_gravity.toString());
    if (params?.max_gravity !== undefined)
      searchParams.set("max_gravity", params.max_gravity.toString());
    if (params?.search) searchParams.set("search", params.search);

    const qs = searchParams.toString();
    return request<ExperimentListResponse>(`/api/experiments${qs ? `?${qs}` : ""}`);
  },

  async getExperiment(id: string): Promise<Experiment> {
    return request<Experiment>(`/api/experiments/${id}`);
  },

  async createExperiment(data: ExperimentRequest): Promise<Experiment> {
    return request<Experiment>("/api/experiments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateExperiment(id: string, data: Partial<ExperimentRequest>): Promise<Experiment> {
    return request<Experiment>(`/api/experiments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteExperiment(id: string): Promise<{ deleted: boolean; experiment_id: string }> {
    return request<{ deleted: boolean; experiment_id: string }>(`/api/experiments/${id}`, {
      method: "DELETE",
    });
  },

  // Simulations
  async runSimulation(payload: SimulationRequest): Promise<SimulationResponse> {
    return request<SimulationResponse>("/api/simulations/run", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSimulation(id: string): Promise<SimulationResponse> {
    return request<SimulationResponse>(`/api/simulations/${id}`);
  },

  async listSimulationsForExperiment(experimentId: string): Promise<SimulationResponse[]> {
    return request<SimulationResponse[]>(`/api/simulations/experiment/${experimentId}`);
  },

  // AI Analysis
  async runAnalysis(payload: AnalysisRequest): Promise<AnalysisResponse> {
    return request<AnalysisResponse>("/api/analysis/run", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getAnalysis(id: string): Promise<AnalysisResponse> {
    return request<AnalysisResponse>(`/api/analysis/${id}`);
  },

  async listAnalysesForExperiment(experimentId: string): Promise<AnalysisResponse[]> {
    return request<AnalysisResponse[]>(`/api/analysis/experiment/${experimentId}`);
  },
};
