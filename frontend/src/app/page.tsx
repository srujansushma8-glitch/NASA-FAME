"use client";

import { useEffect } from "react";
import { MonolithHero } from "@/components/landing/MonolithHero";
import { ScienceProblemSection } from "@/components/landing/ScienceProblemSection";
import { CombustionRegimesSection } from "@/components/landing/CombustionRegimesSection";
import { Interactive3DSection } from "@/components/landing/Interactive3DSection";
import { ResearchWorkflowSection } from "@/components/landing/ResearchWorkflowSection";
import { AISafetySection } from "@/components/landing/AISafetySection";
import { MissionControlCTA } from "@/components/landing/MissionControlCTA";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { startScroll } from "@/lib/scroll";

export default function LandingPage() {
  const reduced = useReducedMotion();
  useEffect(() => startScroll(reduced), [reduced]);

  return (
    <div className="relative flex flex-col w-full bg-transparent text-stone min-h-screen overflow-x-hidden selection:bg-cobalt selection:text-white">
      <main className="relative z-10 flex flex-col w-full">
        {/* Section 1: Cinematic Flame Hero */}
        <MonolithHero />

        {/* Section 2: The Scientific Problem */}
        <ScienceProblemSection />

        {/* Section 3: Earth Gravity versus Microgravity Combustion */}
        <CombustionRegimesSection />

        {/* Section 4: Interactive 3D Flame Exploration */}
        <Interactive3DSection />

        {/* Section 5: Scientific Research Workflow */}
        <ResearchWorkflowSection />

        {/* Section 6: AI-Powered Fire Safety Analysis */}
        <AISafetySection />

        {/* Section 7: Mission Control Entry */}
        <MissionControlCTA />
      </main>
    </div>
  );
}
