"use client";

import React, { forwardRef } from "react";

/**
 * Reusable Card components adhering to Emil Kowalski concentric nested border-radius:
 * R_inner = R_outer - padding.
 * Apple translucent materials & subtle rim lighting.
 */
export const Card = forwardRef(function Card(
  { variant = "default", className = "", children, ...props },
  ref
) {
  const variants = {
    default:
      "bg-surface-card border border-border-subtle shadow-xs text-text-primary",
    subtle:
      "bg-surface-card-subtle border border-border-subtle text-text-primary",
    glass:
      "apple-card-glass border border-white/[0.08] text-white shadow-md",
    dark:
      "bg-black-surface border border-white/[0.08] text-white shadow-xs",
  };

  return (
    <div
      ref={ref}
      className={`rounded-[20px] overflow-hidden transition-colors duration-200 ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardHeader = forwardRef(function CardHeader(
  { className = "", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardTitle = forwardRef(function CardTitle(
  { className = "", children, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={`text-sm font-bold tracking-tight text-black-primary ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

export const CardDescription = forwardRef(function CardDescription(
  { className = "", children, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={`text-xs text-text-secondary mt-0.5 max-w-lg leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

export const CardContent = forwardRef(function CardContent(
  { className = "", children, ...props },
  ref
) {
  return (
    <div ref={ref} className={`p-6 space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
});

export const CardFooter = forwardRef(function CardFooter(
  { className = "", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`px-6 py-4 bg-surface-card-subtle border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
