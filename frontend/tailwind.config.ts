import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Core text tokens ── */
        ink:   "#e8e2d9",   // primary text (warm white)
        slate: {
          DEFAULT: "#888888",
          100:     "#1e1e1e",
          200:     "#2a2a2a",
        },

        /* ── Surface tokens ── */
        sand: "#0d0d0d",
        sky:  "#0a0a0a",

        /* ── Brand / accent ── */
        coral: "#f59e0b",   // was blue — now amber throughout
        mint:  "rgba(245,158,11,0.08)",

        brand: {
          50:  "rgba(245,158,11,0.06)",
          100: "rgba(245,158,11,0.10)",
          200: "rgba(245,158,11,0.18)",
          300: "rgba(245,158,11,0.28)",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },

        accent: "#f59e0b",

        /* ── Full accent palette (used across badge/status system) ── */
        amber:  "#f59e0b",
        blue:   "#3b82f6",
        green:  "#10b981",
        purple: "#8b5cf6",
        red:    "#f43f5e",
        cyan:   "#06b6d4",
        lime:   "#84cc16",
        orange: "#fb923c",
        pink:   "#e879f9",
      },

      backgroundColor: {
        surface:     "#111111",
        "surface-low": "#0d0d0d",
        "surface-bg":  "#0a0a0a",
      },

      borderColor: {
        DEFAULT:      "#1e1e1e",
        soft:         "#161616",
        strong:       "#2a2a2a",
      },

      boxShadow: {
        panel: "0 20px 60px rgba(0,0,0,0.55)",
        soft:  "0 4px 20px rgba(0,0,0,0.35)",
        amber: "0 10px 28px rgba(245,158,11,0.25)",
        card:  "0 40px 80px rgba(0,0,0,0.5)",
      },

      fontFamily: {
        sans:    ["DM Mono", "monospace"],
        mono:    ["DM Mono", "monospace"],
        display: ["DM Serif Display", "Georgia", "serif"],
      },

      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },

      animation: {
        "fade-up": "fadeUp 0.4s ease both",
        shimmer:   "skeletonShimmer 1.6s ease-in-out infinite",
      },

      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        skeletonShimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition:  "400px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;