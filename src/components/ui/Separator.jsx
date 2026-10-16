"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

/**
 * Reusable Separator component following shadcn architecture:
 * - data-slot="separator"
 * - Supports horizontal and vertical orientations
 */
export const Separator = forwardRef(function Separator(
  {
    orientation = "horizontal",
    decorative = true,
    className,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      data-slot="separator"
      className={cn(
        "shrink-0 bg-border-subtle",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
});

export default Separator;
