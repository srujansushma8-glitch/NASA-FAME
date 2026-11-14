"use client";

import { useEffect } from "react";
import { FlameHero } from "@/components/selene/FlameHero";
import { ResearchLog } from "@/components/selene/ResearchLog";
import { WorkflowTrajectory } from "@/components/selene/WorkflowTrajectory";
import { Capabilities } from "@/components/selene/Capabilities";
import { AccessManifest } from "@/components/selene/AccessManifest";
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
