/**
 * NASA-FLAME: Scientific Color Maps and Interpolation Utilities
 * Supports physical thermal blackbody radiation, CH-radical and C2-radical chemiluminescence, and perceptually uniform palettes.
 */

export type ColormapType = "blackbody" | "chemiluminescence" | "inferno" | "coolwarm";

interface ColorStop {
  stop: number; // 0.0 to 1.0
  r: number;
  g: number;
  b: number;
}

export const COLOR_PALETTES: Record<ColormapType, ColorStop[]> = {
  // Thermal blackbody radiation: 300 K to 2400 K
  blackbody: [
    { stop: 0.0, r: 15, g: 20, b: 35 },     // Ambient / Dark boundary (~300 K)
    { stop: 0.25, r: 140, g: 20, b: 10 },   // Dull red (~900 K)
    { stop: 0.50, r: 230, g: 75, b: 15 },   // Orange combustion zone (~1400 K)
    { stop: 0.75, r: 255, g: 195, b: 40 },  // Bright yellow soot incandescence (~1800 K)
    { stop: 1.0, r: 255, g: 255, b: 245 },  // White-hot reaction zone (>2200 K)
  ],

  // Microgravity chemiluminescence: CH* (431 nm) & C2* Swan band (516 nm) radicals
  chemiluminescence: [
    { stop: 0.0, r: 8, g: 11, b: 20 },      // Ambient non-reacting
    { stop: 0.25, r: 15, g: 60, b: 180 },   // Deep blue CH* radical emission
    { stop: 0.50, r: 30, g: 175, b: 235 },  // Cyan C2* Swan emission zone
    { stop: 0.75, r: 180, g: 235, b: 255 }, // High-intensity blue reaction front
    { stop: 1.0, r: 255, g: 240, b: 190 },  // Mild soot incandescence core (if any)
  ],

  // Perceptually uniform scientific inferno
  inferno: [
    { stop: 0.0, r: 0, g: 0, b: 4 },
    { stop: 0.25, r: 87, g: 16, b: 110 },
    { stop: 0.50, r: 187, g: 55, b: 84 },
    { stop: 0.75, r: 249, g: 142, b: 9 },
    { stop: 1.0, r: 252, g: 255, b: 164 },
  ],

  // Cool-warm divergence for comparisons (e.g. 0g vs 1g delta)
  coolwarm: [
    { stop: 0.0, r: 59, g: 76, b: 192 },    // Negative delta / cooler
    { stop: 0.5, r: 221, g: 221, b: 221 },  // Zero delta
    { stop: 1.0, r: 180, g: 4, b: 38 },     // Positive delta / hotter
  ],
};

/**
 * Interpolates an RGB color from a palette given a normalized [0, 1] scalar value.
 */
export function getInterpolatedColor(
  colormap: ColormapType,
  t: number
): { r: number; g: number; b: number; hex: string } {
  const clamped = Math.max(0, Math.min(1, isNaN(t) ? 0 : t));
  const stops = COLOR_PALETTES[colormap] || COLOR_PALETTES.blackbody;

  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i].stop && clamped <= stops[i + 1].stop) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper.stop - lower.stop;
  const fraction = range === 0 ? 0 : (clamped - lower.stop) / range;

  const r = Math.round(lower.r + (upper.r - lower.r) * fraction);
  const g = Math.round(lower.g + (upper.g - lower.g) * fraction);
  const b = Math.round(lower.b + (upper.b - lower.b) * fraction);

  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  return { r, g, b, hex };
}

/**
 * Maps a temperature in Kelvin to a color using the blackbody palette.
 */
export function temperatureToColor(
  tempK: number,
  minK: number = 300,
  maxK: number = 2400
): { r: number; g: number; b: number; hex: string } {
  if (tempK <= minK) return getInterpolatedColor("blackbody", 0);
  if (tempK >= maxK) return getInterpolatedColor("blackbody", 1);
  const t = (tempK - minK) / (maxK - minK);
  return getInterpolatedColor("blackbody", t);
}
