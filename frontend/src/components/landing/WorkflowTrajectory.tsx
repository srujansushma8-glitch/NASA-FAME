"use client";

import { useEffect, useRef, useState } from "react";
import { trajectory } from "@/content";
import { clamp, easeOutCubic, pinProgress, range } from "@/lib/math";
import { onFrame } from "@/lib/scroll";

/**
 * Combustion Research Workflow — Drawn as you scroll.
 * Section pins for 380svh while the four legs of the experiment workflow
 * ink themselves one after another, a sensor capsule riding the leg being drawn;
 * the burn altitude/distance counter ticks up to 384,400 mm.
 */

const SECTION_VH = 380;
const WINDOW = [0.06, 0.92] as const;
const DISTANCE = 384400;

const EARTH = { cx: 230, cy: 320, r: 92 };
const MOON = { cx: 985, cy: 300, r: 46 };

const LEGS = [
  // Chamber preparation & atmospheric 1g orbit
  `M${EARTH.cx} ${EARTH.cy - 128} a128 128 0 1 1 -0.1 0 a128 128 0 0 1 106 57`,
  // Freefall deployment & microgravity coast
  `M${EARTH.cx + 106} ${EARTH.cy - 71} C 520 40, 820 70, ${MOON.cx - 20} ${MOON.cy - 84}`,
  // Spherical Burke-Schumann equilibrium envelope
  `M${MOON.cx - 20} ${MOON.cy - 84} a86 86 0 1 1 -0.1 0.2 a86 86 0 0 1 20 1`,
  // Radiative extinction & soot capture
  `M${MOON.cx} ${MOON.cy - 86} Q ${MOON.cx + 40} ${MOON.cy - 70} ${MOON.cx + 30} ${MOON.cy - 36}`,
];

export function WorkflowTrajectory() {
  const rootRef = useRef<HTMLElement>(null);
  const legRefs = useRef<SVGPathElement[]>([]);
  const capsuleRef = useRef<SVGGElement>(null);
  const kmRef = useRef<HTMLSpanElement>(null);
  const [leg, setLeg] = useState(0);

  useEffect(() => {
    let lastP = -1;
    let current = 0;
    return onFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const { p, rect, vh } = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const u = range(p, ...WINDOW) * LEGS.length;
      const s = clamp(Math.floor(u), 0, LEGS.length - 1);
      if (s !== current) {
        current = s;
        setLeg(s);
      }
      legRefs.current.forEach((path, i) => {
        if (!path) return;
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        if (i === s && capsuleRef.current) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          capsuleRef.current.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        }
      });
      const coast = easeOutCubic(clamp(u - 1));
      if (kmRef.current) {
        kmRef.current.textContent = Math.round(coast * DISTANCE).toLocaleString("en-US");
      }
    });
  }, []);

  const current = trajectory.legs[leg];

  return (
    <section
      ref={rootRef}
      id="trajectory"
      aria-labelledby="trajectory-title"
      className="relative bg-void"
      style={{ height: `${SECTION_VH}svh` }}
    >
      <div className="sticky top-0 flex h-screen-s flex-col overflow-hidden px-4 pt-20 pb-8 sm:px-6 md:px-[6vw] md:pt-24">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-label text-earth uppercase">{trajectory.eyebrow}</p>
            <h2
              id="trajectory-title"
              className="mt-3 max-w-[20ch] font-display text-display text-white"
            >
              {trajectory.heading}
            </h2>
          </div>
          <p className="font-mono text-label text-regolith/60 uppercase" aria-live="off">
            Flight altitude · burn range <span ref={kmRef} className="text-white tabular-nums">0</span> mm
          </p>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center">
          <svg
            viewBox="0 0 1200 600"
            className="h-auto max-h-full w-full"
            role="img"
            aria-label="Combustion research trajectory: From 1g buoyancy to 0g molecular diffusion across 4 phases."
          >
            <defs>
              <radialGradient id="earth-glow">
                <stop offset="0.6" stopColor="#6fb6ff" stopOpacity="0.4" />
                <stop offset="0.85" stopColor="#ff7029" stopOpacity="0.2" />
                <stop offset="1" stopColor="#6fb6ff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="target-sphere" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#6fb6ff" />
                <stop offset="80%" stopColor="#087cff" />
                <stop offset="100%" stopColor="#05070c" />
              </radialGradient>
            </defs>

            {/* Faint cosmic star field */}
            <g fill="#fff">
              {Array.from({ length: 70 }, (_, i) => (
                <circle
                  key={i}
                  cx={(i * 173) % 1200}
                  cy={(i * 97) % 600}
                  r={i % 7 === 0 ? 1.4 : 0.7}
                  opacity={0.15 + ((i * 37) % 50) / 100}
                />
              ))}
            </g>

            {/* Terrestrial 1g Chamber Station */}
            <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r * 1.15} fill="url(#earth-glow)" />
            <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} fill="#0d1829" stroke="#6fb6ff" strokeWidth="1" strokeOpacity="0.6" />
            <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r * 0.7} fill="none" stroke="#6fb6ff" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={EARTH.cx} cy={EARTH.cy} r={6} fill="#6fb6ff" />

            {/* Microgravity 0g ISS Flight Station */}
            <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r} fill="url(#target-sphere)" stroke="#ff7029" strokeWidth="1" strokeOpacity="0.6" />
            <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r * 1.3} fill="none" stroke="#ff7029" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />

            {/* Ghost routes */}
            {LEGS.map((d, i) => (
              <path
                key={`g${i}`}
                d={d}
                fill="none"
                stroke="#fff"
                strokeOpacity="0.08"
                strokeWidth="1.5"
                strokeDasharray="3 6"
              />
            ))}

            {/* Inked legs */}
            {LEGS.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  if (el) legRefs.current[i] = el;
                }}
                d={d}
                pathLength={1}
                fill="none"
                stroke={i === 1 ? "#6fb6ff" : i === 2 ? "#ff7029" : "#f2e6c9"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 1"
                strokeDashoffset="1"
              />
            ))}

            {/* In-flight Sensor Probe / Capsule */}
            <g ref={capsuleRef} transform={`translate(${EARTH.cx} ${EARTH.cy - 128})`}>
              <circle r="12" fill="#ff7029" opacity="0.3" />
              <circle r="7" fill="#6fb6ff" opacity="0.4" />
              <circle r="3.5" fill="#fff" />
            </g>

            {/* Telemetry Labels */}
            <g fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="2" fill="#8b909b">
              <text x={EARTH.cx} y={EARTH.cy + EARTH.r + 58} textAnchor="middle">
                TERRESTRIAL 1G
              </text>
              <text x={MOON.cx} y={MOON.cy + MOON.r + 70} textAnchor="middle">
                ISS ORBIT 0G
              </text>
            </g>
          </svg>
        </div>

        {/* Current leg narrative card */}
        <div className="grid gap-4 border-t border-white/10 pt-5 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-10">
          <p className="font-mono text-label text-earth uppercase">
            {current.day} · Phase {leg + 1}/{trajectory.legs.length}
          </p>
          <div
            key={leg}
            className="animate-[leg-in_0.6s_cubic-bezier(0.2,0.7,0.1,1)]"
            aria-live="polite"
          >
            <h3 className="font-display text-[1.125rem] tracking-[0.08em] text-white uppercase md:text-[1.375rem]">
              {current.title}
            </h3>
            <p className="mt-1.5 max-w-[40rem] text-body text-regolith/70 font-sans">{current.body}</p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {trajectory.legs.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-8 rounded-full transition-colors duration-500 ${
                  i <= leg ? "bg-earth" : "bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

