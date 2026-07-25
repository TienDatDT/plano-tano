"use client";

import { Plus, Truck, Search } from "lucide-react";
import { Translation, useTranslation } from "react-i18next";

interface SupplierHeaderProps {
  total: number;
  onAdd: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function SupplierHeader({
  total,
  onAdd,
  search,
  onSearchChange,
}: SupplierHeaderProps) {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-premium-subtle text-premium-primary shadow-sm ring-1 ring-premium-border/50">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {t("supplierHeader.title")}
            </h1>
            <p className="text-sm font-medium text-premium-muted">
              {t("supplierHeader.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl bg-white px-4 py-2 ring-1 ring-premium-border sm:block">
            <span className="text-xs font-semibold uppercase tracking-wider text-premium-muted">
              {t("supplierHeader.totalSuppliers")}
            </span>
            <p className="text-xl font-bold text-neutral-900">{total}</p>
          </div>

          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-premium-primary px-5 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t("supplierHeader.addSupplier")}</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("supplierHeader.searchPlaceholder")}
          className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-4 text-sm ring-1 ring-premium-border placeholder:text-premium-muted focus:outline-none focus:ring-2 focus:ring-premium-primary/50 sm:max-w-sm"
        />
      </div>
    </div>
  );
}