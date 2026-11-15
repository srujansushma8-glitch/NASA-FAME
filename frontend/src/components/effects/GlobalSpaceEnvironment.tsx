"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface Satellite {
  x: number;
  y: number;
  vx: number;
  vy: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  angle: number;
  speed: number;
  beaconPhase: number;
  size: number;
  hasSolarPanels: boolean;
}

interface Spacecraft {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  type: "station" | "orbiter" | "probe";
  beaconTimer: number;
}

/**
 * GlobalSpaceEnvironment
 * High-performance, cinematic, multi-layered deep space atmosphere.
 * Features:
 * - Real-time twinkling starfield with parallax depth and color temperature
 * - Periodic shooting stars (meteors) with glowing ionization trails
 * - Realistic planet Earth with atmospheric limb scattering, clouds, and continent illumination
 * - Orbiting satellites and spacecraft with blinking navigation strobe beacons
 * - Cursor-following electric-blue spotlight and proximity glow on nearby stars
 * - Architectural spacecraft viewport framing tailored to each page (Dashboard, Workspace, etc.)
 */
export function GlobalSpaceEnvironment() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Mouse tracking state for cursor lighting and star proximity
  const mouseRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    isActive: false,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.isActive = true;

      // Update global CSS variables for card hover highlights
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize Stars
    const starCount = Math.min(Math.floor((width * height) / 4200), 450);
    const starColors = [
      "#ffffff", // O/B class hot white
      "#e0f2fe", // Blue-white
      "#bae6fd", // Deep electric blue
      "#fed7aa", // Amber warm star
      "#ffffff",
    ];

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.35,
      baseAlpha: Math.random() * 0.65 + 0.25,
      twinkleSpeed: Math.random() * 0.025 + 0.008,
      twinklePhase: Math.random() * Math.PI * 2,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // Shooting Stars collection
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + 3000 + Math.random() * 5000;

    // Satellites with blinking beacons
    const satellites: Satellite[] = [
      {
        x: width * 0.15,
        y: height * 0.22,
        vx: 0.18,
        vy: -0.04,
        orbitRadiusX: 420,
        orbitRadiusY: 180,
        angle: 0.4,
        speed: 0.0007,
        beaconPhase: 0,
        size: 3.2,
        hasSolarPanels: true,
      },
      {
        x: width * 0.78,
        y: height * 0.38,
        vx: -0.14,
        vy: 0.05,
        orbitRadiusX: 580,
        orbitRadiusY: 220,
        angle: 2.8,
        speed: -0.0005,
        beaconPhase: Math.PI,
        size: 2.8,
        hasSolarPanels: true,
      },
      {
        x: width * 0.45,
        y: height * 0.12,
        vx: 0.22,
        vy: 0.02,
        orbitRadiusX: 680,
        orbitRadiusY: 140,
        angle: 4.5,
        speed: 0.0009,
        beaconPhase: 1.5,
        size: 2.2,
        hasSolarPanels: false,
      },
    ];

    // Deep space station in high orbit
    const spaceStation: Spacecraft = {
      x: width * 0.82,
      y: height * 0.28,
      vx: -0.025,
      vy: 0.008,
      scale: 1.0,
      type: "station",
      beaconTimer: 0,
    };

    let earthRotation = 0;

    // Main Canvas Render Loop
    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      // 1. Mouse Spotlight Lerp
      const mouse = mouseRef.current;
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.06;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.06;

      // 2. Distant Spiral Galaxy (Soft Atmospheric Core)
      const galaxyX = width * 0.25;
      const galaxyY = height * 0.28;
      const galaxyGrad = ctx.createRadialGradient(galaxyX, galaxyY, 0, galaxyX, galaxyY, 180);
      galaxyGrad.addColorStop(0, "rgba(99, 102, 241, 0.07)");
      galaxyGrad.addColorStop(0.35, "rgba(59, 130, 246, 0.04)");
      galaxyGrad.addColorStop(0.7, "rgba(43, 75, 255, 0.015)");
      galaxyGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = galaxyGrad;
      ctx.beginPath();
      ctx.arc(galaxyX, galaxyY, 180, 0, Math.PI * 2);
      ctx.fill();

      // 3. Render Stars with Twinkling & Cursor Proximity Reactivity
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        if (!reducedMotion) {
          s.twinklePhase += s.twinkleSpeed;
          // Very gentle cosmic drift
          s.x += 0.012;
          if (s.x > width) s.x = 0;
        }

        const twinkle = Math.sin(s.twinklePhase) * 0.28;
        let alpha = Math.max(0.08, Math.min(1.0, s.baseAlpha + twinkle));

        // Cursor proximity boost: stars brighten when the cursor approaches
        if (mouse.isActive) {
          const dx = mouse.currentX - s.x;
          const dy = mouse.currentY - s.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) {
            // within 150px
            const boost = (1.0 - Math.sqrt(distSq) / 150) * 0.55;
            alpha = Math.min(1.0, alpha + boost);
          }
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Shooting Stars (Meteors)
      const now = Date.now();
      if (!reducedMotion && now > nextShootingStarTime && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.4,
          length: Math.random() * 110 + 60,
          speed: Math.random() * 9 + 11,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.4,
          opacity: 1.0,
          life: 0,
          maxLife: Math.random() * 24 + 18,
        });
        nextShootingStarTime = now + 4500 + Math.random() * 7000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const meteor = shootingStars[i];
        meteor.life++;
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.opacity = 1.0 - (meteor.life / meteor.maxLife);

        if (meteor.life >= meteor.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const meteorGrad = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        meteorGrad.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
        meteorGrad.addColorStop(0.2, `rgba(96, 165, 250, ${meteor.opacity * 0.85})`);
        meteorGrad.addColorStop(0.6, `rgba(43, 75, 255, ${meteor.opacity * 0.4})`);
        meteorGrad.addColorStop(1, "rgba(43, 75, 255, 0)");

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Meteor Head Glow
        ctx.fillStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Planet Earth with Atmospheric Limb Scattering (Visible in Spacecraft Viewport)
      // Positioned gracefully in the lower half of the screen
      earthRotation += 0.0003;
      const earthCenterX = width * 0.42;
      const earthCenterY = height * 1.45;
      const earthRadius = Math.max(width * 0.72, 700);

      // Deep Space Blue Atmospheric Outer Corona
      const atmosphereGrad = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius - 12,
        earthCenterX,
        earthCenterY,
        earthRadius + 65
      );
      atmosphereGrad.addColorStop(0, "rgba(56, 189, 248, 0.42)");
      atmosphereGrad.addColorStop(0.25, "rgba(43, 75, 255, 0.28)");
      atmosphereGrad.addColorStop(0.65, "rgba(20, 37, 138, 0.10)");
      atmosphereGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = atmosphereGrad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 65, 0, Math.PI * 2);
      ctx.fill();

      // Earth Planetary Body
      const earthBodyGrad = ctx.createRadialGradient(
        earthCenterX - earthRadius * 0.35,
        earthCenterY - earthRadius * 0.55,
        earthRadius * 0.1,
        earthCenterX,
        earthCenterY,
        earthRadius
      );
      earthBodyGrad.addColorStop(0, "#1a365d"); // Lit oceanic blue
      earthBodyGrad.addColorStop(0.4, "#0f1f38"); // Intermediate ocean
      earthBodyGrad.addColorStop(0.75, "#080f1e"); // Nightside terminal
      earthBodyGrad.addColorStop(1, "#04070d"); // Deep nightside

      ctx.fillStyle = earthBodyGrad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric Limb Glow Line (Luminous Horizon Arc)
      ctx.strokeStyle = "rgba(125, 211, 252, 0.55)";
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "rgba(56, 189, 248, 0.85)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // 6. Realistic Space Station (ISS CIR Flight Science Rig) in Orbit
      if (!reducedMotion) {
        spaceStation.x += spaceStation.vx;
        spaceStation.y += spaceStation.vy;
        if (spaceStation.x < -100) spaceStation.x = width + 50;
        spaceStation.beaconTimer += 0.04;
      }

      ctx.save();
      ctx.translate(spaceStation.x, spaceStation.y);
      const sScale = 0.85;

      // Station Central Truss
      ctx.strokeStyle = "rgba(203, 213, 225, 0.65)";
      ctx.lineWidth = 1.8 * sScale;
      ctx.beginPath();
      ctx.moveTo(-32 * sScale, 0);
      ctx.lineTo(32 * sScale, 0);
      ctx.stroke();

      // Solar Panel Arrays (Left & Right)
      ctx.fillStyle = "rgba(43, 75, 255, 0.65)";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 1;
      // Left panels
      ctx.fillRect(-28 * sScale, -14 * sScale, 10 * sScale, 28 * sScale);
      ctx.strokeRect(-28 * sScale, -14 * sScale, 10 * sScale, 28 * sScale);
      // Right panels
      ctx.fillRect(18 * sScale, -14 * sScale, 10 * sScale, 28 * sScale);
      ctx.strokeRect(18 * sScale, -14 * sScale, 10 * sScale, 28 * sScale);

      // Central Pressurized Laboratory Modules
      ctx.fillStyle = "rgba(226, 232, 240, 0.9)";
      ctx.fillRect(-6 * sScale, -5 * sScale, 12 * sScale, 10 * sScale);

      // Blinking Navigation Beacon (Red Port, Green Starboard, Strobe White)
      const isBeaconOn = Math.sin(spaceStation.beaconTimer) > 0.4;
      if (isBeaconOn) {
        // Starboard Green
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(32 * sScale, 0, 1.8 * sScale, 0, Math.PI * 2);
        ctx.fill();

        // Port Red
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(-32 * sScale, 0, 1.8 * sScale, 0, Math.PI * 2);
        ctx.fill();

        // Central Masthead Strobe (Cyan / White)
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, -6 * sScale, 1.6 * sScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // 7. Satellites in Smooth Orbital Trajectories
      for (const sat of satellites) {
        if (!reducedMotion) {
          sat.angle += sat.speed;
          sat.beaconPhase += 0.05;
        }

        const satX = width * 0.5 + Math.cos(sat.angle) * sat.orbitRadiusX;
        const satY = height * 0.35 + Math.sin(sat.angle) * sat.orbitRadiusY * 0.45;

        ctx.save();
        ctx.translate(satX, satY);

        // Satellite Main Body
        ctx.fillStyle = "rgba(241, 245, 249, 0.85)";
        ctx.fillRect(-sat.size, -sat.size, sat.size * 2, sat.size * 2);

        // Solar Wings
        if (sat.hasSolarPanels) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
          ctx.fillRect(-sat.size * 3.5, -sat.size * 0.6, sat.size * 2.2, sat.size * 1.2);
          ctx.fillRect(sat.size * 1.3, -sat.size * 0.6, sat.size * 2.2, sat.size * 1.2);
        }

        // Blinking Optical Strobe
        if (Math.sin(sat.beaconPhase) > 0.6) {
          ctx.fillStyle = "#38bdf8";
          ctx.shadowColor = "#2B4BFF";
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(0, 0, sat.size * 1.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      // 8. Interactive Cursor Spotlight (Deep Electric Blue & Cyan Halo)
      if (mouse.isActive) {
        const spotGrad = ctx.createRadialGradient(
          mouse.currentX,
          mouse.currentY,
          0,
          mouse.currentX,
          mouse.currentY,
          340
        );
        spotGrad.addColorStop(0, "rgba(43, 75, 255, 0.16)");
        spotGrad.addColorStop(0.35, "rgba(56, 189, 248, 0.06)");
        spotGrad.addColorStop(0.7, "rgba(20, 37, 138, 0.02)");
        spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(mouse.currentX, mouse.currentY, 340, 0, Math.PI * 2);
        ctx.fill();

        // Secondary Soft Inner Halo
        const innerGrad = ctx.createRadialGradient(
          mouse.currentX,
          mouse.currentY,
          0,
          mouse.currentX,
          mouse.currentY,
          75
        );
        innerGrad.addColorStop(0, "rgba(125, 211, 252, 0.22)");
        innerGrad.addColorStop(1, "rgba(43, 75, 255, 0)");
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(mouse.currentX, mouse.currentY, 75, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion]);

  // Determine page-specific cockpit & viewport overlay styling
  const isDashboard = pathname === "/dashboard";
  const isLogin = pathname === "/login";
  const isWorkspace = pathname === "/workspace";
  const isSimulations = pathname === "/simulations";
  const isAssistant = pathname === "/assistant";
  const isHistory = pathname === "/history";

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05070D]"
      aria-hidden="true"
    >
      {/* 1. Deep Space Volumetric Atmospheric Nebulae */}
      <div
        className="absolute -top-[15%] -right-[10%] w-[900px] h-[900px] rounded-full blur-[150px] opacity-45 pointer-events-none animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(43, 75, 255, 0.18) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)",
          animationDuration: "18s",
        }}
      />
      <div
        className="absolute top-[45%] -left-[15%] w-[800px] h-[800px] rounded-full blur-[140px] opacity-35 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(43, 75, 255, 0.06) 55%, transparent 80%)",
        }}
      />

      {/* 2. Main Canvas for Stars, Earth, Satellites, Meteors, and Spotlight */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 3. Spacecraft Cockpit / Bridge Architectural Ribs & Cyan Light Strips (Ref: Attached User Photo) */}
      {(isDashboard || isLogin) && (
        <div className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-1000">
          {/* Top Arched Viewport Canopy Rib */}
          <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 1920 1080">
            <defs>
              <linearGradient id="cockpitRibGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#030712" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="cyanNeonStrip" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#2B4BFF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Left Curved Structural Arch Column */}
            <path
              d="M0,0 L240,0 C180,320 160,740 0,1080 Z"
              fill="url(#cockpitRibGrad)"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1.5"
            />
            {/* Left Cyan Light Conduit */}
            <path
              d="M240,0 C180,320 160,740 0,1080"
              fill="none"
              stroke="url(#cyanNeonStrip)"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_12px_#38bdf8]"
            />

            {/* Right Curved Structural Arch Column */}
            <path
              d="M1920,0 L1680,0 C1740,320 1760,740 1920,1080 Z"
              fill="url(#cockpitRibGrad)"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeWidth="1.5"
            />
            {/* Right Cyan Light Conduit */}
            <path
              d="M1680,0 C1740,320 1760,740 1920,1080"
              fill="none"
              stroke="url(#cyanNeonStrip)"
              strokeWidth="2.5"
              className="drop-shadow-[0_0_12px_#38bdf8]"
            />

            {/* Top Viewport Frame Lip */}
            <path
              d="M240,0 C640,65 1280,65 1680,0 L1920,0 L0,0 Z"
              fill="url(#cockpitRibGrad)"
              stroke="rgba(56, 189, 248, 0.2)"
              strokeWidth="1"
            />
          </svg>

          {/* Holographic Station Flight Coordinates (Station HUD) */}
          <div className="absolute top-20 left-12 font-mono text-[10px] tracking-[0.25em] text-cyan-400/60 hidden xl:flex flex-col gap-1 select-none">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>ISS CIR // STATION ALT 408 KM</span>
            </span>
            <span>VELOCITY: 7.66 KM/S // INCL 51.64°</span>
            <span className="text-stone-muted">ATMOSPHERE: 0.000G QUASI-STEADY</span>
          </div>
        </div>
      )}

      {/* 4. Page Specific Holographic Scanning Overlays */}
      {isAssistant && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse absolute top-1/3" />
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cobalt to-transparent animate-pulse absolute top-2/3" />
        </div>
      )}

      {/* 5. Monolith Cosmic Grid Texture */}
      <div className="absolute inset-0 monolith-grid pointer-events-none opacity-20" />
    </div>
  );
}
