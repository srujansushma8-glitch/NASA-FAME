"use client";

import { useEffect, useRef } from "react";
import { hero } from "@/content";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { clamp, easeOutCubic, lerp, pinProgress, range } from "@/lib/math";
import { onFrame } from "@/lib/scroll";

/**
 * Microgravity Combustion Flame Hero
 * Full-screen cinematic hero with deep cosmic atmosphere,
 * realistic spherical microgravity flame, and precision chamber aperture.
 *
 *   0.00 – 0.18  cosmic dust / combustion particulate veil drifts off the lens
 *   0.04 – 0.50  the spherical microgravity flame rises from behind the horizon
 *   0.10 – 0.50  MICROGRAVITY COMBUSTION title resolves with tracking & blur
 *   0.28 – 0.60  the optical chamber aperture closes in with foreground depth
 *   0.70 – 1.00  ground apron tilts upward and swallows the frame to black void
 */

const STAGE_VH = 440;

type Mote = { x: number; y: number; r: number; s: number; a: number };

export function FlameHero() {
  const rootRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const flameLayerRef = useRef<HTMLDivElement>(null);
  const starsLayerRef = useRef<HTMLDivElement>(null);
  const horizonLayerRef = useRef<HTMLDivElement>(null);
  const chamberRimRef = useRef<HTMLDivElement>(null);
  const groundLayerRef = useRef<HTMLDivElement>(null);

  const elevRef = useRef<HTMLSpanElement>(null);
  const clockRef = useRef<HTMLParagraphElement>(null);

  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  // Dust canvas sizing
  useEffect(() => {
    const c = dustRef.current;
    if (!c) return;
    const sync = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = dustRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let seed = 17;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const motes: Mote[] = Array.from({ length: 140 }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.6,
      s: 0.3 + rand(),
      a: 0.2 + rand() * 0.6,
    }));
    let lastP = -1;
    let lastTime = 0;

    return onFrame((time) => {
      const dt = lastTime ? Math.min(0.1, (time - lastTime) / 1000) : 1 / 60;
      lastTime = time;
      const root = rootRef.current;
      if (!root) return;
      const { p, rect } = pinProgress(root);
      if (rect.bottom < 0) return;

      // Particulate dust drifts every frame while visible
      const veil = 1 - range(p, 0, 0.18);
      if (veil > 0.001) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const dpr = canvas.width / Math.max(1, w);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#dfe6f2";
        for (const m of motes) {
          if (!reducedRef.current) {
            m.x += 0.006 * m.s * dt;
            m.y -= 0.004 * m.s * dt;
            if (m.x > 1) m.x -= 1;
            if (m.y < 0) m.y += 1;
          }
          ctx.globalAlpha = m.a * veil;
          ctx.beginPath();
          ctx.arc(m.x * w, (m.y - p * 0.6) * h, m.r * (1 + p * 4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const exit = range(p, 0.7, 1);
      const settle = easeOutCubic(range(p, 0, 0.5));

      // Dust veil clears upward
      if (veilRef.current) {
        veilRef.current.style.opacity = String(veil);
        veilRef.current.style.transform = `translate3d(0, ${-range(p, 0, 0.18) * 24}vh, 0) scale(${
          1 + range(p, 0, 0.18) * 0.25
        })`;
      }
      canvas.style.opacity = String(veil);

      // Deep cosmos stars layer
      if (starsLayerRef.current) {
        const y = lerp(0, -6, p);
        const s = lerp(1.14, 1, settle);
        starsLayerRef.current.style.transform = `translate3d(0, ${y}vh, 0) scale(${s})`;
      }

      // Spherical Microgravity Flame: rises smoothly from behind horizon
      const rise = easeOutCubic(range(p, 0.04, 0.5));
      if (flameLayerRef.current) {
        const y = lerp(34, 0, rise) - exit * 12;
        const scale = lerp(0.92, 1, rise);
        flameLayerRef.current.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
      }

      // Chamber horizon
      if (horizonLayerRef.current) {
        const y = lerp(9, 0, settle) - exit * 26;
        horizonLayerRef.current.style.transform = `translate3d(0, ${y}vh, 0)`;
      }

      // Chamber aperture rim
      const rim = easeOutCubic(range(p, 0.28, 0.58));
      if (chamberRimRef.current) {
        const y = -exit * 44;
        const scale = lerp(1.6, 1, rim);
        chamberRimRef.current.style.transform = `translate3d(0, ${y}vh, 0) scale(${scale})`;
        chamberRimRef.current.style.opacity = String(rim);
      }

      // Ground apron swallows to black
      const ground = easeOutCubic(range(p, 0.34, 0.6));
      if (groundLayerRef.current) {
        const y = lerp(36, 0, ground) - exit * 78;
        groundLayerRef.current.style.transform = `translate3d(0, ${y}vh, 0)`;
      }

      // Display Typography resolves
      const tIn = easeOutCubic(range(p, 0.08, 0.24));
      const tOut = range(p, 0.42, 0.52);
      const title = titleRef.current;
      if (title) {
        title.style.opacity = String(tIn * (1 - tOut));
        title.style.letterSpacing = `${lerp(0.55, 0.22, tIn)}em`;
        title.style.transform = `translate3d(0, ${-p * 6}vh, 0)`;
        title.style.filter = tIn < 0.99 ? `blur(${(1 - tIn) * 10}px)` : "";
      }

      // Telemetry HUD in corners
      if (hudRef.current) {
        hudRef.current.style.opacity = String(
          range(p, 0.02, 0.1) * (1 - range(p, 0.62, 0.72))
        );
      }
      const secs = p * 5400;
      if (clockRef.current) {
        clockRef.current.textContent = `T+ ${String(Math.floor(secs / 3600)).padStart(2, "0")}:${String(
          Math.floor((secs % 3600) / 60)
        ).padStart(2, "0")}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
      }
      if (elevRef.current) {
        elevRef.current.textContent = `${(rise * 12.4).toFixed(1)}°`;
      }
    });
  }, []);

  return (
    <section
      id="top"
      ref={rootRef}
      aria-label="Microgravity Combustion Flame Hero"
      className="relative"
      style={{ height: `${STAGE_VH}svh` }}
    >
      <div className="sticky top-0 h-screen-s overflow-hidden bg-void">
        {/* ========================================================================= */}
        {/* LAYER 1: Deep Cosmos Starfield & Nebula Glow                              */}
        {/* ========================================================================= */}
        <div ref={starsLayerRef} className="absolute inset-0 size-full will-change-transform">
          <svg className="size-full" preserveAspectRatio="none">
            <defs>
              <radialGradient id="cosmos-nebula" cx="50%" cy="45%" r="65%">
                <stop offset="0%" stopColor="#0c172e" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#070b14" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#05070c" stopOpacity="1" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#cosmos-nebula)" />
            {Array.from({ length: 90 }, (_, i) => {
              const cx = ((i * 137.5) % 100) + "%";
              const cy = ((i * 93.1) % 90) + "%";
              const r = i % 11 === 0 ? 1.6 : i % 5 === 0 ? 1.1 : 0.65;
              const op = 0.2 + ((i * 29) % 70) / 100;
              return <circle key={i} cx={cx} cy={cy} r={r} fill="#ffffff" opacity={op} />;
            })}
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 2: Central Dominant Visual Subject — Realistic Spherical 0g Flame   */}
        {/* ========================================================================= */}
        <div
          ref={flameLayerRef}
          className="absolute inset-0 flex items-center justify-center will-change-transform pointer-events-none"
        >
          <div className="relative size-[min(80vw,540px)] flex items-center justify-center">
            {/* Ambient chemiluminescence halo */}
            <div
              className="absolute inset-0 rounded-full blur-[80px] opacity-75 animate-pulse"
              style={{
                background:
                  "radial-gradient(circle, rgba(111,182,255,0.45) 0%, rgba(255,112,41,0.3) 45%, transparent 75%)",
                animationDuration: "4s",
              }}
            />

            {/* Scientific Spherical Microgravity Flame SVG */}
            <svg viewBox="0 0 500 500" className="size-full drop-shadow-[0_0_50px_rgba(111,182,255,0.5)]">
              <defs>
                <radialGradient id="radical-zone" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="18%" stopColor="#cce4ff" stopOpacity="0.95" />
                  <stop offset="38%" stopColor="#6fb6ff" stopOpacity="0.9" />
                  <stop offset="58%" stopColor="#38bdf8" stopOpacity="0.75" />
                  <stop offset="78%" stopColor="#ffaa40" stopOpacity="0.6" />
                  <stop offset="92%" stopColor="#ff7029" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ff7029" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="soot-shell-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="76%" stopColor="transparent" />
                  <stop offset="86%" stopColor="#ff7029" stopOpacity="0.35" />
                  <stop offset="94%" stopColor="#78350f" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>

                <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="30%" stopColor="#6fb6ff" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#087cff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              <circle cx="250" cy="250" r="236" fill="none" stroke="#6fb6ff" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.3" />
              <circle cx="250" cy="250" r="210" fill="none" stroke="#ffaa40" strokeWidth="0.75" strokeDasharray="3 4" opacity="0.4" />
              <circle cx="250" cy="250" r="182" fill="none" stroke="#ff7029" strokeWidth="0.75" opacity="0.5" />

              <circle cx="250" cy="250" r="204" fill="url(#soot-shell-grad)" stroke="#ff7029" strokeWidth="1.2" strokeOpacity="0.5" />
              <circle cx="250" cy="250" r="162" fill="url(#radical-zone)" />

              <circle cx="250" cy="250" r="64" fill="url(#core-glow)" filter="blur(2px)" />
              <circle cx="250" cy="250" r="22" fill="#ffffff" opacity="0.95" />

              {Array.from({ length: 18 }, (_, k) => {
                const angle = (k * 20 * Math.PI) / 180;
                const r = 180 + ((k * 31) % 40);
                const px = 250 + Math.cos(angle) * r;
                const py = 250 + Math.sin(angle) * r;
                return (
                  <circle
                    key={k}
                    cx={px}
                    cy={py}
                    r={k % 3 === 0 ? 1.8 : 1.2}
                    fill={k % 2 === 0 ? "#6fb6ff" : "#ffaa40"}
                    opacity={0.7}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 3: Chamber Optical Horizon                                          */}
        {/* ========================================================================= */}
        <div
          ref={horizonLayerRef}
          className="absolute inset-0 pointer-events-none will-change-transform flex flex-col justify-end"
        >
          <svg viewBox="0 0 1440 380" className="w-full h-auto text-void" preserveAspectRatio="none">
            <defs>
              <linearGradient id="horizon-grade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#121826" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#0b0f18" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#05070c" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d="M0,180 C360,110 1080,110 1440,180 L1440,380 L0,380 Z"
              fill="url(#horizon-grade)"
            />
            <path
              d="M0,180 C360,110 1080,110 1440,180"
              fill="none"
              stroke="#6fb6ff"
              strokeWidth="1.2"
              strokeOpacity="0.35"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 4: Display Typography                                               */}
        {/* ========================================================================= */}
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-x-0 top-[24%] text-center md:top-[28%] z-20"
          style={{ opacity: 0 }}
        >
          <div className="space-y-1">
            <h1
              className="font-display text-hero text-white [text-shadow:0_4px_40px_rgb(0_0_0/0.8)]"
              style={{ marginRight: "-0.22em" }}
            >
              {hero.titleMain}
            </h1>
            <h2
              className="font-display text-[clamp(1.5rem,5.5vw,5rem)] tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-earth via-sunlit to-flame"
              style={{ marginRight: "-0.2em" }}
            >
              {hero.titleSub}
            </h2>
          </div>
          <p className="mt-5 font-mono text-label text-regolith/80 uppercase tracking-[0.24em]">
            {hero.kicker}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 5: ISS CIR/ACME Optical Observation Chamber Aperture                */}
        {/* ========================================================================= */}
        <div
          ref={chamberRimRef}
          className="pointer-events-none absolute inset-0 size-full will-change-transform z-20"
        >
          <svg viewBox="0 0 1440 900" className="size-full" preserveAspectRatio="none">
            <defs>
              <mask id="chamber-mask">
                <rect width="100%" height="100%" fill="#fff" />
                <ellipse cx="720" cy="440" rx="580" ry="340" fill="#000" />
              </mask>
              <linearGradient id="chamber-metal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f1624" />
                <stop offset="50%" stopColor="#080c14" />
                <stop offset="100%" stopColor="#05070c" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#chamber-metal)" mask="url(#chamber-mask)" />
            <ellipse
              cx="720"
              cy="440"
              rx="580"
              ry="340"
              fill="none"
              stroke="#8b909b"
              strokeWidth="1.5"
              strokeOpacity="0.25"
            />
            <ellipse
              cx="720"
              cy="440"
              rx="575"
              ry="335"
              fill="none"
              stroke="#6fb6ff"
              strokeWidth="0.75"
              strokeDasharray="6 12"
              strokeOpacity="0.3"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* LAYER 6: Ground Black Apron                                               */}
        {/* ========================================================================= */}
        <div
          ref={groundLayerRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 will-change-transform z-30"
        >
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void via-void/90 to-transparent" />
          <div className="absolute inset-x-0 top-full h-[120vh] bg-void" />
        </div>

        {/* ========================================================================= */}
        {/* LAYER 7: Cosmic Dust Particle Veil                                        */}
        {/* ========================================================================= */}
        <div
          ref={veilRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-40"
          style={{
            background:
              "radial-gradient(60% 50% at 30% 40%, rgba(170,184,210,0.55), transparent 70%), radial-gradient(50% 60% at 75% 60%, rgba(120,140,180,0.5), transparent 70%), radial-gradient(80% 80% at 50% 50%, rgba(20,26,40,0.85), rgba(5,7,12,0.95))",
          }}
        >
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
            <p className="font-mono text-label text-regolith/80 uppercase">{hero.kicker}</p>
            <p
              className="mt-3 font-display text-[0.8125rem] tracking-[0.5em] text-white/90 uppercase"
              style={{ marginRight: "-0.5em" }}
            >
              Scroll to clear the dust
            </p>
            <span
              aria-hidden="true"
              className="mt-6 inline-block animate-bounce text-regolith/70 motion-reduce:animate-none"
            >
              ↓
            </span>
          </div>
        </div>
        <canvas
          ref={dustRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full z-40"
        />

        {/* ========================================================================= */}
        {/* LAYER 8: Scientific Telemetry Corner HUD                                  */}
        {/* ========================================================================= */}
        <div
          ref={hudRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 font-mono text-[0.625rem] tracking-[0.14em] text-regolith/75 uppercase sm:inset-6 md:text-label z-50"
          style={{ opacity: 0 }}
        >
          <div className="brackets absolute inset-0 text-regolith/40" />

          <div className="absolute top-16 left-3 space-y-1 md:top-20 md:left-4">
            <p className="text-white font-bold">{hero.labels.telemetry}</p>
            <p className="text-regolith/50">{hero.labels.facility}</p>
          </div>

          <div className="absolute top-16 right-3 space-y-1 text-right md:top-20 md:right-4">
            <p>
              {hero.labels.gravity} · <span ref={elevRef} className="text-earth">0.0°</span>
            </p>
            <p className="text-regolith/50">{hero.labels.regime}</p>
          </div>

          <div className="absolute bottom-3 left-3 space-y-0.5 md:bottom-4 md:left-4">
            <p className="text-emerald-400 font-semibold">{hero.labels.status}</p>
            <p className="text-regolith/50">{hero.labels.coordinates}</p>
          </div>

          <div className="absolute right-3 bottom-3 text-right space-y-0.5 md:right-4 md:bottom-4">
            <p ref={clockRef} className="tabular-nums text-white">T+ 00:00:00</p>
            <p className="text-regolith/60">
              {hero.labels.scroll} <span className="inline-block animate-bounce motion-reduce:animate-none">↓</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

