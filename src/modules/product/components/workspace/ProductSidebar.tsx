"use client";

import { Package, ChevronRight, Search } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import type { ProductJson } from "@/modules/product/lib/serializeProduct";
import { useState, useMemo } from "react";

interface ProductSidebarProps {
  products: ProductJson[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ProductSidebar({ products, selectedId, onSelect }: ProductSidebarProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <Card padding="sm" className="h-full flex flex-col bg-white">
      <CardHeader className="mb-4 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-premium-muted">
            {"Products ("}{products.length})
          </CardTitle>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-premium-muted" />
          <input
            type="text"
            placeholder={"Search product..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-premium-border rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-primary focus:border-transparent bg-premium-surface transition-all"
          />
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto mt-4 px-1 custom-scrollbar min-h-[400px]">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-premium-muted">
            <Package className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">{"No products found"}</p>
          </div>
        ) : (
          <div className="space-y-1.5 pb-2">
            {filteredProducts.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={`group w-full rounded-xl border px-3 py-3 text-left transition-all ${
                    active
                      ? "border-premium-primary bg-premium-subtle text-premium-primary shadow-sm"
                      : "border-transparent hover:border-premium-border bg-transparent hover:bg-premium-bg"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-neutral-900 group-hover:text-premium-primary transition-colors line-clamp-1">
                      {p.name}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                      }`}
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-premium-muted/70">
                      {p.category?.name || "Uncategorized"}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-premium-border" />
                    <span className="text-[10px] font-medium text-premium-muted/70">
                      {p.variants.length} {"SKU"}{p.variants.length !== 1 && "s"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
