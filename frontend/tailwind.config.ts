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
        ink: "#0b1f36",
        slate: {
          DEFAULT: "#5b6b7f",
          100: "#e9eef5",
          200: "#c9d3e1",
        },
        sand: "#f8fafc",
        coral: "#1e3a8a",
        mint: "#dbeafe",
        sky: "#f8fafc",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e3a8a",
          800: "#1e2f74",
          900: "#172554",
        },
        accent: "#f59e0b",
      },
      boxShadow: {
        panel: "0 20px 45px rgba(15, 23, 42, 0.08)",
        soft: "0 12px 24px rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
};

export default config;
