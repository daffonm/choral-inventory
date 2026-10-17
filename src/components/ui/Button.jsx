"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";

/**
 * Button Variants conforming to shadcn CVA architecture and Emil Kowalski motion laws:
 * - Tactile immediate response on press (scale 0.97 via .apple-press).
 * - Exact property transitions (no 'transition: all').
 * - Data slots (data-slot="button") for semantic introspection and styling hooks.
 */
export const buttonVariants = cva(
  "apple-press inline-flex items-center justify-center font-semibold select-none outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-yellow/50 disabled:opacity-50 disabled:pointer-events-none transition-[background-color,border-color,color,box-shadow,transform] will-change-transform",
  {
    variants: {
      variant: {
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
        outline:
          "bg-transparent border border-border-default hover:bg-surface-muted text-black-primary",
      },
      size: {
        xs: "h-6 px-2 text-[10px] rounded-[5px] gap-1",
        sm: "h-7 px-2.5 text-[11px] rounded-[6px] gap-1.5",
        md: "h-9 px-3.5 text-xs rounded-[8px] gap-2",
        lg: "h-10 px-4 text-sm rounded-[10px] gap-2.5",
        icon: "size-8 p-0 rounded-[8px] flex items-center justify-center shrink-0",
        iconSm: "size-7 p-0 rounded-[6px] flex items-center justify-center shrink-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export const Button = forwardRef(function Button(
  {
    className,
    variant = "secondary",
    size = "md",
    children,
    disabled = false,
    icon: Icon,
    type = "button",
    href,
    ...props
  },
  ref
) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link
        ref={ref}
        href={href}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={classes}
        {...props}
      >
        {Icon && <Icon className="size-3.5 shrink-0" />}
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={classes}
      {...props}
    >
      {Icon && <Icon className="size-3.5 shrink-0" />}
      {children}
    </button>
  );
});

export default Button;
