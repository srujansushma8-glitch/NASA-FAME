"use client";

import React from "react";
import { scienceProblem } from "@/content";
import { AlertTriangle, Compass, ShieldAlert, ArrowUpRight } from "lucide-react";

export function ScienceProblemSection() {
  return (
    <section id="science" className="relative py-28 bg-ink border-t border-stone-border/40 overflow-hidden">
      {/* Editorial background grid & markings */}
      <div className="absolute inset-0 monolith-grid pointer-events-none opacity-60" />
      <div className="absolute right-12 top-10 font-mono text-label text-stone-muted/40 uppercase hidden lg:block">
        REF: ARCHIMEDES-COLLAPSE // SECT-01
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-cobalt font-bold tracking-widest">
              // {scienceProblem.sectionNumber}
            </span>
            <span className="font-mono text-label text-stone tracking-widest uppercase">
              {scienceProblem.eyebrow}
            </span>
          </div>

          <h2 className="font-display text-h2 font-bold text-stone-light uppercase tracking-tight">
            {scienceProblem.title}
          </h2>

          <p className="font-sans text-lead text-stone leading-relaxed">
            {scienceProblem.lead}
          </p>
        </div>

        {/* 3 Technical Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {scienceProblem.cards.map((card, idx) => (
            <div
              key={card.code}
              className="relative p-7 rounded-lg bg-ink-surface border border-stone-border/60 hover:border-cobalt/60 transition-all duration-300 flex flex-col justify-between group space-y-6"
            >
              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-cobalt font-bold tracking-widest">{card.code}</span>
                  <span className="text-stone-muted tracking-wider text-[11px] px-2 py-0.5 rounded bg-ink border border-stone-border/30">
                    {card.environment}
                  </span>
                </div>

                <h3 className="font-display text-xl text-stone-light font-semibold group-hover:text-white transition-colors">
                  {card.title}
                </h3>

                <p className="font-sans text-sm text-stone leading-relaxed">
                  {card.physics}
                </p>
              </div>

              {/* Bottom Effect Box */}
              <div className="pt-4 border-t border-stone-border/40 font-mono text-xs text-stone-dim space-y-1">
                <div className="text-[10px] text-stone-muted uppercase tracking-wider">
                  Combustion Consequence
                </div>
                <div className="text-stone-light/90">
                  {card.effect}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Physics Comparison Callout Bar */}
        <div className="mt-12 p-6 rounded-lg bg-ink-elevated border border-stone-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="font-mono text-xs text-cobalt uppercase tracking-wider font-semibold">
              CRITICAL FORMULATION: THE BURKE-SCHUMANN DIFFUSION REGIME
            </div>
            <p className="font-sans text-xs text-stone-dim max-w-2xl">
              In the absence of buoyant convective flux, the continuity equation reduces to steady radial spherical diffusion: 
              <span className="font-mono text-stone-light font-medium ml-1">
                ∇²Y_i = 0  ⇒  Y_F(r) = 1 - r_s / r
              </span>
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 font-mono text-xs text-stone-dim">
            <span className="size-2 rounded-full bg-cobalt" />
            <span>FICKIAN DIFFUSION ONLY</span>
          </div>
        </div>
      </div>
    </section>
  );
}

