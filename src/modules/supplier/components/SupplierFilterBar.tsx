"use client";

import { SearchBar } from "@/shared/components/ui/SearchBar";
import { FilterPanel, FilterGroup, FilterOption } from "@/shared/components/ui/FilterPanel";
import { X } from "lucide-react";
import type { SupplierStatus } from "../types/supplier.types";
import { useTranslation } from "react-i18next";

interface SupplierFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: SupplierStatus | "all";
  onStatusChange: (status: SupplierStatus | "all") => void;
  activeFiltersCount: number;
  onReset: () => void;
}

export function SupplierFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  activeFiltersCount,
  onReset,
}: SupplierFilterBarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Bar - Main interaction */}
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={t("supplierFilters.searchPlaceholder")}
          className="flex-1"
        />

        {/* Filter Panel - Refined search */}
        <FilterPanel onReset={onReset} activeCount={activeFiltersCount}>
          <FilterGroup label={t("supplierFilters.status")}>
            <FilterOption
              active={status === "all"}
              onClick={() => onStatusChange("all")}
              label={t("supplierFilters.allStatus")}
            />
            <FilterOption
              active={status === true}
              onClick={() => onStatusChange(true)}
              label={t("supplierFilters.activeOnly")}
            />
            <FilterOption
              active={status === false}
              onClick={() => onStatusChange(false)}
              label={t("supplierFilters.inactiveOnly")}
            />
          </FilterGroup>

          {/* Example of another group for extensibility */}
          <FilterGroup label={t("supplierFilters.region")}>
            <FilterOption active={false} onClick={() => {}} label={t("supplierFilters.domestic")} />
            <FilterOption active={false} onClick={() => {}} label={t("supplierFilters.international")} />
          </FilterGroup>
        </FilterPanel>
      </div>

      {/* Active Filter Chips */}
      {(search || status !== "all") && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-bold uppercase tracking-wider text-premium-muted/60">
            {t("supplierFilters.activeFilters")}
          </span>

          {search && (
            <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
              <span className="text-premium-muted">{t("supplierFilters.search")}</span>
              <span>{search}</span>
              <button onClick={() => onSearchChange("")} className="ml-1 text-premium-muted hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {status !== "all" && (
            <div className="flex items-center gap-1.5 rounded-full bg-premium-bg border border-premium-border px-3 py-1 text-xs font-medium text-neutral-800">
              <span className="text-premium-muted">{t("supplierFilters.statusLabel")}</span>
              <span className="capitalize">{status}</span>
              <button onClick={() => onStatusChange("all")} className="ml-1 text-premium-muted hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <button
            onClick={onReset}
            className="text-xs font-bold text-premium-primary hover:underline underline-offset-4 ml-1"
          >
            {t("supplierFilters.clearAll")}</button>
        </div>
      )}
    </div>
  );
}
