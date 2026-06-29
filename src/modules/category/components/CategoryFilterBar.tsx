"use client";

import { SearchBar } from "@/shared/components/ui/SearchBar";
import { FilterPanel, FilterGroup, FilterOption } from "@/shared/components/ui/FilterPanel";
import { X } from "lucide-react";

interface CategoryFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeFiltersCount: number;
  onReset: () => void;
}

export function CategoryFilterBar({
  search,
  onSearchChange,
  activeFiltersCount,
  onReset,
}: CategoryFilterBarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={"Search categories by name or description..."}
          className="flex-1"
        />

        <FilterPanel onReset={onReset} activeCount={activeFiltersCount}>
          {/* Demo group cho mở rộng sau, hiện chưa nối logic */}
          <FilterGroup label={"Region (Demo)"}>
            <FilterOption active={false} onClick={() => {}} label={"Domestic"} />
            <FilterOption active={false} onClick={() => {}} label={"International"} />
          </FilterGroup>
        </FilterPanel>
      </div>

      {search && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-premium-muted/60">
            {"Active Filters:"}
          </span>

          <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
            <span className="text-premium-muted">{"Search:"}</span>
            <span>{search}</span>
            <button
              onClick={() => onSearchChange("")}
              className="ml-1 text-premium-muted hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={onReset}
            className="text-xs font-bold text-premium-primary hover:underline underline-offset-4 ml-1"
          >
            {"Clear All"}
          </button>
        </div>
      )}
    </div>
  );
}