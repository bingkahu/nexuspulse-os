// FILE: components/BottomNav.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export type NavTab = "dashboard" | "pulse" | "history" | "settings";

interface NavItem {
  id: NavTab;
  icon: string;
  label: string;
  badge?: number;
}

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  glowColor?: string;
  staleCount?: number;
  className?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "pulse",     icon: "🧬", label: "Pulse" },
  { id: "history",   icon: "📜", label: "History" },
  { id: "settings",  icon: "⚙️",  label: "Settings" },
];

export default function BottomNav({
  activeTab,
  onTabChange,
  glowColor = "#6c63ff",
  staleCount = 0,
  className = "",
}: BottomNavProps) {
  return (
    // Only visible on mobile — hidden md and up
    <nav
      className={`
        fixed bottom-0 left-0 right-0
        glass-nav
        md:hidden
        z-50
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className="flex items-center justify-around"
        style={{
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          paddingTop: "10px",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const hasBadge = item.id === "dashboard" && staleCount > 0;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center gap-1 px-5 py-1 rounded-xl no-select touch-active"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    backgroundColor: `${glowColor}15`,
                    border: `1px solid ${glowColor}30`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon wrapper */}
              <div className="relative">
                <motion.span
                  className="text-xl block"
                  animate={{
                    filter: isActive
                      ? `drop-shadow(0 0 6px ${glowColor})`
                      : "none",
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.span>

                {/* Badge */}
                {hasBadge && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[14px] h-3.5 flex items-center justify-center text-[9px] font-bold rounded-full px-0.5"
                    style={{ backgroundColor: "#ff4069", color: "#fff" }}
                  >
                    {staleCount > 9 ? "9+" : staleCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <motion.span
                className="text-[10px] font-medium leading-none"
                animate={{
                  color: isActive ? glowColor : "#4a5080",
                }}
                transition={{ duration: 0.2 }}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {item.label}
              </motion.span>

              {/* Active dot indicator */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: glowColor }}
                  layoutId="nav-dot"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
