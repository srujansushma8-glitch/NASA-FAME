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
} from "lucide-react";
import { api } from "@/lib/api";
import { Experiment, HealthResponse } from "@/types";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { GravitySelector } from "@/components/ui/GravitySelector";
import { EmptyState, LoadingSpinner } from "@/components/ui/EmptyState";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";

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
    <div className="flex-1 bg-[#080B12] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-electric-400 uppercase tracking-widest">
                Mission Operations Control
              </span>
              <span className="rounded bg-electric-950/60 px-2 py-0.5 text-[10px] font-mono text-electric-300 border border-electric-700/40">
                DB: {health?.database?.engine || "SQLite Active"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Research Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live telemetry, real-time combustion experiments, and microgravity vs terrestrial data.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-charcoal-700 hover:bg-charcoal-600 border border-border px-3 py-2 text-xs font-mono font-medium text-slate-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/workspace"
              className="flex items-center gap-1.5 rounded-lg bg-electric hover:bg-electric-600 px-4 py-2 text-xs font-mono font-semibold text-white shadow-md shadow-electric/25 transition-colors"
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
            subtitle={`${zeroGCount} in 0g &bull; ${earthCount} Earth 1g`}
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
          <div className="lg:col-span-7 flex flex-col rounded-xl border border-border bg-[#090D16] p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Select Gravity Condition
                </span>
                <p className="text-[11px] font-mono text-slate-400">
                  Observe simulated morphological shifts across gravitational field variations
                </p>
              </div>
              <span className="rounded bg-charcoal-700 px-2 py-0.5 text-[10px] font-mono text-electric-400 border border-border">
                {selectedGravity.toFixed(3)} g
              </span>
            </div>

            <GravitySelector value={selectedGravity} onChange={setSelectedGravity} />

            <div className="mt-5 p-4 rounded-lg bg-charcoal-800/80 border border-border/70 space-y-2 text-xs font-mono">
              <div className="text-slate-300 font-semibold">
                Physical Characteristics @ {selectedGravity.toFixed(3)}g:
              </div>
              <div className="text-slate-400 leading-relaxed">
                {selectedGravity <= 0.05
                  ? "• Pure Diffusion: Grashof number approaches zero. Thermal buoyancy is eliminated, resulting in a radially symmetric spherical flame envelope. High soot accumulation in outer boundary; susceptible to radiative extinction."
                  : selectedGravity < 0.6
                  ? "• Transitional Convection: Richardson number indicates mixed convective-diffusive flow. Flame base expands horizontally into an oblate ellipsoid with subdued low-frequency flicker."
                  : "• Buoyancy Plume: Strong upward natural convection accelerates hot gas. Classic elongated teardrop shape with periodic vortex shedding generating ~10–15 Hz flicker instability."}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
              <Link
                href={`/workspace?gravity=${selectedGravity}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-electric-400 hover:text-electric-300 font-medium"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Research Experiments</h2>
              <p className="text-xs text-slate-400">
                Data loaded live from Member 2's FastAPI database
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search fuel, name, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg bg-charcoal-800 border border-border pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-electric w-60"
                />
              </div>

              <Link
                href="/history"
                className="rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-border px-3 py-1.5 text-xs font-mono text-slate-300 transition-colors"
              >
                View All
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
            <div className="overflow-x-auto rounded-xl border border-border bg-[#090D16] shadow-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-border bg-charcoal-800/80 text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Experiment Name</th>
                    <th className="px-4 py-3">Gravity</th>
                    <th className="px-4 py-3">Fuel Species</th>
                    <th className="px-4 py-3">Flow / O₂</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Facility</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-slate-300">
                  {filteredExperiments.slice(0, 8).map((exp) => (
                    <tr key={exp.id} className="hover:bg-charcoal-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{exp.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {exp.description || "NASA Reference Experiment"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                            exp.gravity_level_g <= 0.05
                              ? "bg-electric-950/60 text-electric-300 border-electric-700/50"
                              : exp.gravity_level_g < 0.6
                              ? "bg-amber-950/60 text-amber-300 border-amber-700/50"
                              : "bg-flame-950/60 text-flame-300 border-flame-700/50"
                          }`}
                        >
                          {exp.gravity_level_g.toFixed(3)}g
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{exp.fuel_type}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {exp.fuel_flow_rate_sccm ? `${exp.fuel_flow_rate_sccm} sccm` : "Droplet"} &bull;{" "}
                        {exp.oxygen_percentage}% O₂
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={exp.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {exp.metadata?.facility || "NASA Ground / Orbit"}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Link
                          href={`/workspace?experimentId=${exp.id}`}
                          className="inline-flex items-center gap-1 rounded bg-charcoal-700 hover:bg-charcoal-600 border border-border px-2.5 py-1 text-[11px] text-electric-400 hover:text-electric-300 transition-colors"
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
        <div className="pt-4 border-t border-border">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Navigation to Core Scientific Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/workspace"
              className="flex flex-col p-4 rounded-xl border border-border bg-[#090D16] hover:border-electric/40 transition-colors group"
            >
              <div className="flex items-center justify-between text-slate-300 group-hover:text-electric-400">
                <Compass className="h-5 w-5" />
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="font-mono text-sm font-bold text-white mt-3">Experiment Workspace</div>
              <p className="text-xs text-slate-400 mt-1">
                Configure chamber conditions, select numerical constraints, and launch runs.
              </p>
            </Link>

            <Link
              href="/simulations"
              className="flex flex-col p-4 rounded-xl border border-border bg-[#090D16] hover:border-flame/40 transition-colors group"
            >
              <div className="flex items-center justify-between text-slate-300 group-hover:text-flame-400">
                <Play className="h-5 w-5" />
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="font-mono text-sm font-bold text-white mt-3">Simulation Results</div>
              <p className="text-xs text-slate-400 mt-1">
                Inspect 2D thermal contour matrices, transient trajectories, and compare gravity.
              </p>
            </Link>

            <Link
              href="/assistant"
              className="flex flex-col p-4 rounded-xl border border-border bg-[#090D16] hover:border-electric/40 transition-colors group"
            >
              <div className="flex items-center justify-between text-slate-300 group-hover:text-electric-400">
                <Cpu className="h-5 w-5" />
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="font-mono text-sm font-bold text-white mt-3">AI Research Assistant</div>
              <p className="text-xs text-slate-400 mt-1">
                Compute fluid similarity numbers ($Gr, Ri, Fr$) and get AI combustion analysis.
              </p>
            </Link>

            <Link
              href="/history"
              className="flex flex-col p-4 rounded-xl border border-border bg-[#090D16] hover:border-slate-500 transition-colors group"
            >
              <div className="flex items-center justify-between text-slate-300 group-hover:text-white">
                <History className="h-5 w-5" />
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="font-mono text-sm font-bold text-white mt-3">Experiment History</div>
              <p className="text-xs text-slate-400 mt-1">
                Comprehensive archives, historical parameter comparison matrices, and notes.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

