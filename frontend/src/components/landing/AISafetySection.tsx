"use client";

import React, { useState } from "react";
import Link from "next/link";
import { aiSafetyCapabilities } from "@/content";
import { Cpu, Sparkles, ArrowRight, ShieldCheck, Flame, Radio } from "lucide-react";

export function AISafetySection() {
  const [activeQuery, setActiveQuery] = useState<string>(
    "Why do flames become perfectly spherical in microgravity instead of teardrop-shaped?"
  );

  const sampleQueries = [
    "Why do flames become perfectly spherical in microgravity instead of teardrop-shaped?",
    "How does the Grashof number (Gr) explain the absence of flame flickering in freefall?",
    "Why are microgravity flames vulnerable to radiative extinction at low fuel flow rates?",
    "How does forced ventilation in spacecraft habitats trigger catastrophic smolder transitions?",
  ];

  return (
    <section id="ai-safety" className="relative py-28 bg-ink border-t border-stone-border/40 overflow-hidden">
      <div className="absolute inset-0 monolith-grid pointer-events-none opacity-40" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-border/50 pb-8">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-cobalt font-bold tracking-widest">
                // 05
              </span>
              <span className="font-mono text-label text-stone tracking-widest uppercase">
                AI FIRE SAFETY ANALYSIS
              </span>
            </div>

            <h2 className="font-display text-h2 font-bold text-stone-light uppercase tracking-tight">
              Physics-Informed Spaceflight Safety
            </h2>

            <p className="font-sans text-sm text-stone leading-relaxed">
              Trained on multi-decade microgravity combustion datasets from NASA drop towers, parabolic flights,
              and ISS CIR/ACME campaigns to forecast radiative quenching, cool flames, and smolder transitions.
            </p>
          </div>

          <Link
            href="/assistant"
            className="px-5 py-2.5 rounded bg-cobalt hover:bg-cobalt-hover text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all flex items-center gap-2 self-start md:self-auto shrink-0 shadow-[0_0_20px_rgba(43,75,255,0.3)]"
          >
            <Cpu className="size-4" />
            <span>Launch Full Analyzer</span>
          </Link>
        </div>

        {/* 4 Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiSafetyCapabilities.map((cap) => (
            <div
              key={cap.code}
              className="p-6 rounded-lg bg-ink-surface border border-stone-border/60 hover:border-cobalt/60 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="font-mono text-xs text-cobalt font-bold tracking-widest">
                  {cap.code}
                </div>
                <h3 className="font-display text-base text-stone-light font-semibold">
                  {cap.title}
                </h3>
                <p className="font-sans text-xs text-stone leading-relaxed">
                  {cap.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-border/40 font-mono text-[11px] text-stone-muted flex items-center justify-between">
                <span>RATING</span>
                <span className="text-stone-light font-medium">{cap.metric}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Query Sandbox Terminal */}
        <div className="p-6 sm:p-8 rounded-xl bg-ink-surface border border-stone-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-border/50 pb-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-stone-light font-semibold">
              <span className="size-2 rounded-full bg-cobalt animate-ping" />
              <span>LIVE AI REASONING PREVIEW // PINN SURROGATE</span>
            </div>
            <span className="text-stone-muted">MODEL: CIR-PINN-v2.4 (OFFLINE TRAINED)</span>
          </div>

          {/* Quick Preset Selector */}
          <div className="space-y-2">
            <div className="font-mono text-[11px] text-stone-muted uppercase tracking-wider">
              Select Combustion Query
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuery(q)}
                  className={`px-3 py-1.5 rounded text-left font-mono text-xs border transition-all ${
                    activeQuery === q
                      ? "bg-cobalt/20 text-white border-cobalt ring-1 ring-cobalt/40"
                      : "bg-ink text-stone-dim border-stone-border/60 hover:text-stone hover:border-stone/40"
                  }`}
                >
                  Query 0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Box */}
          <div className="p-5 rounded-lg bg-ink border border-stone-border/70 font-mono text-xs space-y-4">
            <div className="flex items-center gap-2 text-stone-light">
              <span className="text-cobalt font-bold">query &gt;</span>
              <span>{activeQuery}</span>
            </div>

            <div className="p-4 rounded bg-ink-surface/80 border border-stone-border/40 space-y-3">
              <div className="flex items-center gap-2 text-cobalt text-[11px] font-semibold">
                <Sparkles className="size-3.5" />
                <span>AI SCIENTIFIC OBSERVATION & SAFETY SYNTHESIS</span>
              </div>
              <p className="font-sans text-sm text-stone leading-relaxed">
                {activeQuery.includes("spherical") ? (
                  "In microgravity (g ≈ 0), buoyant upward convection vanishes completely because the Grashof number Gr drops below 0.01. Thermal expansion of heated gases produces no Archimedean lift. Consequently, fresh oxidizer is supplied purely via isotropic Fickian mass diffusion (Burke-Schumann regime), forming a quiescent, spherical blue flame shell."
                ) : activeQuery.includes("Grashof") ? (
                  "The Grashof number Gr = g·β·ΔT·L³/ν² quantifies the ratio of buoyant forces to viscous forces. At 1g, Gr ≈ 10⁴ causes unstable buoyant plume necking and vortex shedding at ~12–15 Hz. In 0g freefall, Gr drops to 10⁻⁴, terminating vortex shedding and yielding zero flickering frequency."
                ) : activeQuery.includes("radiative") ? (
                  "In 0g, combustion rates are low due to diffusion resistance. At reduced fuel supply, volumetric radiative heat loss from CO₂ and H₂O molecules exceeds chemical heat release. The peak flame temperature falls below the kinetic extinction threshold (~1450 K), causing sudden radiative extinction or transition into non-luminous cool flames."
                ) : (
                  "In spacecraft cabins, smoldering materials can persist undetected in low oxygen environments. When cabin ventilation systems or air fans activate, the sudden forced convective flux supplies fresh oxidizer while dispersing localized heat, causing smoldering embers to explosively transition into open flaming."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

