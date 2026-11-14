import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#05070c",
          2: "#0b0f18",
          3: "#121722",
        },
        regolith: {
          DEFAULT: "#c9ccd3",
          light: "#e2e4e9",
          dim: "#8b909b",
        },
        dust: "#8b909b",
        earth: {
          DEFAULT: "#6fb6ff",
          dim: "#4a8fd6",
          glow: "rgba(111, 182, 255, 0.2)",
        },
        flame: {
          DEFAULT: "#ff7029",
          hot: "#ffaa40",
          dim: "#d95514",
          glow: "rgba(255, 112, 41, 0.25)",
        },
        sunlit: "#f2e6c9",
      },
      fontFamily: {
        display: ["Michroma", "Eurostile", "Arial Black", "sans-serif"],
        sans: ["Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        hero: ["clamp(2.25rem, 8.6vw, 9rem)", { lineHeight: "1", letterSpacing: "0.24em" }],
        display: ["clamp(1.75rem, 4vw, 3.75rem)", { lineHeight: "1.08", letterSpacing: "0.02em" }],
        lead: ["clamp(1.125rem, 1.6vw, 1.5rem)", { lineHeight: "1.45", letterSpacing: "-0.01em" }],
        body: ["clamp(0.9375rem, 1.05vw, 1.0625rem)", { lineHeight: "1.65", letterSpacing: "-0.005em" }],
        label: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.16em" }],
      },
    },
  },
  plugins: [],
};

export default config;
