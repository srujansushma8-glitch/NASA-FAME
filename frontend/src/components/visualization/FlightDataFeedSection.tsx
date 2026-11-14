"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Activity, ExternalLink, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import { api } from "@/lib/api";
import { Experiment, HealthResponse } from "@/types";

export function FlightDataFeedSection() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        const [expRes, healthRes] = await Promise.allSettled([
          api.listExperiments({ page: 1, page_size: 5 }),
          api.getHealth(),
        ]);

        if (mounted) {
          if (expRes.status === "fulfilled") {
            setExperiments(expRes.value.items || []);
          } else {
            console.warn("Could not load experiments from API:", expRes.reason);
          }

          if (healthRes.status === "fulfilled") {
            setHealth(healthRes.value);
          }
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Error connecting to NASA-FLAME API");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative py-20 sm:py-28 border-b border-border bg-[#05070D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
              <Database className="h-3.5 w-3.5" />
              <span>LIVE MISSION DATABASE // REAL FLIGHT BENCHMARKS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Grounded in Flight Science
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              NASA-FLAME couples empirical datasets from the International Space Station and terrestrial drop towers
              with high-performance numerical conservation equations.
            </p>
          </div>

          {/* System Telemetry Badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl glass-panel border border-border">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <div className="font-mono text-xs">
              <div className="text-slate-400 text-[10px]">API ENGINE STATUS:</div>
              <div className="text-white font-bold">
                {health ? `NASA-FLAME API [${health.status.toUpperCase()}]` : "ONLINE [PORT 8000]"}
              </div>
            </div>
          </div>
        </div>

        {/* Experiment Telemetry Table */}
        <div className="rounded-2xl glass-panel border border-border overflow-hidden mb-12">
          <div className="p-4 sm:p-5 border-b border-border bg-charcoal-900/80 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs font-bold uppercase text-slate-300 tracking-wider">
              RECENT REFERENCE FLIGHT EXPERIMENTS
            </span>
            <Link
              href="/dashboard"
              className="text-xs font-mono text-electric-400 hover:text-electric-300 flex items-center gap-1"
            >
              <span>View Full Flight Archive</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-charcoal-950 text-slate-400 border-b border-border text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Experiment Title</th>
                  <th className="py-3 px-4">Fuel &amp; O₂</th>
                  <th className="py-3 px-4">Gravity</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Querying NASA-FLAME telemetry database...
                    </td>
                  </tr>
                ) : experiments.length > 0 ? (
                  experiments.map((exp) => (
                    <tr key={exp.id} className="hover:bg-charcoal-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-sans font-semibold text-white">{exp.name}</div>
                        <div className="text-[10px] text-slate-400">{exp.description?.substring(0, 55)}...</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{exp.fuel_type}</div>
                        <div className="text-[10px] text-slate-400">{exp.oxygen_percentage}% O₂ &bull; {exp.pressure_atm} atm</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                            exp.gravity_level_g === 0
                              ? "bg-electric-950/70 text-electric-400 border-electric/40"
                              : exp.gravity_level_g < 0.5
                              ? "bg-amber-950/70 text-amber-400 border-amber-600/40"
                              : "bg-flame-950/70 text-flame-400 border-flame-600/40"
                          }`}
                        >
                          {exp.gravity_level_g.toFixed(3)}g
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {exp.metadata?.facility || "ISS CIR / ACME"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/workspace?expId=${exp.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-electric/20 hover:bg-electric text-electric-300 hover:text-white border border-electric/40 transition-all font-semibold"
                        >
                          <span>Simulate</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No experiments loaded. Launch the workspace to create your first experiment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4 Spaceflight Benchmarks Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl glass-panel space-y-3 border border-border hover:border-electric/40 transition-all">
            <span className="font-mono text-xs text-electric-400 font-bold uppercase tracking-wider block">
              FACILITY 01
            </span>
            <h4 className="font-display text-base font-bold text-white">ISS CIR / ACME</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Combustion Integrated Rack inside the Destiny module. Validated spherical diffusion flame kinetics in continuous 0g orbit.
            </p>
            <div className="font-mono text-[10px] text-slate-400 pt-2 border-t border-border">
              ALTITUDE: 408 KM &bull; MICRO-G: 10⁻⁶g
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel space-y-3 border border-border hover:border-flame/40 transition-all">
            <span className="font-mono text-xs text-flame-400 font-bold uppercase tracking-wider block">
              FACILITY 02
            </span>
            <h4 className="font-display text-base font-bold text-white">Glenn Drop Tower</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              NASA Glenn’s 2.2-Second Drop Tower. Investigates isolated fuel droplet burning and empirical d²-law evaporation constants.
            </p>
            <div className="font-mono text-[10px] text-slate-400 pt-2 border-t border-border">
              FREEFALL: 24.1 METERS &bull; VACUUM PURGE
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel space-y-3 border border-border hover:border-amber-400/40 transition-all">
            <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider block">
              FACILITY 03
            </span>
            <h4 className="font-display text-base font-bold text-white">Artemis Lunar Base</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Partial gravity (0.166g) combustion models for lunar pressurized habitats, evaluating oxygen enrichment risk matrices.
            </p>
            <div className="font-mono text-[10px] text-slate-400 pt-2 border-t border-border">
              LUNAR G: 0.166g &bull; O₂ ENRICHMENT: 32%
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel space-y-3 border border-border hover:border-emerald-400/40 transition-all">
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider block">
              FACILITY 04
            </span>
            <h4 className="font-display text-base font-bold text-white">FLEX Droplet Engine</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Flame Extinction Experiment onboard the ISS. Explored cold flame transitions and radiative quenching limits in heptane.
            </p>
            <div className="font-mono text-[10px] text-slate-400 pt-2 border-t border-border">
              COOL FLAME DISCOVERY &bull; CIR PAYLOAD
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
