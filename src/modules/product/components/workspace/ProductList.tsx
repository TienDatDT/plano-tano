"use client";

import { Package, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import type { ProductJson } from "@/modules/product/lib/serializeProduct";

interface ProductListProps {
  products: ProductJson[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ProductList({ products, selectedId, onSelect }: ProductListProps) {
  return (
    <Card padding="sm">
      <CardHeader className="mb-4">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-premium-muted">
          {"Products ("}{products.length}{")"}
        </CardTitle>
      </CardHeader>
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Package className="h-10 w-10 text-premium-secondary" />
          <p className="text-sm font-medium text-neutral-800">{"No products found"}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
          {products.map((p) => {
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                className={`group w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? "border-premium-primary bg-premium-subtle text-premium-primary shadow-sm"
                    : "border-premium-border bg-premium-surface hover:border-premium-secondary hover:bg-premium-bg"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-neutral-900 group-hover:text-premium-primary transition-colors line-clamp-1">
                    {p.name}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      active ? "rotate-90 opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-premium-muted/60">
                    {p.category.name}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-premium-border" />
                  <span className="text-[10px] font-medium text-premium-muted/60">
                    {p.variants.length} {"SKU"}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
