import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/visualization/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // MONOLITH 3-Color Strict Palette
        ink: {
          DEFAULT: "#0C0C0D", // Primary (70%)
          surface: "#121215",
          elevated: "#18181D",
          subtle: "#222228",
          deep: "#080809",
        },
        stone: {
          DEFAULT: "#CFC9BF", // Secondary (20%)
          light: "#EAE7E0",
          dim: "#9E998F",
          muted: "#6B6760",
          border: "rgba(207, 201, 191, 0.15)",
          borderStrong: "rgba(207, 201, 191, 0.35)",
        },
        cobalt: {
          DEFAULT: "#2B4BFF", // Accent (10%)
          hover: "#4361FF",
          glow: "rgba(43, 75, 255, 0.35)",
          subtle: "rgba(43, 75, 255, 0.12)",
          border: "rgba(43, 75, 255, 0.4)",
          dark: "#14258A",
        },
        // Subtle Flame Combustion Core Warmth ONLY
        flame: {
          DEFAULT: "#FF7A29",
          hot: "#FFAA40",
          amber: "#FFB84D",
          glow: "rgba(255, 122, 41, 0.25)",
        },
        // Legacy backward-compatibility mappings
        void: {
          DEFAULT: "#0C0C0D",
          2: "#121215",
          3: "#18181D",
        },
        regolith: {
          DEFAULT: "#CFC9BF",
          light: "#EAE7E0",
          dim: "#9E998F",
        },
        earth: {
          DEFAULT: "#2B4BFF",
          dim: "#1E3ECC",
          glow: "rgba(43, 75, 255, 0.25)",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Michroma", "Eurostile", "-apple-system", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "SF Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        hero: ["clamp(3.5rem, 11vw, 11.5rem)", { lineHeight: "0.88", letterSpacing: "-0.04em" }],
        display: ["clamp(2.25rem, 5.5vw, 5.5rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        h2: ["clamp(1.75rem, 3.5vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        lead: ["clamp(1.05rem, 1.4vw, 1.35rem)", { lineHeight: "1.5", letterSpacing: "-0.01em" }],
        body: ["clamp(0.875rem, 1vw, 1rem)", { lineHeight: "1.65", letterSpacing: "-0.005em" }],
        label: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.22em" }],
        micro: ["0.5625rem", { lineHeight: "1.2", letterSpacing: "0.26em" }],
      },
      letterSpacing: {
        tightest: "-0.05em",
        tighter: "-0.03em",
        widestEditorial: "0.28em",
      },
      backgroundImage: {
        "grid-monolith": "radial-gradient(rgba(207, 201, 191, 0.08) 1px, transparent 0)",
        "cobalt-radial": "radial-gradient(circle at 50% 50%, rgba(43, 75, 255, 0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;