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
    ambient_temperature_k: 293.15,
    gravity_level_g: 0.38,
    burner_diameter_mm: 8.0,
    chamber_volume_liters: 60.0,
    metadata: {
      investigator: "Mars Exploration Safety Group",
      facility: "Centrifuge Chamber",
      tags: ["mars", "reduced-pressure"],
    },
  },
  earth_1g: {
    label: "Earth 1.0g Ground Reference",
    name: "Terrestrial Baseline Plume Test",
    description: "Buoyancy-dominated laminar flame plume with convective vortex flicker",
    fuel_type: "Methane",
    fuel_flow_rate_sccm: 20.0,
    oxidizer: "Air (21% O2, 79% N2)",
    oxygen_percentage: 21.0,
    pressure_atm: 1.0,
    ambient_temperature_k: 298.15,
    gravity_level_g: 1.0,
    burner_diameter_mm: 6.35,
    chamber_volume_liters: 110.0,
    metadata: {
      investigator: "Ground Reference Laboratory",
      facility: "Atmospheric Test Cell",
      tags: ["earth", "1g", "baseline"],
    },
  },
};

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form State
  const [formData, setFormData] = useState<ExperimentRequest>({
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
      tags: ["ISS", "microgravity", "ACME"],
    },
  });

  // Simulation Parameters State
  const [simParams, setSimParams] = useState<SimulationParameters>({
    duration_s: 10.0,
    time_step_s: 0.1,
    grid_resolution: 64,
    radiation_model: true,
  });

  // Execution & Result State
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [execStatus, setExecStatus] = useState<string>("");
  const [lastSimulation, setLastSimulation] = useState<SimulationResponse | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingExperimentId, setExistingExperimentId] = useState<string | null>(null);

  // Load from query parameter if provided
  useEffect(() => {
    const expIdParam = searchParams.get("experimentId");
    const gravParam = searchParams.get("gravity");

    if (expIdParam) {
      setExistingExperimentId(expIdParam);
      api
        .getExperiment(expIdParam)
        .then((exp) => {
          setFormData({
            name: exp.name,
            description: exp.description,
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
          console.error("Failed to load requested experiment", err);
        });
    } else if (gravParam) {
      const gVal = parseFloat(gravParam);
      if (!isNaN(gVal)) {
        setFormData((prev) => ({ ...prev, gravity_level_g: gVal }));
      }
    }
  }, [searchParams]);

  // Handle template selection
  const handleApplyTemplate = (key: string) => {
    const t = NASA_TEMPLATES[key];
    if (t) {
      setExistingExperimentId(null);
      setFormData((prev) => ({
        ...prev,
        ...t,
        metadata: {
          ...prev.metadata,
          ...t.metadata,
        },
      }));
    }
  };

  // Launch Simulation Execution
  const handleRunSimulation = async () => {
    setIsExecuting(true);
    setErrorMessage(null);
    setLastSimulation(null);
    setLastAnalysis(null);

    try {
      setExecStatus("Recording experiment parameters in database...");
      let experimentId = existingExperimentId;

      // Create new experiment record if not updating existing
      if (!experimentId) {
        const createdExp = await api.createExperiment(formData);
        experimentId = createdExp.id;
        setExistingExperimentId(experimentId);
      }

      setExecStatus("Invoking Member 4 physical simulation solver...");
      const simResult = await api.runSimulation({
        experiment_id: experimentId,
        parameters: {
          ...simParams,
          gravity_level_g: formData.gravity_level_g,
        },
      });
      setLastSimulation(simResult);

      setExecStatus("Invoking Member 3 AI Combustion Analysis engine...");
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
    <div className="flex-1 bg-[#080B12] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-electric-400 uppercase tracking-widest">
                Scientific Configuration Workbench
              </span>
              <span className="rounded bg-electric-950/60 px-2 py-0.5 text-[10px] font-mono text-electric-300 border border-electric-700/40">
                0g &bull; 0.166g &bull; 0.38g &bull; 1.0g
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Experiment Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure chamber conditions, adjust numerical solver constraints, and execute physical combustion simulations.
            </p>
          </div>

          {/* NASA Templates dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Templates:</span>
            {Object.entries(NASA_TEMPLATES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyTemplate(key)}
                className="rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-border px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white transition-colors"
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
            <div className="rounded-xl border border-border bg-[#090D16] p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  1. Gravitational Acceleration (g-Level)
                </span>
                <span className="font-mono text-xs text-electric-400 font-bold">
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
            <div className="rounded-xl border border-border bg-[#090D16] p-5 shadow-lg space-y-4">
              <div className="pb-2 border-b border-border/70">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  2. Combustion Reactants &amp; Chamber Parameters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Experiment Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Experiment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  />
                </div>

                {/* Fuel Species */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Fuel Species *
                  </label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fuel_type: e.target.value }))}
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  >
                    <option value="Methane">Methane (CH₄)</option>
                    <option value="Propane">Propane (C₃H₈)</option>
                    <option value="Heptane">n-Heptane (C₇H₁₆)</option>
                    <option value="Hydrogen">Hydrogen (H₂)</option>
                    <option value="Ethylene">Ethylene (C₂H₄)</option>
                  </select>
                </div>

                {/* Flow Rate */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
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
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  />
                </div>

                {/* Oxygen Percentage */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
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
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  />
                </div>

                {/* Pressure */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
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
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  />
                </div>

                {/* Burner / Nozzle Diameter */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
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
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  />
                </div>

                {/* Ambient Temperature */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
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
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  />
                </div>
              </div>
            </div>

            {/* Numerical Solver Constraints */}
            <div className="rounded-xl border border-border bg-[#090D16] p-5 shadow-lg space-y-4">
              <div className="pb-2 border-b border-border/70">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  3. Member 4 Numerical Solver Conditions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
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
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
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
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
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
                    className="w-full rounded-lg bg-charcoal-800 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
                  >
                    <option value={32}>32 x 32 (Fast)</option>
                    <option value={64}>64 x 64 (Standard)</option>
                    <option value={128}>128 x 128 (High-Res)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
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
                  className="rounded accent-electric h-4 w-4 bg-slate-700"
                />
                <label htmlFor="rad_model" className="text-xs font-mono text-slate-300">
                  Enable Optically Thin Radiation Model (Critical for 0g Extinction Limits)
                </label>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isExecuting}
                onClick={handleRunSimulation}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-electric hover:bg-electric-600 disabled:bg-slate-700 px-6 py-3.5 text-sm font-mono font-bold text-white shadow-xl shadow-electric/25 transition-all"
              >
                {isExecuting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{execStatus || "Executing Solver..."}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Launch Physical Simulation &amp; AI Diagnostics</span>
                  </>
                )}
              </button>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs font-mono text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
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
              <div className="rounded-xl border border-emerald-800/40 bg-[#090D16] p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      Simulation Complete
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    Solved in {lastSimulation.execution_duration_ms?.toFixed(1)} ms
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded bg-charcoal-800 border border-border/60">
                    <div className="text-slate-400 text-[10px]">Flame Shape</div>
                    <div className="text-white font-bold mt-0.5">{lastSimulation.flame_shape}</div>
                  </div>
                  <div className="p-2.5 rounded bg-charcoal-800 border border-border/60">
                    <div className="text-slate-400 text-[10px]">Peak Temp</div>
                    <div className="text-flame-400 font-bold mt-0.5">
                      {lastSimulation.max_temperature_k?.toFixed(0)} K
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-charcoal-800 border border-border/60">
                    <div className="text-slate-400 text-[10px]">Flame Radius</div>
                    <div className="text-electric-400 font-bold mt-0.5">
                      {lastSimulation.flame_radius_mm?.toFixed(2)} mm
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-charcoal-800 border border-border/60">
                    <div className="text-slate-400 text-[10px]">Burn Rate</div>
                    <div className="text-emerald-400 font-bold mt-0.5">
                      {lastSimulation.burn_rate_mg_s?.toFixed(2)} mg/s
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => router.push(`/simulations`)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-electric-400 hover:text-electric-300 font-medium"
                  >
                    <span>Inspect 2D Heatmap &amp; Curves</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* AI Diagnostics Card if analysis completed */}
            {lastAnalysis && (
              <div className="rounded-xl border border-electric-800/40 bg-[#090D16] p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2 text-electric-400">
                    <Sparkles className="h-4 w-4 text-electric-400" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      AI Diagnostic Engine
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    Confidence: {(lastAnalysis.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-300 leading-relaxed">
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
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-electric-400 hover:text-electric-300 font-medium"
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
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading Experiment Workspace..." />}>
      <WorkspaceContent />
    </Suspense>
  );
}
