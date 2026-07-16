import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand Navy ──────────────────────────────────────────────
        navy: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          200: "#c0d0fe",
          300: "#91a9fc",
          400: "#6080f8",
          500: "#3a5af1",
          600: "#2238e6",
          700: "#1a28d3",
          800: "#1a23ab",
          900: "#1B2A4A",
          950: "#0F172A",
        },
        // ── Brand Gold ──────────────────────────────────────────────
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#F59E0B",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // ── Semantic ────────────────────────────────────────────────
        success: {
          50:  "#ecfdf5",
          500: "#10b981",
          600: "#059669",
        },
        danger: {
          50:  "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
        },
        warning: {
          50:  "#fffbeb",
          500: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cal Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
        "card-lg": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
        glow: "0 0 0 3px rgb(245 158 11 / 0.2)",
      },
      backgroundImage: {
        "gradient-navy": "linear-gradient(135deg, #0F172A 0%, #1B2A4A 100%)",
        "gradient-gold": "linear-gradient(135deg, #F59E0B 0%, #d97706 100%)",
        "gradient-card": "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(245 158 11 / 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgb(245 158 11 / 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
