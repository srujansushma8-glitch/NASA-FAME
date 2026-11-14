"use client";

import React from "react";
import Link from "next/link";
import {
  Eye,
  Activity,
  Brain,
  Layers,
  Sliders,
  Database,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";

interface Capability {
  id: string;
  tag: string;
  title: string;
  icon: React.ElementType;
  description: string;
  specs: string[];
  link: string;
  linkText: string;
  accent: "electric" | "flame" | "amber" | "emerald";
}

export function ResearchCapabilitiesSection() {
  const capabilities: Capability[] = [
    {
      id: "flame-vis",
      tag: "CAPABILITY 01",
      title: "Volumetric Flame Morphology",
      icon: Eye,
      description:
        "High-fidelity rendering of 3D and 2D stoichiometric flame boundaries, radial isotherms, and outer soot stagnation shells in true zero-gravity.",
      specs: ["Burke-Schumann Solution", "Radially Symmetric Sphere", "Interactive Isotherm Probe"],
      link: "/simulations",
      linkText: "Explore Visualizer",
      accent: "electric",
    },
    {
      id: "sim-engine",
      tag: "CAPABILITY 02",
      title: "Microgravity Simulation Engine",
      icon: Activity,
      description:
        "Physics-grounded numerical solvers integrating energy and species conservation equations with variable gravitational body-force vectors.",
      specs: ["Eulerian CFD Grid", "0g to 1g Body Vectors", "Transient Time-Series Data"],
      link: "/workspace",
      linkText: "Configure Simulation",
      accent: "flame",
    },
    {
      id: "ai-diagnostics",
      tag: "CAPABILITY 03",
      title: "Neural Combustion Diagnostics",
      icon: Brain,
      description:
        "AI-driven regime classification computing Grashof (Gr), Richardson (Ri), Froude (Fr), and Rayleigh (Ra) scaling numbers with extinction alerts.",
      specs: ["98%+ Regime Accuracy", "Extinction LOI Forecasting", "Spaceflight Safety Advisory"],
      link: "/assistant",
      linkText: "Open AI Analyzer",
      accent: "electric",
    },
    {
      id: "temp-distribution",
      tag: "CAPABILITY 04",
      title: "2D Blackbody Heatmap Probing",
      icon: Layers,
      description:
        "Interactive Eulerian temperature contour matrix with blackbody colormaps, thermal gradient analysis, and cursor coordinate inspection.",
      specs: ["Interactive HTML5 Canvas", "Kelvin Coordinate Probe", "Blackbody & Inferno Palettes"],
      link: "/simulations",
      linkText: "View Thermal Contours",
      accent: "amber",
    },
    {
      id: "gravity-compare",
      tag: "CAPABILITY 05",
      title: "0g vs 1g Gravitational Crossfader",
      icon: Sliders,
      description:
        "Parametric comparison workbench contrasting isotropic microgravity diffusion spheres against terrestrial buoyant flicker plumes.",
      specs: ["Side-by-Side Diagnostics", "Dynamic Scaling Calculator", "Vortex Flicker Spectrum"],
      link: "/workspace",
      linkText: "Compare Gravity Regimes",
      accent: "emerald",
    },
    {
      id: "flight-history",
      tag: "CAPABILITY 06",
      title: "NASA Flight Telemetry Archive",
      icon: Database,
      description:
        "Comprehensive database of experimental records from the ISS Combustion Integrated Rack (CIR/ACME), Glenn Drop Tower, and Artemis lunar analogues.",
      specs: ["PostgreSQL & SQLite Storage", "Alembic Database Versioning", "One-Click Experiment Replay"],
      link: "/history",
      linkText: "Access Flight Archive",
      accent: "electric",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 border-b border-border bg-[#030508] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric-950/40 px-3.5 py-1 text-xs font-mono text-electric-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>MISSION PLATFORM CAPABILITIES // RESEARCH ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
            Integrated Scientific Suite
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Six specialized research modules engineered to model, simulate, visualize, and diagnose combustion
            kinetics across the entire gravitational continuum.
          </p>
        </div>

        {/* 6 Capabilities Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className="rounded-2xl glass-panel p-7 space-y-5 border border-border hover:border-electric/40 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-electric-400 font-bold uppercase tracking-wider">
                      {c.tag}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-charcoal-800 border border-border flex items-center justify-center text-slate-300 group-hover:text-electric-400 group-hover:border-electric/40 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-white group-hover:text-electric-300 transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {c.description}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-border/70 font-mono text-[11px] text-slate-400">
                    {c.specs.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-electric-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border/70">
                  <Link
                    href={c.link}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-electric-400 hover:text-electric-300 transition-colors"
                  >
                    <span>{c.linkText}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

