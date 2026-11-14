"use client";

import React, { useState } from "react";
import { Atom, Gauge, Layers, ShieldCheck, Sparkles, ChevronRight, Activity } from "lucide-react";

interface Stage {
  number: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  description: string;
  parameters: { label: string; value: string }[];
  physicsInsight: string;
  equations: string;
}

export function ExperimentJourneySection() {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages: Stage[] = [
    {
      number: "01",
      title: "Chamber Calibration & Fuel Feed",
      subtitle: "REACTANT ISOLATION PROTOCOL",
      icon: Gauge,
      description:
        "The combustion chamber is purged to sub-atmospheric vacuum and backfilled with calibrated oxidizer (21% to 100% O₂) diluted with N₂ or CO₂. Gaseous or liquid fuel (Methane, Propane, Heptane) is metered through a porous bronze sphere or micro-droplet needle dispenser.",
      parameters: [
        { label: "CHAMBER VOLUME", value: "110 L (CIR Standard)" },
        { label: "PRESSURE RANGE", value: "0.1 to 50.0 atm" },
        { label: "FLOW CONTROLLER", value: "0.5 – 100.0 sccm" },
        { label: "LEAK RATE SPEC", value: "< 1.0 × 10⁻⁴ scc/s" },
      ],
      physicsInsight:
        "Precise ambient oxygen dilution dictates the limiting oxygen index (LOI). Droplet diameters are calibrated between 1.0 to 5.0 mm to obey the classical d²-law burning envelope.",
      equations: "d²(t) = d₀² - K · t",
    },
    {
      number: "02",
      title: "Gravitational Acceleration Vectoring",
      subtitle: "MICROGRAVITY INSERTION",
      icon: Atom,
      description:
        "The experiment is initiated under orbital freefall on the ISS (0g) or dropped in the Glenn 2.2-Second Drop Tower. Gravitational acceleration drops to 10⁻⁶ g, collapsing the buoyancy term (g · β · ΔT) to zero.",
      parameters: [
        { label: "ORBITAL ALTITUDE", value: "408 km (ISS Low Earth Orbit)" },
        { label: "EFFECTIVE G-LEVEL", value: "1.0 × 10⁻⁶ g" },
        { label: "ACCELEROMETER", value: "SAMS Microgravity Sensor" },
        { label: "FREEFALL DURATION", value: "Continuous Orbit / 2.2s Drop" },
      ],
      physicsInsight:
        "As g → 0, natural convective velocities plummet from ~1.5 m/s to 0 m/s. The Grashof number Gr drops below 10⁻⁴, transitioning the regime completely into pure molecular diffusion.",
      equations: "Gr = (g · β · ΔT · L³) / ν²  →  0",
    },
    {
      number: "03",
      title: "Micro-Arc Ignition & Spherical Diffusion",
      subtitle: "BURKE-SCHUMANN REACTION FRONT",
      icon: Sparkles,
      description:
        "A low-energy electric spark or pilot wire initiates ignition. Hot combustion radicals form a spherically expanding reaction sheet. Without upward convective draft, reactant diffusion establishes a stable, glowing spherical orb.",
      parameters: [
        { label: "SPARK ENERGY", value: "25 – 120 mJ" },
        { label: "IGNITION TRANSIENT", value: "< 0.40 seconds" },
        { label: "PEAK TEMPERATURE", value: "2,086 – 2,250 K" },
        { label: "FLAME CURVATURE", value: "Symmetric Sphere (AR ≈ 1.0)" },
      ],
      physicsInsight:
        "Reactants meet in stoichiometric proportions at the flame radius. The burning rate is strictly limited by the diffusion coefficient of oxygen into the fuel vapor sphere.",
      equations: "m_dot = 4π · r_f · (λ / c_p) · ln(1 + B)",
    },
    {
      number: "04",
      title: "AI Telemetry & Radiative Quenching Diagnostics",
      subtitle: "NEURAL DIMENSIONLESS ANALYSIS",
      icon: Activity,
      description:
        "Member 3's AI Engine ingests sensor data in real-time. It computes dimensionless scaling numbers (Ri, Gr, Fr, Ra), classifies combustion regimes, monitors radiative heat loss from soot, and predicts radiative extinction boundaries.",
      parameters: [
        { label: "RICHARDSON NUMBER", value: "Ri = Gr / Re²  (0.00)" },
        { label: "FROUDE NUMBER", value: "Fr = u / √(g·L)  (∞)" },
        { label: "AI CONFIDENCE", value: "98.4% Classification" },
        { label: "EXTINCTION ALERT", value: "LOI Monitored (< 13% O₂)" },
      ],
      physicsInsight:
        "Because stagnant gases cannot escape, thermal radiation from CO₂ and H₂O cools the flame. The AI detects when radiative loss exceeds chemical heat generation, forecasting extinction.",
      equations: "Q_rad = 4 · σ · a_p · (T_f⁴ - T_∞⁴)",
    },
  ];

  const current = stages[activeStage];

  return (
    <section className="relative py-20 sm:py-28 border-b border-border bg-[#05070D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
            <Atom className="h-3.5 w-3.5" />
            <span>FLIGHT RESEARCH PROTOCOL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
            The Freefall Experiment Journey
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            From atmospheric chamber evacuation to neural dimensionless diagnostics: how NASA scientists capture
            and analyze the elusive physics of combustion without gravity.
          </p>
        </div>

        {/* 4-Stage Navigation Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx;
            return (
              <button
                key={stage.number}
                onClick={() => setActiveStage(idx)}
                className={`p-5 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                  isActive
                    ? "glass-panel-glow border-electric shadow-lg shadow-electric/15"
                    : "glass-panel hover:border-slate-600 opacity-75 hover:opacity-100"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-electric via-flame to-electric" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-electric-400">
                    STAGE {stage.number}
                  </span>
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-colors ${
                      isActive
                        ? "bg-electric-950 text-electric-400 border-electric/40"
                        : "bg-charcoal-800 text-slate-400 border-border"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {stage.subtitle}
                </div>
                <h4 className="font-sans text-sm font-bold text-white group-hover:text-electric-300 transition-colors">
                  {stage.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Detailed Stage Showcase */}
        <div className="rounded-2xl glass-panel p-6 sm:p-10 border border-electric/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold text-electric-400">
                  [{current.number}]
                </span>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                    {current.title}
                  </h3>
                  <div className="font-mono text-xs text-flame-400 tracking-wider">
                    {current.subtitle}
                  </div>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
                {current.description}
              </p>

              {/* Governing Physics Equation Box */}
              <div className="p-4 rounded-xl bg-charcoal-900/90 border border-border/80">
                <div className="font-mono text-[11px] text-slate-400 mb-1 flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-electric-400" />
                  <span>GOVERNING THERMAL TRANSPORT RELATION:</span>
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-electric-300 py-1">
                  {current.equations}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                  {current.physicsInsight}
                </p>
              </div>
            </div>

            {/* Right Telemetry Matrix */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl bg-charcoal-900/95 border border-border p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <span className="font-mono text-xs font-bold uppercase text-slate-300 tracking-wider">
                    STAGE {current.number} SPECIFICATIONS
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    FLIGHT CALIBRATED
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  {current.parameters.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex justify-between items-center p-2.5 rounded-lg bg-charcoal-800/80 border border-border/50"
                    >
                      <span className="text-slate-400 text-[11px]">{p.label}:</span>
                      <span className="text-white font-bold text-[12px]">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

