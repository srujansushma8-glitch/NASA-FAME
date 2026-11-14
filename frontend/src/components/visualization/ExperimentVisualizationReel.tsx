"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Sparkles, Orbit, Layers, Flame } from "lucide-react";

interface ReelItem {
  id: string;
  tag: string;
  facility: string;
  title: string;
  gravity: string;
  description: string;
  temp: string;
  accent: "electric" | "flame" | "amber" | "emerald";
  visualType: "sphere" | "plume" | "soot" | "plif" | "contours";
}

export function ExperimentVisualizationReel() {
  const [activeIndex, setActiveIndex] = useState<number>(1);

  const items: ReelItem[] = [
    {
      id: "plif-oh",
      tag: "RADICAL FLUORESCENCE",
      facility: "ISS CIR / ACME",
      title: "Planar Laser-Induced Fluorescence (OH*)",
      gravity: "0.000g Microgravity",
      description:
        "Ultraviolet laser sheet excitation revealing the thin stoichiometric reaction zone with isotropic spherical curvature.",
      temp: "2,144 K Peak",
      accent: "electric",
      visualType: "plif",
    },
    {
      id: "burke-sphere",
      tag: "DIFFUSION CORE",
      facility: "ISS CIR / ACME",
      title: "Burke-Schumann Spherical Envelope",
      gravity: "0.000g Microgravity",
      description:
        "Pure molecular diffusion equilibrium. Reactants converge at a spherical boundary with zero upward convective acceleration.",
      temp: "2,086 K Steady",
      accent: "flame",
      visualType: "sphere",
    },
    {
      id: "euler-grid",
      tag: "EULERIAN SOLVER",
      facility: "Glenn GRC / Member 4",
      title: "2D Blackbody Temperature Contour Grid",
      gravity: "0.000g & 1.000g",
      description:
        "High-resolution Navier-Stokes energy conservation matrix displaying radial temperature gradients and conduction zones.",
      temp: "2,250 K Max",
      accent: "emerald",
      visualType: "contours",
    },
    {
      id: "soot-shell",
      tag: "NANOPARTICLE STAGNATION",
      facility: "Glenn 2.2s Drop Tower",
      title: "Concentric Soot Shell Aggregation",
      gravity: "0.000g Microgravity",
      description:
        "Without buoyant evacuation drafts, carbon soot aggregates in an outer radiant shell, dominating radiative emission.",
      temp: "1,850 K Shell",
      accent: "amber",
      visualType: "soot",
    },
    {
      id: "buoyant-plume",
      tag: "TERRESTRIAL CONVECTION",
      facility: "Ground Reference Cell",
      title: "1g Buoyant Plume & Toroidal Vortex",
      gravity: "1.000g Earth Gravity",
      description:
        "Buoyant air acceleration draws a narrow vertical plume with periodic shear instabilities triggering 12.4 Hz flicker.",
      temp: "2,226 K Plume",
      accent: "flame",
      visualType: "plume",
    },
  ];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="relative py-20 sm:py-28 border-b border-border bg-[#030508] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-electric/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
              <Eye className="h-3.5 w-3.5" />
              <span>EXPERIMENT VISUALIZATION REEL // SELENE INTERACTION</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Visualizing the Invisible Flame
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Explore optical and numerical diagnostic captures from NASA microgravity campaigns.
              Click or scrub through the reel to inspect stoichiometric boundaries, soot shells, and thermal contours.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Frame"
              className="p-3 rounded-xl glass-panel hover:bg-charcoal-700 text-slate-300 hover:text-white border border-border transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Frame"
              className="p-3 rounded-xl glass-panel hover:bg-charcoal-700 text-slate-300 hover:text-white border border-border transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* The Reel: Focused Center Frame with Surrounding Frames Dimmed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {items.map((item, idx) => {
            const isCenter = idx === activeIndex;
            const distance = Math.abs(idx - activeIndex);

            // Responsive: only show active and adjacent items on smaller screens
            return (
              <div
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`cursor-pointer rounded-2xl p-6 sm:p-7 border transition-all duration-500 relative overflow-hidden ${
                  isCenter
                    ? "lg:col-span-6 glass-panel-glow border-electric scale-[1.02] shadow-2xl shadow-electric/20 z-20 opacity-100"
                    : distance === 1
                    ? "lg:col-span-3 glass-panel border-border/80 opacity-40 hover:opacity-80 scale-95 z-10 hidden sm:block"
                    : "hidden"
                }`}
              >
                {/* Top Telemetry Strip */}
                <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-4 font-mono text-[11px]">
                  <span className="text-electric-400 font-bold uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <span className="text-slate-400">{item.facility}</span>
                </div>

                {/* Flame Visual Representation Box */}
                <div className="relative h-48 sm:h-56 w-full rounded-xl bg-[#04060B] border border-border/60 flex items-center justify-center overflow-hidden mb-5">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #1E293B 1px, transparent 1px), linear-gradient(to bottom, #1E293B 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />

                  {/* Visual Renderings for each type */}
                  {item.visualType === "sphere" && (
                    <div className="relative flex items-center justify-center">
                      <div className="h-32 w-32 rounded-full bg-gradient-to-r from-electric/40 via-flame/70 to-amber-300 rounded-full blur-md animate-pulse" />
                      <div className="absolute h-24 w-24 rounded-full bg-gradient-to-r from-amber-200 via-flame to-electric-500 border border-amber-300/60 shadow-lg shadow-flame/40" />
                      <div className="absolute h-8 w-8 rounded-full bg-white/90 blur-xs" />
                      <div className="absolute h-36 w-36 rounded-full border border-electric/40 border-dashed" />
                    </div>
                  )}

                  {item.visualType === "plume" && (
                    <div className="relative flex flex-col items-center justify-end h-40">
                      <div className="w-16 h-36 bg-gradient-to-t from-electric via-flame to-transparent rounded-t-full blur-sm" />
                      <div className="absolute bottom-2 w-8 h-20 bg-gradient-to-t from-white via-amber-200 to-transparent rounded-t-full" />
                      <div className="w-12 h-3 bg-slate-700 rounded-t border-t border-slate-500" />
                    </div>
                  )}

                  {item.visualType === "plif" && (
                    <div className="relative flex items-center justify-center">
                      <div className="h-32 w-32 rounded-full border-2 border-electric-400 bg-electric-950/40 shadow-xl shadow-electric/50" />
                      <div className="absolute h-20 w-20 rounded-full border border-cyan-300/80 bg-cyan-950/60" />
                      <div className="absolute h-1 w-44 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                    </div>
                  )}

                  {item.visualType === "soot" && (
                    <div className="relative flex items-center justify-center">
                      <div className="h-36 w-36 rounded-full border-2 border-amber-500/80 bg-amber-950/20 border-dashed animate-spin duration-1000" />
                      <div className="absolute h-24 w-24 rounded-full bg-gradient-to-r from-flame/60 to-amber-600/40 blur-sm" />
                      <div className="absolute h-10 w-10 rounded-full bg-white/80" />
                    </div>
                  )}

                  {item.visualType === "contours" && (
                    <div className="relative flex items-center justify-center w-full h-full p-4">
                      <div className="grid grid-cols-4 gap-1 w-36 h-36">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-sm ${
                              i === 5 || i === 6 || i === 9 || i === 10
                                ? "bg-white"
                                : i % 2 === 0
                                ? "bg-flame-500"
                                : "bg-electric-600"
                            } opacity-80`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Corner Target Markers */}
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">[0,0,0]</div>
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-electric-400 font-bold">
                    {item.temp}
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <div className="font-mono text-xs text-slate-400">{item.gravity}</div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-8 bg-electric" : "w-2 bg-charcoal-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

