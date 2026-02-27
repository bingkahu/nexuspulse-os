// FILE: app/page.tsx

// ── EDGE RUNTIME DECLARATION ──────────────────────────────────────────────────
export const runtime = "edge";
// Revalidate every 5 minutes via ISR (Cloudflare-compatible)
export const revalidate = 300;

import { Suspense } from "react";
import { fetchDashboardData } from "@/lib/github-client";
import { computeVitality, relativeTime } from "@/lib/vitality-engine";
import DashboardClient from "@/components/DashboardClient";

// ── TARGET REPO — configure via env or hardcode your default ──────────────────
const TARGET_OWNER = process.env.GITHUB_OWNER ?? "vercel";
const TARGET_REPO = process.env.GITHUB_REPO ?? "next.js";

async function DashboardData() {
  const data = await fetchDashboardData({ owner: TARGET_OWNER, repo: TARGET_REPO });
  const report = computeVitality(data.metrics);

  return (
    <DashboardClient
      data={data}
      report={report}
    />
  );
}

// ── LOADING SKELETON ──────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-pulse-void flex flex-col">
      {/* Header skeleton */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-pulse-border">
        <div>
          <div className="skeleton h-6 w-40 mb-2" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton w-10 h-10 rounded-xl" />
      </div>

      {/* Mascot skeleton (mobile hero) */}
      <div className="flex justify-center py-8 md:hidden">
        <div className="skeleton w-44 h-44 rounded-full" />
      </div>

      {/* Metric grid skeleton */}
      <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
        <div className="col-span-full skeleton h-40 rounded-2xl" />
      </div>

      {/* Timeline skeleton */}
      <div className="px-4 sm:px-6 pb-24 sm:pb-6">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    </div>
  );
}

// ── ROOT PAGE ─────────────────────────────────────────────────────────────────
export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}
