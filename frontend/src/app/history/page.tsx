"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Play,
  Cpu,
  Trash2,
  GitCompare,
  Eye,
  CheckCircle2,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { Experiment } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState, LoadingSpinner } from "@/components/ui/EmptyState";

export default function HistoryPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [fuelFilter, setFuelFilter] = useState<string>("");
  const [gravityFilter, setGravityFilter] = useState<string>("");

  // Comparison Matrix Selection
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Detail Modal
  const [selectedExpDetail, setSelectedExpDetail] = useState<Experiment | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listExperiments({
        page: 1,
        page_size: 100,
        fuel_type: fuelFilter || undefined,
        search: searchQuery || undefined,
      });
      setExperiments(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load experiment history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fuelFilter]);

  // Handle Delete
  const handleDeleteExperiment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all associated simulations?`)) {
      return;
    }
    try {
      await api.deleteExperiment(id);
      setExperiments((prev) => prev.filter((e) => e.id !== id));
      setSelectedForCompare((prev) => prev.filter((i) => i !== id));
    } catch (err) {
      alert("Failed to delete experiment");
    }
  };

  // Toggle selection for comparison
  const toggleSelectForCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
    } else {
      if (selectedForCompare.length >= 4) {
        alert("You can compare up to 4 experiments at once.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  // Filter experiments locally by gravity if selected
  const filteredList = experiments.filter((exp) => {
    if (gravityFilter === "zero_g" && exp.gravity_level_g > 0.05) return false;
    if (
      gravityFilter === "partial_g" &&
      (exp.gravity_level_g <= 0.05 || exp.gravity_level_g >= 0.6)
    )
      return false;
    if (gravityFilter === "earth" && exp.gravity_level_g < 0.6) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = exp.name.toLowerCase().includes(q);
      const matchFuel = exp.fuel_type.toLowerCase().includes(q);
      const matchFacility = exp.metadata?.facility?.toLowerCase().includes(q);
      if (!matchName && !matchFuel && !matchFacility) return false;
    }

    return true;
  });

  const compareList = experiments.filter((e) => selectedForCompare.includes(e.id));

  return (
    <div className="flex-1 bg-[#080B12] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-electric-400 uppercase tracking-widest">
                Flight &amp; Ground Data Archives
              </span>
              <span className="rounded bg-electric-950/60 px-2 py-0.5 text-[10px] font-mono text-electric-300 border border-electric-700/40">
                {experiments.length} Total Saved
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Experiment History &amp; Matrix Comparison
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse complete archives of recorded combustion experiments, inspect parameters, and compare configurations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedForCompare.length >= 2 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-electric hover:bg-electric-600 px-3.5 py-2 text-xs font-mono font-semibold text-white shadow-md shadow-electric/25 transition-colors"
              >
                <GitCompare className="h-4 w-4" />
                <span>Compare Selected ({selectedForCompare.length})</span>
              </button>
            )}

            <button
              onClick={fetchHistory}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-charcoal-700 hover:bg-charcoal-600 border border-border px-3 py-2 text-xs font-mono font-medium text-slate-200 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-charcoal-800/60 p-4 rounded-xl border border-border/80">
          <div className="flex-1 w-full md:w-auto relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by experiment title, fuel chemical species, facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-charcoal-900 border border-border pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-electric"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Fuel filter */}
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="rounded-lg bg-charcoal-900 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
            >
              <option value="">All Fuel Species</option>
              <option value="Methane">Methane (CH₄)</option>
              <option value="Propane">Propane (C₃H₈)</option>
              <option value="Heptane">Heptane (C₇H₁₆)</option>
              <option value="Hydrogen">Hydrogen (H₂)</option>
            </select>

            {/* Gravity filter */}
            <select
              value={gravityFilter}
              onChange={(e) => setGravityFilter(e.target.value)}
              className="rounded-lg bg-charcoal-900 border border-border px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-electric"
            >
              <option value="">All Gravity Regimes</option>
              <option value="zero_g">0g Microgravity (ISS / Drop Tower)</option>
              <option value="partial_g">Partial Gravity (Lunar / Mars)</option>
              <option value="earth">1.0g Earth Terrestrial</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        {loading ? (
          <LoadingSpinner message="Querying experiment database..." />
        ) : error ? (
          <EmptyState
            title="Database Connection Error"
            description={error}
            actionLabel="Retry"
            onAction={fetchHistory}
            icon="error"
          />
        ) : filteredList.length === 0 ? (
          <EmptyState
            title="No Matching Experiments"
            description="No experiment records match your active search or gravity filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery("");
              setFuelFilter("");
              setGravityFilter("");
            }}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-[#090D16] shadow-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-border bg-charcoal-800/80 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">Compare</th>
                  <th className="px-4 py-3">Experiment Title</th>
                  <th className="px-4 py-3">Gravity Field</th>
                  <th className="px-4 py-3">Fuel / Flow</th>
                  <th className="px-4 py-3">Chamber Conditions</th>
                  <th className="px-4 py-3">Runs / AI</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-slate-300">
                {filteredList.map((exp) => {
                  const isChecked = selectedForCompare.includes(exp.id);
                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-charcoal-800/50 transition-colors ${
                        isChecked ? "bg-electric-950/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectForCompare(exp.id)}
                          className="rounded accent-electric h-3.5 w-3.5 bg-slate-800"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedExpDetail(exp)}
                          className="font-semibold text-white hover:text-electric-400 text-left transition-colors"
                        >
                          {exp.name}
                        </button>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                          {exp.description || exp.metadata?.facility || "NASA Combustion Test"}
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
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{exp.fuel_type}</span>
                        <div className="text-[11px] text-slate-400">
                          {exp.fuel_flow_rate_sccm ? `${exp.fuel_flow_rate_sccm} sccm` : "Droplet"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <div>
                          {exp.pressure_atm} atm &bull; {exp.oxygen_percentage}% O₂
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {exp.ambient_temperature_k} K &bull; Ø{" "}
                          {exp.burner_diameter_mm || exp.initial_droplet_diameter_mm || 6.35}mm
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="text-flame-400 font-semibold">{exp.simulations_count || 0} sim</span>
                          <span>&bull;</span>
                          <span className="text-electric-400 font-semibold">{exp.analyses_count || 0} AI</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={exp.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedExpDetail(exp)}
                          title="View Details"
                          className="p-1 rounded hover:bg-charcoal-700 text-slate-400 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/workspace?experimentId=${exp.id}`}
                          title="Run in Workspace"
                          className="inline-flex p-1 rounded hover:bg-charcoal-700 text-electric-400 hover:text-electric-300"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteExperiment(exp.id, exp.name)}
                          title="Delete Experiment"
                          className="p-1 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Experiment Detail Modal */}
        {selectedExpDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-[#090D16] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="font-mono text-base font-bold text-white">
                    {selectedExpDetail.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedExpDetail.id} &bull; Created: {new Date(selectedExpDetail.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedExpDetail(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-charcoal-700 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded bg-charcoal-800 border border-border">
                  <span className="text-slate-400 text-[10px]">Gravity Level</span>
                  <div className="text-electric-400 font-bold text-sm mt-0.5">
                    {selectedExpDetail.gravity_level_g.toFixed(3)} g
                  </div>
                </div>
                <div className="p-3 rounded bg-charcoal-800 border border-border">
                  <span className="text-slate-400 text-[10px]">Fuel Species</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selectedExpDetail.fuel_type}
                  </div>
                </div>
                <div className="p-3 rounded bg-charcoal-800 border border-border">
                  <span className="text-slate-400 text-[10px]">Chamber Pressure</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selectedExpDetail.pressure_atm} atm
                  </div>
                </div>
                <div className="p-3 rounded bg-charcoal-800 border border-border">
                  <span className="text-slate-400 text-[10px]">Oxygen Vol %</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selectedExpDetail.oxygen_percentage}%
                  </div>
                </div>
                <div className="p-3 rounded bg-charcoal-800 border border-border">
                  <span className="text-slate-400 text-[10px]">Flow Rate</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selectedExpDetail.fuel_flow_rate_sccm
                      ? `${selectedExpDetail.fuel_flow_rate_sccm} sccm`
                      : "Droplet Mode"}
                  </div>
                </div>
                <div className="p-3 rounded bg-charcoal-800 border border-border">
                  <span className="text-slate-400 text-[10px]">Ambient Temp</span>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {selectedExpDetail.ambient_temperature_k} K
                  </div>
                </div>
              </div>

              {selectedExpDetail.metadata && (
                <div className="p-3 rounded bg-charcoal-800/60 border border-border/80 text-xs font-mono space-y-1">
                  <div className="text-slate-400 text-[10px]">Facility &amp; Investigator</div>
                  <div className="text-slate-200">
                    {selectedExpDetail.metadata.facility || "NASA Spaceflight / Ground"} &bull;{" "}
                    {selectedExpDetail.metadata.investigator || "Principal Investigator"}
                  </div>
                  {selectedExpDetail.metadata.notes && (
                    <div className="text-slate-400 text-[11px] pt-1">
                      Notes: {selectedExpDetail.metadata.notes}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Link
                  href={`/workspace?experimentId=${selectedExpDetail.id}`}
                  className="rounded-lg bg-electric hover:bg-electric-600 px-4 py-2 text-xs font-mono font-semibold text-white transition-colors"
                >
                  Configure / Run Simulation
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Experiment Parameter Comparison Matrix Modal */}
        {showCompareModal && compareList.length >= 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
            <div className="w-full max-w-5xl rounded-2xl border border-border bg-[#090D16] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 text-electric-400" />
                  <h3 className="font-mono text-base font-bold text-white">
                    Parameter Matrix Comparison ({compareList.length} Experiments)
                  </h3>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-charcoal-700 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Comparison Matrix Table */}
              <div className="overflow-x-auto rounded-lg border border-border bg-charcoal-900">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-charcoal-800 border-b border-border text-slate-400">
                    <tr>
                      <th className="px-4 py-3 w-48">Parameter</th>
                      {compareList.map((exp) => (
                        <th key={exp.id} className="px-4 py-3 text-white font-bold">
                          {exp.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-slate-300">
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-400">Gravity Level (g)</td>
                      {compareList.map((e) => (
                        <td key={e.id} className="px-4 py-2.5 font-bold text-electric-400">
                          {e.gravity_level_g.toFixed(3)} g
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-400">Fuel Chemical Species</td>
                      {compareList.map((e) => (
                        <td key={e.id} className="px-4 py-2.5 text-white font-medium">
                          {e.fuel_type}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-400">Fuel Flow Rate</td>
                      {compareList.map((e) => (
                        <td key={e.id} className="px-4 py-2.5">
                          {e.fuel_flow_rate_sccm ? `${e.fuel_flow_rate_sccm} sccm` : "Droplet Mode"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-400">Oxygen Percentage</td>
                      {compareList.map((e) => (
                        <td key={e.id} className="px-4 py-2.5">
                          {e.oxygen_percentage}% O₂
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-400">Chamber Pressure</td>
                      {compareList.map((e) => (
                        <td key={e.id} className="px-4 py-2.5">
                          {e.pressure_atm} atm
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-400">Ambient Temperature</td>
                      {compareList.map((e) => (
                        <td key={e.id} className="px-4 py-2.5">
                          {e.ambient_temperature_k} K
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-400">Burner Diameter</td>
                      {compareList.map((e) => (
                        <td key={e.id} className="px-4 py-2.5">
                          {e.burner_diameter_mm || e.initial_droplet_diameter_mm || 6.35} mm
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-400">Facility</td>
                      {compareList.map((e) => (
                        <td key={e.id} className="px-4 py-2.5 text-slate-400">
                          {e.metadata?.facility || "NASA Ground / Orbit"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="rounded-lg bg-charcoal-700 hover:bg-charcoal-600 px-4 py-2 text-xs font-mono text-white"
                >
                  Close Matrix
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

