// FILE: app/[owner]/[repo]/page.tsx

export const runtime = "edge";
export const revalidate = 300;

import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchDashboardData } from "@/lib/github-client";
import { computeVitality } from "@/lib/vitality-engine";
import DashboardClient from "@/components/DashboardClient";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface PageProps {
  params: {
    owner: string;
    repo: string;
  };
}

// ── DYNAMIC METADATA ──────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { owner, repo } = params;
  return {
    title: `${owner}/${repo} — NexusPulse OS`,
    description: `Live community health dashboard for ${owner}/${repo}. Vitality scoring, contributor analytics, and project momentum tracking.`,
    openGraph: {
      title: `${owner}/${repo} — NexusPulse OS`,
      description: `Real-time vitality dashboard for the ${repo} repository.`,
      type: "website",
    },
  };
}

// ── DATA FETCHING COMPONENT ───────────────────────────────────────────────────
async function DashboardData({ owner, repo }: { owner: string; repo: string }) {
  // Decode URI components in case the URL contains encoded chars
  const decodedOwner = decodeURIComponent(owner);
  const decodedRepo = decodeURIComponent(repo);

  const data = await fetchDashboardData({
    owner: decodedOwner,
    repo: decodedRepo,
  });

  const report = computeVitality(data.metrics);

  return (
    <DashboardClient
      data={data}
      report={report}
      currentOwner={decodedOwner}
      currentRepo={decodedRepo}
    />
  );
}

// ── LOADING SKELETON ──────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-pulse-void flex flex-col">
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-pulse-border">
        <div>
          <div className="skeleton h-6 w-40 mb-2" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton w-10 h-10 rounded-xl" />
      </div>
      <div className="flex justify-center py-8 md:hidden">
        <div className="skeleton w-44 h-44 rounded-full" />
      </div>
      <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
        <div className="col-span-full skeleton h-40 rounded-2xl" />
      </div>
      <div className="px-4 sm:px-6 pb-24 sm:pb-6">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    </div>
  );
}

// ── ROOT PAGE ─────────────────────────────────────────────────────────────────
export default function DynamicRepoPage({ params }: PageProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData owner={params.owner} repo={params.repo} />
    </Suspense>
  );
}
