/**
 * NASA-FLAME Shared Visual System Design Tokens
 * Conforming strictly to section 7 (DESIGN REQUIREMENTS):
 * Background: #080B12, Secondary: #111827, Electric Blue: #087CFF, Flame Orange: #FF7029
 */

export const FLAME_THEME = {
  colors: {
    background: "#080B12",
    backgroundAlt: "#0B0F19",
    secondary: "#111827",
    card: "#111827",
    cardHeader: "#161F32",
    surfaceElevated: "#1A2234",
    border: "#1F2937",
    borderHighlight: "#374151",
    borderFocus: "#087CFF",
    
    // Primary accents
    electricBlue: "#087CFF",
    electricBlueHover: "#258DFF",
    electricBlueMuted: "rgba(8, 124, 255, 0.15)",
    electricBlueBorder: "rgba(8, 124, 255, 0.4)",

    flameOrange: "#FF7029",
    flameOrangeHover: "#FF8447",
    flameOrangeMuted: "rgba(255, 112, 41, 0.15)",
    flameOrangeBorder: "rgba(255, 112, 41, 0.4)",

    // Microgravity blue chemiluminescence
    chemiluminescenceBlue: "#38BDF8",
    chemiluminescenceCyan: "#22D3EE",
    
    // Status & Diagnostics
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#087CFF",

    // Typography
    textPrimary: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textMuted: "#9CA3AF",
    textDim: "#6B7280",
    textInverse: "#080B12",
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontFamilyMono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  borders: {
    subtle: "1px solid #1F2937",
    accentBlue: "1px solid rgba(8, 124, 255, 0.4)",
    accentOrange: "1px solid rgba(255, 112, 41, 0.4)",
    radiusSm: "4px",
    radiusMd: "6px",
    radiusLg: "8px",
  },
  shadows: {
    subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.37)",
    elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
  }
} as const;
