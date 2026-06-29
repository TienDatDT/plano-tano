"use client";

import { Plus, Package, FileDown } from "lucide-react";

interface StockInManagementHeaderProps {
  onCreate: () => void;
}

export function StockInManagementHeader({ onCreate }: StockInManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-premium-primary text-white shadow-soft ring-1 ring-premium-primary/20">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {"Stock In Management"}</h1>
          <p className="text-sm font-medium text-premium-muted">
            {"Track and manage inventory receipts from suppliers"}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="hidden sm:inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-premium-border bg-white px-5 text-sm font-bold text-neutral-700 transition-all hover:bg-premium-bg active:scale-[0.98]"
        >
          <FileDown className="h-4 w-4" />
          {"Export"}</button>
        
        <button
          onClick={onCreate}
          className="flex items-center gap-2 rounded-xl bg-premium-primary px-6 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{"Create Stock Entry"}</span>
        </button>
      </div>
    </div>
  );
}
