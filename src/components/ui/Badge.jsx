"use client";

import React, { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";

/**
 * Badge Variants conforming to shadcn CVA architecture & Cyber Punch palette.
 * - data-slot="badge" for styling hooks.
 * - Dot indicator uses size-1.5 standard.
 */
export const badgeVariants = cva(
  "inline-flex items-center border tracking-tight transition-[background-color,border-color,color] duration-150 ease-out",
  {
    variants: {
      variant: {
        yellow:
          "bg-accent-yellow-surface text-text-on-yellow border-accent-yellow-border font-bold",
        red:
          "bg-accent-red-surface text-accent-red border-accent-red-border font-bold",
        neutral:
          "bg-surface-muted text-text-secondary border-border-subtle font-semibold",
        dark:
          "bg-punch-black text-white border-black-subtle font-medium",
        outline:
          "bg-transparent text-text-primary border-border-default",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] rounded-md gap-1",
        md: "px-2.5 py-0.5 text-[11px] rounded-full gap-1.5",
        lg: "px-3 py-1 text-xs rounded-full gap-2",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export const Badge = forwardRef(function Badge(
  {
    variant = "neutral",
    size = "md",
    className,
    dot = false,
    children,
    ...props
  },
  ref
) {
  return (
    <span
      ref={ref}
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          data-slot="badge-dot"
          className={cn(
            "size-1.5 rounded-full shrink-0",
            variant === "red"
              ? "bg-accent-red animate-pulse"
              : variant === "yellow"
                ? "bg-accent-yellow"
                : "bg-text-muted"
          )}
        />
      )}
      {children}
    </span>
  );
});

export default Badge;
