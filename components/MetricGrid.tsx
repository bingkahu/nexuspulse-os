// FILE: components/MetricGrid.tsx
"use client";

import { motion } from "framer-motion";
import { formatMetricValue, type VitalityReport, type RawMetrics } from "@/lib/vitality-engine";

interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  icon: string;
  trend?: "up" | "down" | "flat";
  color: string;    // CSS color
  bgColor: string;  // rgba for card tint
}

interface MetricGridProps {
  metrics: RawMetrics;
  report: VitalityReport;
  className?: string;
}

const TREND_ICONS = { up: "↑", down: "↓", flat: "→" };
const TREND_COLORS = {
  up: "#00ff9d",
  down: "#ff4069",
  flat: "#4a5080",
};

// ── CONTAINER ANIMATION ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

// ── INDIVIDUAL METRIC CARD ────────────────────────────────────────────────────
function MetricCard({ card, index }: { card: MetricCard; index: number }) {
  return (
    <motion.div
      variants={cardVariants}
      className="glass-card-hover touch-active group relative"
      style={{ "--glow-color": card.color } as React.CSSProperties}
    >
      {/* Scan line decoration */}
      <div className="scan-overlay" />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-60"
        style={{ background: card.color }}
      />

      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          {/* Icon */}
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl text-lg"
            style={{ backgroundColor: card.bgColor }}
          >
            {card.icon}
          </div>

          {/* Trend indicator */}
          {card.trend && (
            <span
              className="text-xs font-medium font-mono px-1.5 py-0.5 rounded-md"
              style={{
                color: TREND_COLORS[card.trend],
                backgroundColor: `${TREND_COLORS[card.trend]}18`,
              }}
            >
              {TREND_ICONS[card.trend]}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: card.color,
              textShadow: `0 0 20px ${card.color}44`,
            }}
          >
            {card.value}
          </span>
        </div>

        {/* Label */}
        <p className="text-xs sm:text-sm text-pulse-ghost font-medium">{card.label}</p>

        {/* Sublabel */}
        {card.sublabel && (
          <p className="text-xs text-pulse-muted mt-0.5">{card.sublabel}</p>
        )}
      </div>

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${card.bgColor} 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  );
}

// ── VITALITY BREAKDOWN CARD ───────────────────────────────────────────────────
function VitalityBreakdown({ report }: { report: VitalityReport }) {
  const { breakdown, score, stateConfig } = report;

  const items = [
    {
      label: "Commits ×0.5",
      value: breakdown.commitContribution,
      color: "#6c63ff",
      positive: true,
    },
    {
      label: "PRs Merged ×0.3",
      value: breakdown.prContribution,
      color: "#00d4ff",
      positive: true,
    },
    {
      label: "Stale Issues ×0.2",
      value: -breakdown.stalePenalty,
      color: "#ff4069",
      positive: false,
    },
  ];

  return (
    <motion.div
      variants={cardVariants}
      className="glass-card col-span-full sm:col-span-2 xl:col-span-4"
    >
      <div className="scan-overlay" />
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: stateConfig.glowColor }}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span
              className="text-sm font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: stateConfig.glowColor }}
            >
              Vitality Formula Breakdown
            </span>
          </div>
          <span
            className="text-lg font-bold font-mono"
            style={{ color: stateConfig.glowColor }}
          >
            V = {score > 0 ? "+" : ""}{score}
          </span>
        </div>

        {/* Formula display */}
        <div className="font-mono text-xs text-pulse-muted mb-4 p-2 rounded-lg bg-pulse-void/50 border border-pulse-border">
          V = (Commits × 0.5) + (PR_Merged × 0.3) − (Stale_Issues × 0.2)
        </div>

        {/* Breakdown bars */}
        <div className="space-y-3">
          {items.map((item) => {
            const absValue = Math.abs(item.value);
            const barWidth = Math.min(100, (absValue / 80) * 100);

            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-pulse-ghost">{item.label}</span>
                  <span
                    className="text-xs font-mono font-medium"
                    style={{ color: item.color }}
                  >
                    {item.positive ? "+" : ""}{item.value.toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 bg-pulse-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MetricGrid({ metrics, report, className = "" }: MetricGridProps) {
  const cards: MetricCard[] = [
    {
      id: "stars",
      label: "Total Stars",
      value: formatMetricValue(metrics.totalStars),
      sublabel: "GitHub stargazers",
      icon: "⭐",
      trend: "up",
      color: "#ffb830",
      bgColor: "rgba(255, 184, 48, 0.1)",
    },
    {
      id: "commits",
      label: "Commits (30d)",
      value: metrics.commits,
      sublabel: "Last 30 days",
      icon: "💾",
      trend: metrics.commits > 20 ? "up" : metrics.commits > 5 ? "flat" : "down",
      color: "#6c63ff",
      bgColor: "rgba(108, 99, 255, 0.1)",
    },
    {
      id: "prs",
      label: "PRs Merged",
      value: metrics.prsMerged,
      sublabel: "Last 30 days",
      icon: "🔀",
      trend: metrics.prsMerged > 10 ? "up" : "flat",
      color: "#00d4ff",
      bgColor: "rgba(0, 212, 255, 0.1)",
    },
    {
      id: "forks",
      label: "Total Forks",
      value: formatMetricValue(metrics.totalForks),
      sublabel: "Ecosystem reach",
      icon: "🍴",
      trend: "flat",
      color: "#00ff9d",
      bgColor: "rgba(0, 255, 157, 0.1)",
    },
    {
      id: "issues",
      label: "Open Issues",
      value: metrics.totalIssues,
      sublabel: `${metrics.staleIssues} stale (>30d)`,
      icon: "🐛",
      trend: metrics.staleIssues > metrics.totalIssues * 0.5 ? "down" : "flat",
      color: metrics.staleIssues > 5 ? "#ff4069" : "#ffb830",
      bgColor:
        metrics.staleIssues > 5
          ? "rgba(255, 64, 105, 0.1)"
          : "rgba(255, 184, 48, 0.1)",
    },
    {
      id: "contributors",
      label: "Contributors",
      value: metrics.contributors,
      sublabel: "Active authors",
      icon: "👥",
      trend: metrics.contributors > 10 ? "up" : "flat",
      color: "#b47eff",
      bgColor: "rgba(180, 126, 255, 0.1)",
    },
    {
      id: "vitality",
      label: "Vitality Score",
      value: `${report.normalizedScore.toFixed(0)}%`,
      sublabel: report.stateConfig.label,
      icon: "🧬",
      trend: report.trend === "rising" ? "up" : report.trend === "falling" ? "down" : "flat",
      color: report.stateConfig.glowColor,
      bgColor: `${report.stateConfig.glowColor}18`,
    },
    {
      id: "health",
      label: "Health Index",
      value: `${report.healthPercentage}%`,
      sublabel: "Adjusted for stale debt",
      icon: "❤️‍🔥",
      trend: report.healthPercentage > 70 ? "up" : report.healthPercentage < 40 ? "down" : "flat",
      color: "#ff6b35",
      bgColor: "rgba(255, 107, 53, 0.1)",
    },
  ];

  return (
    <motion.div
      className={`
        grid gap-3 sm:gap-4
        grid-cols-2
        sm:grid-cols-2
        lg:grid-cols-4
        xl:grid-cols-4
        ${className}
      `}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, i) => (
        <MetricCard key={card.id} card={card} index={i} />
      ))}

      {/* Full-width vitality breakdown card */}
      <VitalityBreakdown report={report} />
    </motion.div>
  );
}
