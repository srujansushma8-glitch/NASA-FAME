"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeHeroFlameProps {
  className?: string;
}

export function ThreeHeroFlame({ className = "" }: ThreeHeroFlameProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGLError(true);
        return;
      }
    } catch {
      setHasWebGLError(true);
      return;
    }

    let animationFrameId: number;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 800;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18.5);

    // 2. High-Performance Renderer with ACES Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Main flame pivot group with floating animation
    const flameGroup = new THREE.Group();
    scene.add(flameGroup);

    // 3. Custom GLSL Shader for Volumetric Spherical Microgravity Flame
    const flameVertexShader = `
      uniform float uTime;
      uniform float uNoiseScale;
      uniform float uDisplacement;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vNoise;

      // 3D Simplex noise generator
      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        
        // Animated multi-octave fluidic pulsation in zero gravity
        float noise1 = snoise(position * uNoiseScale + vec3(0.0, uTime * 0.45, 0.0));
        float noise2 = snoise(position * (uNoiseScale * 2.2) - vec3(uTime * 0.35, 0.0, uTime * 0.25)) * 0.5;
        float totalNoise = noise1 + noise2;
        vNoise = totalNoise;

        vec3 newPosition = position + normal * (totalNoise * uDisplacement);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    // Fragment Shader: Outer Cobalt Radical Sheath (#2B4BFF) with Fresnel glow
    const outerFlameFragmentShader = `
      uniform float uTime;
      uniform vec3 uColorCore;
      uniform vec3 uColorEdge;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vNoise;

      void main() {
        vec3 viewDir = normalize(-vPosition);
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
        fresnel = pow(fresnel, 2.2);

        // Electric Cobalt with subtle cyan tinting
        vec3 color = mix(uColorCore, uColorEdge, fresnel * 0.85 + (vNoise * 0.15));
        
        // Alpha falloff toward edges
        float alpha = clamp(fresnel * 0.95 + 0.12, 0.0, 0.92);
        gl_FragColor = vec4(color, alpha);
      }
    `;

    // 4. Glowing Blue Atmospheric Outer Layer (Rayleigh Halo Glow)
    const atmosphericHaloGeo = new THREE.SphereGeometry(6.3, 36, 36);
    const atmosphericHaloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
          float halo = pow(fresnel, 2.6);
          
          // Outer Rayleigh blue spaceflight glow
          vec3 deepCobalt = vec3(0.12, 0.25, 0.95);
          vec3 cyanAtmosphere = vec3(0.24, 0.72, 1.0);
          vec3 color = mix(deepCobalt, cyanAtmosphere, fresnel * 0.7);

          gl_FragColor = vec4(color, clamp(halo * 0.65, 0.0, 0.85));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide, // BackSide for deep volumetric shell effect
      depthWrite: false,
    });
    const atmosphericHaloMesh = new THREE.Mesh(atmosphericHaloGeo, atmosphericHaloMat);
    flameGroup.add(atmosphericHaloMesh);

    // 5. Layer 1: Outer Translucent Blue Quiescent Diffusion Sheath
    const outerGeo = new THREE.IcosahedronGeometry(5.2, 32);
    const outerMat = new THREE.ShaderMaterial({
      vertexShader: flameVertexShader,
      fragmentShader: outerFlameFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uNoiseScale: { value: 0.28 },
        uDisplacement: { value: 0.38 },
        uColorCore: { value: new THREE.Color(0x0e1b66) }, // Deep Cobalt Dark
        uColorEdge: { value: new THREE.Color(0x2B4BFF) }, // Electric Cobalt Primary
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    flameGroup.add(outerMesh);

    // 6. Layer 2: Intermediate High-Excitation CH* Radical Zone
    const midGeo = new THREE.IcosahedronGeometry(4.3, 32);
    const midMat = new THREE.ShaderMaterial({
      vertexShader: flameVertexShader,
      fragmentShader: outerFlameFragmentShader,
      uniforms: {
        uTime: { value: 1.5 },
        uNoiseScale: { value: 0.42 },
        uDisplacement: { value: 0.28 },
        uColorCore: { value: new THREE.Color(0x2B4BFF) },
        uColorEdge: { value: new THREE.Color(0x6082ff) }, // Bright Cobalt Luminous
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const midMesh = new THREE.Mesh(midGeo, midMat);
    flameGroup.add(midMesh);

    // 7. Layer 3: Inner Thermal Combustion Core (Warm Amber/Orange subtle core)
    const coreGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const coreMat = new THREE.ShaderMaterial({
      vertexShader: flameVertexShader,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;

        void main() {
          vec3 viewDir = normalize(-vPosition);
          float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
          
          vec3 amberDeep = vec3(1.0, 0.478, 0.161);
          vec3 amberGlow = vec3(1.0, 0.72, 0.25);
          
          vec3 color = mix(amberDeep, amberGlow, vNoise * 0.5 + 0.5);
          float alpha = clamp(pow(1.0 - rim, 1.4) * 0.75, 0.0, 0.85);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 3.0 },
        uNoiseScale: { value: 0.65 },
        uDisplacement: { value: 0.18 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      depthWrite: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    flameGroup.add(coreMesh);

    // 8. Layer 4: Orbiting Particles with Fading Motion Trails
    const orbitCount = 42;
    const trailSegments = 8;
    const totalTrailPoints = orbitCount * trailSegments;

    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(totalTrailPoints * 3);
    const trailAlphas = new Float32Array(totalTrailPoints);

    // Setup orbit parameters
    interface OrbitBody {
      radius: number;
      speed: number;
      inclination: number;
      azimuth: number;
      phase: number;
      history: THREE.Vector3[];
    }

    const orbits: OrbitBody[] = [];
    for (let i = 0; i < orbitCount; i++) {
      const radius = 5.6 + (i / orbitCount) * 3.6;
      const speed = (0.012 + Math.random() * 0.018) * (Math.random() < 0.5 ? 1 : -1);
      const inclination = (Math.random() - 0.5) * Math.PI * 0.85;
      const azimuth = Math.random() * Math.PI * 2;
      const phase = Math.random() * Math.PI * 2;

      const history: THREE.Vector3[] = [];
      for (let s = 0; s < trailSegments; s++) {
        history.push(new THREE.Vector3(0, 0, 0));
      }

      orbits.push({ radius, speed, inclination, azimuth, phase, history });
    }

    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));

    // Particle texture
    const particleCanvas = document.createElement("canvas");
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pCtx = particleCanvas.getContext("2d");
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, "rgba(180, 225, 255, 1.0)");
      grad.addColorStop(0.35, "rgba(67, 120, 255, 0.75)");
      grad.addColorStop(1, "rgba(43, 75, 255, 0)");
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const orbitMat = new THREE.PointsMaterial({
      size: 0.38,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const orbitPoints = new THREE.Points(trailGeo, orbitMat);
    flameGroup.add(orbitPoints);

    // 9. Floating Microgravity Particulate Motes (Soot Nanoparticles in 0g)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4.6 + Math.random() * 4.4;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.005;
      particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const sootMat = new THREE.PointsMaterial({
      size: 0.28,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sootPoints = new THREE.Points(particleGeo, sootMat);
    flameGroup.add(sootPoints);

    // 10. Atmospheric Instrumentation & Orbital Telemetry Rings
    const ringGroup = new THREE.Group();
    const ringGeo1 = new THREE.RingGeometry(6.6, 6.625, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x2B4BFF,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.38;
    ringGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(7.8, 7.818, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xCFC9BF,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.y = Math.PI * 0.15;
    ringGroup.add(ring2);

    flameGroup.add(ringGroup);

    // 11. Point Lights: Electric Cobalt Key + Ambient Glow
    const cobaltLight = new THREE.PointLight(0x2B4BFF, 5.2, 35);
    cobaltLight.position.set(7, 5, 9);
    scene.add(cobaltLight);

    const cyanRimLight = new THREE.PointLight(0x38bdf8, 3.2, 25);
    cyanRimLight.position.set(-8, -4, 5);
    scene.add(cyanRimLight);

    const amberCoreLight = new THREE.PointLight(0xFF7A29, 2.6, 16);
    amberCoreLight.position.set(0, 0, 0);
    scene.add(amberCoreLight);

    // 12. Pointer-based Parallax & Interactive Drag Rotation
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      isDragging: false,
      prevX: 0,
      prevY: 0,
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = normX;
      mouse.targetY = normY;

      if (mouse.isDragging) {
        const deltaX = e.clientX - mouse.prevX;
        const deltaY = e.clientY - mouse.prevY;
        flameGroup.rotation.y += deltaX * 0.005;
        flameGroup.rotation.x += deltaY * 0.005;
        mouse.prevX = e.clientX;
        mouse.prevY = e.clientY;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      mouse.isDragging = true;
      mouse.prevX = e.clientX;
      mouse.prevY = e.clientY;
      setIsInteracting(true);
    };

    const handlePointerUp = () => {
      mouse.isDragging = false;
      setIsInteracting(false);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    container.addEventListener("mousedown", handlePointerDown);

    // 13. Responsive Resize Observer
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 800;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 14. Main Animation & Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update shader uniforms
      outerMat.uniforms.uTime.value = elapsedTime;
      midMat.uniforms.uTime.value = elapsedTime * 1.2 + 2.0;
      coreMat.uniforms.uTime.value = elapsedTime * 0.8 + 1.0;

      // Smooth mouse parallax interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      // Natural, continuous slow rotation in 0g
      if (!mouse.isDragging) {
        flameGroup.rotation.y += 0.0022;
        flameGroup.rotation.z = Math.sin(elapsedTime * 0.35) * 0.06;
      }

      // Subtle floating levitation in microgravity
      flameGroup.position.y = Math.sin(elapsedTime * 0.75) * 0.36;
      flameGroup.position.x = Math.cos(elapsedTime * 0.52) * 0.15;

      // Parallax camera displacement
      camera.position.x = mouse.x * 1.8;
      camera.position.y = mouse.y * 1.4;
      camera.lookAt(0, 0, 0);

      // Rotate orbital rings
      ring1.rotation.z += 0.0016;
      ring2.rotation.z -= 0.0011;

      // Update Keplerian Orbit Particles & Fading Trails
      const trailArray = trailGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < orbitCount; i++) {
        const o = orbits[i];
        o.phase += o.speed;

        // Current 3D position on inclined orbit
        const currentPos = new THREE.Vector3(
          Math.cos(o.phase) * o.radius,
          Math.sin(o.phase) * o.radius * Math.sin(o.inclination),
          Math.sin(o.phase) * o.radius * Math.cos(o.inclination)
        ).applyAxisAngle(new THREE.Vector3(0, 1, 0), o.azimuth);

        // Update history trail segments
        o.history.unshift(currentPos.clone());
        o.history.pop();

        for (let s = 0; s < trailSegments; s++) {
          const pt = o.history[s];
          const idx = (i * trailSegments + s) * 3;
          trailArray[idx] = pt.x;
          trailArray[idx + 1] = pt.y;
          trailArray[idx + 2] = pt.z;
        }
      }
      trailGeo.attributes.position.needsUpdate = true;

      // Update Microscopic Soot Nanoparticles
      const sootPos = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        sootPos[i * 3] += particleVelocities[i * 3];
        sootPos[i * 3 + 1] += particleVelocities[i * 3 + 1];
        sootPos[i * 3 + 2] += particleVelocities[i * 3 + 2];

        const dist = Math.sqrt(
          sootPos[i * 3] ** 2 +
          sootPos[i * 3 + 1] ** 2 +
          sootPos[i * 3 + 2] ** 2
        );

        if (dist > 9.8 || dist < 3.8) {
          const u = Math.random();
          const v = Math.random();
          const theta = u * 2.0 * Math.PI;
          const phi = Math.acos(2.0 * v - 1.0);
          const r = 4.8 + Math.random() * 3.5;
          sootPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          sootPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          sootPos[i * 3 + 2] = r * Math.cos(phi);
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      container.removeEventListener("mousedown", handlePointerDown);
      resizeObserver.disconnect();

      // Dispose Three.js resources cleanly
      outerGeo.dispose();
      outerMat.dispose();
      midGeo.dispose();
      midMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      atmosphericHaloGeo.dispose();
      atmosphericHaloMat.dispose();
      trailGeo.dispose();
      orbitMat.dispose();
      particleGeo.dispose();
      sootMat.dispose();
      particleTexture.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (hasWebGLError) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="relative size-[480px] rounded-full border border-cobalt/30 bg-ink-surface/80 flex flex-col items-center justify-center text-center p-8">
          <div className="size-32 rounded-full bg-gradient-to-tr from-cobalt to-flame/60 blur-xl opacity-75 animate-pulse" />
          <div className="relative z-10 font-mono text-xs text-stone-dim space-y-2">
            <span className="text-cobalt font-bold tracking-widest">[ SPHERICAL FLAME 0.00G ]</span>
            <p>WebGL Hardware Acceleration Disabled</p>
            <p className="text-[10px] text-stone-muted">Using Fallback Computational Vector State</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full select-none cursor-grab active:cursor-grabbing ${className}`}
      title="Interactive 3D Microgravity Flame: Drag to rotate, move cursor for parallax"
    >
      {/* Precision Instrument HUD overlay on the 3D canvas */}
      <div className="absolute top-4 right-4 pointer-events-none hidden md:flex flex-col items-end gap-1 font-mono text-[10px] tracking-widest text-stone-dim/70">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-cobalt animate-ping" />
          <span className="text-stone-light">THREE.JS GLSL 3.0</span>
        </div>
        <span>BURKE-SCHUMANN DIFFUSION</span>
        <span className="text-cobalt font-semibold">G = 0.000000 m/s²</span>
      </div>

      <div className="absolute bottom-4 left-4 pointer-events-none hidden md:flex items-center gap-3 font-mono text-[9px] text-stone-muted/80 tracking-widest">
        <span>[ DRAG TO ROTATE 3D SPHERE ]</span>
        <span>•</span>
        <span>[ ORBITAL RADICAL PARTICLES ]</span>
      </div>
    </div>
  );
}
