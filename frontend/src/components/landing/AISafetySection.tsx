"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
    <section id="ai-safety" className="relative py-28 bg-ink/30 border-t border-stone-border/40 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-border/50 pb-8"
        >
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
            className="px-5 py-2.5 rounded bg-cobalt hover:bg-cobalt-hover text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center gap-2 self-start md:self-auto shrink-0 shadow-[0_0_20px_rgba(43,75,255,0.35)] hover:shadow-[0_0_35px_rgba(43,75,255,0.6)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Cpu className="size-4" />
            <span>Launch Full Analyzer</span>
          </Link>
        </motion.div>

        {/* 4 Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiSafetyCapabilities.map((cap, idx) => (
            <motion.div
              key={cap.code}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.75,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-lg bg-ink-surface/90 border border-stone-border/60 hover:border-cobalt/60 hover:shadow-[0_0_25px_rgba(43,75,255,0.18)] transition-all flex flex-col justify-between space-y-4"
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
            </motion.div>
          ))}
        </div>

        {/* Interactive Query Sandbox Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 sm:p-8 rounded-xl bg-ink-surface/95 border border-stone-border/70 hover:border-cobalt/40 transition-colors space-y-6 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-border/50 pb-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-stone-light font-semibold">
              <span className="size-2 rounded-full bg-cobalt animate-ping shadow-[0_0_8px_#2B4BFF]" />
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
                  className={`px-3 py-1.5 rounded text-left font-mono text-xs transition-all ${
                    activeQuery === q
                      ? "bg-cobalt/20 border border-cobalt text-white shadow-[0_0_15px_rgba(43,75,255,0.25)]"
                      : "bg-ink/80 border border-stone-border/50 text-stone-dim hover:text-stone-light hover:border-stone-border"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Output Display */}
          <div className="p-4 rounded-lg bg-ink/90 border border-stone-border/50 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-stone-muted text-[10px]">
              <span>ACTIVE INFERENCE RESULT</span>
              <span className="text-cobalt">CONFIDENCE: 98.7%</span>
            </div>
            <div className="text-stone-light leading-relaxed">
              {activeQuery.includes("spherical") ? (
                <>
                  <span className="text-cobalt font-semibold">[0G SPHERICAL DIFFUSION]: </span>
                  Buoyant acceleration term (g · β · ΔT) vanishes. Radial molecular diffusion dominates across all coordinate axes. 
                  Flame envelope expands into a calm, symmetric sphere with zero flicker instability (Grashof Gr &lt; 0.01).
                </>
              ) : activeQuery.includes("Grashof") ? (
                <>
                  <span className="text-cobalt font-semibold">[GRASHOF NUMBER SCALING]: </span>
                  Gr = g · β · ΔT · L³ / ν². On Earth, Gr &gt; 10⁴ drives turbulent vortex shedding generating the classic 10–15 Hz flicker. 
                  In orbit, Gr drops by 4+ orders of magnitude, eliminating all buoyant hydrodynamic instabilities.
                </>
              ) : activeQuery.includes("radiative extinction") ? (
                <>
                  <span className="text-flame font-semibold">[RADIATIVE QUENCHING LIMIT]: </span>
                  In the absence of buoyant convective sweeping, accumulated CO₂ and H₂O product shells emit high infrared radiation, 
                  cooling the reaction below chemical kinetic autoignition limits.
                </>
              ) : (
                <>
                  <span className="text-flame font-semibold">[SMOLDERING REIGNITION HAZARD]: </span>
                  Hidden deep-seated smoldering inside ventilation ducts maintains elevated temperatures without flame. 
                  Sudden air current re-introduction spikes Damköhler number (Da), initiating rapid transition to open combustion.
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
