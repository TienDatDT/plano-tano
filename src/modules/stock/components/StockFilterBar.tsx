"use client";

import { Search, Filter, X } from "lucide-react";

interface StockFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: string[];
  onReset: () => void;
}

export function StockFilterBar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  onReset,
}: StockFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted" />
        <input
          type="text"
          placeholder={"Search by product name or SKU..."}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-premium-border bg-premium-bg/40 py-2.5 pl-10 pr-4 text-sm outline-none ring-premium-secondary/20 transition-all focus:border-premium-secondary focus:bg-white focus:ring-4"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-premium-border bg-premium-bg/40 py-2.5 pl-10 pr-8 text-sm outline-none ring-premium-secondary/20 transition-all focus:border-premium-secondary focus:bg-white focus:ring-4"
          >
            <option value="all">{"All Categories"}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {(search || categoryFilter !== "all") && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>{"Clear"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
