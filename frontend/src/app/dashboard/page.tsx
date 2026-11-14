"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Compass,
  Play,
  Cpu,
  History,
  Flame,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { api } from "@/lib/api";
import { Experiment, HealthResponse } from "@/types";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { GravitySelector } from "@/components/ui/GravitySelector";
import { EmptyState, LoadingSpinner } from "@/components/ui/EmptyState";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [selectedGravity, setSelectedGravity] = useState<number>(0.0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, healthRes] = await Promise.all([
        api.listExperiments({ page: 1, page_size: 50 }),
        api.getHealth().catch(() => null),
      ]);
      setExperiments(expRes.items);
      if (healthRes) setHealth(healthRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics based on actual available experiments
  const totalExperiments = experiments.length;
  const zeroGCount = experiments.filter((e) => e.gravity_level_g <= 0.05).length;
  const partialGCount = experiments.filter((e) => e.gravity_level_g > 0.05 && e.gravity_level_g < 0.6).length;
  const earthCount = experiments.filter((e) => e.gravity_level_g >= 0.6).length;
  const totalSimulations = experiments.reduce((acc, curr) => acc + (curr.simulations_count || 0), 0);

  // Filtered experiments for table
  const filteredExperiments = experiments.filter((e) => {
    const matchesSearch =
      searchQuery === "" ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fuel_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030508] relative overflow-hidden text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        {/* Subtle Cosmic Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-electric-500/10 via-electric-900/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-flame-500/5 blur-3xl pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl space-y-8 relative">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-electric-950/80 border border-electric-500/40 text-electric-300 font-mono text-[10px] tracking-widest uppercase">
                  <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                  Mission Control Telemetry
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-mono text-slate-300 border border-white/10">
                  DB: {health?.database?.engine || "SQLite Active"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white mt-2 tracking-tight uppercase">
                Research Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
                Real-time combustion diagnostics, microgravity vs terrestrial flight archives, and computational fluid mechanics telemetry.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 text-xs font-mono font-medium text-slate-200 transition-all hover:border-white/20"
                title="Refresh Data"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
                <span>Sync Telemetry</span>
              </button>

              <Link
                href="/workspace"
                className="flex items-center gap-2 rounded-xl bg-electric-500 hover:bg-electric-400 px-5 py-2.5 text-xs font-mono font-semibold text-white shadow-lg shadow-electric-500/25 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>New Experiment</span>
              </Link>
            </div>
          </div>

          {/* Global Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Experiments"
              value={totalExperiments}
              unit="records"
              subtitle={`${zeroGCount} in 0g • ${earthCount} Earth 1g`}
              icon={Compass}
              variant="electric"
            />
            <StatCard
              title="Simulation Runs"
              value={totalSimulations}
              unit="solved"
              subtitle="Member 4 Numerical Engine outputs"
              icon={Play}
              variant="flame"
            />
            <StatCard
              title="0g Microgravity Ratio"
              value={totalExperiments > 0 ? `${((zeroGCount / totalExperiments) * 100).toFixed(0)}%` : "0%"}
              unit="of dataset"
              subtitle={`${zeroGCount} ISS / Drop Tower tests`}
              icon={Activity}
              variant="emerald"
            />
            <StatCard
              title="Partial-g Regimes"
              value={partialGCount}
              unit="lunar/mars"
              subtitle="0.166g and 0.380g analogues"
              icon={Layers}
              variant="amber"
            />
          </div>

          {/* Gravity Condition Analysis & Live Morphology Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
                    Gravitational Regime Selector
                  </span>
                  <p className="text-[12px] font-sans text-slate-400 mt-0.5">
                    Observe simulated morphological shifts across gravitational field variations
                  </p>
                </div>
                <span className="rounded-lg bg-electric-950/80 px-3 py-1 text-xs font-mono font-semibold text-cyan-300 border border-electric-500/30">
                  {selectedGravity.toFixed(3)} g
                </span>
              </div>

              <GravitySelector value={selectedGravity} onChange={setSelectedGravity} />

              <div className="mt-5 p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
                <div className="text-slate-200 font-semibold tracking-wide">
                  Physical Characteristics @ {selectedGravity.toFixed(3)}g:
                </div>
                <div className="text-slate-400 leading-relaxed font-sans text-xs">
                  {selectedGravity <= 0.05
                    ? "• Pure Diffusion: Grashof number approaches zero. Thermal buoyancy is eliminated, resulting in a radially symmetric spherical flame envelope. High soot accumulation in outer boundary; susceptible to radiative extinction."
                    : selectedGravity < 0.6
                    ? "• Transitional Convection: Richardson number indicates mixed convective-diffusive flow. Flame base expands horizontally into an oblate ellipsoid with subdued low-frequency flicker."
                    : "• Buoyancy Plume: Strong upward natural convection accelerates hot gas. Classic elongated teardrop shape with periodic vortex shedding generating ~10–15 Hz flicker instability."}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                <Link
                  href={`/workspace?gravity=${selectedGravity}`}
                  className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  <span>Configure Experiment at {selectedGravity.toFixed(2)}g</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <FlameVisualizer
                gravity={selectedGravity}
                flameRadiusMm={selectedGravity === 0 ? 8.8 : selectedGravity < 0.5 ? 7.2 : 5.0}
                flameHeightMm={selectedGravity >= 0.6 ? 25.0 : undefined}
                maxTemperatureK={selectedGravity === 0 ? 2086 : selectedGravity < 0.5 ? 2250 : 2226}
                title="Real-time Morphology Preview"
              />
            </div>
          </div>

          {/* Recent Experiments Table & Module Quick Nav */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display font-bold text-white tracking-wide uppercase">
                  Recent Research Experiments
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Synchronized live from NASA-FLAME Core Database
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search fuel, name, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-64 transition-all"
                  />
                </div>

                <Link
                  href="/history"
                  className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-mono text-slate-300 transition-colors"
                >
                  View Archive
                </Link>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner message="Fetching experiments from NASA-FLAME Backend..." />
            ) : error ? (
              <EmptyState
                title="Backend Connection Notice"
                description={`Unable to retrieve experiments: ${error}. Ensure FastAPI is running on port 8000.`}
                actionLabel="Retry Connection"
                onAction={fetchData}
                icon="error"
              />
            ) : filteredExperiments.length === 0 ? (
              <EmptyState
                title="No Experiments Found"
                description="No experiments match the filter criteria or database has not been seeded."
                actionLabel="Create Experiment"
                onAction={() => (window.location.href = "/workspace")}
              />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-white/10 bg-white/5 text-slate-400 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Experiment Name</th>
                      <th className="px-5 py-3.5">Gravity</th>
                      <th className="px-5 py-3.5">Fuel Species</th>
                      <th className="px-5 py-3.5">Flow / O₂</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Facility</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {filteredExperiments.slice(0, 8).map((exp) => (
                      <tr key={exp.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white tracking-wide">{exp.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs font-sans mt-0.5">
                            {exp.description || "NASA Reference Experiment"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded px-2.5 py-1 text-[10px] font-bold border ${
                              exp.gravity_level_g <= 0.05
                                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                                : exp.gravity_level_g < 0.6
                                ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                : "bg-flame-950/60 text-flame-300 border-flame-500/40"
                            }`}
                          >
                            {exp.gravity_level_g.toFixed(3)}g
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white font-medium">{exp.fuel_type}</td>
                        <td className="px-5 py-4 text-slate-400">
                          {exp.fuel_flow_rate_sccm ? `${exp.fuel_flow_rate_sccm} sccm` : "Droplet"} •{" "}
                          {exp.oxygen_percentage}% O₂
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={exp.status} />
                        </td>
                        <td className="px-5 py-4 text-slate-400 text-[11px]">
                          {exp.metadata?.facility || "NASA Ground / Orbit"}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <Link
                            href={`/workspace?experimentId=${exp.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>Simulate</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Navigation Cards */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-4">
              Scientific Flight Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/workspace"
                className="flex flex-col p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/40 transition-all group shadow-xl"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-400">
                  <Compass className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-display text-sm font-bold text-white mt-4 tracking-wide uppercase">Experiment Workspace</div>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Configure chamber conditions, select numerical constraints, and launch runs.
                </p>
              </Link>

              <Link
                href="/simulations"
                className="flex flex-col p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-flame-500/40 transition-all group shadow-xl"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-flame-400">
                  <Play className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-display text-sm font-bold text-white mt-4 tracking-wide uppercase">Simulation Results</div>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Inspect 2D thermal contour matrices, transient trajectories, and compare gravity.
                </p>
              </Link>

              <Link
                href="/assistant"
                className="flex flex-col p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/40 transition-all group shadow-xl"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-cyan-400">
                  <Cpu className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-display text-sm font-bold text-white mt-4 tracking-wide uppercase">AI Research Assistant</div>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Compute fluid similarity numbers ($Gr, Ri, Fr$) and get AI combustion analysis.
                </p>
              </Link>

              <Link
                href="/history"
                className="flex flex-col p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/30 transition-all group shadow-xl"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-white">
                  <History className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="font-display text-sm font-bold text-white mt-4 tracking-wide uppercase">Experiment History</div>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Comprehensive archives, historical parameter comparison matrices, and notes.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
