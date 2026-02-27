// FILE: next.config.js
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @cloudflare/next-on-pages
  reactStrictMode: true,

  images: {
    // Cloudflare Pages uses its own image optimization
    unoptimized: true,
  },

  // Ensure all pages are treated as Edge-compatible
  experimental: {
    // Required for Edge runtime compatibility
    serverComponentsExternalPackages: [],
  },
};

// Setup local dev platform emulation (Cloudflare bindings in dev)
if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default nextConfig;
