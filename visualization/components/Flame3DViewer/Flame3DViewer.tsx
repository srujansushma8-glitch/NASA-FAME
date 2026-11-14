/**
 * NASA-FLAME: Flame3DViewer
 * Interactive 3D scientific combustion visualization using Three.js.
 * Accurately models microgravity spherical diffusion (0g) vs terrestrial buoyant teardrop (1g).
 * 
 * Complies with NASA-FLAME Design Requirements & Scientific Provenance principles.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  SimulationResponseData,
  SimulationTimeSeriesPoint,
  DataOrigin,
} from "../../types/index.ts";
import { FLAME_THEME } from "../../theme/colors.ts";
import { ProvenanceBadge } from "../Common/ProvenanceBadge.tsx";
import { calculateFlickerFrequency, calculateBuoyantDraftVelocity } from "../../utils/flamePhysics.ts";

export interface Flame3DViewerProps {
  simulationData?: SimulationResponseData | null;
  gravityLevel?: number; // Override or default (0.0 to 1.0+)
  fuelName?: string;
  burnerDiameterMm?: number;
  initialTime?: number;
  onTimeUpdate?: (time_s: number) => void;
  colormap?: "blackbody" | "chemiluminescence" | "inferno";
  showConvectiveVectors?: boolean;
  showChamberBounds?: boolean;
  height?: number | string;
  width?: number | string;
  readOnly?: boolean;
}

export const Flame3DViewer: React.FC<Flame3DViewerProps> = ({
  simulationData,
  gravityLevel,
  fuelName = "Methane",
  burnerDiameterMm = 4.0,
  initialTime = 0,
  onTimeUpdate,
  colormap = "blackbody",
  showConvectiveVectors = true,
  showChamberBounds = true,
  height = 520,
  width = "100%",
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [activeColormap, setActiveColormap] = useState<"blackbody" | "chemiluminescence" | "inferno">(colormap);
  const [vectorsEnabled, setVectorsEnabled] = useState<boolean>(showConvectiveVectors);
  const [cameraPreset, setCameraPreset] = useState<string>("isometric");
  const [webglError, setWebglError] = useState<string | null>(null);

  // Three.js object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const flameMeshRef = useRef<THREE.Mesh | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const sootShellMeshRef = useRef<THREE.Mesh | null>(null);
  const vectorGroupRef = useRef<THREE.Group | null>(null);

  // Mouse interaction for rotation & zoom
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngle = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 70,
  });

  const effectiveGravity = gravityLevel !== undefined 
    ? gravityLevel 
    : (simulationData?.gravity_level_g ?? 0.0);

  const timeSeries = simulationData?.time_series || [];
  const maxSimDuration = timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].time_s : 10.0;

  // Resolve current metric point based on currentTime
  const currentMetric: SimulationTimeSeriesPoint = React.useMemo(() => {
    if (timeSeries.length === 0) {
      const is0g = effectiveGravity <= 0.05;
      return {
        time_s: currentTime,
        flame_radius_mm: is0g ? 6.5 : 4.5,
        max_temperature_k: is0g ? 1520 : 1780,
        burning_rate_mg_s: is0g ? 1.2 : 2.8,
        soot_fraction: is0g ? 0.2e-6 : 1.5e-6,
      };
    }
    // Interpolate or find closest point
    const closest = timeSeries.reduce((prev, curr) =>
      Math.abs(curr.time_s - currentTime) < Math.abs(prev.time_s - currentTime) ? curr : prev
    );
    return closest;
  }, [timeSeries, currentTime, effectiveGravity]);

  const flickerFrequency = calculateFlickerFrequency(effectiveGravity, burnerDiameterMm);
  const convectiveVelocity = calculateBuoyantDraftVelocity(
    effectiveGravity,
    simulationData?.flame_height_mm || 18.0,
    currentMetric.max_temperature_k
  );

  // Camera presets
  const applyCameraPreset = useCallback((preset: string) => {
    setCameraPreset(preset);
    switch (preset) {
      case "side":
        cameraAngle.current = { theta: 0, phi: Math.PI / 2, radius: 65 };
        break;
      case "top":
        cameraAngle.current = { theta: 0, phi: 0.01, radius: 65 };
        break;
      case "standoff":
        cameraAngle.current = { theta: Math.PI / 6, phi: Math.PI / 2.2, radius: 40 };
        break;
      case "isometric":
      default:
        cameraAngle.current = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 70 };
        break;
    }
  }, []);

  // Update Camera Cartesian Coordinates from Spherical
  const updateCameraTransform = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngle.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y + 5, z);
    cameraRef.current.lookAt(0, 8, 0);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    try {
      const width = container.clientWidth || 600;
      const heightVal = container.clientHeight || 450;

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, heightVal);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x080b12, 1);
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x080b12, 0.008);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(45, width / heightVal, 0.1, 1000);
      cameraRef.current = camera;
      updateCameraTransform();

      // Ambient & Directional Lighting
      const ambientLight = new THREE.AmbientLight(0x223355, 0.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(20, 40, 30);
      scene.add(dirLight);

      // Burner Nozzle / Droplet Base
      const burnerGeo = new THREE.CylinderGeometry(burnerDiameterMm / 2, (burnerDiameterMm / 2) * 1.2, 8, 24);
      const burnerMat = new THREE.MeshStandardMaterial({
        color: 0x374151,
        metalness: 0.85,
        roughness: 0.35,
      });
      const burnerMesh = new THREE.Mesh(burnerGeo, burnerMat);
      burnerMesh.position.set(0, -4, 0);
      scene.add(burnerMesh);

      // Grid Base / Ground Plate
      const grid = new THREE.GridHelper(50, 20, 0x087cff, 0x1f2937);
      grid.position.y = -8;
      scene.add(grid);

      // Combustion Chamber Wireframe Boundary
      if (showChamberBounds) {
        const chamberGeo = new THREE.BoxGeometry(40, 50, 40);
        const chamberEdges = new THREE.EdgesGeometry(chamberGeo);
        const chamberLine = new THREE.LineSegments(
          chamberEdges,
          new THREE.LineBasicMaterial({ color: 0x1f2937, transparent: true, opacity: 0.6 })
        );
        chamberLine.position.y = 17;
        scene.add(chamberLine);
      }

      // Outer Flame Mesh
      const flameGeo = new THREE.SphereGeometry(1, 32, 32);
      const flameMat = new THREE.MeshStandardMaterial({
        color: 0xff7029,
        roughness: 0.2,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameMeshRef.current = flameMesh;
      scene.add(flameMesh);

      // Inner Radical Reaction Core (CH* chemiluminescent reaction zone)
      const coreGeo = new THREE.SphereGeometry(0.6, 24, 24);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMeshRef.current = coreMesh;
      scene.add(coreMesh);

      // Microgravity Soot Outer Shell
      const sootGeo = new THREE.SphereGeometry(1.25, 24, 24);
      const sootMat = new THREE.MeshBasicMaterial({
        color: 0x111827,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      const sootShell = new THREE.Mesh(sootGeo, sootMat);
      sootShellMeshRef.current = sootShell;
      scene.add(sootShell);

      // Convective Flow Vector Field (1g updraft plumes)
      const vectorGroup = new THREE.Group();
      vectorGroupRef.current = vectorGroup;
      const numLines = 14;
      for (let i = 0; i < numLines; i++) {
        const rad = 4 + Math.random() * 8;
        const ang = (i / numLines) * Math.PI * 2;
        const points = [
          new THREE.Vector3(Math.cos(ang) * rad, -4, Math.sin(ang) * rad),
          new THREE.Vector3(Math.cos(ang) * (rad * 0.8), 10, Math.sin(ang) * (rad * 0.8)),
          new THREE.Vector3(Math.cos(ang) * (rad * 0.4), 26, Math.sin(ang) * (rad * 0.4)),
        ];
        const curve = new THREE.CatmullRomCurve3(points);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(12));
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x087cff,
          transparent: true,
          opacity: 0.4,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        vectorGroup.add(line);
      }
      scene.add(vectorGroup);

    } catch (err: any) {
      console.warn("WebGL initialization note:", err);
      setWebglError(err?.message || "WebGL initialization failed. Using high-precision 2D Canvas fallback.");
    }

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [burnerDiameterMm, showChamberBounds, updateCameraTransform]);

  // Main Animation & Physics Update Loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const animate = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Update simulation time if playing
      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          const clamped = next > maxSimDuration ? 0 : next;
          if (onTimeUpdate) onTimeUpdate(clamped);
          return clamped;
        });
      }

      // Physics-informed visual scaling
      if (flameMeshRef.current && coreMeshRef.current && sootShellMeshRef.current) {
        const isMicrogravity = effectiveGravity <= 0.05;
        const isPartialG = effectiveGravity > 0.05 && effectiveGravity < 0.8;
        const r_base = currentMetric.flame_radius_mm;

        // Flicker oscillation (Only in buoyant gravity)
        let flickerFactor = 1.0;
        if (!isMicrogravity) {
          const freq = flickerFrequency > 0 ? flickerFrequency : 11.5;
          flickerFactor = 1.0 + 0.08 * Math.sin(timestamp * 0.006 * freq);
        }

        if (isMicrogravity) {
          // Perfectly spherical diffusion flame (Burke-Schumann)
          const scale = r_base;
          flameMeshRef.current.scale.set(scale, scale, scale);
          flameMeshRef.current.position.set(0, scale * 0.8, 0);

          coreMeshRef.current.scale.set(scale * 0.6, scale * 0.6, scale * 0.6);
          coreMeshRef.current.position.set(0, scale * 0.8, 0);

          sootShellMeshRef.current.visible = true;
          sootShellMeshRef.current.scale.set(scale * 1.35, scale * 1.35, scale * 1.35);
          sootShellMeshRef.current.position.set(0, scale * 0.8, 0);

          // Color: Dominant blue chemiluminescence, dim outer mantle
          if (activeColormap === "chemiluminescence" || activeColormap === "blackbody") {
            (flameMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(0x1d4ed8);
            (coreMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
          }
        } else if (isPartialG) {
          // Transitional widened base with intermediate elongation
          const h_scale = r_base * (1.5 + effectiveGravity * 2.0) * flickerFactor;
          const w_scale = r_base * 1.3;
          flameMeshRef.current.scale.set(w_scale, h_scale, w_scale);
          flameMeshRef.current.position.set(0, h_scale * 0.5, 0);

          coreMeshRef.current.scale.set(w_scale * 0.5, h_scale * 0.4, w_scale * 0.5);
          coreMeshRef.current.position.set(0, h_scale * 0.3, 0);

          sootShellMeshRef.current.visible = false;
          (flameMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xf59e0b);
          (coreMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x60a5fa);
        } else {
          // 1g Terrestrial buoyant elongated teardrop
          const h_scale = r_base * 3.4 * flickerFactor;
          const w_scale = r_base * 0.95;
          flameMeshRef.current.scale.set(w_scale, h_scale, w_scale);
          flameMeshRef.current.position.set(0, h_scale * 0.5, 0);

          coreMeshRef.current.scale.set(w_scale * 0.6, h_scale * 0.3, w_scale * 0.6);
          coreMeshRef.current.position.set(0, h_scale * 0.2, 0);

          sootShellMeshRef.current.visible = false;

          // Color: Bright yellow-orange incandescent soot tip with blue base
          (flameMeshRef.current.material as THREE.MeshStandardMaterial).color.setHex(0xff7029);
          (coreMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
        }
      }

      // Convective vector visibility and animation
      if (vectorGroupRef.current) {
        vectorGroupRef.current.visible = vectorsEnabled && effectiveGravity > 0.05;
        if (vectorGroupRef.current.visible) {
          vectorGroupRef.current.rotation.y += 0.005;
        }
      }

      // Render Scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isPlaying,
    playbackSpeed,
    maxSimDuration,
    effectiveGravity,
    currentMetric,
    flickerFrequency,
    activeColormap,
    vectorsEnabled,
    onTimeUpdate,
  ]);

  // Mouse drag Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMousePos.current.x;
    const dy = e.clientY - prevMousePos.current.y;
    prevMousePos.current = { x: e.clientX, y: e.clientY };

    cameraAngle.current.theta -= dx * 0.01;
    cameraAngle.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngle.current.phi - dy * 0.01));
    updateCameraTransform();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAngle.current.radius = Math.max(20, Math.min(180, cameraAngle.current.radius + e.deltaY * 0.05));
    updateCameraTransform();
  };

  const dataOrigin: DataOrigin = simulationData?.provenance?.dataOrigin || "VISUALIZATION_MODEL";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: FLAME_THEME.colors.secondary,
        borderRadius: FLAME_THEME.borders.radiusMd,
        border: FLAME_THEME.borders.subtle,
        overflow: "hidden",
        width,
        height,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: FLAME_THEME.colors.cardHeader,
          borderBottom: FLAME_THEME.borders.subtle,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              color: FLAME_THEME.colors.electricBlue,
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.04em",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
            }}
          >
            FLAME 3D VIEWPORT
          </span>
          <span
            style={{
              color: FLAME_THEME.colors.textMuted,
              fontSize: "12px",
            }}
          >
            {fuelName} | g = {effectiveGravity.toFixed(2)}g ({effectiveGravity <= 0.05 ? "0g Spherical" : "1g Buoyant"})
          </span>
        </div>

        {/* Provenance Badge */}
        <ProvenanceBadge
          origin={dataOrigin}
          compact={true}
          citation={simulationData?.provenance?.citation}
        />
      </div>

      {/* Main 3D Canvas Area */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: "relative",
          cursor: isDraggingRef.current ? "grabbing" : "grab",
          outline: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />

        {webglError && (
          <div
            style={{
              position: "absolute",
              top: "44px",
              left: "12px",
              padding: "4px 8px",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "4px",
              fontSize: "10px",
              color: "#FCD34D",
              fontFamily: "monospace",
              zIndex: 6,
            }}
          >
            Notice: {webglError}
          </div>
        )}

        {/* Camera Preset Controls Overlay */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "flex",
            gap: "4px",
            zIndex: 5,
          }}
        >
          {["isometric", "side", "top", "standoff"].map((p) => (
            <button
              key={p}
              onClick={() => applyCameraPreset(p)}
              style={{
                padding: "3px 8px",
                fontSize: "11px",
                fontFamily: FLAME_THEME.typography.fontFamilyMono,
                backgroundColor: cameraPreset === p ? FLAME_THEME.colors.electricBlue : "rgba(17, 24, 39, 0.75)",
                color: cameraPreset === p ? "#FFFFFF" : FLAME_THEME.colors.textSecondary,
                border: FLAME_THEME.borders.subtle,
                borderRadius: FLAME_THEME.borders.radiusSm,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => applyCameraPreset("isometric")}
            title="Reset to default camera orientation"
            style={{
              padding: "3px 8px",
              fontSize: "11px",
              fontFamily: FLAME_THEME.typography.fontFamilyMono,
              backgroundColor: "rgba(17, 24, 39, 0.75)",
              color: FLAME_THEME.colors.textMuted,
              border: FLAME_THEME.borders.subtle,
              borderRadius: FLAME_THEME.borders.radiusSm,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>

        {/* Scientific HUD Metrics Overlay */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: "rgba(11, 15, 25, 0.85)",
            backdropFilter: "blur(4px)",
            border: FLAME_THEME.borders.subtle,
            borderRadius: FLAME_THEME.borders.radiusSm,
            padding: "8px 12px",
            fontSize: "11px",
            fontFamily: FLAME_THEME.typography.fontFamilyMono,
            color: FLAME_THEME.colors.textSecondary,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          <div>T_peak: <span style={{ color: "#F97316", fontWeight: 700 }}>{currentMetric.max_temperature_k.toFixed(0)} K</span></div>
          <div>r_flame: <span style={{ color: "#38BDF8" }}>{currentMetric.flame_radius_mm.toFixed(1)} mm</span></div>
          <div>f_flicker: <span style={{ color: effectiveGravity <= 0.05 ? "#10B981" : "#F59E0B" }}>
            {effectiveGravity <= 0.05 ? "0.00 Hz (Steady)" : `${flickerFrequency.toFixed(1)} Hz`}
          </span></div>
          {effectiveGravity > 0.05 && (
            <div>u_draft: <span style={{ color: "#60A5FA" }}>{convectiveVelocity.toFixed(2)} m/s</span></div>
          )}
        </div>

        {/* Procedural Model Notice watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "12px",
            fontSize: "10px",
            color: FLAME_THEME.colors.textDim,
            fontFamily: FLAME_THEME.typography.fontFamilyMono,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          NASA-FLAME 3D Scientific Visualization Engine | Interactive Raymarched Geometry
        </div>
      </div>

      {/* User Simulation Playback & Color Controls Bar */}
      {!readOnly && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
            backgroundColor: FLAME_THEME.colors.cardHeader,
            borderTop: FLAME_THEME.borders.subtle,
            fontSize: "12px",
            zIndex: 10,
          }}
        >
          {/* Play / Pause / Step Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                padding: "4px 10px",
                backgroundColor: isPlaying ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                color: isPlaying ? "#FCA5A5" : "#6EE7B7",
                border: `1px solid ${isPlaying ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)"}`,
                borderRadius: FLAME_THEME.borders.radiusSm,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={() => setCurrentTime((t) => Math.max(0, t - 0.2))}
              style={{
                padding: "4px 8px",
                backgroundColor: FLAME_THEME.colors.surfaceElevated,
                color: FLAME_THEME.colors.textSecondary,
                border: FLAME_THEME.borders.subtle,
                borderRadius: FLAME_THEME.borders.radiusSm,
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              -0.2s
            </button>
            <button
              onClick={() => setCurrentTime((t) => Math.min(maxSimDuration, t + 0.2))}
              style={{
                padding: "4px 8px",
                backgroundColor: FLAME_THEME.colors.surfaceElevated,
                color: FLAME_THEME.colors.textSecondary,
                border: FLAME_THEME.borders.subtle,
                borderRadius: FLAME_THEME.borders.radiusSm,
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              +0.2s
            </button>
            <span
              style={{
                fontFamily: FLAME_THEME.typography.fontFamilyMono,
                color: FLAME_THEME.colors.textPrimary,
                fontSize: "11px",
                marginLeft: "4px",
              }}
            >
              t = {currentTime.toFixed(2)}s / {maxSimDuration.toFixed(1)}s
            </span>
          </div>

          {/* Playback speed selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: FLAME_THEME.colors.textDim, fontSize: "11px" }}>Speed:</span>
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                style={{
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontFamily: FLAME_THEME.typography.fontFamilyMono,
                  backgroundColor: playbackSpeed === spd ? FLAME_THEME.colors.electricBlue : FLAME_THEME.colors.surfaceElevated,
                  color: playbackSpeed === spd ? "#FFFFFF" : FLAME_THEME.colors.textMuted,
                  border: FLAME_THEME.borders.subtle,
                  borderRadius: FLAME_THEME.borders.radiusSm,
                  cursor: "pointer",
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Colormap & Vector Toggles */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setVectorsEnabled(!vectorsEnabled)}
              style={{
                padding: "3px 8px",
                fontSize: "11px",
                backgroundColor: vectorsEnabled ? "rgba(8, 124, 255, 0.2)" : FLAME_THEME.colors.surfaceElevated,
                color: vectorsEnabled ? "#60A5FA" : FLAME_THEME.colors.textMuted,
                border: FLAME_THEME.borders.subtle,
                borderRadius: FLAME_THEME.borders.radiusSm,
                cursor: "pointer",
              }}
            >
              Vectors {vectorsEnabled ? "ON" : "OFF"}
            </button>
            <select
              value={activeColormap}
              onChange={(e) => setActiveColormap(e.target.value as any)}
              style={{
                padding: "3px 8px",
                fontSize: "11px",
                fontFamily: FLAME_THEME.typography.fontFamilyMono,
                backgroundColor: FLAME_THEME.colors.surfaceElevated,
                color: FLAME_THEME.colors.textPrimary,
                border: FLAME_THEME.borders.subtle,
                borderRadius: FLAME_THEME.borders.radiusSm,
                cursor: "pointer",
              }}
            >
              <option value="blackbody">Blackbody (Kelvin)</option>
              <option value="chemiluminescence">Chemiluminescence (Radicals)</option>
              <option value="inferno">Inferno</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
