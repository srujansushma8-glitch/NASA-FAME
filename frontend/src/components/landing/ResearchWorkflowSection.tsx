"use client";

import React from "react";
import { workflowStages } from "@/content";
import { ArrowRight, Layers, Sliders, Activity, Cpu } from "lucide-react";

export function ResearchWorkflowSection() {
  return (
    <section id="workflow" className="relative py-28 bg-ink border-t border-stone-border/40 overflow-hidden">
      <div className="absolute inset-0 monolith-grid pointer-events-none opacity-40" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-border/50 pb-8">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-cobalt font-bold tracking-widest">
                // 04
              </span>
              <span className="font-mono text-label text-stone tracking-widest uppercase">
                SCIENTIFIC RESEARCH WORKFLOW
              </span>
            </div>

            <h2 className="font-display text-h2 font-bold text-stone-light uppercase tracking-tight">
              Flight Telemetry to Inverse AI Estimation
            </h2>

            <p className="font-sans text-sm text-stone leading-relaxed">
              How microgravity experiments inside the 110-liter ISS Combustion Integrated Rack (CIR)
              are conditioned, ignited in 10⁻⁶g freefall, captured via narrow-band pyrometry, and processed by deep surrogates.
            </p>
          </div>

          <div className="font-mono text-xs text-stone-dim flex items-center gap-2">
            <span className="size-2 rounded-full bg-cobalt" />
            <span>4 STAGES VERIFIED</span>
          </div>
        </div>

        {/* 4 Workflow Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowStages.map((stage) => (
            <div
              key={stage.step}
              className="p-6 rounded-lg bg-ink-surface border border-stone-border/60 hover:border-cobalt/60 transition-all duration-300 flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-cobalt font-bold tracking-widest">STAGE {stage.step}</span>
                  <span className="text-[10px] text-stone-muted px-2 py-0.5 rounded bg-ink border border-stone-border/30">
                    {stage.tag}
                  </span>
                </div>

                <h3 className="font-display text-lg text-stone-light font-semibold group-hover:text-white transition-colors">
                  {stage.title}
                </h3>

                <p className="font-sans text-xs text-stone leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              {/* Technical Parameters */}
              <div className="pt-4 border-t border-stone-border/40 font-mono text-[11px] text-stone-dim space-y-1.5">
                <div className="text-[10px] text-stone-muted uppercase tracking-wider">
                  Test Parameters
                </div>
                {stage.parameters.map((param, i) => (
                  <div key={i} className="text-stone-light/80 flex items-center gap-1.5">
                    <span className="size-1 rounded-full bg-cobalt" />
                    <span>{param}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

