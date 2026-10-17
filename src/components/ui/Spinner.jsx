"use client";

import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";

/**
 * Standard shadcn Accessible Spinner Component
 * Designed according to /shadcn-component-review standards:
 * - data-slot="spinner"
 * - Full accessibility: role="status", aria-live="polite", sr-only label
 * - Strict use of size-* and gap-* tokens
 * - Fluid composite-only rotation animation
 */

export const spinnerVariants = cva(
  "animate-spin shrink-0 [animation-duration:600ms]",
  {
    variants: {
      size: {
        xs: "size-3.5",
        sm: "size-4",
        default: "size-5",
        lg: "size-6",
        xl: "size-8",
      },
      variant: {
        default: "text-text-muted",
        primary: "text-accent-yellow",
        white: "text-white",
        subtle: "text-border-default",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export function Spinner({
  size = "default",
  variant = "default",
  label = "Memuat data...",
  className,
  ...props
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      data-slot="spinner"
      className="inline-flex items-center justify-center"
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(spinnerVariants({ size, variant }), className)}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Composable Loading State with Centered Spinner & Description
 */
export function LoadingState({
  title = "Memuat Data...",
  description = "Menghubungkan ke database realtime...",
  className,
}) {
  return (
    <div
      data-slot="loading-state"
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center gap-3 w-full min-h-[220px]",
        className
      )}
    >
      <Spinner size="lg" variant="primary" />
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
          {title}
        </p>
        <p className="text-[11px] text-text-muted max-w-xs">{description}</p>
      </div>
    </div>
  );
}

export default Spinner;
