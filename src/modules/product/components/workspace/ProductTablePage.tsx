"use client";

import type { ProductJson } from "@/modules/product/lib/serializeProduct";
import { ProductToolbar } from "./ProductToolbar";
import { ProductTable } from "./ProductTable";
import { useTranslation } from "react-i18next";

interface ProductTablePageProps {
  products: ProductJson[];
  selectedRowIds: Set<string>;
  expandedRowId: string | null;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onExpand: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddProduct: () => void;
  totalProducts: number;
  totalStock: number;
  statusFilter: "all" | "ACTIVE" | "INACTIVE";
  setStatusFilter: (val: "all" | "ACTIVE" | "INACTIVE") => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  categories: any[];
  activeFiltersCount: number;
  onResetFilters: () => void;
}

export function ProductTablePage({
  products,
  selectedRowIds,
  expandedRowId,
  onToggleRow,
  onToggleAll,
  onExpand,
  onEdit,
  onDelete,
  onAddProduct,
  totalProducts,
  totalStock,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  activeFiltersCount,
  onResetFilters,
}: ProductTablePageProps) {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{t("products.title")}</h1>
          <p className="mt-1 text-sm text-premium-muted">{t("products.subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white px-4 py-2 ring-1 ring-premium-border/50 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">
              {t("products.totalProducts")}</span>
            <p className="text-lg font-mono font-bold text-neutral-900">{totalProducts}</p>
          </div>
          <div className="rounded-xl bg-white px-4 py-2 ring-1 ring-premium-border/50 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">
              {t("products.totalStock")}</span>
            <p className="text-lg font-mono font-bold text-neutral-900">{totalStock}</p>
          </div>
        </div>
      </div>

      <ProductToolbar 
        onAddProduct={onAddProduct} 
        selectedCount={selectedRowIds.size} 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={onResetFilters}
      />
      
      <ProductTable 
        products={products}
        selectedRowIds={selectedRowIds}
        expandedRowId={expandedRowId}
        onToggleRow={onToggleRow}
        onToggleAll={onToggleAll}
        onExpand={onExpand}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
