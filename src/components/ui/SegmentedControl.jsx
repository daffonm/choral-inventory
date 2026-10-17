"use client";

import React, { useRef, useState, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils/utils";

/**
 * Reusable SegmentedControl component.
 * - Emil Kowalski layout continuity with a sliding active indicator pill.
 * - Apple-style concentric nested radii (R_inner = R_outer - padding = 12px - 4px = 8px).
 * - Direct tactile response on press.
 * - data-slot attributes for shadcn-style introspection.
 */
export const SegmentedControl = forwardRef(function SegmentedControl(
  {
    options = [],
    value,
    onChange,
    className,
    size = "md",
    ...props
  },
  ref
) {
  const innerRef = useRef(null);
  const containerRef = (ref && typeof ref === "object") ? ref : innerRef;
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector(`[data-active="true"]`);
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      });
    }
  }, [value, options, containerRef]);

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      data-slot="segmented-control"
      className={cn(
        "relative inline-flex items-center bg-surface-muted p-1 rounded-[12px] border border-border-subtle select-none",
        className
      )}
      {...props}
    >
      {/* Sliding active indicator pill */}
      <div
        data-slot="segmented-indicator"
        className="absolute top-1 bottom-1 rounded-[8px] bg-surface-card border border-border-subtle shadow-xs transition-[left,width,opacity] duration-200 ease-[var(--ease-spring)] pointer-events-none"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />

      {options.map((opt) => {
        const isActive = value === opt.value;
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            data-slot="segmented-item"
            data-active={isActive ? "true" : "false"}
            onClick={() => onChange(opt.value)}
            className={cn(
              "apple-press relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold outline-none focus:outline-none transition-colors duration-150",
              isActive
                ? "text-black-primary font-bold"
                : "text-text-secondary hover:text-black-primary"
            )}
          >
            {Icon && (
              <span className="flex items-center justify-center">
                {typeof Icon === "function" ? (
                  <Icon className="size-3.5" />
                ) : (
                  Icon
                )}
              </span>
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
});

export default SegmentedControl;
