"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Activity,
  ArrowRight,
  Sparkles,
  Flame,
  Atom,
  Layers,
  Shield,
  Gauge,
  Sliders,
  Database,
  ExternalLink,
  ChevronDown,
  Terminal,
} from "lucide-react";

import { CinematicHeroFlame } from "@/components/visualization/CinematicHeroFlame";
import { GravityComparisonArena } from "@/components/visualization/GravityComparisonArena";
import { ExperimentJourneySection } from "@/components/visualization/ExperimentJourneySection";
import { CombustionVisualizerPreview } from "@/components/visualization/CombustionVisualizerPreview";
import { AIAnalysisPreviewSection } from "@/components/visualization/AIAnalysisPreviewSection";
import { FlightDataFeedSection } from "@/components/visualization/FlightDataFeedSection";

export default function LandingPage() {
  const [heroGravity, setHeroGravity] = useState<number>(0.0);

  return (
    <div className="flex flex-col w-full bg-[#05070D] text-slate-100 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-center border-b border-border overflow-hidden pt-12 pb-20">
        {/* Subtle Starfield & Particle Dust Layer */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#38BDF8 0.75px, transparent 0.75px), radial-gradient(#FF7029 0.75px, transparent 0.75px)",
            backgroundSize: "36px 36px",
            backgroundPosition: "0 0, 18px 18px",
          }}
        />

        {/* Ambient Cosmic Radial Glows */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-electric/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] bg-flame/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Mission Branding & Narrative */}
            <div className="lg:col-span-6 space-y-6">
              {/* Mission Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric-950/50 px-4 py-1.5 text-xs font-mono text-electric-300 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-electric-400 animate-ping" />
                <span className="tracking-wider">NASA CIR / ACME &bull; FLAME IN FREEFALL</span>
              </div>

              {/* Main Typography Header */}
              <div className="space-y-2">
                <div className="font-mono text-xs sm:text-sm font-bold tracking-[0.3em] text-slate-400 uppercase">
                  MICROGRAVITY COMBUSTION SCIENCE
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.05]">
                  FIRE IN{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 via-flame-400 to-amber-300">
                    FREEFALL
                  </span>
                </h1>
              </div>

              {/* Mission Narrative Prose */}
              <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-xl">
                When combustion escapes the pull of Earth, natural convection dies (<span className="font-mono text-white font-semibold">Gr &rarr; 0</span>).
                Without buoyant updrafts, fire becomes a quiescent, perfect luminous sphere governed purely by
                molecular diffusion and radiative heat loss.
              </p>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/workspace"
                  className="flex items-center gap-2 rounded-xl bg-electric hover:bg-electric-600 px-6 py-3.5 text-sm font-mono font-semibold text-white shadow-xl shadow-electric/30 transition-all hover:scale-[1.02]"
                >
                  <Compass className="h-4 w-4" />
                  <span>LAUNCH WORKSPACE</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl glass-panel hover:bg-charcoal-700/80 px-5 py-3.5 text-sm font-mono font-semibold text-slate-200 transition-all border border-border hover:border-slate-500"
                >
                  <Activity className="h-4 w-4 text-electric-400" />
                  <span>MISSION DASHBOARD</span>
                </Link>

                <Link
                  href="/assistant"
                  className="flex items-center gap-2 rounded-xl glass-panel hover:bg-charcoal-700/80 px-4 py-3.5 text-sm font-mono font-semibold text-slate-300 transition-all border border-border hover:border-flame/40"
                >
                  <Sparkles className="h-4 w-4 text-flame-400" />
                  <span>AI DIAGNOSTICS</span>
                </Link>
              </div>

              {/* Research Telemetry Numbers Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/80 max-w-lg">
                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                    0.000 <span className="text-sm font-normal text-slate-400">g</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                    ISS Freefall
                  </div>
                </div>

                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-flame-400">
                    ~12.4 <span className="text-sm font-normal text-slate-400">Hz</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                    1g Vortex Flicker
                  </div>
                </div>

                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-electric-400">
                    &infin;
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                    0g Froude Number
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Cinematic Hero Flame */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <CinematicHeroFlame
                initialGravity={heroGravity}
                onGravityChange={(g) => setHeroGravity(g)}
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator Prompt */}
        <div className="hidden md:flex flex-col items-center justify-center absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-500 font-mono text-[10px] tracking-widest uppercase">
          <span>EXPLORE MISSION SCIENCE</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-electric-400 mt-1" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. REAL-TIME TELEMETRY TICKER TAPE                                        */}
      {/* ========================================================================= */}
      <div className="bg-[#030509] border-b border-border/80 py-2.5 px-4 overflow-x-auto whitespace-nowrap">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-8 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">STATUS: FLIGHT NOMINAL</span>
          </div>
          <div>ORBIT: ISS 408 KM ALTITUDE</div>
          <div>PRESSURE: 1.013 BAR</div>
          <div>CHAMBER: CIR-110L</div>
          <div>BUOYANCY: SUPPRESSED (Gr = 0)</div>
          <div>EXTINCTION LOI: 13.2% O₂</div>
          <div>TRANSPORT: BURKE-SCHUMANN DIFFUSION</div>
          <div className="text-electric-400">BACKEND API: LIVE (PORT 8000)</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SCIENTIFIC EXPERIMENT JOURNEY SECTION                                  */}
      {/* ========================================================================= */}
      <ExperimentJourneySection />

      {/* ========================================================================= */}
      {/* 4. GRAVITY COMPARISON ARENA (0g vs 1g)                                    */}
      {/* ========================================================================= */}
      <GravityComparisonArena />

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE COMBUSTION VISUALIZATION PREVIEW                           */}
      {/* ========================================================================= */}
      <CombustionVisualizerPreview />

      {/* ========================================================================= */}
      {/* 6. AI-POWERED FLAME ANALYSIS PREVIEW                                      */}
      {/* ========================================================================= */}
      <AIAnalysisPreviewSection />

      {/* ========================================================================= */}
      {/* 7. REAL FLIGHT DATA & NASA RESEARCH BENCHMARKS                            */}
      {/* ========================================================================= */}
      <FlightDataFeedSection />

      {/* ========================================================================= */}
      {/* 8. SCIENTIFIC PRINCIPLES PILLARS GRID                                     */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#06080E] border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
              <Atom className="h-3.5 w-3.5" />
              <span>THEORETICAL FOUNDATIONS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              The Physics of Zero-G Combustion
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              When buoyant convection drops out of the transport equations, combustion is ruled
              by isotropic diffusion, soot shell radiation, and discrete quenching boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl glass-panel space-y-3 hover:border-electric/50 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-electric-950 border border-electric/40 flex items-center justify-center text-electric-400 group-hover:scale-110 transition-transform">
                <Atom className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">Burke-Schumann Diffusion</h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Fuel and oxidizer meet in a stoichiometric spherical boundary layer. Transport is governed purely by Fickian diffusion with zero convective elongation.
              </p>
              <div className="font-mono text-[10px] text-electric-400 pt-2 border-t border-border">
                d²-LAW COMBUSTION KINETICS
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl glass-panel space-y-3 hover:border-flame/50 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-flame-950 border border-flame/40 flex items-center justify-center text-flame-400 group-hover:scale-110 transition-transform">
                <Gauge className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">Buoyancy Suppression</h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Grashof (<span className="font-mono text-white">Gr</span>) and Richardson (<span className="font-mono text-white">Ri</span>) numbers
                collapse to zero. This extinguishes buoyant upward acceleration and 10–15 Hz flicker vortex instabilities.
              </p>
              <div className="font-mono text-[10px] text-flame-400 pt-2 border-t border-border">
                Gr → 0 &bull; FLICKER SHUTDOWN
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl glass-panel space-y-3 hover:border-amber-400/50 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-amber-950 border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">Soot Shell Stagnation</h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Without buoyant updrafts to clear carbon nanoparticles, soot accumulates in a concentric spherical shell,
                altering thermal radiation emissivity and reaction temperature.
              </p>
              <div className="font-mono text-[10px] text-amber-400 pt-2 border-t border-border">
                CONCENTRIC NANOPARTICLE SHELL
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl glass-panel space-y-3 hover:border-emerald-400/50 transition-all group">
              <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">Radiative Quenching</h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Stagnant combustion products (CO₂ and H₂O) radiate heat outward. At low flow velocities, radiative heat loss
                exceeds chemical heat release, triggering radiative extinction.
              </p>
              <div className="font-mono text-[10px] text-emerald-400 pt-2 border-t border-border">
                LIMITING OXYGEN INDEX (LOI)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CINEMATIC FINAL CTA: LAUNCH YOUR EXPERIMENT                             */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-[#04060A]">
        {/* Glowing space horizon light flare */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[350px] bg-gradient-to-r from-electric/20 via-flame/15 to-electric/20 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric-950/60 px-4 py-1.5 text-xs font-mono text-electric-400 backdrop-blur-md">
            <Terminal className="h-3.5 w-3.5" />
            <span>MISSION EXECUTION CONSOLE // READY FOR INITIALIZATION</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
            Launch Your Microgravity Experiment
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed">
            Configure fuel chemistry, dial in gravitational acceleration vectors, and run full-scale numerical
            simulations and neural diagnostics in real-time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/workspace"
              className="flex items-center gap-2.5 rounded-xl bg-electric hover:bg-electric-600 px-8 py-4 text-base font-mono font-bold text-white shadow-2xl shadow-electric/40 transition-all hover:scale-105"
            >
              <Compass className="h-5 w-5" />
              <span>LAUNCH WORKSPACE</span>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/simulations"
              className="flex items-center gap-2.5 rounded-xl glass-panel hover:bg-charcoal-700/80 px-7 py-4 text-base font-mono font-bold text-slate-200 transition-all border border-border hover:border-slate-400"
            >
              <Activity className="h-5 w-5 text-electric-400" />
              <span>VIEW SIMULATIONS</span>
            </Link>

            <Link
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl glass-panel hover:bg-charcoal-700/80 px-6 py-4 text-base font-mono font-bold text-slate-300 transition-all border border-border hover:border-flame/40"
            >
              <ExternalLink className="h-5 w-5 text-flame-400" />
              <span>SWAGGER API DOCS</span>
            </Link>
          </div>

          <div className="pt-8 border-t border-border/60 max-w-lg mx-auto font-mono text-xs text-slate-500">
            NASA-FLAME &bull; FLAME IN FREEFALL &bull; ALL SUBSYSTEMS NOMINAL
          </div>
        </div>
      </section>
    </div>
  );
}
