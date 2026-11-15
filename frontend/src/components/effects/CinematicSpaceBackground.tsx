"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  layer: number; // 0 = distant, 1 = mid, 2 = near
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

/**
 * CinematicSpaceBackground
 * Multilayer space atmosphere with:
 * - 3-depth parallax starfield (twinkling, multiple sizes and astronomical tints)
 * - Drifting micro-particles mimicking space dust / zero-g motes
 * - Deep navy and electric-blue volumetric nebula gradients with slow organic drift
 * - Smooth continuous requestAnimationFrame loop with reduced-motion support
 */
export function CinematicSpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let particles: Particle[] = [];
    let scrollY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const colors = [
      "rgba(255, 255, 255,", // Pure stellar white
      "rgba(195, 215, 255,", // Blue-white giant
      "rgba(145, 185, 255,", // Deep blue stellar
      "rgba(255, 240, 220,", // Faint warm yellow
    ];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initStars();
    };

    const initStars = () => {
      // Density based on viewport size
      const count = Math.floor((width * height) / 4800);
      stars = [];

      for (let i = 0; i < count; i++) {
        const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.85 ? 1 : 2;
        let radius: number;
        let baseAlpha: number;

        if (layer === 0) {
          radius = Math.random() * 0.7 + 0.3; // Micro distant stars
          baseAlpha = Math.random() * 0.45 + 0.15;
        } else if (layer === 1) {
          radius = Math.random() * 0.9 + 0.7; // Mid-depth stars
          baseAlpha = Math.random() * 0.55 + 0.35;
        } else {
          radius = Math.random() * 1.2 + 1.1; // Prominent stars
          baseAlpha = Math.random() * 0.4 + 0.6;
        }

        const colorBase = colors[Math.floor(Math.random() * colors.length)];

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          baseAlpha,
          twinkleSpeed: Math.random() * 1.5 + 0.5,
          twinklePhase: Math.random() * Math.PI * 2,
          layer,
          color: colorBase,
        });
      }

      // Initialize 45 slow-drifting cosmic dust motes
      particles = [];
      const particleCount = Math.floor(width / 35);
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const createParticle = (): Particle => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.4) * 0.15, // Gentle drift
        vy: (Math.random() - 0.5) * 0.12,
        radius: Math.random() * 1.4 + 0.6,
        alpha: Math.random() * 0.25 + 0.05,
        life: 0,
        maxLife: Math.random() * 400 + 300,
      };
    };

    const handleScroll = () => {
      scrollY = window.scrollY || window.pageYOffset;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / width - 0.5) * 25;
      targetMouseY = (e.clientY / height - 0.5) * 20;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    resize();

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Smooth mouse parallax interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      const timeSec = currentTime * 0.001;

      // 1. Draw Stars across 3 parallax depth layers
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Parallax speed based on depth layer
        const parallaxFactor = (s.layer + 1) * 0.02;
        const scrollFactor = (s.layer + 1) * 0.08;

        const px = (s.x + mouseX * parallaxFactor + width) % width;
        const py = (s.y - scrollY * scrollFactor + height * 10) % height;

        // Twinkling calculation
        let alpha = s.baseAlpha;
        if (!reducedMotion) {
          const wave = Math.sin(timeSec * s.twinkleSpeed + s.twinklePhase);
          alpha = s.baseAlpha * (0.75 + 0.25 * wave);
        }

        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${alpha.toFixed(3)})`;
        ctx.fill();

        // Subtle soft diffraction flare for brightest near stars
        if (s.layer === 2 && s.radius > 1.3) {
          ctx.beginPath();
          ctx.arc(px, py, s.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(43, 75, 255, ${(alpha * 0.18).toFixed(3)})`;
          ctx.fill();
        }
      }

      // 2. Draw Drifting Cosmic Micro-Particles (Space Dust)
      if (!reducedMotion) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          // Wrap bounds or respawn
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          if (p.life > p.maxLife) {
            particles[i] = createParticle();
            continue;
          }

          // Fade in and out
          const lifeProgress = p.life / p.maxLife;
          const currentAlpha = Math.sin(lifeProgress * Math.PI) * p.alpha;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 210, 255, ${currentAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 1: Deep cosmic navy and midnight gradients */}
      <div
        className="absolute inset-0 bg-[#07090E]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 80% 15%, rgba(43, 75, 255, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 15% 55%, rgba(14, 165, 233, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(43, 75, 255, 0.06) 0%, transparent 60%)
          `,
        }}
      />

      {/* Layer 2: Moving Deep Space Nebula Atmosphere */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[850px] h-[850px] rounded-full blur-[140px] pointer-events-none animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(43, 75, 255, 0.09) 0%, rgba(20, 37, 138, 0.04) 50%, transparent 70%)",
          animationDuration: "16s",
        }}
      />

      <div
        className="absolute bottom-[10%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[130px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.04) 0%, rgba(43, 75, 255, 0.03) 45%, transparent 65%)",
        }}
      />

      {/* Layer 3: Canvas for Multi-Layer Parallax Starfield & Space Dust */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-90"
      />

      {/* Layer 4: Subtle Organic Cosmic Grid Texture */}
      <div className="absolute inset-0 monolith-grid pointer-events-none opacity-30" />
    </div>
  );
}

