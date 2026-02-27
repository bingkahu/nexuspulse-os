// FILE: lib/vitality-engine.ts

/**
 * NexusPulse Vitality Engine
 * ─────────────────────────────────────────────────────────
 * Computes a repository's "life force" from raw GitHub metrics.
 * All math runs at the Edge — no server required.
 *
 * Vitality Formula:
 *   V = (Commits × 0.5) + (PR_Merged × 0.3) - (Stale_Issues × 0.2)
 *
 * State thresholds are calibrated for a healthy open-source repo.
 */

export type VitalityState =
  | "dormant"     // V < 0   — the repo is in decay
  | "recovering"  // 0–25    — life signs present
  | "stable"      // 25–60   — steady, predictable
  | "thriving"    // 60–90   — high momentum
  | "supernova";  // > 90    — exceptional burst of activity

export interface RawMetrics {
  commits: number;
  prsMerged: number;
  staleIssues: number;
  totalIssues: number;
  totalStars: number;
  totalForks: number;
  contributors: number;
  lastCommitDate: string;
}

export interface VitalityReport {
  score: number;            // Raw computed score (can be negative)
  normalizedScore: number;  // 0–100 clamped for UI display
  state: VitalityState;
  breakdown: {
    commitContribution: number;
    prContribution: number;
    stalePenalty: number;
  };
  stateConfig: StateConfig;
  trend: "rising" | "falling" | "flat";
  healthPercentage: number; // 0–100 for the progress arc
}

export interface StateConfig {
  label: string;
  emoji: string;
  color: string;          // Tailwind color token
  glowColor: string;      // CSS hex for dynamic shadow
  description: string;
  mascotAnimation: "idle" | "pulse" | "breathe" | "orbit" | "supernova";
  particleCount: number;
  ringColor: string;      // CSS gradient string for mascot ring
}

// ── STATE CONFIGURATION MAP ───────────────────────────────────────────────────
export const STATE_CONFIGS: Record<VitalityState, StateConfig> = {
  dormant: {
    label: "Dormant",
    emoji: "🌑",
    color: "text-pulse-muted",
    glowColor: "#4a5080",
    description: "Repository activity has ceased. Awaiting revival.",
    mascotAnimation: "idle",
    particleCount: 0,
    ringColor: "conic-gradient(from 0deg, #4a5080, #2a2d4a, #4a5080)",
  },
  recovering: {
    label: "Recovering",
    emoji: "🌒",
    color: "text-pulse-amber",
    glowColor: "#ffb830",
    description: "Faint signals detected. Growth patterns emerging.",
    mascotAnimation: "breathe",
    particleCount: 4,
    ringColor: "conic-gradient(from 0deg, #ffb830, #ff6b00, #ffb830)",
  },
  stable: {
    label: "Stable",
    emoji: "🌗",
    color: "text-pulse-cyan",
    glowColor: "#00d4ff",
    description: "Consistent cadence. The system holds steady.",
    mascotAnimation: "pulse",
    particleCount: 8,
    ringColor: "conic-gradient(from 0deg, #00d4ff, #0066ff, #00d4ff)",
  },
  thriving: {
    label: "Thriving",
    emoji: "🌕",
    color: "text-pulse-green",
    glowColor: "#00ff9d",
    description: "Peak performance. High contributor momentum detected.",
    mascotAnimation: "orbit",
    particleCount: 16,
    ringColor: "conic-gradient(from 0deg, #00ff9d, #00b4d8, #6c63ff, #00ff9d)",
  },
  supernova: {
    label: "Supernova",
    emoji: "✨",
    color: "text-yellow-300",
    glowColor: "#ff6b35",
    description: "CRITICAL MASS ACHIEVED. Extraordinary activity surge.",
    mascotAnimation: "supernova",
    particleCount: 32,
    ringColor:
      "conic-gradient(from 0deg, #ff6b35, #ff4069, #6c63ff, #00ff9d, #ffb830, #ff6b35)",
  },
};

// ── CORE VITALITY FORMULA ──────────────────────────────────────────────────────
export function computeVitality(metrics: RawMetrics): VitalityReport {
  const commitContribution = metrics.commits * 0.5;
  const prContribution = metrics.prsMerged * 0.3;
  const stalePenalty = metrics.staleIssues * 0.2;

  const score = commitContribution + prContribution - stalePenalty;

  // Normalize to 0–100 scale (score of 120 = max expected healthy activity)
  const MAX_EXPECTED_SCORE = 120;
  const normalizedScore = Math.max(0, Math.min(100, (score / MAX_EXPECTED_SCORE) * 100));

  const state = resolveState(score);
  const stateConfig = STATE_CONFIGS[state];

  // Health percentage accounts for stale debt ratio
  const staleRatio = metrics.totalIssues > 0
    ? metrics.staleIssues / metrics.totalIssues
    : 0;
  const healthPercentage = Math.max(0, Math.min(100, normalizedScore * (1 - staleRatio * 0.5)));

  // Simplified trend: compare commit velocity against PR closure rate
  const commitMomentum = metrics.commits * 0.5;
  const closureMomentum = metrics.prsMerged * 0.3;
  const trend: VitalityReport["trend"] =
    commitMomentum > closureMomentum + 10
      ? "rising"
      : closureMomentum > commitMomentum + 10
      ? "falling"
      : "flat";

  return {
    score: Math.round(score * 10) / 10,
    normalizedScore: Math.round(normalizedScore * 10) / 10,
    state,
    breakdown: {
      commitContribution: Math.round(commitContribution * 10) / 10,
      prContribution: Math.round(prContribution * 10) / 10,
      stalePenalty: Math.round(stalePenalty * 10) / 10,
    },
    stateConfig,
    trend,
    healthPercentage: Math.round(healthPercentage),
  };
}

function resolveState(score: number): VitalityState {
  if (score < 0) return "dormant";
  if (score < 25) return "recovering";
  if (score < 60) return "stable";
  if (score < 90) return "thriving";
  return "supernova";
}

// ── MOCK DATA FACTORY (used when no GITHUB_TOKEN is set) ──────────────────────
export function generateMockMetrics(seed: number = Date.now()): RawMetrics {
  const random = (min: number, max: number) => {
    const x = Math.sin(seed++) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const commits = random(5, 150);
  const prsMerged = random(2, 60);
  const totalIssues = random(10, 80);
  const staleIssues = random(0, Math.floor(totalIssues * 0.6));

  return {
    commits,
    prsMerged,
    staleIssues,
    totalIssues,
    totalStars: random(20, 5000),
    totalForks: random(5, 800),
    contributors: random(3, 50),
    lastCommitDate: new Date(Date.now() - random(0, 7) * 86400000).toISOString(),
  };
}

// ── UTILITY: Format large numbers for display ─────────────────────────────────
export function formatMetricValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

// ── UTILITY: Relative time formatting (Edge-safe, no date-fns) ────────────────
export function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
