// FILE: components/DashboardClient.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import MascotCanvas from "./MascotCanvas";
import MetricGrid from "./MetricGrid";
import HistoryScroll from "./HistoryScroll";
import BottomNav, { type NavTab } from "./BottomNav";
import { relativeTime, type VitalityReport } from "@/lib/vitality-engine";
import type { FullDashboardData } from "@/lib/github-client";

interface DashboardClientProps {
  data: FullDashboardData;
  report: VitalityReport;
  currentOwner: string;   // ← NEW: passed from the dynamic route
  currentRepo: string;    // ← NEW: passed from the dynamic route
}

// ── REPO SEARCH BAR ───────────────────────────────────────────────────────────
// Shared between DesktopSidebar and MobileHeader
function RepoSearchBar({
  currentOwner,
  currentRepo,
  glowColor,
  onNavigate,
  compact = false,
}: {
  currentOwner: string;
  currentRepo: string;
  glowColor: string;
  onNavigate: () => void; // callback so parent can close any open panel
  compact?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Input is pre-filled with the current repo so users can see what they're on
  const [inputValue, setInputValue] = useState(`${currentOwner}/${currentRepo}`);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Keep the input in sync if the parent page changes (browser back/forward)
  useEffect(() => {
    setInputValue(`${currentOwner}/${currentRepo}`);
  }, [currentOwner, currentRepo]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      const trimmed = inputValue.trim().replace(/^github\.com\//i, "");
      const parts = trimmed.split("/").filter(Boolean);

      if (parts.length < 2) {
        setError("Use format: owner/repo");
        inputRef.current?.focus();
        return;
      }

      const [owner, ...repoParts] = parts;
      const repo = repoParts.join("/"); // handles scoped names like org/sub/repo

      if (!owner || !repo) {
        setError("Both owner and repo are required.");
        return;
      }

      setError(null);
      setIsNavigating(true);
      onNavigate();
      router.push(`/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    },
    [inputValue, router, onNavigate]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      aria-label="Search repository"
    >
      <div
        className={`
          relative flex items-center rounded-xl overflow-hidden
          transition-all duration-200
          ${compact ? "h-9" : "h-10"}
        `}
        style={{
          background: "rgba(3, 4, 10, 0.7)",
          border: `1px solid ${isFocused ? `${glowColor}60` : "rgba(30,34,64,0.8)"}`,
          boxShadow: isFocused
            ? `0 0 0 3px ${glowColor}15, 0 0 20px ${glowColor}10`
            : "none",
        }}
      >
        {/* Search icon */}
        <span
          className={`flex-shrink-0 pl-3 text-sm transition-colors duration-200 ${
            isFocused ? "" : "opacity-40"
          }`}
          style={{ color: isFocused ? glowColor : "#8b92b8" }}
          aria-hidden="true"
        >
          🔍
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="owner/repo"
          aria-label="Enter GitHub owner/repo"
          className={`
            flex-1 bg-transparent outline-none px-2 text-pulse-pure placeholder-pulse-muted
            font-mono
            ${compact ? "text-xs" : "text-xs sm:text-sm"}
          `}
          style={{
            caretColor: glowColor,
            fontFamily: "'JetBrains Mono', monospace",
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isNavigating}
          className="flex-shrink-0 flex items-center justify-center h-full px-3 text-xs font-semibold transition-colors duration-150"
          style={{
            background: `${glowColor}20`,
            color: glowColor,
            borderLeft: `1px solid ${glowColor}30`,
            fontFamily: "'Space Grotesk', sans-serif",
            minWidth: 40,
          }}
          whileTap={{ scale: 0.94 }}
          aria-label="Go to repository"
        >
          {isNavigating ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="block"
            >
              ⟳
            </motion.span>
          ) : (
            "→"
          )}
        </motion.button>
      </div>

      {/* Inline error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-xs px-1"
            style={{ color: "#ff4069" }}
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

// ── DESKTOP SIDEBAR ───────────────────────────────────────────────────────────
function DesktopSidebar({
  data,
  report,
  activeTab,
  onTabChange,
  currentOwner,
  currentRepo,
}: {
  data: FullDashboardData;
  report: VitalityReport;
  activeTab: NavTab;
  onTabChange: (t: NavTab) => void;
  currentOwner: string;
  currentRepo: string;
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
      {/* Brand + search */}
      <div className="p-5 border-b border-pulse-border space-y-3">
        <div>
          <h1
            className="text-lg font-bold gradient-text-violet"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            NexusPulse OS
          </h1>
          <p className="text-xs text-pulse-muted mt-0.5">Edge Community Dashboard</p>
        </div>

        {/* ── REPO SEARCH — desktop ── */}
        <RepoSearchBar
          currentOwner={currentOwner}
          currentRepo={currentRepo}
          glowColor={glowColor}
          onNavigate={() => {}} // no panel to close on desktop
        />
      </div>

      {/* Mascot floating orb */}
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
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-xs text-pulse-ghost">
              ⭐ {data.repo.stars.toLocaleString()}
            </span>
            <span className="text-pulse-border">·</span>
            <span className="text-xs text-pulse-ghost">
              🍴 {data.repo.forks.toLocaleString()}
            </span>
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
                border: isActive
                  ? `1px solid ${glowColor}30`
                  : "1px solid transparent",
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
  currentOwner,
  currentRepo,
}: {
  data: FullDashboardData;
  report: VitalityReport;
  currentOwner: string;
  currentRepo: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="md:hidden border-b border-pulse-border bg-pulse-nebula/60 backdrop-blur-xl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe pt-3 pb-3 gap-3">
        <div className="min-w-0">
          <h1
            className="text-base font-bold gradient-text-violet"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            NexusPulse OS
          </h1>
          <p className="text-xs text-pulse-muted font-mono truncate max-w-[160px]">
            {data.repo.name}
          </p>
        </div>

        {/* Search toggle button */}
        <motion.button
          onClick={() => setSearchOpen((v) => !v)}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl touch-active"
          style={{
            backgroundColor: searchOpen
              ? `${report.stateConfig.glowColor}20`
              : "rgba(30,34,64,0.5)",
            border: `1px solid ${
              searchOpen
                ? `${report.stateConfig.glowColor}40`
                : "rgba(30,34,64,0.8)"
            }`,
          }}
          whileTap={{ scale: 0.88 }}
          aria-label={searchOpen ? "Close search" : "Search repositories"}
          aria-expanded={searchOpen}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={searchOpen ? "close" : "search"}
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="text-sm"
            >
              {searchOpen ? "✕" : "🔍"}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Live status pill */}
        <div
          className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium"
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

      {/* ── COLLAPSIBLE SEARCH — mobile ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <RepoSearchBar
                currentOwner={currentOwner}
                currentRepo={currentRepo}
                glowColor={report.stateConfig.glowColor}
                onNavigate={() => setSearchOpen(false)}
              />
              <p className="text-xs text-pulse-muted mt-2 px-1">
                Try{" "}
                <button
                  className="font-mono underline underline-offset-2 hover:text-pulse-ghost transition-colors"
                  onClick={() => {
                    window.location.href = "/facebook/react";
                  }}
                  style={{ color: report.stateConfig.glowColor }}
                >
                  facebook/react
                </button>{" "}
                or{" "}
                <button
                  className="font-mono underline underline-offset-2 hover:text-pulse-ghost transition-colors"
                  onClick={() => {
                    window.location.href = "/microsoft/vscode";
                  }}
                  style={{ color: report.stateConfig.glowColor }}
                >
                  microsoft/vscode
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot hero */}
      <div className="flex flex-col items-center py-5 px-4">
        <MascotCanvas report={report} size="hero" />
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
function SettingsPanel({
  data,
  report,
  currentOwner,
  currentRepo,
}: {
  data: FullDashboardData;
  report: VitalityReport;
  currentOwner: string;
  currentRepo: string;
}) {
  const { stateConfig, breakdown, score } = report;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 sm:p-5">
        <div className="section-header">
          <span>⚙️</span>
          <h2
            className="text-sm font-semibold text-pulse-pure"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            System Configuration
          </h2>
        </div>
        <div className="space-y-3 text-sm">
          {[
            { label: "Runtime", value: "Cloudflare Edge (V8)" },
            {
              label: "Data source",
              value: data.isMockData ? "Mock (no token)" : "GitHub API v3",
            },
            { label: "Cache TTL", value: "300 seconds" },
            { label: "Algorithm", value: "Vitality Engine v1.0" },
            { label: "Formula", value: "V = C×0.5 + P×0.3 − S×0.2" },
            { label: "Current repo", value: `${currentOwner}/${currentRepo}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between items-center py-2 border-b border-pulse-border last:border-0"
            >
              <span className="text-pulse-muted">{label}</span>
              <span className="font-mono text-xs text-pulse-ghost">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5">
        <div className="section-header">
          <span>🎨</span>
          <h2
            className="text-sm font-semibold text-pulse-pure"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            State Machine Debug
          </h2>
        </div>
        <div className="font-mono text-xs space-y-2 p-3 rounded-xl bg-pulse-void/60 border border-pulse-border">
          <div style={{ color: stateConfig.glowColor }}>
            state: &quot;{report.state}&quot;
          </div>
          <div className="text-pulse-ghost">
            score:{" "}
            <span className="text-pulse-cyan">{score}</span>
          </div>
          <div className="text-pulse-ghost">
            normalized:{" "}
            <span className="text-pulse-cyan">{report.normalizedScore}%</span>
          </div>
          <div className="text-pulse-ghost">
            health:{" "}
            <span className="text-pulse-green">{report.healthPercentage}%</span>
          </div>
          <div className="text-pulse-ghost">
            trend:{" "}
            <span className="text-pulse-amber">&quot;{report.trend}&quot;</span>
          </div>
          <div className="text-pulse-ghost">
            commits_contribution:{" "}
            <span className="text-pulse-cyan">+{breakdown.commitContribution}</span>
          </div>
          <div className="text-pulse-ghost">
            pr_contribution:{" "}
            <span className="text-pulse-cyan">+{breakdown.prContribution}</span>
          </div>
          <div className="text-pulse-ghost">
            stale_penalty:{" "}
            <span style={{ color: "#ff4069" }}>-{breakdown.stalePenalty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PULSE TAB ─────────────────────────────────────────────────────────────────
function PulseTab({
  report,
  data,
}: {
  report: VitalityReport;
  data: FullDashboardData;
}) {
  const { stateConfig, healthPercentage, normalizedScore } = report;

  return (
    <div className="space-y-4">
      <div className="glass-card p-6 flex flex-col items-center gap-4">
        <div className="section-header w-full">
          <span>🧬</span>
          <h2
            className="text-sm font-semibold"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: stateConfig.glowColor,
            }}
          >
            Vitality Pulse
          </h2>
        </div>
        <MascotCanvas report={report} size="hero" />
        <div className="text-center">
          <p
            className="text-lg font-bold"
            style={{
              color: stateConfig.glowColor,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {stateConfig.emoji} {stateConfig.label}
          </p>
          <p className="text-sm text-pulse-ghost mt-1 max-w-xs">
            {stateConfig.description}
          </p>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5">
        <div className="section-header">
          <span>📈</span>
          <h2
            className="text-sm font-semibold text-pulse-pure"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
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
                <span
                  className="font-mono text-sm font-medium"
                  style={{ color }}
                >
                  {value.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-pulse-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}66`,
                  }}
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

// ── ROOT CLIENT COMPONENT ─────────────────────────────────────────────────────
export default function DashboardClient({
  data,
  report,
  currentOwner,
  currentRepo,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const { stateConfig } = report;
  const glowColor = stateConfig.glowColor;

  // Inject CSS custom properties for dynamic glow theming
  useEffect(() => {
    document.documentElement.style.setProperty("--glow-color", glowColor);
    document.documentElement.style.setProperty(
      "--mascot-ring-color",
      stateConfig.ringColor
    );
  }, [glowColor, stateConfig.ringColor]);

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
    settings: (
      <SettingsPanel
        data={data}
        report={report}
        currentOwner={currentOwner}
        currentRepo={currentRepo}
      />
    ),
  };

  return (
    <div className="flex min-h-dvh bg-pulse-void">
      {/* ── DESKTOP SIDEBAR ── */}
      <DesktopSidebar
        data={data}
        report={report}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentOwner={currentOwner}
        currentRepo={currentRepo}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 pb-[72px] md:pb-0">
        {/* Mobile header (includes mascot hero) */}
        <MobileHeader
          data={data}
          report={report}
          currentOwner={currentOwner}
          currentRepo={currentRepo}
        />

        {/* Desktop page header bar */}
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
            animate={{
              boxShadow: [
                `0 0 0px ${glowColor}00`,
                `0 0 12px ${glowColor}44`,
                `0 0 0px ${glowColor}00`,
              ],
            }}
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

        {/* Tab content with page transition */}
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        glowColor={glowColor}
        staleCount={data.metrics.staleIssues}
      />
    </div>
  );
}
