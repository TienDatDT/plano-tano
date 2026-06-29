"use client";

import { SearchBar } from "@/shared/components/ui/SearchBar";
import { FilterPanel, FilterGroup, FilterOption } from "@/shared/components/ui/FilterPanel";
import { X, Calendar, User, Tag } from "lucide-react";

interface StockInListFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  supplierFilter: string;
  onSupplierFilterChange: (value: string) => void;
  onReset: () => void;
}

export function StockInListFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  supplierFilter,
  onSupplierFilterChange,
  onReset,
}: StockInListFilterBarProps) {
  const activeCount = [statusFilter, supplierFilter].filter(f => f !== "all").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={"Search receipts by code or supplier..."}
          className="flex-1"
        />

        <FilterPanel onReset={onReset} activeCount={activeCount}>
          <FilterGroup label={"Status"}>
            {["all", "Draft", "Completed", "Cancelled"].map((status) => (
              <FilterOption
                key={status}
                active={statusFilter === status}
                onClick={() => onStatusFilterChange(status)}
                label={status === "all" ? "All Statuses" : status}
              />
            ))}
          </FilterGroup>

          <FilterGroup label={"Supplier"}>
            {["all", "Midori Paperworks", "Graphite & Grove", "Hue & Tone"].map((sup) => (
              <FilterOption
                key={sup}
                active={supplierFilter === sup}
                onClick={() => onSupplierFilterChange(sup)}
                label={sup === "all" ? "All Suppliers" : sup}
              />
            ))}
          </FilterGroup>

          <FilterGroup label={"Time Range"}>
            <FilterOption
              active={false}
              onClick={() => {}}
              label={"Last 30 Days"}
            />
            <FilterOption
              active={false}
              onClick={() => {}}
              label={"Last Quarter"}
            />
          </FilterGroup>
        </FilterPanel>
      </div>

      {(search || activeCount > 0) && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-premium-muted/60">
            {"Active Filters:"}</span>
          
          {search && (
            <FilterChip label={`Search: ${search}`} onRemove={() => onSearchChange("")} />
          )}
          {statusFilter !== "all" && (
            <FilterChip label={`Status: ${statusFilter}`} onRemove={() => onStatusFilterChange("all")} />
          )}
          {supplierFilter !== "all" && (
            <FilterChip label={`Supplier: ${supplierFilter}`} onRemove={() => onSupplierFilterChange("all")} />
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

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
      <span>{label}</span>
      <button onClick={onRemove} className="ml-1 text-premium-muted hover:text-red-500 transition-colors">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
