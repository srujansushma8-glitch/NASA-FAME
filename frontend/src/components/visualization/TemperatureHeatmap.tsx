"use client";

import React, { useEffect, useRef, useState } from "react";
import { SimulationScalarField } from "@/types";
import { Maximize2 } from "lucide-react";

interface TemperatureHeatmapProps {
  scalarField?: SimulationScalarField;
  title?: string;
  maxTempK?: number;
}

export function TemperatureHeatmap({
  scalarField,
  title = "2D Spatial Temperature Field (Kelvin)",
  maxTempK = 2200,
}: TemperatureHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverData, setHoverData] = useState<{ x: number; y: number; temp: number } | null>(null);

  // Map Kelvin (300K to maxTempK) to RGB color
  const getTemperatureColor = (tempK: number, minT = 298.15, maxT = maxTempK) => {
    const t = Math.max(0, Math.min(1, (tempK - minT) / (maxT - minT)));

    // Blackbody-like colormap: Deep blue -> Cyan -> Green -> Orange -> Yellow -> White
    let r = 0,
      g = 0,
      b = 0;
    if (t < 0.2) {
      // 0 to 0.2: Dark blue to deep cyan
      b = Math.floor(60 + (t / 0.2) * 160);
      g = Math.floor((t / 0.2) * 80);
      r = Math.floor((t / 0.2) * 20);
    } else if (t < 0.45) {
      // 0.2 to 0.45: Cyan to green-yellow
      const ratio = (t - 0.2) / 0.25;
      r = Math.floor(20 + ratio * 120);
      g = Math.floor(80 + ratio * 140);
      b = Math.floor(220 - ratio * 160);
    } else if (t < 0.75) {
      // 0.45 to 0.75: Yellow to flame orange
      const ratio = (t - 0.45) / 0.3;
      r = Math.floor(140 + ratio * 115);
      g = Math.floor(220 - ratio * 110);
      b = Math.floor(60 - ratio * 50);
    } else {
      // 0.75 to 1.0: Orange to incandescent white
      const ratio = (t - 0.75) / 0.25;
      r = 255;
      g = Math.floor(110 + ratio * 145);
      b = Math.floor(10 + ratio * 245);
    }
    return [r, g, b];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (
      !scalarField ||
      !scalarField.temperature_matrix ||
      scalarField.temperature_matrix.length === 0
    ) {
      // Render fallback ambient field
      ctx.fillStyle = "#0B0F19";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#64748B";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("No Spatial Scalar Field Available", canvas.width / 2, canvas.height / 2);
      return;
    }

    const matrix = scalarField.temperature_matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Use offscreen image buffer
    const imgData = ctx.createImageData(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const temp = matrix[r][c];
        const [red, green, blue] = getTemperatureColor(temp);
        const idx = (r * cols + c) * 4;
        imgData.data[idx] = red;
        imgData.data[idx + 1] = green;
        imgData.data[idx + 2] = blue;
        imgData.data[idx + 3] = 255;
      }
    }

    // Render scaled to canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cols;
    tempCanvas.height = rows;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.putImageData(imgData, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }
  }, [scalarField, maxTempK]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !scalarField || !scalarField.temperature_matrix) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;

    const matrix = scalarField.temperature_matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;

    const col = Math.floor(xPct * cols);
    const row = Math.floor(yPct * rows);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const realX = scalarField.grid_x ? scalarField.grid_x[col] : (col - cols / 2) * 0.5;
      const realY = scalarField.grid_y ? scalarField.grid_y[row] : (rows - row) * 0.5;
      setHoverData({
        x: realX,
        y: realY,
        temp: matrix[row][col],
      });
    }
  };

  return (
    <div className="relative flex flex-col rounded-[6px] bg-void-2 p-5 ring-1 ring-white/10 shadow-2xl overflow-hidden">
      <div className="brackets pointer-events-none absolute inset-0 text-regolith/20" />
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div>
          <span className="font-display text-[0.875rem] tracking-[0.08em] text-white uppercase">
            {title}
          </span>
          <p className="text-[0.75rem] font-mono text-regolith/60 mt-0.5">
            Eulerian grid temperature distribution &bull; Spatial isotherms
          </p>
        </div>
        {hoverData && (
          <div className="rounded-[3px] bg-void/80 ring-1 ring-white/20 px-2.5 py-1 text-[0.6875rem] font-mono text-earth tabular-nums">
            X: {hoverData.x.toFixed(1)}mm | Y: {hoverData.y.toFixed(1)}mm | {hoverData.temp.toFixed(0)} K
          </div>
        )}
      </div>

      <div className="relative mt-4 flex items-center justify-center relative z-10">
        <canvas
          ref={canvasRef}
          width={320}
          height={260}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverData(null)}
          className="h-64 w-full rounded-[4px] ring-1 ring-white/10 bg-void cursor-crosshair object-contain"
        />

        {/* Temperature Color Scale Bar */}
        <div className="absolute right-3 bottom-3 flex flex-col items-center bg-void/90 p-2 rounded-[3px] ring-1 ring-white/10 text-[0.625rem] font-mono text-regolith/75">
          <span>{maxTempK}K</span>
          <div
            className="my-1.5 w-2 h-24 rounded-[1px] ring-1 ring-white/10"
            style={{
              background: "linear-gradient(to bottom, #FFFFFF, #FFE066, #FF7029, #087CFF, #0A1B30)",
            }}
          />
          <span>298K</span>
        </div>
      </div>
    </div>
  );
}

