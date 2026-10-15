"use client";

import React, { forwardRef } from "react";
import Link from "next/link";

/**
 * Reusable Button component blending Apple tactile feel and Emil Kowalski motion laws.
 * - Tactile immediate response on pointer-down (:active scale 0.97).
 * - Exact property transitions (no 'transition: all').
 * - Concentric corner radii matching parent padding.
 * - Supports href prop to render accessible Next.js Link without invalid button-inside-anchor nesting.
 */
export const Button = forwardRef(function Button(
  {
    variant = "secondary",
    size = "md",
    className = "",
    children,
    disabled = false,
    icon: Icon,
    type = "button",
    href,
    ...props
  },
  ref
) {
  const baseStyles =
    "apple-press inline-flex items-center justify-center font-semibold select-none outline-none focus:outline-none focus:ring-1 focus:ring-accent-yellow/50 disabled:opacity-50 disabled:pointer-events-none transition-[background-color,border-color,color,box-shadow,transform] will-change-transform";

  const variants = {
    primary:
      "bg-accent-yellow hover:bg-accent-yellow-hover text-black shadow-xs border border-accent-yellow-border font-bold",
    neon:
      "neon-pro-cta font-bold",
    danger:
      "bg-accent-red hover:bg-accent-red-hover text-white shadow-xs border border-accent-red-border font-bold",
    secondary:
      "bg-surface-card hover:bg-surface-muted text-black-primary border border-border-default shadow-2xs",
    ghost:
      "bg-transparent hover:bg-surface-muted text-text-secondary hover:text-black-primary border border-transparent",
    glass:
      "apple-card-glass hover:bg-white/[0.08] text-white font-medium border border-white/[0.1]",
    dark:
      "bg-black-primary hover:bg-black-hover text-white border border-black-subtle shadow-xs",
  };

  const sizes = {
    xs: "h-6 px-2 text-[10px] rounded-[5px] gap-1",
    sm: "h-7 px-2.5 text-[11px] rounded-[6px] gap-1.5",
    md: "h-9 px-3.5 text-xs rounded-[8px] gap-2",
    lg: "h-10 px-4 text-sm rounded-[10px] gap-2.5",
    icon: "w-8 h-8 p-0 rounded-[8px] flex items-center justify-center shrink-0",
    iconSm: "w-7 h-7 p-0 rounded-[6px] flex items-center justify-center shrink-0",
  };

  const buttonClasses = `${baseStyles} ${variants[variant] || variants.secondary} ${sizes[size] || sizes.md} ${className}`;

  if (href) {
    return (
      <Link
        ref={ref}
        href={href}
        className={buttonClasses}
        {...props}
      >
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
});
