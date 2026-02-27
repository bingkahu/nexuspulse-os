// FILE: tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── NEXUSPULSE COLOR SYSTEM ───────────────────────────────
      colors: {
        pulse: {
          void: "#03040a",       // Near-black background
          nebula: "#0d0f1e",     // Card backgrounds
          surface: "#131629",    // Elevated surfaces
          border: "#1e2240",     // Subtle borders
          glow: "#6c63ff",       // Primary violet glow
          cyan: "#00d4ff",       // Accent cyan
          green: "#00ff9d",      // Vitality green
          amber: "#ffb830",      // Warning amber
          red: "#ff4069",        // Danger red
          muted: "#4a5080",      // Muted text
          ghost: "#8b92b8",      // Secondary text
          pure: "#e8eaff",       // Primary text
        },
      },

      // ── CUSTOM FONTS ──────────────────────────────────────────
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },

      // ── GLASSMORPHISM BACKDROP BLUR ───────────────────────────
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "80px",
      },

      // ── PULSE ANIMATIONS ──────────────────────────────────────
      animation: {
        // Core pulse for vitality orb
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",

        // Glow breathing effect
        "glow-breathe": "glowBreathe 3s ease-in-out infinite",
        "glow-breathe-fast": "glowBreathe 1.2s ease-in-out infinite",

        // Orbit rotation for satellite elements
        "orbit-cw": "orbitCW 12s linear infinite",
        "orbit-ccw": "orbitCCW 18s linear infinite",

        // Scan line for tech feel
        "scan-down": "scanDown 3s linear infinite",

        // Float for mascot idle state
        float: "float 6s ease-in-out infinite",
        "float-fast": "float 2.5s ease-in-out infinite",

        // Data stream
        "stream-up": "streamUp 2s linear infinite",

        // Shimmer for loading states
        shimmer: "shimmer 2s linear infinite",

        // Supernova burst
        supernova: "supernova 0.8s ease-out forwards",

        // Spin variants
        "spin-slow": "spin 8s linear infinite",
        "spin-reverse": "spinReverse 6s linear infinite",
      },

      keyframes: {
        glowBreathe: {
          "0%, 100%": {
            boxShadow: "0 0 20px var(--glow-color, #6c63ff44)",
            filter: "brightness(1)",
          },
          "50%": {
            boxShadow: "0 0 60px var(--glow-color, #6c63ff88), 0 0 120px var(--glow-color, #6c63ff33)",
            filter: "brightness(1.2)",
          },
        },
        orbitCW: {
          from: { transform: "rotate(0deg) translateX(var(--orbit-radius, 80px)) rotate(0deg)" },
          to: { transform: "rotate(360deg) translateX(var(--orbit-radius, 80px)) rotate(-360deg)" },
        },
        orbitCCW: {
          from: { transform: "rotate(0deg) translateX(var(--orbit-radius, 80px)) rotate(0deg)" },
          to: { transform: "rotate(-360deg) translateX(var(--orbit-radius, 80px)) rotate(360deg)" },
        },
        scanDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(200%)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        streamUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        supernova: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.8)", opacity: "0.7", filter: "brightness(3)" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        spinReverse: {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
      },

      // ── CUSTOM BOX SHADOWS ────────────────────────────────────
      boxShadow: {
        "glow-violet": "0 0 30px #6c63ff44, 0 0 60px #6c63ff22",
        "glow-cyan": "0 0 30px #00d4ff44, 0 0 60px #00d4ff22",
        "glow-green": "0 0 30px #00ff9d44, 0 0 60px #00ff9d22",
        "glow-amber": "0 0 30px #ffb83044, 0 0 60px #ffb83022",
        "glow-red": "0 0 30px #ff406944, 0 0 60px #ff406922",
        "glow-supernova": "0 0 80px #ff6b35, 0 0 160px #ff406966, 0 0 240px #6c63ff33",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-hover": "0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      },

      // ── GRID TEMPLATE COLUMNS ─────────────────────────────────
      gridTemplateColumns: {
        "metric-sm": "repeat(1, minmax(0, 1fr))",
        "metric-md": "repeat(2, minmax(0, 1fr))",
        "metric-lg": "repeat(3, minmax(0, 1fr))",
        "metric-xl": "repeat(4, minmax(0, 1fr))",
      },

      // ── SPACING ───────────────────────────────────────────────
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
        "nav-height": "72px",
      },

      // ── BORDER RADIUS ─────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
