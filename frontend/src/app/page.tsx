"use client";

import { useEffect } from "react";
import { FlameHero } from "@/components/landing/FlameHero";
import { ResearchLog } from "@/components/landing/ResearchLog";
import { WorkflowTrajectory } from "@/components/landing/WorkflowTrajectory";
import { Capabilities } from "@/components/landing/Capabilities";
import { AccessManifest } from "@/components/landing/AccessManifest";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { startScroll } from "@/lib/scroll";

export default function LandingPage() {
  const reduced = useReducedMotion();
  useEffect(() => startScroll(reduced), [reduced]);

  return (
    <div className="flex flex-col w-full bg-void text-white overflow-x-hidden">
      <FlameHero />
      <ResearchLog />
      <WorkflowTrajectory />
      <Capabilities />
      <AccessManifest />
    </div>
  );
}
