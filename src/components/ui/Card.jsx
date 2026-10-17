"use client";

import React, { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";

export const cardVariants = cva(
  "rounded-[20px] overflow-hidden transition-[background-color,border-color,box-shadow] duration-200 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-surface-card border border-border-subtle shadow-xs text-text-primary",
        subtle:
          "bg-surface-card-subtle border border-border-subtle text-text-primary",
        glass:
          "apple-card-glass border border-white/[0.08] text-white shadow-md",
        dark:
          "bg-black-surface border border-white/[0.08] text-white shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const Card = forwardRef(function Card(
  { variant = "default", className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardHeader = forwardRef(function CardHeader(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        "p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardTitle = forwardRef(function CardTitle(
  { className, children, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn(
        "text-sm font-bold tracking-tight text-black-primary",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

export const CardDescription = forwardRef(function CardDescription(
  { className, children, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn(
        "text-xs text-text-secondary mt-0.5 max-w-lg leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

export const CardContent = forwardRef(function CardContent(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("p-6 flex flex-col gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardFooter = forwardRef(function CardFooter(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn(
        "px-6 py-4 bg-surface-card-subtle border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
