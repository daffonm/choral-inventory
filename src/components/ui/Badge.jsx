"use client";

import React from "react";

/**
 * Reusable Badge component matching the Cyber Punch design system palette.
 * - Yellow: 10% secondary accent (Status, active, highlights)
 * - Red: 5% punch accent (Alerts, urgent changes, stockouts)
 * - Neutral: White shade surface
 */
export function Badge({
  variant = "neutral",
  size = "md",
  className = "",
  dot = false,
  children,
  ...props
}) {
  const variants = {
    yellow:
      "bg-accent-yellow-surface text-text-on-yellow border-accent-yellow-border font-bold",
    red:
      "bg-accent-red-surface text-accent-red border-accent-red-border font-bold",
    neutral:
      "bg-surface-muted text-text-secondary border-border-subtle font-semibold",
    dark:
      "bg-punch-black text-white border-black-subtle font-medium",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] rounded-md gap-1",
    md: "px-2.5 py-0.5 text-[11px] rounded-full gap-1.5",
    lg: "px-3 py-1 text-xs rounded-full gap-2",
  };

  return (
    <span
      className={`inline-flex items-center border tracking-tight ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            variant === "red"
              ? "bg-accent-red animate-pulse"
              : variant === "yellow"
              ? "bg-accent-yellow"
              : "bg-text-muted"
          }`}
        />
      )}
      {children}
    </span>
  );
}
