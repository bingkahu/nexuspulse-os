// FILE: app/page.tsx

export const runtime = "edge";

import { redirect } from "next/navigation";

const DEFAULT_OWNER = process.env.DEFAULT_GITHUB_OWNER ?? "bingkahu";
const DEFAULT_REPO = process.env.DEFAULT_GITHUB_REPO ?? "nexuspulse-os";

// Permanent redirect to the default repo dashboard.
// Cloudflare Edge handles this as a lightweight 307 with zero compute cost.
export default function RootPage() {
  redirect(`/${DEFAULT_OWNER}/${DEFAULT_REPO}`);
}
