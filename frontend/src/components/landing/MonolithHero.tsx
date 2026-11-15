"use client";

import React, { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowDownRight, Compass, Activity, ShieldCheck, Flame } from "lucide-react";
import { heroContent, brand } from "@/content";

// Dynamically import Three.js Hero Flame to prevent SSR hydration mismatches
const ThreeHeroFlame = dynamic(
  () => import("./ThreeHeroFlame").then((mod) => mod.ThreeHeroFlame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="size-48 rounded-full border border-cobalt/30 animate-pulse bg-cobalt/5 flex items-center justify-center font-mono text-xs text-cobalt">
          INITIALIZING WEBGL 3.0...
        </div>
      </div>
    ),
  }
);

export function MonolithHero() {
  const heroRef = useRef<HTMLElement>(null);

  const handleScrollToExplore = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("science");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full bg-ink flex items-center pt-20 pb-16 lg:py-0 overflow-hidden monolith-grid"
    >
      {/* Background radial atmosphere glow (Electric Cobalt 10% rule) */}
      <div className="absolute right-[-10%] top-[10%] w-[700px] h-[700px] rounded-full bg-cobalt/10 blur-[130px] pointer-events-none" />
      <div className="absolute right-[15%] top-[25%] w-[350px] h-[350px] rounded-full bg-flame/15 blur-[90px] pointer-events-none" />

      {/* Decorative technical line guides */}
      <div className="absolute inset-x-0 top-24 h-px bg-stone-border/40 pointer-events-none" />
      <div className="absolute left-8 lg:left-16 inset-y-0 w-px bg-stone-border/30 pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center min-h-[calc(100vh-5rem)]">
          {/* Left Column: Oversized Editorial Typography & Action CTAs (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8 lg:pt-0">
            {/* Small NASA-FLAME logo and mission identifier */}
            <div className="flex items-center gap-3">
              <div className="size-7 rounded bg-cobalt/15 border border-cobalt/40 flex items-center justify-center text-cobalt">
                <Flame className="size-4 text-cobalt" />
              </div>
              <div className="font-mono text-label text-stone tracking-widest uppercase">
                {heroContent.missionTag}
              </div>
            </div>

            {/* Large headline: FIRE BEYOND GRAVITY. */}
            <h1 className="font-display text-hero font-extrabold text-white uppercase tracking-tightest leading-[0.88] select-none">
              <div>{heroContent.headlineLine1}</div>
              <div className="text-stone">{heroContent.headlineLine2}</div>
              <div className="text-white flex items-baseline">
                {heroContent.headlineLine3}
                <span className="size-3 rounded-full bg-cobalt inline-block ml-2 mb-1" />
              </div>
            </h1>

            {/* Supporting text */}
            <p className="font-sans text-lead text-stone max-w-xl font-normal leading-relaxed">
              {heroContent.supportingText}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* [ EXPLORE THE MISSION ] */}
              <a
                href="#science"
                onClick={handleScrollToExplore}
                className="group px-6 sm:px-8 py-3.5 rounded border border-stone/30 bg-ink-surface/80 hover:bg-stone/10 hover:border-cobalt text-stone hover:text-white font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5"
              >
                <span>{heroContent.btnExplore}</span>
                <ArrowDownRight className="size-4 text-stone group-hover:text-cobalt group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </a>

              {/* [ ENTER MISSION CONTROL ] */}
              <Link
                href="/dashboard"
                className="px-6 sm:px-8 py-3.5 rounded bg-cobalt hover:bg-cobalt-hover text-white font-mono text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-[0_0_25px_rgba(43,75,255,0.4)] hover:shadow-[0_0_35px_rgba(43,75,255,0.6)] flex items-center gap-2.5"
              >
                <Activity className="size-4 text-white" />
                <span>{heroContent.btnEnter}</span>
              </Link>
            </div>

            {/* Telemetry indicator: MICROGRAVITY RESEARCH SYSTEM — ONLINE */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-t border-stone-border/50 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cobalt opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-cobalt" />
                </span>
                <span className="text-stone tracking-widest font-medium uppercase">
                  {heroContent.telemetryStatus}
                </span>
              </div>

              <div className="text-stone-dim tracking-wider hidden sm:block">
                // {heroContent.flightCoordinates}
              </div>
            </div>

            {/* System Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {heroContent.systemSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="p-2.5 rounded bg-ink-surface/60 border border-stone-border/30"
                >
                  <div className="font-mono text-[9px] text-stone-muted uppercase tracking-widest">
                    {spec.label}
                  </div>
                  <div className="font-mono text-xs text-stone-light font-semibold mt-0.5">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Massive Realistic 3D Spherical Microgravity Flame (5 cols + bleed) */}
          <div className="lg:col-span-5 relative h-[450px] sm:h-[550px] lg:h-[720px] w-full flex items-center justify-center">
            {/* The 3D flame object extends beyond container edges, just like MONOLITH */}
            <div className="relative w-full h-full lg:w-[130%] lg:max-w-none lg:-right-16 flex items-center justify-center">
              <ThreeHeroFlame className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Scroll Marker */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] text-stone-muted tracking-widest uppercase pointer-events-none">
        <span>SCROLL TO EXPLORE SCIENCE</span>
        <div className="w-px h-6 bg-gradient-to-b from-stone-dim to-transparent animate-bounce" />
      </div>
    </section>
  );
}

