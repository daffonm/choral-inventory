"use client";

import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Table = forwardRef(function Table(
  { className, ...props },
  ref
) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        ref={ref}
        data-slot="table"
        className={cn("w-full text-left text-xs caption-bottom", className)}
        {...props}
      />
    </div>
  );
});

export const TableHeader = forwardRef(function TableHeader(
  { className, ...props },
  ref
) {
  return (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn("bg-surface-muted text-text-secondary font-semibold border-b border-border-subtle", className)}
      {...props}
    />
  );
});

export const TableBody = forwardRef(function TableBody(
  { className, ...props },
  ref
) {
  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      className={cn("divide-y divide-border-subtle text-text-primary", className)}
      {...props}
    />
  );
});

export const TableFooter = forwardRef(function TableFooter(
  { className, ...props },
  ref
) {
  return (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn("border-t border-border-subtle bg-surface-muted/50 font-medium", className)}
      {...props}
    />
  );
});

export const TableRow = forwardRef(function TableRow(
  { className, ...props },
  ref
) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn(
        "hover:bg-surface-hover/60 transition-[background-color] duration-150 ease-out",
        className
      )}
      {...props}
    />
  );
});

export const TableHead = forwardRef(function TableHead(
  { className, ...props },
  ref
) {
  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        "p-3 font-semibold text-text-secondary align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
});

export const TableCell = forwardRef(function TableCell(
  { className, ...props },
  ref
) {
  return (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn("p-3 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
});

export const TableCaption = forwardRef(function TableCaption(
  { className, ...props },
  ref
) {
  return (
    <caption
      ref={ref}
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-text-muted", className)}
      {...props}
    />
  );
});

export default Table;
