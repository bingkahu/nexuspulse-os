// FILE: components/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MascotCanvas from "./MascotCanvas";
import MetricGrid from "./MetricGrid";
import HistoryScroll from "./HistoryScroll";
import BottomNav, { type NavTab } from "./BottomNav";
import { relativeTime, type VitalityReport } from "@/lib/vitality-engine";
import type { FullDashboardData } from "@/lib/github-client";

interface DashboardClientProps {
  data: FullDashboardData;
  report: VitalityReport;
}

// ── DESKTOP SIDEBAR NAV ───────────────────────────────────────────────────────
function DesktopSidebar({
  data,
  report,
  activeTab,
  onTabChange,
}: {
  data: FullDashboardData;
  report: VitalityReport;
  activeTab: NavTab;
  onTabChange: (t: NavTab) => void;
}) {
  const { stateConfig } = report;
  const glowColor = stateConfig.glowColor;

  const navItems: { id: NavTab; icon: string; label: string }[] = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "pulse",     icon: "🧬", label: "Pulse" },
    { id: "history",   icon: "📜", label: "History" },
    { id: "settings",  icon: "⚙️",  label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 xl:w-72 min-h-dvh border-r border-pulse-border bg-pulse-nebula/50 backdrop-blur-xl flex-shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-pulse-border">
        <h1
          className="text-lg font-bold gradient-text-violet"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          NexusPulse OS
        </h1>
        <p className="text-xs text-pulse-muted mt-0.5">Edge Community Dashboard</p>
      </div>

      {/* Mascot "floating orb" — desktop only */}
      <div className="flex flex-col items-center py-6 px-4">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <MascotCanvas report={report} size="orb" />
        </motion.div>

        {/* Repo info */}
        <div className="mt-5 text-center w-full">
          
            href={data.repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-pulse-pure hover:text-white transition-colors truncate block"
          >
            {data.repo.name}
          </a>
          <p className="text-xs text-pulse-muted mt-1 line-clamp-2 leading-relaxed px-2">
            {data.repo.description}
          </p>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-xs text-pulse-ghost">⭐ {data.repo.stars.toLocaleString()}</span>
            <span className="text-pulse-border">·</span>
            <span className="text-xs text-pulse-ghost">🍴 {data.repo.forks.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium touch-active text-left"
              style={{
                backgroundColor: isActive ? `${glowColor}15` : "transparent",
                color: isActive ? glowColor : "#8b92b8",
                border: isActive ? `1px solid ${glowColor}30` : "1px solid transparent",
              }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: glowColor }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="p-4 border-t border-pulse-border">
        {data.isMockData && (
          <div className="mb-2 text-xs p-2 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300">
            ⚠ Mock data mode. Set GITHUB_TOKEN env var.
          </div>
        )}
        <p className="text-xs text-pulse-muted">
          Synced {relativeTime(data.fetchedAt)}
        </p>
      </div>
    </aside>
  );
}

// ── MOBILE HEADER ─────────────────────────────────────────────────────────────
function MobileHeader({
  data,
  report,
}: {
  data: FullDashboardData;
  report: VitalityReport;
}) {
  return (
    <header className="md:hidden border-b border-pulse-border bg-pulse-nebula/60 backdrop-blur-xl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe pt-3 pb-3">
        <div>
          <h1
            className="text-base font-bold gradient-text-violet"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            NexusPulse OS
          </h1>
          <p className="text-xs text-pulse-muted font-mono truncate max-w-[180px]">
            {data.repo.name}
          </p>
        </div>
        {/* Mini status badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${report.stateConfig.glowColor}15`,
            border: `1px solid ${report.stateConfig.glowColor}30`,
            color: report.stateConfig.glowColor,
          }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: report.stateConfig.glowColor }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          LIVE
        </div>
      </div>

      {/* Mascot hero — mobile only */}
      <div className="flex flex-col items-center py-5 px-4">
        <MascotCanvas report={report} size="hero" />

        {/* State description */}
        <motion.p
          className="text-xs text-pulse-ghost text-center mt-4 max-w-xs leading-relaxed px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {report.stateConfig.description}
        </motion.p>

        {data.isMockData && (
          <div className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-300">
            ⚠ Mock data — set GITHUB_TOKEN to go live
          </div>
        )}
      </div>
    </header>
  );
}

// ── SETTINGS PANEL ────────────────────────────────────────────────────────────
function SettingsPanel({ data, report }: { data: FullDashboardData; report: VitalityReport }) {
  const { stateConfig, breakdown, score } = report;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 sm:p-5">
        <div className="section-header">
          <span>⚙️</span>
          <h2 className="text-sm font-semibold text-pulse-pure" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            System Configuration
          </h2>
        </div>
        <div className="space-y-3 text-sm">
          {[
            { label: "Runtime", value: "Cloudflare Edge (V8)" },
            { label: "Data source", value: data.isMockData ? "Mock (no token)" : "GitHub API v3" },
            { label: "Cache TTL", value: "300 seconds" },
            { label: "Algorithm", value: "Vitality Engine v1.0" },
            { label: "Formula", value: "V = C×0.5 + P×0.3 − S×0.2" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-pulse-border last:border-0">
              <span className="text-pulse-muted">{label}</span>
              <span className="font-mono text-xs text-pulse-ghost">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5">
        <div className="section-header">
          <span>🎨</span>
          <h2 className="text-sm font-semibold text-pulse-pure" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            State Machine Debug
          </h2>
        </div>
        <div className="font-mono text-xs space-y-2 p-3 rounded-xl bg-pulse-void/60 border border-pulse-border">
          <div style={{ color: stateConfig.glowColor }}>state: "{report.state}"</div>
          <div className="text-pulse-ghost">score: <span className="text-pulse-cyan">{score}</span></div>
          <div className="text-pulse-ghost">normalized: <span className="text-pulse-cyan">{report.normalizedScore}%</span></div>
          <div className="text-pulse-ghost">health: <span className="text-pulse-green">{report.healthPercentage}%</span></div>
          <div className="text-pulse-ghost">trend: <span className="text-pulse-amber">"{report.trend}"</span></div>
          <div className="text-pulse-ghost">commits_contribution: <span className="text-pulse-cyan">+{breakdown.commitContribution}</span></div>
          <div className="text-pulse-ghost">pr_contribution: <span className="text-pulse-cyan">+{breakdown.prContribution}</span></div>
          <div className="text-pulse-ghost">stale_penalty: <span style={{ color: "#ff4069" }}>-{breakdown.stalePenalty}</span></div>
        </div>
      </div>
    </div>
  );
}

// ── PULSE TAB ─────────────────────────────────────────────────────────────────
function PulseTab({ report, data }: { report: VitalityReport; data: FullDashboardData }) {
  const { stateConfig, healthPercentage, normalizedScore } = report;

  return (
    <div className="space-y-4">
      {/* Large vitality orb — centered */}
      <div className="glass-card p-6 flex flex-col items-center gap-4">
        <div className="section-header w-full">
          <span>🧬</span>
          <h2 className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: stateConfig.glowColor }}>
            Vitality Pulse
          </h2>
        </div>

        <MascotCanvas report={report} size="hero" />

        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: stateConfig.glowColor, fontFamily: "'Space Grotesk', sans-serif" }}>
            {stateConfig.emoji} {stateConfig.label}
          </p>
          <p className="text-sm text-pulse-ghost mt-1 max-w-xs">
            {stateConfig.description}
          </p>
        </div>
      </div>

      {/* Health meters */}
      <div className="glass-card p-4 sm:p-5">
        <div className="section-header">
          <span>📈</span>
          <h2 className="text-sm font-semibold text-pulse-pure" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Health Indicators
          </h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Vitality Score", value: normalizedScore, color: stateConfig.glowColor },
            { label: "Health Index", value: healthPercentage, color: "#00ff9d" },
            {
              label: "Activity Density",
              value: Math.min(100, (data.metrics.commits / 50) * 100),
              color: "#6c63ff",
            },
            {
              label: "PR Throughput",
              value: Math.min(100, (data.metrics.prsMerged / 20) * 100),
              color: "#00d4ff",
            },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-pulse-ghost">{label}</span>
                <span className="font-mono text-sm font-medium" style={{ color }}>
                  {value.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-pulse-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD CLIENT ─────────────────────────────────────────────────────
export default function DashboardClient({ data, report }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const { stateConfig } = report;
  const glowColor = stateConfig.glowColor;

  // Inject CSS custom properties for dynamic glow
  useEffect(() => {
    document.documentElement.style.setProperty("--glow-color", glowColor);
    document.documentElement.style.setProperty("--mascot-ring-color", stateConfig.ringColor);
  }, [glowColor, stateConfig.ringColor]);

  // Tab content map
  const tabContent = {
    dashboard: (
      <div className="space-y-4">
        <MetricGrid metrics={data.metrics} report={report} />
        <HistoryScroll
          commits={data.recentCommits}
          prs={data.recentPRs}
          issues={data.recentIssues}
          glowColor={glowColor}
        />
      </div>
    ),
    pulse: <PulseTab report={report} data={data} />,
    history: (
      <HistoryScroll
        commits={data.recentCommits}
        prs={data.recentPRs}
        issues={data.recentIssues}
        glowColor={glowColor}
      />
    ),
    settings: <SettingsPanel data={data} report={report} />,
  };

  return (
    <div className="flex min-h-dvh bg-pulse-void">
      {/* Desktop sidebar */}
      <DesktopSidebar
        data={data}
        report={report}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 pb-[72px] md:pb-0">
        {/* Mobile header + mascot hero */}
        <MobileHeader data={data} report={report} />

        {/* Desktop page header */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-pulse-border">
          <div>
            <h2
              className="text-base font-semibold text-pulse-pure capitalize"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {activeTab}
            </h2>
            <p className="text-xs text-pulse-muted mt-0.5">
              Last synced {relativeTime(data.fetchedAt)}
            </p>
          </div>
          {/* State pill */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${glowColor}15`,
              border: `1px solid ${glowColor}30`,
              color: glowColor,
            }}
            animate={{ boxShadow: [`0 0 0px ${glowColor}00`, `0 0 12px ${glowColor}44`, `0 0 0px ${glowColor}00`] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: glowColor }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {stateConfig.emoji} {stateConfig.label.toUpperCase()}
          </motion.div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        glowColor={glowColor}
        staleCount={data.metrics.staleIssues}
      />
    </div>
  );
}
