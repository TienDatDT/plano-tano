"use client";

import { Pencil, Plus, MoreHorizontal } from "lucide-react";
import type { ProductJson } from "@/modules/product/lib/serializeProduct";

interface ProductHeaderProps {
  product: ProductJson | null;
  onEditProduct: () => void;
  onAddVariant: () => void;
}

export function ProductHeader({
  product,
  onEditProduct,
  onAddVariant,
}: ProductHeaderProps) {
  if (!product) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-premium-border bg-white rounded-t-2xl p-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 group">
          <h2 className="text-2xl font-extrabold text-neutral-900 truncate">
            {product.name}
          </h2>
          <button
            onClick={onEditProduct}
            className="p-1.5 text-premium-muted opacity-0 group-hover:opacity-100 transition-opacity hover:bg-premium-subtle hover:text-premium-primary rounded-md"
            title={"Edit Product"}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-premium-muted mt-1 truncate">
          {product.description || "No description provided."}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onAddVariant}
          className="flex items-center gap-2 rounded-xl bg-premium-primary px-4 py-2 text-sm font-bold text-white shadow-soft hover:opacity-90 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{"Add SKU"}</span>
        </button>
        {/* Bulk actions dropdown could go here, but we will have a separate floating BulkActionBar for table selections */}
        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-premium-border bg-premium-surface text-premium-muted hover:text-premium-primary hover:bg-premium-subtle transition-all shadow-sm">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
