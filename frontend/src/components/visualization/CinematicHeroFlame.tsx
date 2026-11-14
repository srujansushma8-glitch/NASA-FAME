"use client";

import React, { useEffect, useRef, useState } from "react";
import { Gauge, Layers, Sparkles, Orbit, RotateCcw } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface CinematicHeroFlameProps {
  initialGravity?: number;
  onGravityChange?: (g: number) => void;
}

export function CinematicHeroFlame({
  initialGravity = 0.0,
  onGravityChange,
}: CinematicHeroFlameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [gravity, setGravity] = useState<number>(initialGravity);
  const [showIsotherms, setShowIsotherms] = useState<boolean>(true);
  const [showHUD, setShowHUD] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Parallax angles
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Handle gravity change
  const handleSetGravity = (g: number) => {
    setGravity(g);
    if (onGravityChange) {
      onGravityChange(g);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Handle high DPI
    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Particle system
    const particles: Particle[] = [];
    const maxParticles = 65;

    const spawnParticle = (w: number, h: number, gLevel: number): Particle => {
      const isZeroG = gLevel <= 0.05;
      const angle = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const r = Math.random() * 25 + 10;

      let vx: number, vy: number, vz: number;

      if (isZeroG) {
        // Isotropic spherical drift (zero upward velocity)
        const speed = Math.random() * 0.4 + 0.15;
        vx = Math.cos(angle) * Math.cos(phi) * speed;
        vy = Math.sin(phi) * speed;
        vz = Math.sin(angle) * Math.cos(phi) * speed;
      } else {
        // Buoyant upward acceleration
        const upwardSpeed = -(Math.random() * 1.8 + 1.2) * Math.sqrt(Math.max(0.1, gLevel));
        vx = (Math.random() - 0.5) * 0.6;
        vy = upwardSpeed;
        vz = (Math.random() - 0.5) * 0.6;
      }

      // Palette: Blue core -> yellow -> orange -> dark soot
      const colors = ["#087CFF", "#38BDF8", "#FFE066", "#FF7029", "#FF4500"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        x: Math.cos(angle) * r,
        y: isZeroG ? Math.sin(phi) * r : Math.sin(angle) * (r * 0.5) + 20,
        z: Math.sin(angle) * r,
        vx,
        vy,
        vz,
        life: 0,
        maxLife: Math.random() * 70 + 40,
        size: Math.random() * 2.5 + 1.0,
        color,
      };
    };

    // Render loop
    const render = () => {
      time += 0.035;

      // Smooth mouse parallax interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.06;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.06;

      const rect = canvas.parentElement?.getBoundingClientRect() || { width: 500, height: 500 };
      const w = rect.width;
      const h = rect.height;
      const centerX = w / 2 + mousePos.current.x * 25;
      const centerY = h / 2 + mousePos.current.y * 20;

      ctx.clearRect(0, 0, w, h);

      const isZeroG = gravity <= 0.05;
      const isTransitional = gravity > 0.05 && gravity < 0.6;
      const isTeardrop = gravity >= 0.6;

      // 1. Draw Background Orbital Target Rings & HUD
      if (showHUD) {
        ctx.save();
        ctx.strokeStyle = "rgba(46, 63, 92, 0.25)";
        ctx.lineWidth = 1;

        // Outer Reticle Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, 155, 0, Math.PI * 2);
        ctx.stroke();

        // Intermediate Segmented Ring
        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = "rgba(8, 124, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 125, time * 0.1, time * 0.1 + Math.PI * 1.5);
        ctx.stroke();

        // Inner Coordinate Crosshairs
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(46, 63, 92, 0.35)";
        const crossSize = 14;
        ctx.beginPath();
        ctx.moveTo(centerX - 165, centerY);
        ctx.lineTo(centerX - 165 + crossSize, centerY);
        ctx.moveTo(centerX + 165 - crossSize, centerY);
        ctx.lineTo(centerX + 165, centerY);
        ctx.moveTo(centerX, centerY - 165);
        ctx.lineTo(centerX, centerY - 165 + crossSize);
        ctx.moveTo(centerX, centerY + 165 - crossSize);
        ctx.lineTo(centerX, centerY + 165);
        ctx.stroke();

        ctx.restore();
      }

      // 2. Volumetric Glow Behind Flame
      ctx.save();
      const outerGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        15,
        centerX,
        centerY,
        isZeroG ? 140 : 180
      );
      outerGlow.addColorStop(0, "rgba(255, 112, 41, 0.25)");
      outerGlow.addColorStop(0.4, "rgba(8, 124, 255, 0.15)");
      outerGlow.addColorStop(1, "rgba(5, 7, 13, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Render 3D Flame Geometry
      ctx.save();

      // Flicker calculation
      const flickerFreq = isZeroG ? 0 : 12.0; // 0 Hz in 0g, ~12 Hz in 1g
      const flickerAmp = isZeroG ? 0.015 : 0.08 * Math.sqrt(gravity);
      const flicker = 1.0 + Math.sin(time * flickerFreq) * flickerAmp;

      if (isZeroG) {
        // ==========================================
        // 0g PURE SPHERICAL BURKE-SCHUMANN FLAME
        // ==========================================
        const radius = 62 * flicker;

        // A. Thermal Isotherms Outlines
        if (showIsotherms) {
          ctx.save();
          // Outer thermal radiation isotherm
          ctx.strokeStyle = "rgba(8, 124, 255, 0.35)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 1.45, 0, Math.PI * 2);
          ctx.stroke();

          // Stoichiometric reaction front boundary
          ctx.strokeStyle = "rgba(255, 112, 41, 0.4)";
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // B. Outer Soot Stagnation Shell
        const sootGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.7,
          centerX,
          centerY,
          radius * 1.1
        );
        sootGrad.addColorStop(0, "rgba(255, 112, 41, 0)");
        sootGrad.addColorStop(0.7, "rgba(255, 140, 20, 0.4)");
        sootGrad.addColorStop(0.95, "rgba(255, 90, 0, 0.65)");
        sootGrad.addColorStop(1, "rgba(255, 70, 0, 0)");

        ctx.fillStyle = sootGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
        ctx.fill();

        // C. Golden Reaction Zone (High temperature)
        const reactionGrad = ctx.createRadialGradient(
          centerX - mousePos.current.x * 10,
          centerY - mousePos.current.y * 10,
          radius * 0.1,
          centerX,
          centerY,
          radius * 0.85
        );
        reactionGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        reactionGrad.addColorStop(0.35, "rgba(255, 224, 102, 0.9)");
        reactionGrad.addColorStop(0.7, "rgba(255, 112, 41, 0.75)");
        reactionGrad.addColorStop(0.92, "rgba(8, 124, 255, 0.45)");
        reactionGrad.addColorStop(1, "rgba(8, 124, 255, 0)");

        ctx.fillStyle = reactionGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
        ctx.fill();

        // D. Inner Chemiluminescent Blue Core
        const blueCore = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius * 0.35
        );
        blueCore.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        blueCore.addColorStop(0.5, "rgba(100, 200, 255, 0.7)");
        blueCore.addColorStop(0.85, "rgba(8, 124, 255, 0.4)");
        blueCore.addColorStop(1, "rgba(8, 124, 255, 0)");

        ctx.fillStyle = blueCore;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // ==========================================
        // 1g BUOYANT TEARDROP FLAME / TRANSITIONAL
        // ==========================================
        const baseWidth = isTeardrop ? 36 : 46;
        const flameHeight = (isTeardrop ? 115 : 85) * flicker;
        const tipY = centerY - flameHeight;
        const baseY = centerY + 30;

        // Buoyant flame shape path
        ctx.beginPath();
        ctx.moveTo(centerX, tipY);
        // Right flank curve
        ctx.bezierCurveTo(
          centerX + baseWidth * 1.1,
          centerY - flameHeight * 0.35,
          centerX + baseWidth * 1.25,
          baseY - 10,
          centerX,
          baseY
        );
        // Left flank curve
        ctx.bezierCurveTo(
          centerX - baseWidth * 1.25,
          baseY - 10,
          centerX - baseWidth * 1.1,
          centerY - flameHeight * 0.35,
          centerX,
          tipY
        );
        ctx.closePath();

        // Vertical gradient
        const plumeGrad = ctx.createLinearGradient(centerX, baseY, centerX, tipY);
        plumeGrad.addColorStop(0, "rgba(8, 124, 255, 0.85)"); // Blue base
        plumeGrad.addColorStop(0.2, "rgba(255, 224, 102, 0.95)"); // Bright core
        plumeGrad.addColorStop(0.65, "rgba(255, 112, 41, 0.85)"); // Orange mantle
        plumeGrad.addColorStop(0.9, "rgba(255, 69, 0, 0.5)"); // Soot tip
        plumeGrad.addColorStop(1, "rgba(100, 20, 0, 0)");

        ctx.fillStyle = plumeGrad;
        ctx.fill();

        // Inner luminous core
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - flameHeight * 0.45);
        ctx.bezierCurveTo(
          centerX + baseWidth * 0.55,
          centerY,
          centerX + baseWidth * 0.6,
          baseY - 5,
          centerX,
          baseY - 5
        );
        ctx.bezierCurveTo(
          centerX - baseWidth * 0.6,
          baseY - 5,
          centerX - baseWidth * 0.55,
          centerY,
          centerX,
          centerY - flameHeight * 0.45
        );
        ctx.closePath();

        const innerGrad = ctx.createLinearGradient(centerX, baseY, centerX, centerY - flameHeight * 0.45);
        innerGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        innerGrad.addColorStop(0.6, "rgba(255, 235, 150, 0.8)");
        innerGrad.addColorStop(1, "rgba(255, 150, 50, 0)");
        ctx.fillStyle = innerGrad;
        ctx.fill();
      }

      ctx.restore();

      // 4. Update & Render Isotropic Particles
      while (particles.length < maxParticles) {
        particles.push(spawnParticle(w, h, gravity));
      }

      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.7;
        const px = centerX + p.x;
        const py = centerY + p.y;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. Burner Mount Representation at Bottom
      ctx.save();
      const burnerWidth = 32;
      const burnerY = centerY + (isZeroG ? 65 : 32);
      ctx.fillStyle = "#161F30";
      ctx.strokeStyle = "#2E3F5C";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(centerX - burnerWidth / 2, burnerY, burnerWidth, 8, 2);
      ctx.fill();
      ctx.stroke();

      // Nozzle orifice
      ctx.fillStyle = "#087CFF";
      ctx.beginPath();
      ctx.arc(centerX, burnerY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [gravity, showIsotherms, showHUD]);

  // Mouse move handler for 3D parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mousePos.current.targetX = nx;
    mousePos.current.targetY = ny;
  };

  const handleMouseLeave = () => {
    mousePos.current.targetX = 0;
    mousePos.current.targetY = 0;
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] rounded-2xl glass-panel-glow overflow-hidden select-none"
    >
      {/* Background Starfield Canvas Grid */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Top Left Mission Telemetry Overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-electric-400 animate-ping" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-electric-400">
            CIR / ACME TELEMETRY HUD
          </span>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          SYS: BURKE-SCHUMANN 3D CONVECTIVE MESH
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          REGIME:{" "}
          <span className="text-white font-semibold">
            {gravity === 0
              ? "0.0g ISOTROPIC DIFFUSION"
              : gravity < 0.5
              ? `${gravity}g TRANSITIONAL PARTIAL-G`
              : "1.0g BUOYANT CONVECTIVE PLUME"}
          </span>
        </div>
      </div>

      {/* Top Right Tooling Buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        <button
          onClick={() => setShowIsotherms(!showIsotherms)}
          title="Toggle Thermal Isotherms"
          className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
            showIsotherms
              ? "bg-electric-950/70 border-electric text-electric-400 shadow-sm shadow-electric/20"
              : "bg-charcoal-800/80 border-border text-slate-400 hover:text-white"
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span>ISOTHERMS</span>
          </span>
        </button>

        <button
          onClick={() => setShowHUD(!showHUD)}
          title="Toggle Reticle HUD"
          className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
            showHUD
              ? "bg-electric-950/70 border-electric text-electric-400 shadow-sm shadow-electric/20"
              : "bg-charcoal-800/80 border-border text-slate-400 hover:text-white"
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <Orbit className="h-3 w-3" />
            <span>HUD</span>
          </span>
        </button>
      </div>

      {/* Bottom Center Gravity Preset Switcher */}
      <div className="absolute bottom-5 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-10">
        <div className="flex items-center justify-center p-1 rounded-xl bg-charcoal-900/90 border border-electric/30 backdrop-blur-md shadow-2xl">
          {[
            { label: "0g Microgravity", g: 0.0, badge: "ISS CIR" },
            { label: "0.166g Moon", g: 0.166, badge: "Lunar" },
            { label: "0.38g Mars", g: 0.38, badge: "Martian" },
            { label: "1.0g Earth", g: 1.0, badge: "1g Plume" },
          ].map((item) => (
            <button
              key={item.g}
              onClick={() => handleSetGravity(item.g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex flex-col items-center ${
                gravity === item.g
                  ? "bg-gradient-to-r from-electric to-electric-600 text-white font-bold shadow-md shadow-electric/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-charcoal-800"
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[9px] opacity-75 font-normal">{item.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Left Quick Telemetry Readout */}
      <div className="hidden sm:block absolute bottom-5 left-5 z-10 pointer-events-none">
        <div className="font-mono text-[10px] space-y-0.5 text-slate-400 bg-charcoal-950/80 p-2.5 rounded-lg border border-border/70 backdrop-blur-sm">
          <div>
            PEAK TEMP:{" "}
            <span className="text-flame-400 font-bold">
              {gravity === 0 ? "2,086 K" : gravity < 0.5 ? "2,190 K" : "2,226 K"}
            </span>
          </div>
          <div>
            FLAME RADIUS:{" "}
            <span className="text-white font-bold">
              {gravity === 0 ? "10.8 mm (SPHERE)" : gravity < 0.5 ? "8.2 mm (OVAL)" : "5.4 mm (BASE)"}
            </span>
          </div>
          <div>
            BUOYANCY DRAFT:{" "}
            <span className="text-electric-400 font-bold">
              {gravity === 0 ? "0.00 m/s (SUPPRESSED)" : gravity < 0.5 ? "0.42 m/s" : "1.85 m/s"}
            </span>
          </div>
        </div>
      </div>

      {/* Floating 3D Interaction Hint */}
      <div className="hidden lg:flex items-center gap-1.5 absolute bottom-5 right-5 z-10 pointer-events-none font-mono text-[10px] text-slate-500 bg-charcoal-950/60 px-2.5 py-1 rounded border border-border/50">
        <Sparkles className="h-3 w-3 text-electric-400" />
        <span>MOVE CURSOR FOR 3D PERSPECTIVE PARALLAX</span>
      </div>
    </div>
  );
}

