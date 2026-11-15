"use client";

import React from "react";
import { ThreeGravityComparison } from "@/components/visualization/ThreeGravityComparison";

export function Interactive3DSection() {
  return (
    <section id="explorer" className="relative py-28 bg-ink border-t border-stone-border/40 overflow-hidden">
      <div className="absolute inset-0 monolith-grid pointer-events-none opacity-40" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-cobalt font-bold tracking-widest">
              // 03
            </span>
            <span className="font-mono text-label text-stone tracking-widest uppercase">
              INTERACTIVE 3D EXPLORATION
            </span>
          </div>

          <h2 className="font-display text-h2 font-bold text-stone-light uppercase tracking-tight">
            Live 3D Gravitational Deformation Lab
          </h2>

          <p className="font-sans text-sm text-stone leading-relaxed">
            Directly test the mathematical transition from buoyant convection (1g) to isotropic Burke-Schumann
            spherical diffusion (0g). Drag the slider to observe fluidic morphing, temperature gradient redistribution,
            and soot envelope shifts in real time.
          </p>
        </div>

        {/* The 3D Interactive Arena */}
        <ThreeGravityComparison />
      </div>
    </section>
  );
}

