"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Brain, ArrowRight, CheckCircle2, AlertTriangle, Shield, Gauge } from "lucide-react";
import { DimensionlessGauge } from "@/components/visualization/DimensionlessGauge";

interface DiagnosticSample {
  regime: string;
  gravityLabel: string;
  g: number;
  fuel: string;
  confidence: number;
  summary: string;
  grashof: number;
  richardson: number;
  froude: number;
  rayleigh: number;
  findings: string[];
  recommendations: string[];
}

export function AIAnalysisPreviewSection() {
  const [selectedCase, setSelectedCase] = useState<number>(0);

  const cases: DiagnosticSample[] = [
    {
      regime: "Diffusive Spherical Microgravity",
      gravityLabel: "0.00g (ISS CIR / ACME)",
      g: 0.0,
      fuel: "Methane (CH₄)",
      confidence: 0.984,
      summary:
        "Symmetric spherical diffusion flame observed under orbital microgravity. Buoyancy forces are mathematically suppressed (Gr = 0.00, Ri = 0.00), eliminating natural convection and buoyant vortex flicker.",
      grashof: 0.0,
      richardson: 0.0,
      froude: 9999.0, // Infinite
      rayleigh: 0.0,
      findings: [
        "Isotropic Radial Diffusion: Flame envelope exhibits circular aspect ratio (AR ≈ 1.01). Reactant transport governed by Fickian molecular diffusion.",
        "Soot Shell Stagnation: Without upward draft velocity, carbon nanoparticles aggregate in an outer spherical shell.",
        "Dominant Radiative Heat Loss: Stagnant CO₂ and H₂O combustion products radiate thermal energy into the ambient chamber.",
      ],
      recommendations: [
        "Monitor ambient O₂ concentration (> 14%) to guard against low-flow radiative quenching.",
        "Utilize high-speed narrow-band CH* chemiluminescence imaging to track stoichiometric boundary curvature.",
      ],
    },
    {
      regime: "Transitional Lunar Gravity",
      gravityLabel: "0.166g (Artemis Analogue)",
      g: 0.166,
      fuel: "Propane (C₃H₈)",
      confidence: 0.961,
      summary:
        "Intermediate gravitational acceleration perturbs spherical symmetry into an oblate teardrop geometry. Partial buoyancy creates slow periodic vortex oscillations at ~4 Hz.",
      grashof: 3.98e4,
      richardson: 3.02,
      froude: 2.47,
      rayleigh: 2.83e4,
      findings: [
        "Base Expansion: The flame base widens significantly compared to terrestrial flames while a subtle upward drift develops.",
        "Low-Frequency Flicker: Buoyancy instabilities develop at ~4 Hz, significantly slower than Earth 1g.",
      ],
      recommendations: [
        "Compare mass consumption rate against d²-law baseline to isolate the partial-gravity convective enhancement factor.",
        "Calibrate lunar habitat ventilation thresholds to minimize convective flame acceleration.",
      ],
    },
    {
      regime: "Buoyant Laminar Convective Plume",
      gravityLabel: "1.00g (Terrestrial Baseline)",
      g: 1.0,
      fuel: "Methane (CH₄)",
      confidence: 0.992,
      summary:
        "Strong buoyancy-driven convection elongates the flame into a narrow vertical teardrop with ~12.4 Hz periodic vortex shedding and high convective heat removal.",
      grashof: 2.4e5,
      richardson: 18.2,
      froude: 1.01,
      rayleigh: 1.7e5,
      findings: [
        "Convective Acceleration: Hot gas thermal expansion produces buoyancy-induced velocity up to 1.85 m/s.",
        "Toroidal Vortex Shedding: Shear with ambient air triggers periodic ~12 Hz flicker instability.",
        "Upward Soot Escape: Soot nanoparticles vent into a trailing smoke plume.",
      ],
      recommendations: [
        "Cross-reference against ISS microgravity test runs to isolate the pure gravitational acceleration vector on soot nucleation.",
      ],
    },
  ];

  const current = cases[selectedCase];

  return (
    <section className="relative py-20 sm:py-28 border-b border-border bg-[#070A12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
            <Brain className="h-3.5 w-3.5" />
            <span>NEURAL FLAME DIAGNOSTICS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
            AI Combustion Analysis Engine
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Member 3’s AI Engine continuously ingests physical parameters, evaluates fluid dynamic dimensionless scaling metrics,
            and detects combustion regime shifts across varying gravity levels.
          </p>

          {/* Preset Case Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {cases.map((c, i) => (
              <button
                key={c.regime}
                onClick={() => setSelectedCase(i)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-medium border transition-all ${
                  selectedCase === i
                    ? "bg-electric border-electric text-white shadow-lg shadow-electric/25"
                    : "glass-panel border-border text-slate-400 hover:text-white"
                }`}
              >
                <span>{c.regime}</span>
                <span className="ml-1.5 opacity-70">[{c.g}g]</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live AI Analysis Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Diagnostic Card */}
          <div className="lg:col-span-7 rounded-2xl glass-panel-glow p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <span className="font-mono text-xs uppercase text-electric-400 font-bold">
                  REGIME CLASSIFICATION
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                  {current.regime}
                </h3>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  CONDITIONS: {current.gravityLabel} &bull; FUEL: {current.fuel}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-charcoal-900 border border-electric/40 px-3 py-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-electric-400 animate-spin" />
                <div className="text-right">
                  <div className="font-mono text-[10px] text-slate-400">CONFIDENCE</div>
                  <div className="font-mono text-xs font-bold text-white">
                    {(current.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Summary */}
            <div className="p-4 rounded-xl bg-charcoal-900/90 border border-border text-xs text-slate-300 leading-relaxed font-sans">
              <span className="font-mono font-bold text-electric-300 uppercase block mb-1">
                EXECUTIVE TELEMETRY SUMMARY:
              </span>
              {current.summary}
            </div>

            {/* Scientific Insights */}
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold uppercase text-slate-300 tracking-wider">
                NEURAL PHYSICS FINDINGS:
              </span>
              <div className="space-y-2.5">
                {current.findings.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-electric-400 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="space-y-3 pt-2">
              <span className="font-mono text-xs font-bold uppercase text-amber-400 tracking-wider">
                SPACEFLIGHT RECOMMENDATIONS:
              </span>
              <div className="space-y-2">
                {current.recommendations.map((r, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-lg bg-charcoal-900 border border-border">
                    <Shield className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/assistant"
                className="inline-flex items-center gap-2 text-xs font-mono text-electric-400 hover:text-electric-300 transition-colors"
              >
                <span>Open Full AI Research Assistant Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Dimensionless Numbers Radar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl glass-panel p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-mono text-xs font-bold uppercase text-slate-300 tracking-wider">
                  SCALING METRICS
                </span>
                <span className="font-mono text-xs text-electric-400">DIMENSIONLESS</span>
              </div>

              <div className="space-y-4">
                <DimensionlessGauge
                  numbers={{
                    richardson_number: current.richardson,
                    grashof_number: current.grashof,
                    froude_number: current.froude,
                    rayleigh_number: current.rayleigh,
                  }}
                  regime={current.regime}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
