"use client";

import React, { forwardRef, useState } from "react";
import { Button } from "./Button";
import { Icons } from "./Icons";

/**
 * Reusable Input component.
 * - Clean Cyber Punch focus ring with zero outline-offset.
 * - Concentric nested radius: 10px.
 */
export const Input = forwardRef(function Input(
  {
    type = "text",
    className = "",
    disabled = false,
    icon: Icon,
    size = "md",
    ...props
  },
  ref
) {
  const isSm = size === "sm";
  const sizeClasses = isSm
    ? "h-8 text-xs rounded-lg"
    : "h-10 text-xs rounded-[10px]";
  const paddingClasses = Icon
    ? isSm
      ? "pl-8 pr-2.5"
      : "pl-9 pr-3"
    : isSm
    ? "px-3"
    : "px-3.5";

  return (
    <div className="relative flex items-center w-full">
      {Icon && (
        <span className={`absolute ${isSm ? "left-2.5" : "left-3"} text-text-muted pointer-events-none`}>
          {typeof Icon === "function" ? <Icon className={isSm ? "w-3.5 h-3.5" : "w-4 h-4"} /> : Icon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={`w-full font-medium text-black-primary bg-surface-muted border border-border-default placeholder:text-text-muted focus:outline-none focus:border-accent-yellow/70 transition-[border-color,background-color] duration-150 ease-out ${sizeClasses} ${paddingClasses} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
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
  className = "",
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
    <div className={`relative flex items-center w-full ${className}`}>
      <input
        type="text"
        readOnly
        value={displayValue}
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
              <Icons.Check className="w-3.5 h-3.5" />
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
