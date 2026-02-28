// FILE: lib/github-client.ts

/**
 * NexusPulse GitHub Client — Edge Runtime Compatible
 * ─────────────────────────────────────────────────────────
 * Uses fetch() directly (no Node.js http module) so it runs
 * on Cloudflare's V8-based Edge without polyfills.
 *
 * CHANGE: owner and repo are now explicit string parameters
 * on every public function — no module-level constants.
 */

import { RawMetrics, generateMockMetrics } from "./vitality-engine";

// ── PUBLIC TYPES ──────────────────────────────────────────────────────────────
export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface CommitActivity {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface PullRequest {
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  mergedAt: string | null;
  author: string;
  url: string;
}

export interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  isStale: boolean;
  url: string;
  labels: string[];
}

export interface FullDashboardData {
  repo: {
    name: string;
    description: string;
    stars: number;
    forks: number;
    url: string;
  };
  metrics: RawMetrics;
  recentCommits: CommitActivity[];
  recentPRs: PullRequest[];
  recentIssues: Issue[];
  fetchedAt: string;
  isMockData: boolean;
}

// ── INTERNALS ─────────────────────────────────────────────────────────────────
const GITHUB_API = "https://api.github.com";
const STALE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function ghFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "NexusPulse-OS/1.0",
      ...options.headers,
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(
      `GitHub API error: ${res.status} ${res.statusText} — ${path}`
    );
  }

  return res.json() as Promise<T>;
}

// ── MAIN DATA FETCHER — now accepts GitHubRepo argument ───────────────────────
export async function fetchDashboardData(
  target: GitHubRepo
): Promise<FullDashboardData> {
  const token = process.env.GITHUB_TOKEN;

  if (!token || token === "mock") {
    return buildMockDashboard(target);
  }

  try {
    const { owner, repo } = target;
    const since = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const [repoData, commitsData, prsData, issuesData, contributorsData] =
      await Promise.all([
        ghFetch<GHRepo>(`/repos/${owner}/${repo}`, token),
        ghFetch<GHCommit[]>(
          `/repos/${owner}/${repo}/commits?since=${since}&per_page=30`,
          token
        ),
        ghFetch<GHPR[]>(
          `/repos/${owner}/${repo}/pulls?state=closed&sort=updated&per_page=20`,
          token
        ),
        ghFetch<GHIssue[]>(
          `/repos/${owner}/${repo}/issues?state=open&per_page=50`,
          token
        ),
        ghFetch<{ total_count: number }[]>(
          `/repos/${owner}/${repo}/contributors?per_page=1&anon=false`,
          token
        ),
      ]);

    const recentCommits: CommitActivity[] = commitsData.slice(0, 10).map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0].slice(0, 80),
      author: c.commit.author?.name ?? c.author?.login ?? "unknown",
      date: c.commit.author?.date ?? new Date().toISOString(),
      url: c.html_url,
    }));

    const mergedPRs = prsData.filter((pr) => pr.merged_at !== null);
    const recentPRs: PullRequest[] = mergedPRs.slice(0, 10).map((pr) => ({
      number: pr.number,
      title: pr.title.slice(0, 80),
      state: "merged",
      mergedAt: pr.merged_at,
      author: pr.user?.login ?? "ghost",
      url: pr.html_url,
    }));

    const recentIssues: Issue[] = issuesData
      .filter((i) => !i.pull_request)
      .slice(0, 15)
      .map((issue) => {
        const lastActivity = new Date(issue.updated_at).getTime();
        const isStale = Date.now() - lastActivity > STALE_THRESHOLD_MS;
        return {
          number: issue.number,
          title: issue.title.slice(0, 80),
          state: issue.state as "open" | "closed",
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          isStale,
          url: issue.html_url,
          labels: issue.labels.map((l) => l.name),
        };
      });

    const staleIssues = issuesData
      .filter((i) => !i.pull_request)
      .filter(
        (i) =>
          Date.now() - new Date(i.updated_at).getTime() > STALE_THRESHOLD_MS
      ).length;

    const metrics: RawMetrics = {
      commits: commitsData.length,
      prsMerged: mergedPRs.length,
      staleIssues,
      totalIssues: issuesData.filter((i) => !i.pull_request).length,
      totalStars: repoData.stargazers_count,
      totalForks: repoData.forks_count,
      contributors: contributorsData.length,
      lastCommitDate:
        commitsData[0]?.commit.author?.date ?? new Date().toISOString(),
    };

    return {
      repo: {
        name: repoData.full_name,
        description: repoData.description ?? "No description provided.",
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        url: repoData.html_url,
      },
      metrics,
      recentCommits,
      recentPRs,
      recentIssues,
      fetchedAt: new Date().toISOString(),
      isMockData: false,
    };
  } catch (error) {
    console.error("[NexusPulse] GitHub fetch failed, falling back to mock:", error);
    return buildMockDashboard(target);
  }
}

// ── MOCK DATA BUILDER ─────────────────────────────────────────────────────────
function buildMockDashboard(target: GitHubRepo): FullDashboardData {
  const metrics = generateMockMetrics();

  const mockCommits: CommitActivity[] = Array.from({ length: 8 }, (_, i) => ({
    sha: Math.random().toString(16).slice(2, 9),
    message: [
      "feat: implement edge-optimized caching layer",
      "fix: resolve race condition in vitality engine",
      "docs: update API integration guide",
      "chore: upgrade dependencies to latest stable",
      "refactor: extract mascot state machine",
      "perf: optimize SVG rendering pipeline",
      "test: add integration tests for GitHub client",
      "feat: add supernova animation sequence",
    ][i],
    author: ["alice", "bob", "carol", "dave", "eve"][i % 5],
    date: new Date(Date.now() - i * 6 * 3600000).toISOString(),
    url: "#",
  }));

  const mockPRs: PullRequest[] = Array.from({ length: 5 }, (_, i) => ({
    number: 100 + i,
    title: [
      "Add Cloudflare KV caching for GitHub data",
      "Mobile navigation z-index fix",
      "Vitality score normalization improvements",
      "Dark mode refinements for MetricGrid",
      "TypeScript strict mode compliance",
    ][i],
    state: "merged",
    mergedAt: new Date(Date.now() - i * 2 * 86400000).toISOString(),
    author: ["alice", "bob", "carol", "dave", "eve"][i],
    url: "#",
  }));

  const mockIssues: Issue[] = Array.from({ length: 6 }, (_, i) => ({
    number: 50 + i,
    title: [
      "Mascot flickers on Safari iOS 17",
      "Edge runtime crashes with large repos",
      "Add support for GitLab API",
      "Timeline scroll performance on older devices",
      "Accessibility: keyboard navigation in BottomNav",
      "Feature: export vitality report as PDF",
    ][i],
    state: "open",
    createdAt: new Date(Date.now() - i * 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 8 * 86400000).toISOString(),
    isStale: i > 3,
    url: "#",
    labels: [["bug", "ui", "enhancement", "discussion", "accessibility", "feature"][i]],
  }));

  return {
    repo: {
      name: `${target.owner}/${target.repo}`,
      description:
        "An edge-optimized community dashboard powered by NexusPulse OS. [MOCK DATA — set GITHUB_TOKEN to use live data]",
      stars: metrics.totalStars,
      forks: metrics.totalForks,
      url: `https://github.com/${target.owner}/${target.repo}`,
    },
    metrics,
    recentCommits: mockCommits,
    recentPRs: mockPRs,
    recentIssues: mockIssues,
    fetchedAt: new Date().toISOString(),
    isMockData: true,
  };
}

// ── GITHUB API TYPE STUBS ─────────────────────────────────────────────────────
interface GHRepo {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
}
interface GHCommit {
  sha: string;
  commit: { message: string; author: { name: string; date: string } | null };
  author: { login: string } | null;
  html_url: string;
}
interface GHPR {
  number: number;
  title: string;
  merged_at: string | null;
  user: { login: string } | null;
  html_url: string;
}
interface GHIssue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_request?: object;
  labels: { name: string }[];
}
