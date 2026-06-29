"use client";

import { Search, Plus, X } from "lucide-react";
import { useAdminSearch } from "@/modules/admin/context/AdminSearchContext";
import { FilterPanel, FilterGroup, FilterOption } from "@/shared/components/ui/FilterPanel";
import { useTranslation } from "react-i18next";

interface ProductToolbarProps {
  onAddProduct: () => void;
  selectedCount: number;
  statusFilter: "all" | "ACTIVE" | "INACTIVE";
  setStatusFilter: (val: "all" | "ACTIVE" | "INACTIVE") => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  categories: any[];
  activeFiltersCount: number;
  onResetFilters: () => void;
}

export function ProductToolbar({
  onAddProduct,
  selectedCount,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  activeFiltersCount,
  onResetFilters,
}: ProductToolbarProps) {
  const { query, setQuery } = useAdminSearch();
  const { t } = useTranslation();

  const selectedCategoryName = categories.find((c) => c.id === categoryFilter)?.name;

  return (
    <div className="flex flex-col gap-4 mb-6 bg-white p-4 rounded-2xl border border-premium-border shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-premium-muted" />
          <input
            type="text"
            placeholder={t("products.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-premium-border rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-primary focus:border-transparent bg-premium-surface transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterPanel onReset={onResetFilters} activeCount={activeFiltersCount} label={"Filter"}>
            <FilterGroup label={"Product Status"}>
              <FilterOption
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
                label={"All Status"}
              />
              <FilterOption
                active={statusFilter === "ACTIVE"}
                onClick={() => setStatusFilter("ACTIVE")}
                label={"Active Only"}
              />
              <FilterOption
                active={statusFilter === "INACTIVE"}
                onClick={() => setStatusFilter("INACTIVE")}
                label={"Inactive Only"}
              />
            </FilterGroup>

            <FilterGroup label={"Category"}>
              <FilterOption
                active={categoryFilter === "all"}
                onClick={() => setCategoryFilter("all")}
                label={"All Categories"}
              />
              {categories.map((c) => (
                <FilterOption
                  key={c.id}
                  active={categoryFilter === c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  label={c.name}
                />
              ))}
            </FilterGroup>
          </FilterPanel>

          <button
            onClick={onAddProduct}
            className="inline-flex items-center gap-2 rounded-xl bg-premium-primary px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> {"Add Product"}
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(query || statusFilter !== "all" || categoryFilter !== "all") && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-premium-border/50 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-premium-muted/60">
            {"Active Filters:"}</span>
          
          {query && (
            <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
              <span className="text-premium-muted">{"Search:"}</span>
              <span>{query}</span>
              <button onClick={() => setQuery("")} className="ml-1 text-premium-muted hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {statusFilter !== "all" && (
            <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
              <span className="text-premium-muted">{"Status:"}</span>
              <span className="capitalize">{statusFilter.toLowerCase()}</span>
              <button onClick={() => setStatusFilter("all")} className="ml-1 text-premium-muted hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {categoryFilter !== "all" && selectedCategoryName && (
            <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
              <span className="text-premium-muted">{"Category:"}</span>
              <span>{selectedCategoryName}</span>
              <button onClick={() => setCategoryFilter("all")} className="ml-1 text-premium-muted hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setQuery("");
              onResetFilters();
            }}
            className="text-xs font-bold text-premium-primary hover:underline underline-offset-4 ml-1"
          >
            {"Clear All"}</button>
        </div>
      )}
    </div>
  );
}
