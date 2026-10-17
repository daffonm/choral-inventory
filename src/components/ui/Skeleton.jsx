"use client";

import React from "react";
import { cn } from "@/lib/utils/utils";

/**
 * Standard shadcn Skeleton Primitive & Composable Layout Blocks
 * Designed according to /shadcn-component-review standards:
 * - data-slot="skeleton"
 * - Semantic tokens: bg-surface-muted / bg-surface-card-subtle
 * - Layout uses strictly gap-*, never space-y-*
 * - Fully accessible with aria-hidden
 */

export function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg bg-surface-muted/80 border border-border-subtle/30",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div data-slot="skeleton-text" aria-hidden="true" className={cn("flex flex-col gap-2 w-full", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-3.5 rounded-md",
            index === lines - 1 ? "w-3/5" : index === 0 ? "w-full" : "w-5/6"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, children }) {
  return (
    <div
      data-slot="skeleton-card"
      aria-hidden="true"
      className={cn(
        "rounded-[20px] p-6 bg-surface-card border border-border-subtle flex flex-col gap-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-1/3 rounded-md" />
        <Skeleton className="size-6 rounded-full" />
      </div>
      <Skeleton className="h-8 w-1/2 rounded-md" />
      <SkeletonText lines={2} />
      {children}
    </div>
  );
}

export function SkeletonKpi({ count = 4, className }) {
  return (
    <div
      data-slot="skeleton-kpi-grid"
      aria-hidden="true"
      className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", className)}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-surface-card border border-border-subtle flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="size-3 rounded-full" />
          </div>
          <Skeleton className="h-7 w-20 rounded-md mt-1" />
          <Skeleton className="h-2.5 w-12 rounded mt-0.5" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 6, className }) {
  return (
    <div
      data-slot="skeleton-table"
      aria-hidden="true"
      className={cn(
        "w-full overflow-hidden rounded-[20px] border border-border-subtle bg-surface-card",
        className
      )}
    >
      {/* Header bar */}
      <div className="p-4 sm:p-6 border-b border-border-subtle flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 w-1/3">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-2.5 w-60 rounded" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Table header */}
      <div className="grid grid-cols-6 gap-4 p-4 border-b border-border-subtle/70 bg-surface-muted/40">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-full rounded" />
        ))}
      </div>

      {/* Table rows */}
      <div className="flex flex-col divide-y divide-border-subtle/50">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="grid grid-cols-6 gap-4 p-4 items-center">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={cn(
                  "h-4 rounded",
                  cIdx === 0 ? "w-4/5 font-mono" : cIdx === 1 ? "w-full" : "w-2/3"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title = "Belum Ada Data",
  description = "Data live Firestore masih kosong. Data akan tercatat otomatis saat ada transaksi atau setelah di-seed manual.",
  action,
  className,
}) {
  const IconComponent = icon;
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center gap-3 w-full",
        className
      )}
    >
      <div className="size-11 rounded-2xl bg-surface-muted/80 flex items-center justify-center text-text-muted border border-border-subtle shadow-xs">
        {IconComponent ? (
          <IconComponent className="size-5 text-text-secondary" />
        ) : (
          <span className="text-base font-mono">∅</span>
        )}
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
          {title}
        </h4>
        <p className="text-[11px] text-text-muted leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default Skeleton;
