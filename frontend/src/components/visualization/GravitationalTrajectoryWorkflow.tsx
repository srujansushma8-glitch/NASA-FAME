"use client";

import React, { useState } from "react";
import { Compass, Orbit, ArrowDown, Activity, Sparkles, CheckCircle2 } from "lucide-react";

interface Waypoint {
  stage: string;
  altitude: string;
  gravity: number;
  label: string;
  grashof: string;
  regime: string;
  flameShape: string;
  description: string;
}

export function GravitationalTrajectoryWorkflow() {
  const [activeWaypoint, setActiveWaypoint] = useState<number>(3); // Default to 0g

  const waypoints: Waypoint[] = [
    {
      stage: "WAYPOINT 01",
      altitude: "0.0 KM (Sea Level)",
      gravity: 1.0,
      label: "Terrestrial Ground Reference Cell",
      grashof: "Gr ≈ 2.40 × 10⁵",
      regime: "Buoyant Convective Plume",
      flameShape: "Teardrop Plume (Aspect Ratio > 3.0)",
      description:
        "Standard terrestrial combustion governed by buoyant air acceleration. Hot gas expansion draws ambient air into the base, creating narrow vertical elongation with 10–15 Hz flicker.",
    },
    {
      stage: "WAYPOINT 02",
      altitude: "Hypobaric Test Cell (0.7 atm)",
      gravity: 0.38,
      label: "Martian Surface Analogue",
      grashof: "Gr ≈ 9.12 × 10⁴",
      regime: "Partial Buoyant Regime",
      flameShape: "Transitional Oval (Aspect Ratio ~2.2)",
      description:
        "Reduced gravity environment. Reduced buoyant acceleration lowers upward draft velocity while preserving subtle upward convective drift.",
    },
    {
      stage: "WAYPOINT 03",
      altitude: "Parabolic Flight Arc (10.5 km)",
      gravity: 0.166,
      label: "Lunar Surface Habitat Analogue",
      grashof: "Gr ≈ 3.98 × 10⁴",
      regime: "Transitional Low-Gravity",
      flameShape: "Base-Widened Envelope (Aspect Ratio ~1.6)",
      description:
        "Artemis equivalent lunar gravity. Flame base widens horizontally, and buoyant vortex shedding slows down to a gentle ~4 Hz oscillation.",
    },
    {
      stage: "WAYPOINT 04",
      altitude: "408.2 KM (ISS Low Earth Orbit)",
      gravity: 0.0,
      label: "Orbital Microgravity (ISS CIR / ACME)",
      grashof: "Gr → 0.00",
      regime: "Pure Burke-Schumann Diffusion",
      flameShape: "Perfect Sphere (Aspect Ratio ≈ 1.0)",
      description:
        "Natural convection completely ceases. Without upward buoyant acceleration, reactant transport is purely governed by molecular diffusion, establishing an isotropic, glowing spherical orb.",
    },
  ];

  const current = waypoints[activeWaypoint];

  return (
    <section className="relative py-20 sm:py-28 border-b border-border bg-[#05070D] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
            <Orbit className="h-3.5 w-3.5" />
            <span>GRAVITATIONAL TRAJECTORY // 1g TO 0g DECENTRALIZATION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
            The Decoupling of Gravity
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Trace the continuous mathematical transition as gravity scales down from 1.0g to 0.0g.
            Watch buoyant convection extinguish, vortex oscillations collapse, and spherical symmetry emerge.
          </p>
        </div>

        {/* Trajectory Timeline Strip */}
        <div className="relative mb-12">
          {/* Connecting Track Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-charcoal-700 hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
            {waypoints.map((wp, idx) => {
              const isActive = idx === activeWaypoint;
              return (
                <button
                  key={wp.stage}
                  onClick={() => setActiveWaypoint(idx)}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    isActive
                      ? "glass-panel-glow border-electric shadow-xl shadow-electric/20 scale-[1.02]"
                      : "glass-panel border-border/70 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-electric-400">
                      {wp.stage}
                    </span>
                    <span
                      className={`h-3 w-3 rounded-full border ${
                        isActive
                          ? "bg-electric border-white animate-ping"
                          : "bg-charcoal-800 border-border"
                      }`}
                    />
                  </div>

                  <div className="font-mono text-xl sm:text-2xl font-bold text-white mb-1">
                    {wp.gravity.toFixed(3)}g
                  </div>
                  <div className="text-xs text-slate-300 font-sans font-semibold line-clamp-1">
                    {wp.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Waypoint Showcase */}
        <div className="rounded-2xl glass-panel-glow p-6 sm:p-10 border border-electric/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs text-electric-400 font-bold">
                <span>{current.stage}</span>
                <span>&bull;</span>
                <span>{current.altitude}</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {current.label}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
                {current.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border font-mono text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">GRASHOF NUMBER:</div>
                  <div className="text-base font-bold text-white mt-0.5">{current.grashof}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">MORPHOLOGY:</div>
                  <div className="text-base font-bold text-electric-400 mt-0.5">
                    {current.flameShape}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Physics Telemetry Box */}
            <div className="lg:col-span-5 rounded-xl bg-charcoal-900/90 border border-border p-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border/70">
                <span className="text-slate-300 font-bold uppercase tracking-wider">
                  TRAJECTORY METRICS
                </span>
                <span className="text-emerald-400 text-[10px]">CONVERGENCE VERIFIED</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between p-2 rounded bg-charcoal-800/80 border border-border/40">
                  <span className="text-slate-400">TRANSPORT REGIME:</span>
                  <span className="text-white font-bold">{current.regime}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-charcoal-800/80 border border-border/40">
                  <span className="text-slate-400">FLICKER FREQUENCY:</span>
                  <span className="text-white font-bold">
                    {current.gravity === 0 ? "0 Hz (Suppressed)" : current.gravity < 0.5 ? "~4 Hz" : "~12.4 Hz"}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-charcoal-800/80 border border-border/40">
                  <span className="text-slate-400">BUOYANT VELOCITY:</span>
                  <span className="text-electric-400 font-bold">
                    {current.gravity === 0 ? "0.00 m/s" : `${(1.85 * Math.sqrt(current.gravity)).toFixed(2)} m/s`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
