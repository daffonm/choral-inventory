"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

/**
 * Reusable Progress component following shadcn architecture and Emil Kowalski motion laws:
 * - data-slot="progress" and data-slot="progress-indicator".
 * - Smooth hardware-accelerated width transition with custom ease-out curve.
 */
export const Progress = forwardRef(function Progress(
  {
    value = 0,
    max = 100,
    className,
    indicatorClassName,
    ...props
  },
  ref
) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      data-slot="progress"
      className={cn(
        "relative w-full h-2 overflow-hidden rounded-full bg-surface-muted border border-border-subtle",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        style={{ width: `${percentage}%` }}
        className={cn(
          "h-full bg-accent-yellow transition-[width] duration-300 ease-[var(--ease-out)]",
          indicatorClassName
        )}
      />
    </div>
  );
});

export default Progress;
