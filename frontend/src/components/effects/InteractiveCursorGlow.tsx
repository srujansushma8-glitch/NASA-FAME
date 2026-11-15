"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * InteractiveCursorGlow
 * Renders a soft, electric-blue radial spotlight that smoothly interpolates (lerp)
 * towards the mouse cursor position, providing subtle ambient illumination to the background
 * and updating CSS variables (--mouse-x, --mouse-y) for interactive card highlights.
 * 
 * Automatically switches to an ambient breathing effect on mobile/touch devices.
 */
export function InteractiveCursorGlow() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Detect touch-only devices or reduced motion preference
    const touchQuery = window.matchMedia("(pointer: coarse)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setIsTouchDevice(touchQuery.matches);
    setReducedMotion(motionQuery.matches);

    const handleTouchChange = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    touchQuery.addEventListener("change", handleTouchChange);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      touchQuery.removeEventListener("change", handleTouchChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  useEffect(() => {
    if (isTouchDevice || reducedMotion) return;

    let animationFrameId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isVisible = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible && spotlightRef.current) {
        isVisible = true;
        spotlightRef.current.style.opacity = "1";
      }

      // Update global CSS custom properties for card hover effects
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (spotlightRef.current) {
        spotlightRef.current.style.opacity = "0";
      }
    };

    const handleMouseEnter = () => {
      isVisible = true;
      if (spotlightRef.current) {
        spotlightRef.current.style.opacity = "1";
      }
    };

    // Smooth lerp animation loop
    const animate = () => {
      const ease = 0.09; // Smooth inertial glide
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isTouchDevice, reducedMotion]);

  // Touch / Mobile Fallback: Subtle static/ambient breathing cosmic glow
  if (isTouchDevice || reducedMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-cobalt/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft electric-blue radial spotlight */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[750px] h-[750px] rounded-full opacity-0 transition-opacity duration-700 ease-out will-change-transform"
        style={{
          background: `radial-gradient(
            circle,
            rgba(43, 75, 255, 0.13) 0%,
            rgba(56, 189, 248, 0.06) 28%,
            rgba(43, 75, 255, 0.02) 55%,
            transparent 72%
          )`,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

