"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, Compass, Play, Cpu, ArrowUpRight, ShieldCheck, Flame } from "lucide-react";

export function MissionControlCTA() {
  const portals = [
    {
      href: "/dashboard",
      code: "PORTAL-01",
      title: "Mission Control Dashboard",
      desc: "Live telemetry, research experiments overview, combustion regime distributions, and sensor monitors.",
      icon: Activity,
    },
    {
      href: "/workspace",
      code: "PORTAL-02",
      title: "Experiment Workspace",
      desc: "Configure fuels, oxidizers, chamber pressures, flow rates, and gravitational environments.",
      icon: Compass,
    },
    {
      href: "/simulations",
      code: "PORTAL-03",
      title: "Combustion Simulation Lab",
      desc: "Interactive 3D Three.js flame simulation, real-time transient physics, temperature distribution, and geometry.",
      icon: Play,
    },
    {
      href: "/assistant",
      code: "PORTAL-04",
      title: "AI Combustion Analyzer",
      desc: "Physics-grounded surrogate querying, dimensionless numbers scaling, and fire safety risk classification.",
      icon: Cpu,
    },
  ];

  return (
    <section className="relative py-28 bg-ink/30 border-t border-stone-border/40 overflow-hidden">
      {/* Cobalt glow backdrop */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[800px] h-[350px] bg-cobalt/15 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-16">
        {/* Editorial Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 font-mono text-xs text-cobalt tracking-widest uppercase px-3 py-1 rounded bg-ink-elevated border border-stone-border/60">
            <span className="size-2 rounded-full bg-cobalt animate-ping shadow-[0_0_8px_#2B4BFF]" />
            <span>FLIGHT OPERATIONS SYSTEM // NOMINAL</span>
          </div>

          <h2 className="font-display text-hero font-extrabold text-stone-light uppercase tracking-tightest leading-none">
            MISSION <br />
            <span className="text-white">CONTROL.</span>
          </h2>

          <p className="font-sans text-lead text-stone max-w-xl mx-auto leading-relaxed pt-2">
            Access the complete suite of aerospace microgravity combustion research instruments,
            scientific simulation solvers, and AI safety diagnostics.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded bg-cobalt hover:bg-cobalt-hover text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-[0_0_35px_rgba(43,75,255,0.45)] hover:shadow-[0_0_55px_rgba(43,75,255,0.75)] hover:scale-[1.025] active:scale-[0.98] flex items-center gap-3"
            >
              <Activity className="size-4" />
              <span>LAUNCH MISSION CONTROL DASHBOARD</span>
            </Link>
          </div>
        </motion.div>

        {/* 4 Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {portals.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.code}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.75,
                  delay: idx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={p.href}
                  className="group p-6 rounded-lg bg-ink-surface/90 border border-stone-border/60 hover:border-cobalt hover:bg-ink-elevated hover:shadow-[0_0_30px_rgba(43,75,255,0.22)] transition-all duration-300 flex flex-col justify-between space-y-6 h-full"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-cobalt font-bold tracking-widest">{p.code}</span>
                      <Icon className="size-4 text-stone-dim group-hover:text-cobalt group-hover:scale-110 transition-all" />
                    </div>

                    <h3 className="font-display text-lg text-stone-light font-semibold group-hover:text-white transition-colors">
                      {p.title}
                    </h3>

                    <p className="font-sans text-xs text-stone leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-border/40 font-mono text-[11px] text-stone-dim flex items-center justify-between group-hover:text-cobalt transition-colors">
                    <span>ACCESS MODULE</span>
                    <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
