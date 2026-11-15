/**
 * NASA-FLAME: High-Performance Canvas Contour Heatmap Renderer
 * Renders 2D spatial temperature scalar fields with bilinear interpolation,
 * color bar legend, and coordinate tick axes.
 */

import { ColormapType, getInterpolatedColor } from "../../theme/colormaps";

export interface ContourRenderOptions {
  canvas: HTMLCanvasElement;
  gridX: number[]; // mm
  gridY: number[]; // mm
  matrix: number[][]; // [y][x] in Kelvin
  minTempK?: number;
  maxTempK?: number;
  colormap?: ColormapType;
  showColorbar?: boolean;
}

export function renderContourField({
  canvas,
  gridX,
  gridY,
  matrix,
  minTempK = 300,
  maxTempK = 2400,
  colormap = "blackbody",
  showColorbar = true,
}: ContourRenderOptions): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const numY = matrix.length;
  if (numY === 0) return;
  const numX = matrix[0].length;
  if (numX === 0) return;

  const plotMarginLeft = 45;
  const plotMarginBottom = 35;
  const plotMarginTop = 15;
  const plotMarginRight = showColorbar ? 65 : 15;

  const plotW = Math.max(10, w - plotMarginLeft - plotMarginRight);
  const plotH = Math.max(10, h - plotMarginTop - plotMarginBottom);

  // Background
  ctx.fillStyle = "#0B0F19";
  ctx.fillRect(0, 0, w, h);

  // Offscreen buffer for rasterizing cell matrix
  const imgData = ctx.createImageData(plotW, plotH);
  const data = imgData.data;

  const rangeK = Math.max(1, maxTempK - minTempK);

  for (let py = 0; py < plotH; py++) {
    const normY = py / (plotH - 1); // 0 (top) to 1 (bottom)
    const gridYIdx = (1.0 - normY) * (numY - 1); // invert Y so +Y is up
    const y0 = Math.floor(gridYIdx);
    const y1 = Math.min(numY - 1, y0 + 1);
    const fy = gridYIdx - y0;

    for (let px = 0; px < plotW; px++) {
      const normX = px / (plotW - 1);
      const gridXIdx = normX * (numX - 1);
      const x0 = Math.floor(gridXIdx);
      const x1 = Math.min(numX - 1, x0 + 1);
      const fx = gridXIdx - x0;

      // Bilinear interpolation
      const v00 = matrix[y0]?.[x0] ?? minTempK;
      const v10 = matrix[y0]?.[x1] ?? minTempK;
      const v01 = matrix[y1]?.[x0] ?? minTempK;
      const v11 = matrix[y1]?.[x1] ?? minTempK;

      const top = v00 * (1 - fx) + v10 * fx;
      const bottom = v01 * (1 - fx) + v11 * fx;
      const tempK = top * (1 - fy) + bottom * fy;

      const tNorm = Math.max(0, Math.min(1, (tempK - minTempK) / rangeK));
      const rgb = getInterpolatedColor(colormap, tNorm);

      const pIdx = (py * plotW + px) * 4;
      data[pIdx] = rgb.r;
      data[pIdx + 1] = rgb.g;
      data[pIdx + 2] = rgb.b;
      data[pIdx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, plotMarginLeft, plotMarginTop);

  // Plot border
  ctx.strokeStyle = "#1F2937";
  ctx.lineWidth = 1;
  ctx.strokeRect(plotMarginLeft, plotMarginTop, plotW, plotH);

  // Axis labels & Ticks
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";

  // X Axis
  const minX = gridX[0] ?? -20;
  const maxX = gridX[gridX.length - 1] ?? 20;
  ctx.fillText(`${minX.toFixed(0)} mm`, plotMarginLeft, h - 18);
  ctx.fillText("0 mm", plotMarginLeft + plotW / 2, h - 18);
  ctx.fillText(`${maxX.toFixed(0)} mm`, plotMarginLeft + plotW, h - 18);
  ctx.fillText("Radial X Axis (mm)", plotMarginLeft + plotW / 2, h - 4);

  // Y Axis
  ctx.textAlign = "right";
  const minY = gridY[0] ?? -20;
  const maxY = gridY[gridY.length - 1] ?? 20;
  ctx.fillText(`${maxY.toFixed(0)}`, plotMarginLeft - 6, plotMarginTop + 10);
  ctx.fillText("0", plotMarginLeft - 6, plotMarginTop + plotH / 2);
  ctx.fillText(`${minY.toFixed(0)}`, plotMarginLeft - 6, plotMarginTop + plotH - 2);

  ctx.save();
  ctx.translate(12, plotMarginTop + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText("Axial Height Y (mm)", 0, 0);
  ctx.restore();

  // Color bar legend
  if (showColorbar) {
    const barX = w - plotMarginRight + 12;
    const barY = plotMarginTop;
    const barW = 14;
    const barH = plotH;

    for (let i = 0; i < barH; i++) {
      const tNorm = 1.0 - i / barH;
      const rgb = getInterpolatedColor(colormap, tNorm);
      ctx.fillStyle = rgb.hex;
      ctx.fillRect(barX, barY + i, barW, 1);
    }

    ctx.strokeStyle = "#1F2937";
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.textAlign = "left";
    ctx.fillStyle = "#D1D5DB";
    ctx.font = "9px monospace";
    ctx.fillText(`${maxTempK}K`, barX + barW + 4, barY + 8);
    ctx.fillText(`${Math.round((maxTempK + minTempK) / 2)}K`, barX + barW + 4, barY + barH / 2);
    ctx.fillText(`${minTempK}K`, barX + barW + 4, barY + barH - 2);
  }
}
