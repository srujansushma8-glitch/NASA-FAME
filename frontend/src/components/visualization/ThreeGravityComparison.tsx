"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Sliders, RotateCcw, Info, ArrowUpRight, ShieldCheck, Flame, Gauge } from "lucide-react";

export function ThreeGravityComparison() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gravity, setGravity] = useState<number>(0.0); // 0.0 to 1.0
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(false);

  // Scientific dimensionless numbers calculated in real time
  const physics = useMemo(() => {
    const g = Math.max(0.0001, gravity);
    const T_flame = 1800; // K
    const T_inf = 300; // K
    const L = 0.015; // characteristic length 15mm
    const nu = 1.5e-5; // kinematic viscosity m^2/s
    const beta = 1 / T_inf; // expansion coefficient
    const Pr = 0.71; // Prandtl number
    const u_inj = 0.08; // injection velocity m/s

    // Grashof Number: Gr = g * beta * deltaT * L^3 / nu^2
    const deltaT = T_flame - T_inf;
    const Gr = gravity < 0.01 ? 0.008 : (g * 9.81 * beta * deltaT * Math.pow(L, 3)) / Math.pow(nu, 2);

    // Richardson Number: Ri = Gr / Re^2
    const Re = (u_inj * L) / nu;
    const Ri = Gr / Math.pow(Re, 2);

    // Froude Number: Fr = u / sqrt(g * L)
    const Fr = gravity < 0.01 ? 999.0 : u_inj / Math.sqrt(g * 9.81 * L);

    // Rayleigh Number: Ra = Gr * Pr
    const Ra = Gr * Pr;

    // Convective Draft Velocity (m/s)
    const draftVelocity = gravity < 0.01 ? 0.0 : Math.sqrt(2 * g * 9.81 * L * (deltaT / T_inf));

    // Natural Flicker Frequency (Hz) ~ 1.5 * sqrt(g / D)
    const flickerFreq = gravity < 0.02 ? 0.0 : 1.5 * Math.sqrt((g * 9.81) / L);

    // Burn rate estimate (mg/s)
    const burnRate = 1.1 + gravity * 1.75;

    return {
      Gr,
      Ri,
      Fr,
      Ra,
      draftVelocity,
      flickerFreq,
      burnRate,
    };
  }, [gravity]);

  // Three.js interactive morphing scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animId: number;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const flameGroup = new THREE.Group();
    scene.add(flameGroup);

    // 1. Morphing Flame Geometry (Deforms from Sphere at 0g to Teardrop at 1g)
    const radius = 3.6;
    const baseGeo = new THREE.SphereGeometry(radius, 48, 48);
    const originalPositions = baseGeo.attributes.position.clone();

    // Shader material that shifts color from pure cobalt at 0g to cobalt base + amber soot at 1g
    const flameMat = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        uniform float uGravity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vHeight;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;

          // Buoyant vertical stretch and teardrop elongation
          float g = clamp(uGravity, 0.0, 1.0);
          
          if (pos.y > 0.0) {
            // Upper hemisphere stretches upward proportional to gravity
            float stretch = 1.0 + g * 1.45;
            pos.y *= stretch;
            // Taper the top into a pointed apex
            float taper = 1.0 - (pos.y / (5.0 * stretch)) * 0.45 * g;
            pos.x *= max(0.2, taper);
            pos.z *= max(0.2, taper);
          } else {
            // Lower hemisphere flattens slightly against burner
            pos.y *= (1.0 - g * 0.2);
          }

          // Buoyant flickering wave along Y axis
          if (g > 0.05) {
            float freq = 6.0 * sqrt(g);
            float flicker = sin(uTime * freq + pos.y * 1.8) * (0.12 * g * (pos.y + 2.0));
            pos.x += flicker;
            pos.z += cos(uTime * freq * 0.8 + pos.y * 1.5) * (0.08 * g);
          }

          vPosition = pos;
          vHeight = pos.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uGravity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying float vHeight;

        void main() {
          vec3 viewDir = normalize(-vPosition);
          float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
          rim = pow(rim, 1.8);

          // 0g color: Electric Cobalt (#2B4BFF)
          vec3 cobalt = vec3(0.169, 0.294, 1.0);
          // 1g flame tip soot color: Warm luminous amber (#FF9429 to #FFAE42)
          vec3 amberSoot = vec3(1.0, 0.58, 0.16);

          // Blend based on height and gravity
          float sootFactor = clamp((vHeight + 1.0) / 4.5, 0.0, 1.0) * uGravity;
          vec3 flameColor = mix(cobalt, amberSoot, sootFactor);

          float alpha = clamp(rim * 0.85 + 0.15, 0.0, 0.92);
          gl_FragColor = vec4(flameColor, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uGravity: { value: gravity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const flameMesh = new THREE.Mesh(baseGeo, flameMat);
    flameGroup.add(flameMesh);

    // 2. Convective Flow Streamlines (Show vertical draft at 1g, absent at 0g)
    const streamlineCount = 36;
    const streamlineGeo = new THREE.BufferGeometry();
    const streamlinePositions = new Float32Array(streamlineCount * 3);
    const streamlineVels = new Float32Array(streamlineCount);

    for (let i = 0; i < streamlineCount; i++) {
      const angle = (i / streamlineCount) * Math.PI * 2;
      const r = 4.2 + Math.random() * 1.2;
      streamlinePositions[i * 3] = Math.cos(angle) * r;
      streamlinePositions[i * 3 + 1] = (Math.random() - 0.5) * 8.0;
      streamlinePositions[i * 3 + 2] = Math.sin(angle) * r;
      streamlineVels[i] = Math.random() * 0.08 + 0.04;
    }
    streamlineGeo.setAttribute("position", new THREE.BufferAttribute(streamlinePositions, 3));

    const streamlineMat = new THREE.PointsMaterial({
      size: 0.2,
      color: 0xCFC9BF,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const streamlinePoints = new THREE.Points(streamlineGeo, streamlineMat);
    flameGroup.add(streamlinePoints);

    // 3. Burner Base Reticle
    const burnerGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.3, 32);
    const burnerMat = new THREE.MeshBasicMaterial({
      color: 0x18181D,
      wireframe: true,
    });
    const burnerMesh = new THREE.Mesh(burnerGeo, burnerMat);
    burnerMesh.position.y = -3.8;
    flameGroup.add(burnerMesh);

    // Lights
    const keyLight = new THREE.PointLight(0x2B4BFF, 3.5, 25);
    keyLight.position.set(4, 5, 8);
    scene.add(keyLight);

    const amberLight = new THREE.PointLight(0xFF7A29, 2.0, 15);
    amberLight.position.set(0, 0, 0);
    scene.add(amberLight);

    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const t = clock.getElapsedTime();

      // Update uniforms
      flameMat.uniforms.uTime.value = t;
      flameMat.uniforms.uGravity.value = gravity;

      // Adjust burner position slightly based on stretch
      flameMesh.position.y = gravity * 0.6;
      flameGroup.rotation.y += 0.003;

      // Streamline buoyancy acceleration
      const posArr = streamlineGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < streamlineCount; i++) {
        // In 0g: very slow isotropic drift
        // In 1g: rapid upward buoyant acceleration
        const upwardSpeed = gravity < 0.02 ? 0.002 : streamlineVels[i] * (gravity * 2.8 + 0.1);
        posArr[i * 3 + 1] += upwardSpeed;
        if (posArr[i * 3 + 1] > 6.0) {
          posArr[i * 3 + 1] = -4.0;
        }
      }
      streamlineGeo.attributes.position.needsUpdate = true;
      streamlineMat.opacity = Math.max(0.05, gravity * 0.45);

      renderer.render(scene, camera);
    };

    render();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      baseGeo.dispose();
      originalPositions.clone();
      flameMat.dispose();
      streamlineGeo.dispose();
      streamlineMat.dispose();
      burnerGeo.dispose();
      burnerMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [gravity]);

  const presets = [
    { label: "ISS Microgravity", g: 0.0, tag: "0.00g (10⁻⁶g)", regime: "Spherical Diffusion" },
    { label: "Moon Surface", g: 0.16, tag: "0.16g", regime: "Bulbous Dome" },
    { label: "Mars Surface", g: 0.38, tag: "0.38g", regime: "Ellipsoidal Plume" },
    { label: "Earth Sea Level", g: 1.0, tag: "1.00g", regime: "Buoyant Teardrop" },
  ];

  return (
    <div className="w-full bg-ink-surface border border-stone-border rounded-xl p-6 sm:p-8 lg:p-10 space-y-8">
      {/* Header with Title and Mode Indicator */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-label text-cobalt uppercase mb-2">
            <span className="size-2 rounded-full bg-cobalt animate-pulse" />
            <span>INTERACTIVE GRAVITATIONAL BENCHMARK</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-stone-light">
            Buoyant Transition Arena (0.00g → 1.00g)
          </h3>
          <p className="font-sans text-sm text-stone-dim max-w-xl mt-1">
            Drag the gravitational acceleration slider to witness the real-time morphological collapse
            of buoyancy-driven natural convection into pure molecular diffusion.
          </p>
        </div>

        {/* Scientific Provenance Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-ink-elevated border border-stone-border font-mono text-[11px] text-stone-dim shrink-0">
          <ShieldCheck className="size-3.5 text-cobalt" />
          <span>NASA CIR/ACME PHYSICS GROUNDED</span>
        </div>
      </div>

      {/* Main 2-Column Display: Left 3D Viewport, Right Real-Time Telemetry & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Three.js Interactive Viewport (7 cols) */}
        <div className="lg:col-span-7 relative h-[420px] sm:h-[480px] w-full rounded-lg bg-ink-deep border border-stone-border/80 overflow-hidden">
          <div ref={mountRef} className="w-full h-full" />

          {/* Viewport HUD Overlays */}
          <div className="absolute top-4 left-4 font-mono text-[11px] text-stone-dim space-y-1 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-stone-light font-bold">STATE:</span>
              <span className="text-cobalt">
                {gravity <= 0.05
                  ? "QUASI-STEADY SPHERICAL DIFFUSION"
                  : gravity < 0.3
                  ? "TRANSITIONAL BULBOUS CONVECTION"
                  : gravity < 0.7
                  ? "DEVELOPED ELLIPSOIDAL PLUME"
                  : "BUOYANT TEARDROP (TURBULENT FLICKER)"}
              </span>
            </div>
            <p className="text-[10px] text-stone-muted">
              Burner: d = 4.0 mm · Fuel: Methane (CH₄)
            </p>
          </div>

          <div className="absolute bottom-4 right-4 font-mono text-[11px] text-stone-dim bg-ink/80 px-2.5 py-1 rounded border border-stone-border/40 pointer-events-none">
            <span>g = {(gravity * 9.80665).toFixed(3)} m/s²</span>
          </div>
        </div>

        {/* Right: Controls & Scientific Dimensionless Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Slider & Presets */}
          <div className="space-y-4 bg-ink p-5 rounded-lg border border-stone-border/60">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-stone-light uppercase font-semibold">Gravitational Force</span>
              <span className="text-cobalt font-bold text-sm">{gravity.toFixed(2)} g</span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gravity}
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              className="w-full h-2 bg-ink-elevated rounded-lg appearance-none cursor-pointer accent-[#2B4BFF]"
              aria-label="Gravity Level Slider"
            />

            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {presets.map((p) => {
                const isActive = Math.abs(gravity - p.g) < 0.05;
                return (
                  <button
                    key={p.label}
                    onClick={() => setGravity(p.g)}
                    className={`px-3 py-2 rounded text-left font-mono transition-all text-xs border ${
                      isActive
                        ? "bg-cobalt/15 text-stone-light border-cobalt ring-1 ring-cobalt/50"
                        : "bg-ink-surface text-stone-dim border-stone-border hover:border-stone hover:text-stone-light"
                    }`}
                  >
                    <div className="font-semibold">{p.tag}</div>
                    <div className="text-[10px] text-stone-muted truncate">{p.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimensionless Numbers Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded bg-ink border border-stone-border/60">
              <div className="font-mono text-[10px] text-stone-muted uppercase tracking-wider">
                Grashof No. (Gr)
              </div>
              <div className="font-mono text-lg text-stone-light font-bold mt-1">
                {physics.Gr < 0.1 ? "< 0.01" : Math.round(physics.Gr).toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-dim mt-0.5">
                {gravity < 0.05 ? "Diffusion dominant (Gr → 0)" : "Buoyancy dominant"}
              </div>
            </div>

            <div className="p-3.5 rounded bg-ink border border-stone-border/60">
              <div className="font-mono text-[10px] text-stone-muted uppercase tracking-wider">
                Richardson No. (Ri)
              </div>
              <div className="font-mono text-lg text-cobalt font-bold mt-1">
                {physics.Ri < 0.05 ? "0.00" : physics.Ri.toFixed(2)}
              </div>
              <div className="text-[10px] text-stone-dim mt-0.5">
                Natural / Forced Convection
              </div>
            </div>

            <div className="p-3.5 rounded bg-ink border border-stone-border/60">
              <div className="font-mono text-[10px] text-stone-muted uppercase tracking-wider">
                Draft Velocity
              </div>
              <div className="font-mono text-lg text-stone-light font-bold mt-1">
                {physics.draftVelocity.toFixed(2)} m/s
              </div>
              <div className="text-[10px] text-stone-dim mt-0.5">
                Upward buoyant suction
              </div>
            </div>

            <div className="p-3.5 rounded bg-ink border border-stone-border/60">
              <div className="font-mono text-[10px] text-stone-muted uppercase tracking-wider">
                Flicker Instability
              </div>
              <div className="font-mono text-lg text-stone-light font-bold mt-1">
                {physics.flickerFreq.toFixed(1)} Hz
              </div>
              <div className="text-[10px] text-stone-dim mt-0.5">
                {gravity < 0.02 ? "Quiescent (Zero flicker)" : "Vortex shedding"}
              </div>
            </div>
          </div>

          {/* Scientific Key Takeaway Box */}
          <div className="p-4 rounded-lg bg-cobalt/10 border border-cobalt/30 flex items-start gap-3 text-xs text-stone-light">
            <Info className="size-4 text-cobalt shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Aerospace Insight:</strong> At 0.00g, flame flickering collapses because the buoyancy Grashof number drops to zero. Heat transfer switches entirely from convective updraft to spherical molecular conduction and radiation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

