"use client";

import React, { forwardRef, useState } from "react";
import { cva } from "class-variance-authority";
import { Button } from "./Button";
import { Icons } from "./Icons";
import { cn } from "@/lib/utils/utils";

export const inputVariants = cva(
  "w-full font-medium text-black-primary bg-surface-muted border border-border-default placeholder:text-text-muted focus:outline-none focus:border-accent-yellow/70 transition-[border-color,background-color] duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "h-8 text-xs rounded-lg",
        md: "h-10 text-xs rounded-[10px]",
        lg: "h-11 text-sm rounded-[10px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

/**
 * Reusable Input component conforming to shadcn & Emil Kowalski concentric radii.
 */
export const Input = forwardRef(function Input(
  {
    type = "text",
    className,
    disabled = false,
    icon: Icon,
    size = "md",
    ...props
  },
  ref
) {
  const isSm = size === "sm";
  const paddingClasses = Icon
    ? isSm
      ? "pl-8 pr-2.5"
      : "pl-9 pr-3"
    : isSm
      ? "px-3"
      : "px-3.5";

  return (
    <div data-slot="input-wrapper" className="relative flex items-center w-full">
      {Icon && (
        <span
          data-slot="input-icon"
          className={cn(
            "absolute text-text-muted pointer-events-none flex items-center justify-center",
            isSm ? "left-2.5" : "left-3"
          )}
        >
          {typeof Icon === "function" ? (
            <Icon className={isSm ? "size-3.5" : "size-4"} />
          ) : (
            Icon
          )}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        data-slot="input"
        data-size={size}
        className={cn(inputVariants({ size }), paddingClasses, className)}
        {...props}
      />
    </div>
  );
});

/**
 * Reusable CopyInput component matching Supabase / Dev settings style:
 * - Readonly value with embedded copy button.
 * - Optional secret masking toggle (•••• •••• •••• ••••).
 * - Asymmetric feedback timing on copy (120ms enter, 180ms ease-out snap back).
 */
export function CopyInput({
  value = "",
  masked = false,
  allowReveal = false,
  className,
  labels = { copy: "Copy", copied: "Copied!", show: "Show", hide: "Hide" },
}) {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(!masked);

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(value);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const displayValue = masked && !isRevealed ? "•••• •••• •••• ••••" : value;

  return (
    <div
      data-slot="copy-input"
      className={cn("relative flex items-center w-full", className)}
    >
      <input
        type="text"
        readOnly
        value={displayValue}
        data-slot="input"
        className="w-full h-10 px-3.5 pr-28 text-xs font-mono text-black-primary bg-surface-muted border border-border-default rounded-[10px] focus:outline-none select-all"
      />
      <div className="absolute right-1.5 flex items-center gap-1">
        {allowReveal && (
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => setIsRevealed(!isRevealed)}
            className="h-7 px-2 text-[10px] font-semibold text-text-secondary"
          >
            {isRevealed ? labels.hide : labels.show}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={handleCopy}
          className="h-7 px-2.5 text-[10px] font-bold"
        >
          {copied ? (
            <span className="text-accent-yellow font-bold flex items-center gap-1">
              <Icons.Check className="size-3.5" />
              {labels.copied}
            </span>
          ) : (
            labels.copy
          )}
        </Button>
      </div>
    </div>
  );
}

export default Input;
