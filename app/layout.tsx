// FILE: app/layout.tsx

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusPulse OS — Community Dashboard",
  description:
    "Edge-optimized GitHub community health dashboard. Real-time vitality scoring, contributor analytics, and project momentum tracking.",
  keywords: ["github", "dashboard", "open source", "community", "metrics", "edge"],
  authors: [{ name: "NexusPulse OS" }],
  openGraph: {
    title: "NexusPulse OS",
    description: "Your repository's life force, visualized.",
    type: "website",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Prevents iOS auto-zoom on form inputs
  userScalable: false,
  // Use the full available viewport height
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#03040a" },
    { media: "(prefers-color-scheme: light)", color: "#03040a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to Google Fonts for minimal latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* PWA manifest placeholder */}
        {/* <link rel="manifest" href="/manifest.json" /> */}
      </head>
      <body
        style={
          {
            fontFamily: "'Inter', system-ui, sans-serif",
            "--font-display": "'Space Grotesk'",
            "--font-body": "'Inter'",
            "--font-mono": "'JetBrains Mono'",
          } as React.CSSProperties
        }
      >
        {/* Ambient background mesh — pure CSS, no JS */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {/* Primary violet nebula */}
          <div
            className="absolute rounded-full opacity-20 blur-3xl"
            style={{
              width: "60vw",
              height: "60vw",
              maxWidth: 800,
              maxHeight: 800,
              top: "-20%",
              right: "-10%",
              background: "radial-gradient(circle, #6c63ff 0%, transparent 70%)",
            }}
          />
          {/* Secondary cyan nebula */}
          <div
            className="absolute rounded-full opacity-10 blur-3xl"
            style={{
              width: "50vw",
              height: "50vw",
              maxWidth: 600,
              maxHeight: 600,
              bottom: "10%",
              left: "-15%",
              background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)",
            }}
          />
          {/* Tertiary green accent */}
          <div
            className="absolute rounded-full opacity-8 blur-2xl"
            style={{
              width: "30vw",
              height: "30vw",
              maxWidth: 400,
              maxHeight: 400,
              bottom: "30%",
              right: "20%",
              background: "radial-gradient(circle, #00ff9d 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Main content — above the ambient layer */}
        <div className="relative" style={{ zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
