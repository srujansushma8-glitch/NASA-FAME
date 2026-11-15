"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThreeGravityComparison } from "@/components/visualization/ThreeGravityComparison";

export function Interactive3DSection() {
  return (
    <section id="explorer" className="relative py-28 bg-ink/30 border-t border-stone-border/40 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl space-y-3"
        >
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
        </motion.div>

        {/* The 3D Interactive Arena */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <ThreeGravityComparison />
        </motion.div>
      </div>
    </section>
  );
}
