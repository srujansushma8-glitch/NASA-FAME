"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface Star {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
  color: string;
  hasSpikes?: boolean;
  spikeLength?: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  maxOpacity: number;
  life: number;
  maxLife: number;
  thickness: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  vertices: { x: number; y: number }[];
  rotation: number;
  rotSpeed: number;
  baseShade: string;
  highlightShade: string;
}

/**
 * CosmicNebulaEnvironment
 * 
 * Recreates the exact cosmic atmosphere of the reference image:
 * - Deep navy and cosmic black outer space void.
 * - Glowing electric-blue and violet/purple nebulae clouds flowing diagonally.
 * - Dense field of tiny twinkling stars with astronomical color temperatures.
 * - Prominent bright landmark stars with 4-point cross diffraction spikes.
 * - Distant cratered moon/planet (top-left) with crescent shadow and satellite.
 * - Distant glowing blue world (bottom-right) with atmospheric limb scattering.
 * - Faceted rocky asteroids tumbling and drifting along the lower perimeter.
 * - Occasional dynamic shooting stars (meteors) with luminous ionization trails.
 * - Multiple depth layers of slowly drifting micro-dust particles.
 * - Real interactive cursor lighting: bright cyan-blue central spotlight with
 *   multiple soft concentric blue halos smoothly following the cursor,
 *   illuminating nearby stars and particles on proximity.
 * - Strictly NO spacecraft, astronauts, space stations, or cockpit window frames.
 * - High-DPI, 60fps performance with clean tear-down and accessibility support.
 */
export function CosmicNebulaEnvironment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const [reducedMotion, setReducedMotion] = useState(false);

  // Mouse tracking state for cursor spotlight and proximity reactions
  const mouseRef = useRef({
    targetX: -1000,
    targetY: -1000,
    currentX: -1000,
    currentY: -1000,
    isActive: false,
    hoverRadius: 220,
  });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const handleMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotion);
    return () => motionQuery.removeEventListener("change", handleMotion);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Entity collections
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let particles: Particle[] = [];
    let asteroids: Asteroid[] = [];

    // Cached offscreen nebula canvas for high-performance fluid rendering
    let nebulaCanvas: HTMLCanvasElement | null = null;
    let nebulaCtx: CanvasRenderingContext2D | null = null;

    // Time tracking
    let lastTime = performance.now();
    let meteorTimer = 0;
    let nextMeteorDelay = 2500 + Math.random() * 3000;

    // Helper: generate irregular asteroid polygon
    const createAsteroidVertices = (radius: number, points = 8) => {
      const vertices: { x: number; y: number }[] = [];
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Perturb radius irregularly
        const r = radius * (0.68 + Math.random() * 0.45);
        vertices.push({
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
        });
      }
      return vertices;
    };

    // Initialize or resize the universe
    const initUniverse = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Initialize mouse to center if not set
      if (mouseRef.current.targetX < 0) {
        mouseRef.current.targetX = width * 0.5;
        mouseRef.current.targetY = height * 0.45;
        mouseRef.current.currentX = mouseRef.current.targetX;
        mouseRef.current.currentY = mouseRef.current.targetY;
      }

      // --- 1. Populate Starfield (Dense: ~3,800 stars) ---
      stars = [];
      const starCount = Math.floor(Math.max(2800, (width * height) / 420));
      const starPalettes = [
        "rgba(255, 255, 255,", // Pure crisp white
        "rgba(240, 245, 255,", // Brilliant diamond
        "rgba(147, 197, 253,", // Hot B-class blue
        "rgba(96, 165, 250,",  // Royal azure
        "rgba(56, 189, 248,",  // Electric cyan
        "rgba(196, 181, 253,", // Violet tint
        "rgba(254, 240, 138,", // Warm star
      ];

      for (let i = 0; i < starCount; i++) {
        const layer = Math.random() < 0.65 ? 0 : Math.random() < 0.88 ? 1 : 2;
        const color = starPalettes[Math.floor(Math.random() * starPalettes.length)];
        const baseRadius =
          layer === 0
            ? 0.35 + Math.random() * 0.45
            : layer === 1
            ? 0.75 + Math.random() * 0.65
            : 1.35 + Math.random() * 0.95;

        const baseAlpha =
          layer === 0
            ? 0.25 + Math.random() * 0.45
            : layer === 1
            ? 0.45 + Math.random() * 0.45
            : 0.75 + Math.random() * 0.25;

        // Give ~18 bright landmark stars 4-point cross diffraction spikes
        const hasSpikes = layer === 2 && Math.random() < 0.08 && stars.filter((s) => s.hasSpikes).length < 20;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius,
          radius: baseRadius,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: 0.6 + Math.random() * 2.2,
          twinklePhase: Math.random() * Math.PI * 2,
          layer,
          color,
          hasSpikes,
          spikeLength: hasSpikes ? 7 + Math.random() * 12 : undefined,
        });
      }

      // --- 2. Populate Drifting Dust Micro-Motes (180 particles) ---
      particles = [];
      for (let i = 0; i < 160; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.48) * 0.12,
          vy: (Math.random() - 0.48) * 0.12,
          radius: 0.6 + Math.random() * 1.4,
          baseAlpha: 0.15 + Math.random() * 0.35,
          alpha: 0.15 + Math.random() * 0.35,
          color: Math.random() < 0.5 ? "rgba(56, 189, 248," : "rgba(168, 85, 247,",
        });
      }

      // --- 3. Populate Asteroids (Bottom-left & lower edge cluster) ---
      asteroids = [];
      const asteroidConfigs = [
        { xRatio: 0.03, yRatio: 0.88, r: 18, speed: 0.003 },
        { xRatio: 0.08, yRatio: 0.94, r: 24, speed: -0.0025 },
        { xRatio: 0.14, yRatio: 0.92, r: 14, speed: 0.004 },
        { xRatio: 0.19, yRatio: 0.97, r: 20, speed: -0.0035 },
        { xRatio: 0.27, yRatio: 0.95, r: 12, speed: 0.002 },
        { xRatio: 0.78, yRatio: 0.86, r: 16, speed: -0.003 },
        { xRatio: 0.82, yRatio: 0.74, r: 11, speed: 0.004 },
        { xRatio: 0.94, yRatio: 0.68, r: 15, speed: -0.002 },
      ];

      asteroids = asteroidConfigs.map((cfg) => ({
        x: cfg.xRatio * width,
        y: cfg.yRatio * height,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.03,
        radius: cfg.r,
        vertices: createAsteroidVertices(cfg.r, 8),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: cfg.speed,
        baseShade: "#080c18",
        highlightShade: "rgba(56, 189, 248, 0.45)",
      }));

      // --- 4. Render Offscreen Volumetric Nebula Texture ---
      nebulaCanvas = document.createElement("canvas");
      nebulaCanvas.width = Math.floor(width * 0.7);
      nebulaCanvas.height = Math.floor(height * 0.7);
      nebulaCtx = nebulaCanvas.getContext("2d");

      if (nebulaCtx) {
        renderOffscreenNebula(nebulaCtx, nebulaCanvas.width, nebulaCanvas.height);
      }
    };

    // Render volumetric glowing nebulae in offscreen buffer
    const renderOffscreenNebula = (
      nCtx: CanvasRenderingContext2D,
      nw: number,
      nh: number
    ) => {
      nCtx.clearRect(0, 0, nw, nh);

      // Deep void background
      nCtx.fillStyle = "#010206";
      nCtx.fillRect(0, 0, nw, nh);

      // Multi-cluster gas clouds matching the reference image:
      // A massive diagonal river of electric blue and violet glowing gas
      const gasNodes = [
        // Upper-Right to Center Lane (Brilliant Electric Blue & Violet)
        { x: nw * 0.88, y: nh * 0.15, r: nw * 0.38, col: "rgba(29, 78, 216, 0.35)", blend: "screen" },
        { x: nw * 0.82, y: nh * 0.22, r: nw * 0.30, col: "rgba(56, 189, 248, 0.38)", blend: "screen" },
        { x: nw * 0.92, y: nh * 0.28, r: nw * 0.28, col: "rgba(124, 58, 237, 0.32)", blend: "screen" },
        { x: nw * 0.75, y: nh * 0.35, r: nw * 0.34, col: "rgba(37, 99, 235, 0.30)", blend: "screen" },
        { x: nw * 0.68, y: nh * 0.48, r: nw * 0.26, col: "rgba(147, 51, 234, 0.28)", blend: "screen" },
        
        // Center Diagonal Tendril
        { x: nw * 0.55, y: nh * 0.55, r: nw * 0.32, col: "rgba(2, 132, 199, 0.25)", blend: "screen" },
        { x: nw * 0.48, y: nh * 0.62, r: nw * 0.28, col: "rgba(99, 102, 241, 0.22)", blend: "screen" },

        // Lower-Left Basin (Deep Electric Blue, Cyan & Purple Filament)
        { x: nw * 0.12, y: nh * 0.72, r: nw * 0.42, col: "rgba(30, 64, 175, 0.38)", blend: "screen" },
        { x: nw * 0.16, y: nh * 0.80, r: nw * 0.32, col: "rgba(56, 189, 248, 0.32)", blend: "screen" },
        { x: nw * 0.08, y: nh * 0.86, r: nw * 0.30, col: "rgba(126, 34, 206, 0.35)", blend: "screen" },
        { x: nw * 0.22, y: nh * 0.88, r: nw * 0.25, col: "rgba(168, 85, 247, 0.28)", blend: "screen" },
        { x: nw * 0.05, y: nh * 0.62, r: nw * 0.28, col: "rgba(14, 165, 233, 0.26)", blend: "screen" },

        // Stellar Nursery Bright Cores (high-density ionization knots)
        { x: nw * 0.84, y: nh * 0.20, r: nw * 0.12, col: "rgba(224, 242, 254, 0.50)", blend: "lighter" },
        { x: nw * 0.78, y: nh * 0.26, r: nw * 0.09, col: "rgba(192, 132, 252, 0.45)", blend: "lighter" },
        { x: nw * 0.15, y: nh * 0.76, r: nw * 0.14, col: "rgba(186, 230, 253, 0.42)", blend: "lighter" },
        { x: nw * 0.10, y: nh * 0.84, r: nw * 0.08, col: "rgba(216, 180, 254, 0.48)", blend: "lighter" },

        // Soft Ambient Cosmic Dark Navy Base Fill
        { x: nw * 0.50, y: nh * 0.50, r: nw * 0.75, col: "rgba(3, 7, 20, 0.75)", blend: "source-over" },
      ];

      for (const node of gasNodes) {
        nCtx.save();
        nCtx.globalCompositeOperation = node.blend as GlobalCompositeOperation;
        const grad = nCtx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r);
        grad.addColorStop(0, node.col);
        grad.addColorStop(0.45, node.col.replace(/[\d\.]+\)$/, "0.12)"));
        grad.addColorStop(0.8, node.col.replace(/[\d\.]+\)$/, "0.03)"));
        grad.addColorStop(1, "transparent");
        nCtx.fillStyle = grad;
        nCtx.beginPath();
        nCtx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        nCtx.fill();
        nCtx.restore();
      }
    };

    // Spawn periodic shooting star
    const spawnShootingStar = () => {
      const angle = (35 + Math.random() * 20) * (Math.PI / 180); // Diagonal downward
      const speed = 14 + Math.random() * 10;
      const startX = Math.random() * width * 0.8;
      const startY = Math.random() * height * 0.45;
      const maxLife = 40 + Math.random() * 35;

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 120 + Math.random() * 140,
        opacity: 0,
        maxOpacity: 0.75 + Math.random() * 0.25,
        life: 0,
        maxLife,
        thickness: 1.2 + Math.random() * 1.4,
        color: Math.random() < 0.65 ? "#38bdf8" : "#c084fc",
      });
    };

    // --- Render Planets ---
    const drawPlanets = (time: number) => {
      // 1. Top-Left Planet: Cratered Moon in Crescent Phase
      const moonX = width * 0.085;
      const moonY = height * 0.11;
      const moonR = Math.min(width, height) * 0.085;

      ctx.save();
      // Moon Body Base (Dark charcoal sphere)
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = "#0c101c";
      ctx.fill();

      // Moon Surface Texture & Craters
      const craters = [
        { dx: -0.3, dy: -0.25, r: 0.18 },
        { dx: -0.45, dy: 0.05, r: 0.14 },
        { dx: -0.15, dy: -0.42, r: 0.12 },
        { dx: -0.22, dy: 0.32, r: 0.16 },
        { dx: 0.05, dy: -0.1, r: 0.22 },
        { dx: 0.25, dy: 0.15, r: 0.15 },
        { dx: -0.05, dy: 0.4, r: 0.11 },
      ];

      for (const cr of craters) {
        const cx = moonX + cr.dx * moonR;
        const cy = moonY + cr.dy * moonR;
        const rad = cr.r * moonR;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(4, 7, 14, 0.65)";
        ctx.fill();
        // Lit crater rim edge
        ctx.strokeStyle = "rgba(147, 197, 253, 0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Crescent Phase Lighting: Luminous silver-blue rim on upper-left
      const moonGlow = ctx.createRadialGradient(
        moonX - moonR * 0.45,
        moonY - moonR * 0.45,
        moonR * 0.1,
        moonX,
        moonY,
        moonR * 1.05
      );
      moonGlow.addColorStop(0, "rgba(224, 242, 254, 0.85)");
      moonGlow.addColorStop(0.35, "rgba(147, 197, 253, 0.4)");
      moonGlow.addColorStop(0.65, "rgba(29, 78, 216, 0.12)");
      moonGlow.addColorStop(1, "rgba(1, 2, 6, 0.95)");

      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = moonGlow;
      ctx.fill();

      // Outer delicate atmospheric rim highlight
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, Math.PI * 0.6, Math.PI * 1.75);
      ctx.strokeStyle = "rgba(224, 242, 254, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Smaller companion satellite nearby (like in reference image)
      const satX = moonX + moonR * 1.45;
      const satY = moonY + moonR * 0.85;
      const satR = moonR * 0.14;
      ctx.beginPath();
      ctx.arc(satX, satY, satR, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      const satGlow = ctx.createRadialGradient(
        satX - satR * 0.3,
        satY - satR * 0.3,
        1,
        satX,
        satY,
        satR
      );
      satGlow.addColorStop(0, "rgba(224, 242, 254, 0.7)");
      satGlow.addColorStop(1, "rgba(1, 2, 6, 0.95)");
      ctx.fillStyle = satGlow;
      ctx.fill();
      ctx.restore();

      // 2. Bottom-Right Planet: Majestic Glowing Blue Ocean World
      const planetX = width * 1.02;
      const planetY = height * 1.02;
      const planetR = Math.min(width, height) * 0.32;

      ctx.save();
      // Planet Body (Deep blue oceans with continent/cloud swirls)
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
      const planetBase = ctx.createRadialGradient(
        planetX - planetR * 0.55,
        planetY - planetR * 0.55,
        planetR * 0.1,
        planetX,
        planetY,
        planetR
      );
      planetBase.addColorStop(0, "rgba(56, 189, 248, 0.9)");
      planetBase.addColorStop(0.35, "rgba(37, 99, 235, 0.75)");
      planetBase.addColorStop(0.7, "rgba(15, 23, 42, 0.85)");
      planetBase.addColorStop(1, "#010309");
      ctx.fillStyle = planetBase;
      ctx.fill();

      // Cloud swirl bands (rotated gently with time)
      ctx.save();
      ctx.translate(planetX, planetY);
      ctx.rotate(time * 0.00008);
      ctx.beginPath();
      ctx.arc(0, 0, planetR * 0.98, 0, Math.PI * 2);
      ctx.clip();

      const swirlGrad = ctx.createLinearGradient(-planetR, -planetR, planetR, planetR);
      swirlGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      swirlGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.25)");
      swirlGrad.addColorStop(0.6, "transparent");
      swirlGrad.addColorStop(0.9, "rgba(255, 255, 255, 0.08)");
      ctx.fillStyle = swirlGrad;
      ctx.fillRect(-planetR, -planetR, planetR * 2, planetR * 2);
      ctx.restore();

      // Brilliant Atmospheric Limb Scatter Halo (Rayleigh scattering rim)
      const atmoGrad = ctx.createRadialGradient(
        planetX,
        planetY,
        planetR * 0.95,
        planetX,
        planetY,
        planetR * 1.18
      );
      atmoGrad.addColorStop(0, "rgba(56, 189, 248, 0.75)");
      atmoGrad.addColorStop(0.4, "rgba(14, 165, 233, 0.35)");
      atmoGrad.addColorStop(0.75, "rgba(37, 99, 235, 0.12)");
      atmoGrad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(planetX, planetY, planetR * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = atmoGrad;
      ctx.fill();

      // Atmospheric edge highlight arc
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetR, Math.PI * 0.9, Math.PI * 1.6);
      ctx.strokeStyle = "rgba(224, 242, 254, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    };

    // --- Render Asteroids ---
    const drawAsteroids = () => {
      ctx.save();
      for (const ast of asteroids) {
        ast.x += ast.vx;
        ast.y += ast.vy;
        ast.rotation += ast.rotSpeed;

        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rotation);

        ctx.beginPath();
        for (let i = 0; i < ast.vertices.length; i++) {
          const v = ast.vertices[i];
          if (i === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();

        // Shaded dark rock body
        ctx.fillStyle = ast.baseShade;
        ctx.fill();

        // Cosmic cyan rim highlight on illuminated facets
        ctx.strokeStyle = ast.highlightShade;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();
    };

    // --- Render Interactive Cursor Spotlight & Halos ---
    const drawCursorLighting = (mx: number, my: number) => {
      if (mx < -500 || my < -500) return;

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // 1. Broad Outer Ambient Halo (Deep cosmic blue wash ~450px)
      const outerHalo = ctx.createRadialGradient(mx, my, 80, mx, my, 480);
      outerHalo.addColorStop(0, "rgba(30, 64, 175, 0.14)");
      outerHalo.addColorStop(0.4, "rgba(37, 99, 235, 0.08)");
      outerHalo.addColorStop(0.75, "rgba(14, 165, 233, 0.03)");
      outerHalo.addColorStop(1, "transparent");
      ctx.fillStyle = outerHalo;
      ctx.beginPath();
      ctx.arc(mx, my, 480, 0, Math.PI * 2);
      ctx.fill();

      // 2. Mid Electric-Blue Halo (Luminous azure ~160px)
      const midHalo = ctx.createRadialGradient(mx, my, 25, mx, my, 180);
      midHalo.addColorStop(0, "rgba(56, 189, 248, 0.28)");
      midHalo.addColorStop(0.45, "rgba(37, 99, 235, 0.18)");
      midHalo.addColorStop(0.8, "rgba(29, 78, 216, 0.06)");
      midHalo.addColorStop(1, "transparent");
      ctx.fillStyle = midHalo;
      ctx.beginPath();
      ctx.arc(mx, my, 180, 0, Math.PI * 2);
      ctx.fill();

      // 3. Inner Radiant Halo (Vibrant cyan-blue core ~60px)
      const innerHalo = ctx.createRadialGradient(mx, my, 4, mx, my, 65);
      innerHalo.addColorStop(0, "rgba(224, 242, 254, 0.65)");
      innerHalo.addColorStop(0.3, "rgba(56, 189, 248, 0.45)");
      innerHalo.addColorStop(0.7, "rgba(37, 99, 235, 0.20)");
      innerHalo.addColorStop(1, "transparent");
      ctx.fillStyle = innerHalo;
      ctx.beginPath();
      ctx.arc(mx, my, 65, 0, Math.PI * 2);
      ctx.fill();

      // 4. Brilliant Core Spotlight Point (Intense white-cyan center ~14px)
      const corePoint = ctx.createRadialGradient(mx, my, 0, mx, my, 16);
      corePoint.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      corePoint.addColorStop(0.4, "rgba(56, 189, 248, 0.85)");
      corePoint.addColorStop(1, "transparent");
      ctx.fillStyle = corePoint;
      ctx.beginPath();
      ctx.arc(mx, my, 16, 0, Math.PI * 2);
      ctx.fill();

      // 5. Delicate 4-point celestial cursor flare beams (cross glint)
      ctx.strokeStyle = "rgba(186, 230, 253, 0.65)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Horizontal flare beam
      ctx.moveTo(mx - 22, my);
      ctx.lineTo(mx + 22, my);
      // Vertical flare beam
      ctx.moveTo(mx, my - 22);
      ctx.lineTo(mx, my + 22);
      ctx.stroke();

      ctx.restore();
    };

    // --- Main Animation Loop (60 FPS) ---
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // 1. Mouse Lerp Interpolation
      const mouse = mouseRef.current;
      const ease = 0.12; // Smooth responsive glide
      mouse.currentX += (mouse.targetX - mouse.currentX) * ease;
      mouse.currentY += (mouse.targetY - mouse.currentY) * ease;

      // 2. Clear canvas to deep space void
      ctx.fillStyle = "#010206";
      ctx.fillRect(0, 0, width, height);

      // 3. Draw Volumetric Nebulae (with subtle breathing and slow rotation)
      if (nebulaCanvas) {
        ctx.save();
        ctx.globalAlpha = 0.92;
        // Breathing pulse: very slow harmonic
        const breath = 1 + Math.sin(currentTime * 0.0004) * 0.025;
        const nw = width * breath;
        const nh = height * breath;
        const nx = (width - nw) * 0.5;
        const ny = (height - nh) * 0.5;

        ctx.drawImage(nebulaCanvas, nx, ny, nw, nh);
        ctx.restore();
      }

      // 4. Draw Celestial Planets & Moon
      drawPlanets(currentTime);

      // 5. Draw Asteroid Field
      drawAsteroids();

      // 6. Draw Stars & Diffraction Cross Spikes
      const mx = mouse.currentX;
      const my = mouse.currentY;
      const hoverRadius = mouse.hoverRadius;

      ctx.save();
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Twinkle calculation
        star.twinklePhase += star.twinkleSpeed * (reducedMotion ? 0 : 0.02);
        const sineTwinkle = (Math.sin(star.twinklePhase) + 1) * 0.5;
        let dynamicAlpha = star.baseAlpha * (0.45 + sineTwinkle * 0.55);
        let dynamicRadius = star.baseRadius;

        // Proximity calculation to cursor spotlight
        const dx = star.x - mx;
        const dy = star.y - my;
        const distSq = dx * dx + dy * dy;
        const rSq = hoverRadius * hoverRadius;

        if (distSq < rSq) {
          const prox = 1 - Math.sqrt(distSq) / hoverRadius;
          dynamicAlpha = Math.min(1.0, dynamicAlpha + prox * 0.55);
          dynamicRadius += prox * 0.8;
        }

        ctx.fillStyle = `${star.color}${dynamicAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fill();

        // Landmark diffraction cross-spike stars
        if (star.hasSpikes && star.spikeLength) {
          const sLen = star.spikeLength * (0.8 + sineTwinkle * 0.3);
          ctx.strokeStyle = `rgba(186, 230, 253, ${dynamicAlpha * 0.7})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(star.x - sLen, star.y);
          ctx.lineTo(star.x + sLen, star.y);
          ctx.moveTo(star.x, star.y - sLen);
          ctx.lineTo(star.x, star.y + sLen);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 7. Draw Drifting Cosmic Micro-Dust Particles
      ctx.save();
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges smoothly
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 8. Update & Draw Shooting Stars (Meteors)
      meteorTimer += delta;
      if (meteorTimer > nextMeteorDelay) {
        meteorTimer = 0;
        nextMeteorDelay = 2200 + Math.random() * 3200;
        spawnShootingStar();
      }

      ctx.save();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const m = shootingStars[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        // Fade in quickly, then fade out
        if (m.life < 8) {
          m.opacity = (m.life / 8) * m.maxOpacity;
        } else {
          m.opacity = Math.max(0, (1 - m.life / m.maxLife) * m.maxOpacity);
        }

        const tailX = m.x - (m.vx / 14) * m.length;
        const tailY = m.y - (m.vy / 14) * m.length;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.7, `${m.color}66`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${m.opacity})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Glowing nucleus head
        ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (m.life >= m.maxLife) {
          shootingStars.splice(i, 1);
        }
      }
      ctx.restore();

      // 9. Draw Interactive Cursor Spotlight & Concentric Halos
      drawCursorLighting(mouse.currentX, mouse.currentY);

      animId = requestAnimationFrame(animate);
    };

    // --- Event Listeners ---
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.isActive = true;

      // Update global CSS variables for card edge highlights
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = e.touches[0].clientX;
        mouseRef.current.targetY = e.touches[0].clientY;
        mouseRef.current.isActive = true;
      }
    };

    const handleResize = () => {
      initUniverse();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", handleResize);

    initUniverse();
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}
