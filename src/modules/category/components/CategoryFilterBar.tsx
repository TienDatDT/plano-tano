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
        {/* Search Bar - Main interaction */}
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={"Search suppliers by name, contact, email..."}
          className="flex-1"
        />

        {/* Filter Panel - Refined search */}
        <FilterPanel onReset={onReset} activeCount={activeFiltersCount}>
          {/* <FilterGroup label="Supplier Status">
            <FilterOption
              active={status === "all"}
              onClick={() => onStatusChange("all")}
              label="All Status"
            />
            <FilterOption
              active={status === true}
              onClick={() => onStatusChange(true)}
              label="Active Only"
            />
            <FilterOption
              active={status === false}
              onClick={() => onStatusChange(false)}
              label="Inactive Only"
            />
          </FilterGroup> */}

          {/* Example of another group for extensibility */}
          <FilterGroup label={"Region (Demo)"}>
            <FilterOption active={false} onClick={() => {}} label={"Domestic"} />
            <FilterOption active={false} onClick={() => {}} label={"International"} />
          </FilterGroup>
        </FilterPanel>
      </div>

      {/* Active Filter Chips */}
      {(search || status !== "all") && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-premium-muted/60">
            {"Active Filters:"}</span>
          
          {search && (
            <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
              <span className="text-premium-muted">{"Search:"}</span>
              <span>{search}</span>
              <button onClick={() => onSearchChange("")} className="ml-1 text-premium-muted hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {status !== "all" && (
            <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
              <span className="text-premium-muted">{"Status:"}</span>
              <span className="capitalize">{status}</span>
              {/* <button onClick={() => onStatusChange("all")} className="ml-1 text-premium-muted hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button> */}
            </div>
          )}

          <button
            onClick={onReset}
            className="text-xs font-bold text-premium-primary hover:underline underline-offset-4 ml-1"
          >
            {"Clear All"}</button>
        </div>
      )}
    </div>
  );
}
