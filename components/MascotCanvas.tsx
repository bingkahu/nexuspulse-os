// FILE: components/MascotCanvas.tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import type { VitalityReport, VitalityState } from "@/lib/vitality-engine";

interface MascotCanvasProps {
  report: VitalityReport;
  size?: "hero" | "orb"; // hero = mobile header, orb = desktop sidebar
  className?: string;
}

// ── STATE → SVG PATH MAPPING ──────────────────────────────────────────────────
// Each state has a unique "eye" expression and body shape variation
const MASCOT_EYES: Record<VitalityState, { left: string; right: string; pupil?: string }> = {
  dormant: {
    left: "M 58 48 Q 62 44 66 48",   // closed eyes
    right: "M 74 48 Q 78 44 82 48",
  },
  recovering: {
    left: "M 58 48 Q 62 43 66 48",   // half-open
    right: "M 74 46 Q 78 42 82 46",
    pupil: "M 82 46 a 2 2 0 1 1 -0.01 0",
  },
  stable: {
    left: "M 58 47 Q 62 41 66 47",   // open circles represented by cx
    right: "M 74 47 Q 78 41 82 47",
    pupil: "M 62 44 a 4 4 0 1 1 -0.01 0 M 78 44 a 4 4 0 1 1 -0.01 0",
  },
  thriving: {
    left: "M 56 46 Q 62 39 68 46",   // wide open
    right: "M 72 46 Q 78 39 84 46",
    pupil: "M 62 43 a 5 5 0 1 1 -0.01 0 M 78 43 a 5 5 0 1 1 -0.01 0",
  },
  supernova: {
    left: "M 54 44 Q 62 36 70 44",   // fully dilated, star-shaped
    right: "M 70 44 Q 78 36 86 44",
    pupil: "M 62 42 a 6 6 0 1 1 -0.01 0 M 78 42 a 6 6 0 1 1 -0.01 0",
  },
};

// ── PARTICLE SYSTEM ───────────────────────────────────────────────────────────
function Particle({ index, total, color }: { index: number; total: number; color: string }) {
  const angle = (index / total) * 360;
  const radius = 52 + (index % 3) * 12;
  const size = 2 + (index % 4);
  const delay = (index / total) * 2;
  const duration = 2 + (index % 3) * 0.5;

  const x = Math.cos((angle * Math.PI) / 180) * radius + 70;
  const y = Math.sin((angle * Math.PI) / 180) * radius + 70;

  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        cx: [x, x + Math.cos((angle * Math.PI) / 180) * 15],
        cy: [y, y + Math.sin((angle * Math.PI) / 180) * 15],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MascotCanvas({
  report,
  size = "hero",
  className = "",
}: MascotCanvasProps) {
  const prefersReducedMotion = useReducedMotion();
  const { state, stateConfig, normalizedScore, healthPercentage } = report;
  const eyes = MASCOT_EYES[state];

  const svgSize = size === "hero" ? 180 : 140;
  const viewBox = "0 0 140 140";

  // Compute ring circumference for progress arc
  const ringRadius = 62;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference - (healthPercentage / 100) * circumference;

  // Body fill varies by state
  const bodyColors: Record<VitalityState, [string, string]> = {
    dormant: ["#2a2d4a", "#1a1c35"],
    recovering: ["#3d2a0a", "#2a1a05"],
    stable: ["#0a2a3d", "#051a2a"],
    thriving: ["#0a3d2a", "#052a1a"],
    supernova: ["#3d1a0a", "#2a0a05"],
  };
  const [bodyTop, bodyBottom] = bodyColors[state];

  // Core body animation config
  const bodyAnimations = useMemo(() => {
    if (prefersReducedMotion) return {};
    switch (stateConfig.mascotAnimation) {
      case "idle":
        return {};
      case "breathe":
        return { scaleY: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity } };
      case "pulse":
        return { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity } };
      case "orbit":
        return {
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0],
          transition: { duration: 1.5, repeat: Infinity },
        };
      case "supernova":
        return {
          scale: [1, 1.08, 1, 1.08, 1],
          filter: ["brightness(1)", "brightness(1.5)", "brightness(1)", "brightness(2)", "brightness(1)"],
          transition: { duration: 0.8, repeat: Infinity },
        };
      default:
        return {};
    }
  }, [stateConfig.mascotAnimation, prefersReducedMotion]);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: svgSize, height: svgSize }}
    >
      {/* Glow backdrop — pure CSS, no canvas needed */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${stateConfig.glowColor}33 0%, transparent 70%)`,
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
                opacity: [0.5, 1, 0.5],
                scale: [0.9, 1.1, 0.9],
              }
        }
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* SVG Organism */}
      <motion.svg
        width={svgSize}
        height={svgSize}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative gpu"
        animate={bodyAnimations}
        style={{ filter: `drop-shadow(0 0 12px ${stateConfig.glowColor}66)` }}
      >
        <defs>
          {/* Body gradient */}
          <radialGradient id={`bodyGrad-${state}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={bodyTop} />
            <stop offset="100%" stopColor={bodyBottom} />
          </radialGradient>

          {/* Eye glow */}
          <filter id="eyeGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Supernova filter */}
          <filter id="supernovaFilter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── HEALTH RING (progress arc) ── */}
        {/* Background ring */}
        <circle
          cx="70"
          cy="70"
          r={ringRadius}
          stroke="rgba(30,34,64,0.6)"
          strokeWidth="3"
          fill="none"
        />
        {/* Animated progress ring */}
        <motion.circle
          cx="70"
          cy="70"
          r={ringRadius}
          stroke={stateConfig.glowColor}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          transform="rotate(-90 70 70)"
          style={{ filter: `drop-shadow(0 0 4px ${stateConfig.glowColor})` }}
        />

        {/* ── ORBITING PARTICLES ── */}
        {!prefersReducedMotion &&
          Array.from({ length: stateConfig.particleCount }, (_, i) => (
            <Particle
              key={i}
              index={i}
              total={stateConfig.particleCount}
              color={stateConfig.glowColor}
            />
          ))}

        {/* ── MAIN BODY ── */}
        <motion.ellipse
          cx="70"
          cy="72"
          rx="38"
          ry="42"
          fill={`url(#bodyGrad-${state})`}
          stroke={stateConfig.glowColor}
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* Body inner highlight */}
        <ellipse
          cx="60"
          cy="58"
          rx="10"
          ry="6"
          fill="rgba(255,255,255,0.06)"
          transform="rotate(-20 60 58)"
        />

        {/* ── EYES ── */}
        <AnimatePresence mode="wait">
          <motion.g
            key={`eyes-${state}`}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.3 }}
            filter="url(#eyeGlow)"
          >
            {/* Eye sockets */}
            <path
              d={eyes.left}
              stroke={stateConfig.glowColor}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={eyes.right}
              stroke={stateConfig.glowColor}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Pupils — only for open-eye states */}
            {eyes.pupil && state !== "dormant" && (
              <path
                d={eyes.pupil}
                fill={stateConfig.glowColor}
                fillOpacity="0.9"
              />
            )}

            {/* Supernova star pupils */}
            {state === "supernova" && (
              <>
                <motion.text
                  x="58"
                  y="48"
                  fontSize="12"
                  textAnchor="middle"
                  fill="#ffb830"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "62px 44px" }}
                >
                  ✦
                </motion.text>
                <motion.text
                  x="74"
                  y="48"
                  fontSize="12"
                  textAnchor="middle"
                  fill="#ffb830"
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "78px 44px" }}
                >
                  ✦
                </motion.text>
              </>
            )}
          </motion.g>
        </AnimatePresence>

        {/* ── MOUTH ── */}
        <motion.path
          d={
            state === "dormant"
              ? "M 60 65 Q 70 65 80 65"     // flat line — dormant
              : state === "recovering"
              ? "M 60 66 Q 70 63 80 66"     // slight upturn
              : state === "stable"
              ? "M 58 65 Q 70 72 82 65"     // smile
              : state === "thriving"
              ? "M 56 63 Q 70 74 84 63"     // big smile
              : "M 54 61 Q 70 76 86 61"     // huge grin — supernova
          }
          stroke={stateConfig.glowColor}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Vitality score readout inside body */}
        <text
          x="70"
          y="92"
          textAnchor="middle"
          fontSize="11"
          fontFamily="'JetBrains Mono', monospace"
          fill={stateConfig.glowColor}
          fillOpacity="0.8"
        >
          {normalizedScore.toFixed(0)}%
        </text>
      </motion.svg>

      {/* State label badge */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full no-select"
          style={{
            backgroundColor: `${stateConfig.glowColor}22`,
            border: `1px solid ${stateConfig.glowColor}44`,
            color: stateConfig.glowColor,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {stateConfig.emoji} {stateConfig.label}
        </span>
      </motion.div>
    </div>
  );
}
