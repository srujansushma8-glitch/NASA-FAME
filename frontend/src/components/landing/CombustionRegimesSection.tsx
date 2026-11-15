"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gravityComparison } from "@/content";
import { Flame, Compass, Activity, ArrowRight, ShieldCheck, Thermometer } from "lucide-react";

export function CombustionRegimesSection() {
  const [selectedRegime, setSelectedRegime] = useState<string>("orbit");

  const activeEnv = gravityComparison.environments.find((e) => e.id === selectedRegime) || gravityComparison.environments[3];

  return (
    <section id="regimes" className="relative py-28 bg-ink/30 border-t border-stone-border/40 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-16">
        {/* Header */}
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
                // {gravityComparison.sectionNumber}
              </span>
              <span className="font-mono text-label text-stone tracking-widest uppercase">
                {gravityComparison.eyebrow}
              </span>
            </div>

            <h2 className="font-display text-h2 font-bold text-stone-light uppercase tracking-tight">
              {gravityComparison.title}
            </h2>

            <p className="font-sans text-sm text-stone leading-relaxed">
              {gravityComparison.subtitle}
            </p>
          </div>

          <div className="font-mono text-xs text-stone-dim flex items-center gap-2">
            <span className="size-2 rounded-full bg-cobalt animate-pulse shadow-[0_0_10px_#2B4BFF]" />
            <span>4 PLANETARY REGIMES PROFILED</span>
          </div>
        </motion.div>

        {/* 4 Environment Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {gravityComparison.environments.map((env) => {
            const isSelected = env.id === selectedRegime;
            return (
              <button
                key={env.id}
                onClick={() => setSelectedRegime(env.id)}
                className={`p-5 rounded-lg border text-left transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-cobalt/15 border-cobalt shadow-[0_0_20px_rgba(43,75,255,0.25)] scale-[1.01]"
                    : "bg-ink-surface/80 border-stone-border/60 hover:border-stone/40 hover:bg-ink-elevated/70"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-3">
                  <span className={isSelected ? "text-cobalt font-bold" : "text-stone-dim"}>
                    {env.gravity}
                  </span>
                  <span className="text-[10px] text-stone-muted">
                    {env.id === "orbit" ? "ZERO-G" : "PARTIAL-G"}
                  </span>
                </div>

                <div>
                  <div className={`font-display text-base font-semibold ${isSelected ? "text-white" : "text-stone-light"}`}>
                    {env.name}
                  </div>
                  <div className="font-mono text-xs text-stone-dim mt-1">
                    {env.geometry}
                  </div>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Selected Regime Deep Scientific Analysis Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEnv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="p-8 sm:p-10 rounded-xl bg-ink-surface/90 border border-stone-border/70 hover:border-cobalt/40 transition-colors space-y-8 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-border/50 pb-6">
              <div>
                <div className="font-mono text-xs text-cobalt font-semibold tracking-wider uppercase">
                  ACTIVE BENCHMARK // {activeEnv.gravity} ACCELERATION
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-stone-light font-bold mt-1">
                  {activeEnv.name} Combustion Characteristics
                </h3>
              </div>

              <div className="px-4 py-2 rounded bg-ink/80 border border-stone-border font-mono text-xs text-stone-light flex items-center gap-2">
                <span className="size-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: activeEnv.colorTag, color: activeEnv.colorTag }} />
                <span>Flame Geometry: {activeEnv.geometry}</span>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded bg-ink/70 border border-stone-border/50 space-y-1">
                <div className="font-mono text-[10px] text-stone-muted uppercase tracking-wider">
                  FLAME TEMPERATURE
                </div>
                <div className="font-mono text-lg text-stone-light font-bold">
                  {activeEnv.temperature}
                </div>
              </div>

              <div className="p-4 rounded bg-ink/70 border border-stone-border/50 space-y-1">
                <div className="font-mono text-[10px] text-stone-muted uppercase tracking-wider">
                  FUEL BURN RATE
                </div>
                <div className="font-mono text-lg text-stone-light font-bold">
                  {activeEnv.burnRate}
                </div>
              </div>

              <div className="p-4 rounded bg-ink/70 border border-stone-border/50 space-y-1">
                <div className="font-mono text-[10px] text-stone-muted uppercase tracking-wider">
                  BUOYANT FLICKER
                </div>
                <div className="font-mono text-lg text-stone-light font-bold">
                  {activeEnv.flickerFreq}
                </div>
              </div>

              <div className="p-4 rounded bg-ink/70 border border-stone-border/50 space-y-1">
                <div className="font-mono text-[10px] text-stone-muted uppercase tracking-wider">
                  GRAVITY REGIME
                </div>
                <div className="font-mono text-lg text-cobalt font-bold">
                  {activeEnv.gravity}
                </div>
              </div>
            </div>

            {/* In-depth physics details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-lg bg-ink/50 border border-stone-border/40 space-y-2">
                <div className="font-mono text-xs text-cobalt uppercase tracking-wider font-semibold">
                  SOOT FORMATION &amp; MORPHOLOGY
                </div>
                <p className="font-sans text-xs text-stone-dim leading-relaxed">
                  {activeEnv.sootFormation}
                </p>
              </div>

              <div className="p-5 rounded-lg bg-ink/50 border border-stone-border/40 space-y-2">
                <div className="font-mono text-xs text-flame uppercase tracking-wider font-semibold">
                  EXTINCTION &amp; QUENCHING LIMIT
                </div>
                <p className="font-sans text-xs text-stone-dim leading-relaxed">
                  {activeEnv.extinctionMechanism}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
