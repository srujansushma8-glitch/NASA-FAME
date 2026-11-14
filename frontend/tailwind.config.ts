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
        background: "#080B12",
        charcoal: {
          DEFAULT: "#111827",
          900: "#080B12",
          800: "#0D131F",
          700: "#161F30",
          600: "#1F2B42",
          500: "#324363",
        },
        electric: {
          DEFAULT: "#087CFF",
          400: "#3A98FF",
          500: "#087CFF",
          600: "#0062D6",
          glow: "rgba(8, 124, 255, 0.15)",
        },
        flame: {
          DEFAULT: "#FF7029",
          300: "#FFA16B",
          400: "#FF8747",
          500: "#FF7029",
          600: "#E6550E",
          glow: "rgba(255, 112, 41, 0.18)",
        },
        border: {
          DEFAULT: "#1E293B",
          subtle: "#162032",
          bright: "#2E3F5C",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;

