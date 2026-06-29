"use client";

import { Package, Download, RefreshCw } from "lucide-react";

interface StockHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function StockHeader({ onRefresh, isLoading }: StockHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-premium-subtle text-premium-primary shadow-sm ring-1 ring-premium-border/50">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {"Stock Management"}</h1>
          <p className="text-sm font-medium text-premium-muted">
            {"Monitor real-time inventory levels across all variants"}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex h-11 items-center gap-2 rounded-xl border border-premium-border bg-white px-4 text-sm font-bold text-neutral-700 transition-all hover:bg-premium-bg active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{"Refresh"}</span>
        </button>
        <button
          className="flex h-11 items-center gap-2 rounded-xl bg-premium-primary px-6 text-sm font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>{"Export Report"}</span>
        </button>
      </div>
    </div>
  );
}
