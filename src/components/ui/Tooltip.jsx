"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils/utils";

// Global tracker for Emil Kowalski's "skip delay on subsequent hovers" rule
let isAnyTooltipOpen = false;
let globalCloseTimer = null;

/**
 * Reusable Tooltip component implementing Emil Kowalski's principles:
 * - Never animates from scale(0); enters from scale(0.95) with opacity: 0.
 * - Skip delay on subsequent hovers: once any tooltip opens, adjacent tooltips open with 0ms delay.
 * - Anchored with transform-origin.
 * - data-slot attributes for shadcn introspection.
 */
export const Tooltip = forwardRef(function Tooltip(
  {
    content,
    children,
    position = "right",
    className,
    ...props
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const openTimer = useRef(null);

  const handleMouseEnter = () => {
    if (globalCloseTimer) clearTimeout(globalCloseTimer);

    if (isAnyTooltipOpen) {
      // Instant subsequent hover
      setIsOpen(true);
    } else {
      // Initial delay
      openTimer.current = setTimeout(() => {
        isAnyTooltipOpen = true;
        setIsOpen(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    setIsOpen(false);
    globalCloseTimer = setTimeout(() => {
      isAnyTooltipOpen = false;
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
    };
  }, []);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top",
    left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
    right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left",
  };

  return (
    <div
      ref={ref}
      data-slot="tooltip"
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}

      {isOpen && content && (
        <div
          role="tooltip"
          data-slot="tooltip-content"
          className={cn(
            "absolute z-50 px-2.5 py-1 rounded-[6px] bg-black-surface border border-white/[0.12] text-xs font-semibold text-white shadow-xl whitespace-nowrap pointer-events-none transition-[opacity,transform] duration-150 ease-[var(--ease-out)] animate-in fade-in zoom-in-95",
            positions[position] || positions.right,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
});

export default Tooltip;
