"use client";

import React from "react";
import { CinematicSpaceBackground } from "./CinematicSpaceBackground";
import { InteractiveCursorGlow } from "./InteractiveCursorGlow";

/**
 * SpaceEnvironment
 * Global persistent space background environment providing:
 * - Multilayer twinkling starfield (distant, mid, foreground)
 * - Drifting zero-g combustion particulate motes
 * - Deep midnight navy volumetric nebula gradients
 * - Smooth interactive cursor spotlight with mobile ambient fallback
 * 
 * Mounted globally in layout.tsx with pointer-events-none so it never intercepts user interactions.
 */
export function SpaceEnvironment() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <CinematicSpaceBackground />
      <InteractiveCursorGlow />
    </div>
  );
}

