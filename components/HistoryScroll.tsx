// FILE: components/HistoryScroll.tsx
"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { relativeTime } from "@/lib/vitality-engine";
import type { CommitActivity, PullRequest, Issue } from "@/lib/github-client";

type TimelineEvent =
  | { kind: "commit"; data: CommitActivity }
  | { kind: "pr"; data: PullRequest }
  | { kind: "issue"; data: Issue };

interface HistoryScrollProps {
  commits: CommitActivity[];
  prs: PullRequest[];
  issues: Issue[];
  glowColor?: string;
  className?: string;
}

// ── EVENT CONFIG ──────────────────────────────────────────────────────────────
const EVENT_CONFIG = {
  commit: { icon: "💾", label: "commit", color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  pr: { icon: "🔀", label: "PR merged", color: "#00d4ff", bg: "rgba(0,212,255,0.1)" },
  issue: { icon: "🐛", label: "issue", color: "#ffb830", bg: "rgba(255,184,48,0.1)" },
};

// ── MERGE & SORT EVENTS ───────────────────────────────────────────────────────
function buildTimeline(
  commits: CommitActivity[],
  prs: PullRequest[],
  issues: Issue[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...commits.slice(0, 8).map((data) => ({ kind: "commit" as const, data })),
    ...prs.slice(0, 5).map((data) => ({ kind: "pr" as const, data })),
    ...issues.slice(0, 5).map((data) => ({ kind: "issue" as const, data })),
  ];

  // Sort by date descending
  return events.sort((a, b) => {
    const dateA =
      a.kind === "commit"
        ? a.data.date
        : a.kind === "pr"
        ? a.data.mergedAt ?? ""
        : a.data.updatedAt;
    const dateB =
      b.kind === "commit"
        ? b.data.date
        : b.kind === "pr"
        ? b.data.mergedAt ?? ""
        : b.data.updatedAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

// ── SINGLE TIMELINE ITEM ──────────────────────────────────────────────────────
function TimelineItem({
  event,
  index,
  isLast,
  glowColor,
}: {
  event: TimelineEvent;
  index: number;
  isLast: boolean;
  glowColor: string;
}) {
  const config = EVENT_CONFIG[event.kind];

  const title =
    event.kind === "commit"
      ? event.data.message
      : event.kind === "pr"
      ? `#${event.data.number}: ${event.data.title}`
      : `#${event.data.number}: ${event.data.title}`;

  const author =
    event.kind === "commit"
      ? event.data.author
      : event.kind === "pr"
      ? event.data.author
      : null;

  const date =
    event.kind === "commit"
      ? event.data.date
      : event.kind === "pr"
      ? event.data.mergedAt ?? ""
      : event.data.updatedAt;

  const isStale = event.kind === "issue" && event.data.isStale;
  const url =
    event.kind === "commit"
      ? event.data.url
      : event.kind === "pr"
      ? event.data.url
      : event.data.url;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="relative flex gap-3 sm:gap-4 group"
    >
      {/* ── TIMELINE SPINE ── */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
        {/* Node */}
        <motion.div
          className="relative flex items-center justify-center w-9 h-9 rounded-full text-base flex-shrink-0 z-10 touch-active"
          style={{ backgroundColor: config.bg, border: `1.5px solid ${config.color}44` }}
          whileHover={{ scale: 1.1, boxShadow: `0 0 12px ${config.color}44` }}
        >
          <span>{config.icon}</span>
          {/* Active pulse for most recent item */}
          {index === 0 && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${glowColor}` }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Vertical connector */}
        {!isLast && (
          <div
            className="flex-1 w-px mt-1"
            style={{
              background: `linear-gradient(to bottom, ${config.color}33, transparent)`,
              minHeight: 20,
            }}
          />
        )}
      </div>

      {/* ── EVENT CONTENT ── */}
      <div className="flex-1 pb-4 min-w-0">
        <motion.a
          href={url !== "#" ? url : undefined}
          target={url !== "#" ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="block glass-card-hover group/card p-3 sm:p-4 cursor-pointer no-select"
          whileTap={{ scale: 0.98 }}
        >
          {/* Event type badge + time */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                color: config.color,
                backgroundColor: config.bg,
              }}
            >
              {config.label}
            </span>
            <span className="text-xs text-pulse-muted flex-shrink-0">
              {date ? relativeTime(date) : "—"}
            </span>
          </div>

          {/* Title */}
          <p className="text-sm text-pulse-pure font-medium leading-snug line-clamp-2 mb-1.5">
            {title}
          </p>

          {/* Footer row */}
          <div className="flex items-center gap-2 flex-wrap">
            {author && (
              <span className="text-xs text-pulse-muted flex items-center gap-1">
                <span className="text-pulse-ghost">@{author}</span>
              </span>
            )}
            {isStale && (
              <span className="metric-chip text-xs" style={{ color: "#ff4069", borderColor: "#ff406944", backgroundColor: "#ff406912" }}>
                ⚠ stale
              </span>
            )}
            {event.kind === "issue" && event.data.labels.length > 0 && (
              <>
                {event.data.labels.slice(0, 2).map((label) => (
                  <span key={label} className="metric-chip">
                    {label}
                  </span>
                ))}
              </>
            )}
          </div>
        </motion.a>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function HistoryScroll({
  commits,
  prs,
  issues,
  glowColor = "#6c63ff",
  className = "",
}: HistoryScrollProps) {
  const events = buildTimeline(commits, prs, issues);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`glass-card ${className}`} ref={containerRef}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-pulse-border">
        <div className="section-header">
          <span className="text-base">📜</span>
          <h2
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: glowColor }}
          >
            Activity Stream
          </h2>
        </div>
        <p className="text-xs text-pulse-muted">
          {events.length} events · merged from commits, PRs & issues
        </p>
      </div>

      {/* Timeline scroll area */}
      <div
        className="overflow-y-auto p-4 sm:p-5"
        style={{
          maxHeight: "520px",
          // Custom scrollbar styling inline for cross-browser support
          scrollbarWidth: "thin",
          scrollbarColor: `${glowColor}33 transparent`,
        }}
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-pulse-muted">
            <span className="text-3xl mb-3">🌑</span>
            <p className="text-sm">No recent activity detected.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event, i) => (
              <TimelineItem
                key={`${event.kind}-${i}`}
                event={event}
                index={i}
                isLast={i === events.length - 1}
                glowColor={glowColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
