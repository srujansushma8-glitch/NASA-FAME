"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  ArrowRight,
  Compass,
  Activity,
  Layers,
  Atom,
  Shield,
  Gauge,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { FlameVisualizer } from "@/components/visualization/FlameVisualizer";

export default function LandingPage() {
  const [selectedGravity, setSelectedGravity] = useState<number>(0.0);

  const gravityPresets = [
    { label: "0g Microgravity", g: 0.0, desc: "Spherical Burke-Schumann diffusion flame" },
    { label: "0.166g Lunar", g: 0.166, desc: "Artemis analogue with base widening" },
    { label: "0.38g Martian", g: 0.38, desc: "Transitional partial buoyancy regime" },
    { label: "1.0g Earth", g: 1.0, desc: "Convective buoyant plume with ~12 Hz flicker" },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-[#080B12] via-[#0B101D] to-[#080B12] py-16 sm:py-24">
        {/* Subtle background space particle grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#38BDF8 0.75px, transparent 0.75px), radial-gradient(#FF7029 0.75px, transparent 0.75px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "0 0, 16px 16px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
                <span className="flex h-2 w-2 rounded-full bg-electric-400 animate-ping" />
                NASA CIR / ACME &amp; Microgravity Combustion Science
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                What happens when fire forgets{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-flame via-flame-400 to-amber-300">
                  which way is up?
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl">
                On Earth, hot air rises—creating buoyant convection that stretches flames into flickering teardrops.
                In freefall microgravity (<span className="font-mono text-electric-400 font-semibold">0g</span>),
                buoyancy completely ceases (<span className="font-mono text-slate-200">Gr &approx; 0</span>). Flames become perfect,
                slow-burning luminous spheres governed purely by molecular diffusion and radiative heat loss.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 rounded-lg bg-electric hover:bg-electric-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-electric/25 transition-all font-mono"
                >
                  <Compass className="h-4 w-4" />
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg bg-charcoal-700 hover:bg-charcoal-600 border border-border px-5 py-3 text-sm font-semibold text-slate-200 transition-all font-mono"
                >
                  <Activity className="h-4 w-4 text-electric-400" />
                  <span>Explore Experiments</span>
                </Link>

                <Link
                  href="/assistant"
                  className="flex items-center gap-2 rounded-lg bg-transparent hover:bg-charcoal-800 border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition-all font-mono"
                >
                  <Sparkles className="h-4 w-4 text-flame-400" />
                  <span>Ask AI Assistant</span>
                </Link>
              </div>

              {/* Research Metrics Pills */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/70 max-w-lg">
                <div>
                  <div className="font-mono text-2xl font-bold text-white">0.0 g</div>
                  <div className="text-xs text-slate-400 mt-0.5">ISS Microgravity</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-flame-400">~12 Hz</div>
                  <div className="text-xs text-slate-400 mt-0.5">1g Vortex Flicker</div>
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-electric-400">&infin;</div>
                  <div className="text-xs text-slate-400 mt-0.5">0g Froude Number</div>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl border border-border bg-[#0B101D] p-5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-3">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Live Gravity Switcher
                  </span>
                  <span className="text-[11px] font-mono text-electric-400">
                    Interactive Morphology
                  </span>
                </div>

                {/* Preset switcher tabs */}
                <div className="grid grid-cols-4 gap-1.5 mb-4 bg-charcoal-900 p-1 rounded-lg border border-border">
                  {gravityPresets.map((p) => (
                    <button
                      key={p.g}
                      onClick={() => setSelectedGravity(p.g)}
                      className={`py-1.5 text-[11px] font-mono rounded font-medium transition-colors ${
                        selectedGravity === p.g
                          ? "bg-charcoal-700 text-electric-400 border border-electric/40 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {p.g}g
                    </button>
                  ))}
                </div>

                <FlameVisualizer
                  gravity={selectedGravity}
                  flameRadiusMm={selectedGravity === 0 ? 9.2 : selectedGravity < 0.5 ? 7.8 : 5.4}
                  flameHeightMm={selectedGravity >= 0.6 ? 26.5 : undefined}
                  maxTemperatureK={selectedGravity === 0 ? 2086 : selectedGravity < 0.5 ? 2250 : 2226}
                  title="Interactive Flame Envelope"
                />

                <div className="mt-3 p-3 rounded-lg bg-charcoal-900/80 border border-border/60 text-xs text-slate-300">
                  <span className="font-mono font-semibold text-white">
                    {gravityPresets.find((p) => p.g === selectedGravity)?.label}:
                  </span>{" "}
                  {gravityPresets.find((p) => p.g === selectedGravity)?.desc}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Background Grid */}
      <section className="py-16 sm:py-20 bg-[#080B12] border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-electric-400">
              Combustion Physics Fundamentals
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              The Four Pillars of Freefall Combustion
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              When natural convection drops out of the Navier-Stokes transport equations, combustion is dictated
              by diffusion kinetics, soot stagnation, and radiative heat transfer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="flex flex-col rounded-xl border border-border bg-[#090D16] p-6 hover:border-electric/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-electric-950/60 border border-electric/30 flex items-center justify-center text-electric-400 mb-4">
                <Atom className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-base font-bold text-white">Burke-Schumann Diffusion</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                In 0g, reactant transport is purely governed by Fickian mass diffusion. Fuel and oxidizer meet in
                a stoichiometric spherical shell with no buoyancy-induced stretching.
              </p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col rounded-xl border border-border bg-[#090D16] p-6 hover:border-flame/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-flame-950/60 border border-flame/30 flex items-center justify-center text-flame-400 mb-4">
                <Gauge className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-base font-bold text-white">Buoyancy Suppression</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Grashof (<span className="font-mono text-slate-200">Gr</span>) and Richardson (<span className="font-mono text-slate-200">Ri</span>)
                numbers approach zero. This extinguishes convective plume acceleration and 10–15 Hz flicker vortex instabilities.
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col rounded-xl border border-border bg-[#090D16] p-6 hover:border-amber-500/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-base font-bold text-white">Soot Shell Stagnation</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Without buoyant updrafts to carry soot away, carbon nanoparticles aggregate in an outer spherical shell,
                altering thermal radiation and flame emissivity.
              </p>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col rounded-xl border border-border bg-[#090D16] p-6 hover:border-emerald-500/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-base font-bold text-white">Radiative Extinction Limits</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Stagnant combustion products (CO₂ and H₂O) accumulate around the flame front, radiating thermal energy
                and triggering premature radiative quenching at low flow rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & Benchmark Matrix */}
      <section className="py-16 bg-[#0B101D] border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-flame-400">
                Flight Facilities &amp; Drop Towers
              </span>
              <h2 className="text-3xl font-bold text-white">
                Grounded in Real Spaceflight Benchmarks
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                NASA-FLAME integrates flight data and numerical conservation solvers modeled directly after:
              </p>
              <ul className="space-y-3 text-xs text-slate-300 pt-2 font-mono">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-electric-400 mt-1.5" />
                  <span>
                    <strong className="text-white">ISS CIR / ACME:</strong> Advanced Combustion via Microgravity
                    Experiments onboard the International Space Station.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-flame-400 mt-1.5" />
                  <span>
                    <strong className="text-white">Glenn 2.2-Second Drop Tower:</strong> Freefall drop test rigs verifying
                    isolated droplet burning rates and d²-law kinetics.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5" />
                  <span>
                    <strong className="text-white">Artemis Partial-Gravity Program:</strong> Lunar (0.166g) and Martian (0.38g)
                    atmospheric habitat fire safety standards.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-[#090D16] p-6 shadow-xl">
              <h4 className="font-mono text-xs font-bold uppercase text-slate-300 tracking-wider mb-4 pb-2 border-b border-border">
                Gravity Scale Quick Reference
              </h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded bg-charcoal-800 border border-border/50">
                  <span className="text-electric-400 font-bold">0.000 g (Microgravity)</span>
                  <span className="text-slate-300">Pure Diffusion &bull; Spherical</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded bg-charcoal-800 border border-border/50">
                  <span className="text-amber-400 font-bold">0.166 g (Moon)</span>
                  <span className="text-slate-300">Base Widened &bull; ~4 Hz Flicker</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded bg-charcoal-800 border border-border/50">
                  <span className="text-amber-400 font-bold">0.380 g (Mars)</span>
                  <span className="text-slate-300">Transitional &bull; Low Buoyancy</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded bg-charcoal-800 border border-border/50">
                  <span className="text-flame-400 font-bold">1.000 g (Earth)</span>
                  <span className="text-slate-300">Buoyant Plume &bull; ~12 Hz Vortex</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-electric-400 hover:text-electric-300"
                >
                  <span>Open Research Dashboard</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

