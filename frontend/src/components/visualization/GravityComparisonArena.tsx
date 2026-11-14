"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Layers, ShieldAlert, Zap, Sliders, CheckCircle2 } from "lucide-react";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";

export function GravityComparisonArena() {
  const [sliderGravity, setSliderGravity] = useState<number>(0.0);
  const [activeTab, setActiveTab] = useState<"sideBySide" | "interactive">("interactive");

  // Physics properties calculated from gravity
  const grashofNumber = sliderGravity === 0 ? "0.00" : (sliderGravity * 2.4e5).toExponential(2);
  const richardsonNumber = sliderGravity === 0 ? "0.00" : (sliderGravity * 18.2).toFixed(2);
  const flickerFreq = sliderGravity === 0 ? "0 Hz (Quiescent)" : `${(sliderGravity * 12.4).toFixed(1)} Hz (Flicker Plume)`;
  const aspectMultiplier = sliderGravity === 0 ? 1.0 : 1.0 + sliderGravity * 2.8;

  return (
    <section className="relative py-20 sm:py-28 border-b border-border bg-[#06080E] overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-electric/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-flame/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
            <Sliders className="h-3.5 w-3.5" />
            <span>GRAVITATIONAL MORPHOLOGY COMPARISON</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
            0g Sphere <span className="text-slate-500 font-sans">versus</span> 1g Plume
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Eliminating gravitational acceleration ($g = 0$) shuts down the buoyancy term in the Navier-Stokes momentum equations.
            Compare the profound physical divergence between microgravity diffusion and terrestrial convective burning.
          </p>

          {/* Toggle between interactive slider and side-by-side mode */}
          <div className="inline-flex p-1 rounded-xl bg-charcoal-800/80 border border-border mt-4">
            <button
              onClick={() => setActiveTab("interactive")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === "interactive"
                  ? "bg-electric text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Interactive Gravity Slider
            </button>
            <button
              onClick={() => setActiveTab("sideBySide")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === "sideBySide"
                  ? "bg-electric text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Side-by-Side Breakdown
            </button>
          </div>
        </div>

        {activeTab === "interactive" ? (
          /* ============================================================== */
          /* INTERACTIVE GRAVITY CROSSFADER SLIDER                          */
          /* ============================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visualizer Display */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl glass-panel p-6 shadow-2xl">
                <FlameVisualizer
                  gravity={sliderGravity}
                  flameRadiusMm={sliderGravity === 0 ? 10.5 : sliderGravity < 0.5 ? 8.4 : 5.8}
                  flameHeightMm={sliderGravity >= 0.5 ? 28.0 * (sliderGravity / 1.0) : undefined}
                  maxTemperatureK={sliderGravity === 0 ? 2086 : sliderGravity < 0.5 ? 2190 : 2226}
                  title={`Flame Reaction Geometry (${sliderGravity.toFixed(2)}g)`}
                  showControls={true}
                />

                {/* Slider Input */}
                <div className="mt-6 p-4 rounded-xl bg-charcoal-900/90 border border-border space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">GRAVITATIONAL ACCELERATION:</span>
                    <span className="text-electric-400 font-bold text-sm">
                      {sliderGravity.toFixed(3)} g ({(sliderGravity * 9.80665).toFixed(3)} m/s²)
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={sliderGravity}
                    onChange={(e) => setSliderGravity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-charcoal-700 rounded-lg appearance-none cursor-pointer accent-electric"
                  />

                  {/* Benchmark buttons */}
                  <div className="flex justify-between items-center pt-1 text-[11px] font-mono text-slate-400">
                    <button
                      onClick={() => setSliderGravity(0.0)}
                      className={`hover:text-electric-400 transition-colors ${
                        sliderGravity === 0 ? "text-electric-400 font-bold" : ""
                      }`}
                    >
                      0.0g (ISS)
                    </button>
                    <button
                      onClick={() => setSliderGravity(0.166)}
                      className={`hover:text-amber-400 transition-colors ${
                        Math.abs(sliderGravity - 0.166) < 0.05 ? "text-amber-400 font-bold" : ""
                      }`}
                    >
                      0.166g (Moon)
                    </button>
                    <button
                      onClick={() => setSliderGravity(0.38)}
                      className={`hover:text-amber-400 transition-colors ${
                        Math.abs(sliderGravity - 0.38) < 0.05 ? "text-amber-400 font-bold" : ""
                      }`}
                    >
                      0.38g (Mars)
                    </button>
                    <button
                      onClick={() => setSliderGravity(1.0)}
                      className={`hover:text-flame-400 transition-colors ${
                        sliderGravity === 1.0 ? "text-flame-400 font-bold" : ""
                      }`}
                    >
                      1.0g (Earth)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Telemetry Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl glass-panel p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">
                    PHYSICS TELEMETRY SCALING
                  </span>
                  <span className="text-xs font-mono text-electric-400">
                    {sliderGravity === 0 ? "PURE DIFFUSION" : sliderGravity < 0.5 ? "TRANSITIONAL" : "BUOYANT CONVECTION"}
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-charcoal-800/90 border border-border flex justify-between items-center">
                    <div>
                      <div className="text-slate-400">GRASHOF NUMBER (Gr)</div>
                      <div className="text-[10px] text-slate-500">Buoyant vs Viscous Force</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{grashofNumber}</div>
                      <div className="text-[10px] text-electric-400">
                        {sliderGravity === 0 ? "CONVECTION ZERO" : "BUOYANCY ACTIVE"}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-charcoal-800/90 border border-border flex justify-between items-center">
                    <div>
                      <div className="text-slate-400">RICHARDSON NUMBER (Ri)</div>
                      <div className="text-[10px] text-slate-500">Natural vs Forced Flow</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{richardsonNumber}</div>
                      <div className="text-[10px] text-amber-400">
                        {sliderGravity === 0 ? "FROUDE DOMINATED" : "BUOYANT SHEAR"}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-charcoal-800/90 border border-border flex justify-between items-center">
                    <div>
                      <div className="text-slate-400">VORTEX SHEDDING FREQ</div>
                      <div className="text-[10px] text-slate-500">Instability Oscillation</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{flickerFreq}</div>
                      <div className="text-[10px] text-flame-400">
                        {sliderGravity === 0 ? "STEADY ENVELOPE" : "PERIODIC FLICKER"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physics Summary Callout */}
                <div className="p-4 rounded-xl bg-charcoal-900 border border-electric/20 text-xs text-slate-300 leading-relaxed font-sans">
                  {sliderGravity === 0 ? (
                    <p>
                      <strong className="text-white font-mono">Microgravity Isolation:</strong> With buoyant convection suppressed,
                      reactant molecules diffuse isotropically. The flame envelope settles into a perfect Burke-Schumann sphere where
                      soot particles accumulate in an outer radiative shell.
                    </p>
                  ) : sliderGravity < 0.5 ? (
                    <p>
                      <strong className="text-white font-mono">Partial Gravity Regimes:</strong> On the Moon (0.166g) and Mars (0.38g),
                      intermediate buoyancy forces widen the flame base and create slow, low-frequency oscillations (~4 Hz) critical for habitat life safety.
                    </p>
                  ) : (
                    <p>
                      <strong className="text-white font-mono">Terrestrial Buoyancy:</strong> Under Earth gravity, hot expanding gases
                      accelerate vertically due to density differences, elongating the flame into a teardrop and triggering the classic 10–15 Hz flicker instability.
                    </p>
                  )}
                </div>

                <Link
                  href={`/workspace?g=${sliderGravity}`}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-electric hover:bg-electric-600 px-4 py-3 text-xs font-mono font-semibold text-white transition-all shadow-lg shadow-electric/25"
                >
                  <span>Launch Experiment at {sliderGravity.toFixed(2)}g</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* SIDE-BY-SIDE CARD BREAKDOWN                                    */
          /* ============================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 0g Microgravity Card */}
            <div className="rounded-2xl glass-panel-glow p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-electric-400" />
                  <h3 className="font-display text-xl font-bold text-white tracking-wide">
                    0.0g Microgravity
                  </h3>
                </div>
                <span className="text-xs font-mono text-electric-400 bg-electric-950/60 border border-electric/30 px-2.5 py-1 rounded">
                  BURKE-SCHUMANN SPHERE
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-electric-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white font-mono">Spherical Symmetry:</strong> Zero buoyancy forces
                    (<span className="font-mono text-slate-100">Gr = 0</span>) eliminate the upward plume. The flame assumes a perfectly spherical, isotropic diffusion envelope.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-electric-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white font-mono">Quiescent Stability:</strong> No flicker vortex shedding. The flame
                    burns in steady, silent molecular equilibrium governed strictly by Fick’s law of mass diffusion.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-electric-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white font-mono">Soot Shell Stagnation:</strong> Carbon nanoparticles accumulate in a concentric outer shell rather than venting upward, significantly enhancing thermal emissivity.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-electric-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white font-mono">Radiative Extinction Risk:</strong> High concentration of stagnant CO₂ and H₂O products around the reaction zone leads to radiative heat loss and quenching at low flow velocities.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-900 border border-border/80 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>GRASHOF NUMBER:</span>
                  <span className="text-electric-400 font-bold">Gr = 0.00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>FLICKER FREQUENCY:</span>
                  <span className="text-white font-bold">0 Hz (Quiescent)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>DOMINANT TRANSPORT:</span>
                  <span className="text-slate-200">Molecular Diffusion</span>
                </div>
              </div>
            </div>

            {/* 1g Terrestrial Plume Card */}
            <div className="rounded-2xl glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden border-flame/30">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-flame-400" />
                  <h3 className="font-display text-xl font-bold text-white tracking-wide">
                    1.0g Terrestrial
                  </h3>
                </div>
                <span className="text-xs font-mono text-flame-400 bg-flame-950/60 border border-flame/30 px-2.5 py-1 rounded">
                  CONVECTIVE TEARDROP
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-flame-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white font-mono">Elongated Teardrop Plume:</strong> Heated low-density gas accelerates upward, drawing cooler air into the base and stretching the reaction zone vertically.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-flame-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white font-mono">Periodic Flicker Instability:</strong> Toroidal vortex rings roll up the outer flame boundary, triggering characteristic 10–15 Hz flicker oscillations.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-flame-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white font-mono">Convective Soot Clearance:</strong> Strong upward draft velocities evacuate soot nanoparticles into a trailing smoke plume before extensive agglomeration can occur.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-flame-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white font-mono">Blowout Extinction:</strong> High shear velocity can blow off the flame front if incoming convective momentum exceeds the laminar flame speed.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-900 border border-border/80 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>GRASHOF NUMBER:</span>
                  <span className="text-flame-400 font-bold">Gr ≈ 2.4 × 10⁵</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>FLICKER FREQUENCY:</span>
                  <span className="text-white font-bold">~12.4 Hz (Unstable)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>DOMINANT TRANSPORT:</span>
                  <span className="text-slate-200">Buoyant Convection</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

