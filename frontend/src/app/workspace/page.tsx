"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  Play,
  Flame,
  Layers,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Radio,
  Sliders,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Experiment,
  ExperimentRequest,
  SimulationParameters,
  SimulationResponse,
  AnalysisResponse,
} from "@/types";
import { GravitySelector } from "@/components/ui/GravitySelector";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/EmptyState";
import { DimensionlessGauge } from "@/components/visualization/DimensionlessGauge";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const NASA_TEMPLATES: Record<string, Partial<ExperimentRequest> & { label: string }> = {
  iss_acme: {
    label: "ISS CIR / ACME Methane",
    name: "ISS ACME Spherical Diffusion Test",
    description: "Investigation of spherical diffusion flame and soot shell in microgravity",
    fuel_type: "Methane",
    fuel_flow_rate_sccm: 12.5,
    oxidizer: "Air (21% O2, 79% N2)",
    oxygen_percentage: 21.0,
    pressure_atm: 1.0,
    ambient_temperature_k: 298.15,
    gravity_level_g: 0.0,
    burner_diameter_mm: 6.35,
    chamber_volume_liters: 110.0,
    metadata: {
      investigator: "Dr. D. L. Dietrich (NASA GRC)",
      facility: "ISS Combustion Integrated Rack",
      tags: ["ISS", "ACME", "microgravity", "spherical"],
    },
  },
  drop_tower: {
    label: "Glenn Drop Tower Droplet",
    name: "NASA Glenn 2.2s Droplet Burning",
    description: "Microgravity droplet burning governed by d²-law",
    fuel_type: "Heptane",
    fuel_flow_rate_sccm: 0.0,
    oxidizer: "Air (21% O2, 79% N2)",
    oxygen_percentage: 21.0,
    pressure_atm: 1.0,
    ambient_temperature_k: 295.0,
    gravity_level_g: 0.0,
    initial_droplet_diameter_mm: 1.8,
    chamber_volume_liters: 25.0,
    metadata: {
      investigator: "Dr. F. A. Williams (NASA / UCSD)",
      facility: "Glenn 2.2-Second Drop Tower",
      tags: ["drop-tower", "droplet", "d2-law"],
    },
  },
  lunar: {
    label: "Lunar 0.166g Analogue",
    name: "Artemis Lunar Surface Propane Burner",
    description: "Transitional partial buoyancy regime with base widening",
    fuel_type: "Propane",
    fuel_flow_rate_sccm: 25.0,
    oxidizer: "Air (21% O2, 79% N2)",
    oxygen_percentage: 21.0,
    pressure_atm: 1.0,
    ambient_temperature_k: 298.15,
    gravity_level_g: 0.166,
    burner_diameter_mm: 10.0,
    chamber_volume_liters: 45.0,
    metadata: {
      investigator: "Lunar Habitat Safety Team",
      facility: "Reduced Gravity Aircraft",
      tags: ["lunar", "partial-g"],
    },
  },
  martian: {
    label: "Martian 0.38g Atmosphere",
    name: "Mars Habitat Test Cell",
    description: "Reduced pressure 0.7 atm methane flame under 0.38g gravity",
    fuel_type: "Methane",
    fuel_flow_rate_sccm: 18.0,
    oxidizer: "Habitat Air (30% O2, 70% N2)",
    oxygen_percentage: 30.0,
    pressure_atm: 0.7,
    ambient_temperature_k: 290.0,
    gravity_level_g: 0.38,
    burner_diameter_mm: 8.0,
    chamber_volume_liters: 45.0,
    metadata: {
      investigator: "Mars Surface Exploration Branch",
      facility: "Parabolic Flight Test Cell",
      tags: ["mars", "partial-g"],
    },
  },
  earth_standard: {
    label: "Earth 1.0g Reference",
    name: "Terrestrial Buoyant Diffusion Jet",
    description: "Baseline Earth gravity natural convection teardrop flame",
    fuel_type: "Methane",
    fuel_flow_rate_sccm: 30.0,
    oxidizer: "Air (21% O2, 79% N2)",
    oxygen_percentage: 21.0,
    pressure_atm: 1.0,
    ambient_temperature_k: 298.15,
    gravity_level_g: 1.0,
    burner_diameter_mm: 6.35,
    chamber_volume_liters: 100.0,
    metadata: {
      investigator: "Terrestrial Baseline Study",
      facility: "NASA Glenn Ground Laboratory",
      tags: ["earth", "1g", "baseline"],
    },
  },
};

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const experimentIdParam = searchParams.get("experimentId");
  const gravityParam = searchParams.get("gravity");

  const [formData, setFormData] = useState<ExperimentRequest>({
    name: "ISS ACME Spherical Diffusion Test",
    description: "Investigation of spherical diffusion flame and soot shell in microgravity",
    fuel_type: "Methane",
    fuel_flow_rate_sccm: 12.5,
    oxidizer: "Air (21% O2, 79% N2)",
    oxygen_percentage: 21.0,
    pressure_atm: 1.0,
    ambient_temperature_k: 298.15,
    gravity_level_g: gravityParam ? parseFloat(gravityParam) : 0.0,
    burner_diameter_mm: 6.35,
    chamber_volume_liters: 110.0,
    metadata: {
      investigator: "Dr. D. L. Dietrich (NASA GRC)",
      facility: "ISS Combustion Integrated Rack",
      tags: ["ISS", "ACME", "microgravity"],
    },
  });

  const [simParams, setSimParams] = useState<SimulationParameters>({
    duration_s: 10.0,
    time_step_s: 0.1,
    grid_resolution: 64,
    radiation_model: true,
  });

  const [existingExperimentId, setExistingExperimentId] = useState<string | null>(
    experimentIdParam
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [execStatus, setExecStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state after execution
  const [lastSimulation, setLastSimulation] = useState<SimulationResponse | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResponse | null>(null);

  // If experimentIdParam is provided, load its existing data
  useEffect(() => {
    if (experimentIdParam) {
      api
        .getExperiment(experimentIdParam)
        .then((exp) => {
          setExistingExperimentId(exp.id);
          setFormData({
            name: exp.name,
            description: exp.description || "",
            fuel_type: exp.fuel_type,
            fuel_flow_rate_sccm: exp.fuel_flow_rate_sccm,
            oxidizer: exp.oxidizer,
            oxygen_percentage: exp.oxygen_percentage,
            pressure_atm: exp.pressure_atm,
            ambient_temperature_k: exp.ambient_temperature_k,
            gravity_level_g: exp.gravity_level_g,
            burner_diameter_mm: exp.burner_diameter_mm,
            initial_droplet_diameter_mm: exp.initial_droplet_diameter_mm,
            chamber_volume_liters: exp.chamber_volume_liters,
            metadata: exp.metadata,
          });
        })
        .catch((err) => {
          setErrorMessage(`Failed to load experiment ${experimentIdParam}: ${err.message}`);
        });
    }
  }, [experimentIdParam]);

  const handleApplyTemplate = (key: string) => {
    const template = NASA_TEMPLATES[key];
    if (template) {
      setFormData((prev) => ({
        ...prev,
        ...template,
        name: template.name || prev.name,
        fuel_type: template.fuel_type || prev.fuel_type,
      }));
      setSuccessMessage(`Loaded profile: ${template.label}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleSaveExperiment = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (existingExperimentId) {
        const updated = await api.updateExperiment(existingExperimentId, formData);
        setSuccessMessage(`Experiment "${updated.name}" updated successfully.`);
      } else {
        const created = await api.createExperiment(formData);
        setExistingExperimentId(created.id);
        setSuccessMessage(`Experiment "${created.name}" created and saved.`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save experiment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExperiment = async () => {
    if (!existingExperimentId) return;
    if (!window.confirm("Are you sure you want to delete this research experiment record?")) return;
    setIsSaving(true);
    try {
      await api.deleteExperiment(existingExperimentId);
      setSuccessMessage("Experiment deleted.");
      setExistingExperimentId(null);
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete experiment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    setIsExecuting(true);
    setExecStatus("Persisting experiment parameters...");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let experimentId = existingExperimentId;
      if (!experimentId) {
        const created = await api.createExperiment(formData);
        experimentId = created.id;
        setExistingExperimentId(created.id);
      } else {
        await api.updateExperiment(experimentId, formData);
      }

      setExecStatus("Solving fluid mechanics equations (Navier-Stokes + Energy)...");
      const simResult = await api.runSimulation({
        experiment_id: experimentId,
        parameters: simParams,
      });
      setLastSimulation(simResult);

      setExecStatus("Executing AI Physics-Informed Extinction Diagnostics...");
      const aiResult = await api.runAnalysis({
        experiment_id: experimentId,
        simulation_id: simResult.id,
        analysis_focus: "full",
      });
      setLastAnalysis(aiResult);

      setExecStatus("Completed successfully!");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Simulation execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-ink text-stone py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8 relative">
          {/* Workspace Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-stone-border/60">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cobalt/15 border border-cobalt/40 text-stone-light font-mono text-[10px] tracking-widest uppercase">
                  <Sliders className="h-3 w-3 text-cobalt" />
                  Flight Workbench
                </span>
                <span className="rounded bg-ink-surface px-2.5 py-1 text-[10px] font-mono text-stone-dim border border-stone-border/40">
                  0g • 0.166g • 0.38g • 1.0g
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-stone-light mt-3 tracking-tight uppercase">
                Experiment Workspace
              </h1>
              <p className="text-xs sm:text-sm text-stone mt-1 max-w-2xl font-sans">
                Configure combustion reactants, calibrate chamber atmospheric conditions, and execute physical numerical solvers.
              </p>
            </div>

            {/* NASA Templates dropdown */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-cobalt font-semibold tracking-wider uppercase">Profiles:</span>
              {Object.entries(NASA_TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleApplyTemplate(key)}
                  className="rounded bg-ink-surface hover:bg-ink-elevated border border-stone-border px-3 py-1.5 text-xs font-mono text-stone hover:text-white transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Column Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Configuration Forms (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Gravity Field Module */}
              <div className="rounded-lg border border-stone-border bg-ink-surface p-6 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-border/60">
                  <span className="font-mono text-xs font-bold text-cobalt uppercase tracking-widest">
                    1. Gravitational Acceleration (g-Level)
                  </span>
                  <span className="font-mono text-xs text-stone-light font-bold bg-ink px-2.5 py-1 rounded border border-stone-border">
                    {formData.gravity_level_g.toFixed(3)} g
                  </span>
                </div>
                <GravitySelector
                  value={formData.gravity_level_g}
                  onChange={(g) => setFormData((prev) => ({ ...prev, gravity_level_g: g }))}
                  disabled={isExecuting}
                />
              </div>

              {/* Chamber Physical Parameters */}
              <div className="rounded-lg border border-stone-border bg-ink-surface p-6 space-y-4">
                <div className="pb-3 border-b border-stone-border/60">
                  <span className="font-mono text-xs font-bold text-cobalt uppercase tracking-widest">
                    2. Combustion Reactants &amp; Chamber Parameters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Experiment Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Experiment Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>

                  {/* Experiment Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Experiment Description &amp; Scientific Objective
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Specify scientific investigation goals, expected soot boundaries, or ISS rack setup..."
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all font-sans"
                    />
                  </div>

                  {/* Oxidizer Environment */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Oxidizer Atmosphere
                    </label>
                    <input
                      type="text"
                      value={formData.oxidizer || "Air (21% O2, 79% N2)"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, oxidizer: e.target.value }))
                      }
                      placeholder="Air (21% O2, 79% N2) or custom diluent"
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>

                  {/* Fuel Species */}
                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Fuel Species *
                    </label>
                    <select
                      value={formData.fuel_type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fuel_type: e.target.value }))}
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    >
                      <option value="Methane" className="bg-ink text-white">Methane (CH₄)</option>
                      <option value="Propane" className="bg-ink text-white">Propane (C₃H₈)</option>
                      <option value="Heptane" className="bg-ink text-white">n-Heptane (C₇H₁₆)</option>
                      <option value="Hydrogen" className="bg-ink text-white">Hydrogen (H₂)</option>
                      <option value="Ethylene" className="bg-ink text-white">Ethylene (C₂H₄)</option>
                    </select>
                  </div>

                  {/* Flow Rate */}
                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Fuel Flow Rate (sccm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.fuel_flow_rate_sccm ?? 10}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fuel_flow_rate_sccm: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>

                  {/* Oxygen Percentage */}
                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Ambient Oxygen (Vol %)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      step="0.5"
                      value={formData.oxygen_percentage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          oxygen_percentage: parseFloat(e.target.value) || 21,
                        }))
                      }
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>

                  {/* Pressure */}
                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Chamber Pressure (atm)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      max="50"
                      step="0.1"
                      value={formData.pressure_atm}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pressure_atm: parseFloat(e.target.value) || 1.0,
                        }))
                      }
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>

                  {/* Burner / Nozzle Diameter */}
                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Burner / Droplet Diam (mm)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.1"
                      value={formData.burner_diameter_mm || formData.initial_droplet_diameter_mm || 6.35}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          burner_diameter_mm: parseFloat(e.target.value) || 6.35,
                        }))
                      }
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>

                  {/* Ambient Temperature */}
                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Ambient Temp (K)
                    </label>
                    <input
                      type="number"
                      min="200"
                      max="1000"
                      step="1"
                      value={formData.ambient_temperature_k}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ambient_temperature_k: parseFloat(e.target.value) || 298.15,
                        }))
                      }
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Numerical Solver Constraints */}
              <div className="rounded-lg border border-stone-border bg-ink-surface p-6 space-y-4">
                <div className="pb-3 border-b border-stone-border/60">
                  <span className="font-mono text-xs font-bold text-cobalt uppercase tracking-widest">
                    3. Numerical Solver Controls
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Duration (s)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={simParams.duration_s}
                      onChange={(e) =>
                        setSimParams((prev) => ({
                          ...prev,
                          duration_s: parseFloat(e.target.value) || 10.0,
                        }))
                      }
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Time Step Δt (s)
                    </label>
                    <input
                      type="number"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={simParams.time_step_s}
                      onChange={(e) =>
                        setSimParams((prev) => ({
                          ...prev,
                          time_step_s: parseFloat(e.target.value) || 0.1,
                        }))
                      }
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-stone-dim mb-1.5 uppercase tracking-wider">
                      Grid Points
                    </label>
                    <select
                      value={simParams.grid_resolution}
                      onChange={(e) =>
                        setSimParams((prev) => ({
                          ...prev,
                          grid_resolution: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full rounded bg-ink border border-stone-border px-3.5 py-2.5 text-xs font-mono text-stone-light focus:outline-none focus:border-cobalt transition-all"
                    >
                      <option value={32} className="bg-ink text-white">32 x 32 (Fast)</option>
                      <option value={64} className="bg-ink text-white">64 x 64 (Standard)</option>
                      <option value={128} className="bg-ink text-white">128 x 128 (High-Res)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="rad_model"
                    checked={simParams.radiation_model}
                    onChange={(e) =>
                      setSimParams((prev) => ({
                        ...prev,
                        radiation_model: e.target.checked,
                      }))
                    }
                    className="rounded accent-[#2B4BFF] h-4 w-4 bg-ink border-stone-border"
                  />
                  <label htmlFor="rad_model" className="text-xs font-mono text-stone">
                    Enable Optically Thin Radiation Model (Critical for 0g Extinction Limits)
                  </label>
                </div>
              </div>

              {/* Launch & CRUD Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={handleRunSimulation}
                  className="w-full flex items-center justify-center gap-3 rounded bg-cobalt hover:bg-cobalt-hover disabled:bg-ink-surface disabled:text-stone-muted px-6 py-4 text-xs font-mono uppercase tracking-widest font-bold text-white shadow-[0_0_25px_rgba(43,75,255,0.4)] transition-all"
                >
                  {isExecuting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>{execStatus || "Executing Solver..."}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current text-white" />
                      <span>Launch Physical Simulation &amp; AI Diagnostics</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    disabled={isSaving || isExecuting}
                    onClick={handleSaveExperiment}
                    className="flex-1 flex items-center justify-center gap-2 rounded bg-ink-surface hover:bg-ink-elevated border border-stone-border py-3 text-xs font-mono text-stone transition-colors"
                  >
                    <span>{existingExperimentId ? "Update Record in DB" : "Save Record to DB"}</span>
                  </button>

                  {existingExperimentId && (
                    <button
                      type="button"
                      disabled={isSaving || isExecuting}
                      onClick={handleDeleteExperiment}
                      className="px-4 py-3 rounded bg-ink border border-stone-border/80 hover:border-flame/60 text-xs font-mono text-stone hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setExistingExperimentId(null);
                      setSuccessMessage(null);
                      handleApplyTemplate("iss_acme");
                    }}
                    className="px-4 py-3 rounded bg-ink-surface hover:bg-ink-elevated border border-stone-border text-xs font-mono text-stone-dim transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {successMessage && (
                  <div className="p-4 rounded bg-ink border border-cobalt/50 text-xs font-mono text-stone-light flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-cobalt" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 rounded bg-ink border border-flame/60 text-xs font-mono text-stone-light flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-flame" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Execution Monitor & Live Result Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Real-time Morphology Canvas */}
              <FlameVisualizer
                shape={lastSimulation?.flame_shape}
                gravity={formData.gravity_level_g}
                flameRadiusMm={lastSimulation?.flame_radius_mm || (formData.gravity_level_g <= 0.05 ? 8.5 : 5.2)}
                flameHeightMm={lastSimulation?.flame_height_mm}
                maxTemperatureK={lastSimulation?.max_temperature_k || 2100}
                sootFraction={lastSimulation?.soot_volume_fraction}
                title="Flame Envelope Monitor"
              />

              {/* Live Solver Output Summary */}
              {lastSimulation && (
                <div className="rounded-lg border border-cobalt/40 bg-ink-surface p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-border/60">
                    <div className="flex items-center gap-2 text-stone-light">
                      <CheckCircle2 className="h-4 w-4 text-cobalt" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">
                        Simulation Complete
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-stone-dim">
                      Solved in {lastSimulation.execution_duration_ms?.toFixed(1)} ms
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded bg-ink border border-stone-border/40">
                      <div className="text-stone-dim text-[10px] uppercase tracking-wider">Flame Shape</div>
                      <div className="text-white font-bold mt-1 tracking-wide">{lastSimulation.flame_shape}</div>
                    </div>
                    <div className="p-3 rounded bg-ink border border-stone-border/40">
                      <div className="text-stone-dim text-[10px] uppercase tracking-wider">Peak Temp</div>
                      <div className="text-flame font-bold mt-1">
                        {lastSimulation.max_temperature_k?.toFixed(0)} K
                      </div>
                    </div>
                    <div className="p-3 rounded bg-ink border border-stone-border/40">
                      <div className="text-stone-dim text-[10px] uppercase tracking-wider">Flame Radius</div>
                      <div className="text-cobalt font-bold mt-1">
                        {lastSimulation.flame_radius_mm?.toFixed(2)} mm
                      </div>
                    </div>
                    <div className="p-3 rounded bg-ink border border-stone-border/40">
                      <div className="text-stone-dim text-[10px] uppercase tracking-wider">Burn Rate</div>
                      <div className="text-stone-light font-bold mt-1">
                        {lastSimulation.burn_rate_mg_s?.toFixed(2)} mg/s
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => router.push(`/simulations`)}
                      className="inline-flex items-center gap-2 text-xs font-mono text-cobalt hover:underline font-medium transition-colors"
                    >
                      <span>Inspect 2D Heatmap &amp; Curves</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* AI Diagnostics Card if analysis completed */}
              {lastAnalysis && (
                <div className="rounded-lg border border-cobalt/40 bg-ink-surface p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-border/60">
                    <div className="flex items-center gap-2 text-stone-light">
                      <Sparkles className="h-4 w-4 text-cobalt" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">
                        AI Diagnostic Engine
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-stone-dim">
                      Confidence: {(lastAnalysis.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-xs font-mono text-stone leading-relaxed">
                    {lastAnalysis.summary}
                  </div>

                  <div className="pt-2">
                    <DimensionlessGauge
                      numbers={lastAnalysis.dimensionless_numbers}
                      regime={lastAnalysis.regime_classification}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => router.push(`/assistant`)}
                      className="inline-flex items-center gap-2 text-xs font-mono text-cobalt hover:underline font-medium transition-colors"
                    >
                      <span>Full AI Scientific Report</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading Experiment Workspace..." />}>
      <WorkspaceContent />
    </Suspense>
  );
}
