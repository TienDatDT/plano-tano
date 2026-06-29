"use client";

import { useDraggable } from "@dnd-kit/core";
import { ProductVariant } from "../types";
import {
  Package,
  Search,
  GripVertical,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const CATEGORIES = ["All", "Notebooks", "Pens", "Stationery", "Art", "Storage"];

interface ProductSidebarProps {
  products: ProductVariant[];
}

export function ProductSidebar({ products }: ProductSidebarProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      category === "All" || (p.category && p.category === category);
    return matchSearch && matchCat;
  });

  const stockLevel = (stock: number) => {
    if (stock === 0) return { label: "Out of stock", cls: "bg-red-50 text-red-600 border border-red-100" };
    if (stock <= 15) return { label: `${stock} low`, cls: "bg-orange-50 text-orange-600 border border-orange-100" };
    return { label: `${stock} units`, cls: "bg-premium-subtle text-premium-primary border border-premium-secondary/30" };
  };

  return (
    <div className="flex flex-col h-full bg-premium-surface rounded-2xl border border-premium-border shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-premium-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-premium-primary mb-0.5">
              {"Inventory"}</p>
            <h3 className="font-bold text-neutral-900 text-base">{"Products"}</h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-premium-subtle text-premium-primary">
            {filtered.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-premium-muted" />
          <input
            type="text"
            id="product-search"
            placeholder={"Search SKU or name…"}
            className="w-full bg-premium-bg border border-premium-border rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 ring-premium-primary/20 transition-all placeholder:text-premium-muted/60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryMenu((p) => !p)}
            className="w-full flex items-center justify-between bg-premium-bg border border-premium-border rounded-xl px-3 py-2 text-sm text-neutral-700 hover:border-premium-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-premium-muted" />
              <span className="font-medium">{category}</span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-premium-muted transition-transform ${showCategoryMenu ? "rotate-180" : ""}`}
            />
          </button>
          {showCategoryMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-premium-surface border border-premium-border rounded-xl shadow-soft z-10 overflow-hidden">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setShowCategoryMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-premium-subtle text-premium-primary font-bold"
                      : "text-neutral-700 hover:bg-premium-bg"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag hint */}
      <div className="px-5 py-2.5 bg-premium-bg/60 border-b border-premium-border">
        <p className="text-[10px] font-bold text-premium-muted/70 uppercase tracking-widest flex items-center gap-1.5">
          <GripVertical className="h-3 w-3" />
          {"Drag to place on shelf"}</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
        {filtered.map((product) => (
          <DraggableProduct key={product.id} product={product} stockLevel={stockLevel} />
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-premium-subtle flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6 text-premium-secondary" />
            </div>
            <p className="text-sm font-medium text-premium-muted">{"No products found"}</p>
            <p className="text-xs text-premium-muted/60 mt-1">{"Try a different search or filter"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

type StockLevelFn = (stock: number) => { label: string; cls: string };

function DraggableProduct({
  product,
  stockLevel,
}: {
  product: ProductVariant;
  stockLevel: StockLevelFn;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${product.id}`,
    data: { type: "new", product },
  });

  const { label, cls } = stockLevel(product.stock);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group relative flex items-center gap-3 p-3 rounded-xl border bg-premium-surface transition-all duration-200 cursor-grab active:cursor-grabbing select-none
        ${isDragging
          ? "opacity-40 border-premium-primary shadow-inner scale-95"
          : "border-premium-border hover:border-premium-primary/50 hover:shadow-soft hover:-translate-y-0.5"
        }`}
    >
      {/* Drag handle indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-premium-primary/0 group-hover:bg-premium-primary/60 transition-colors" />

      {/* Icon */}
      <div className="w-12 h-12 bg-premium-bg rounded-xl flex items-center justify-center border border-premium-border overflow-hidden shrink-0">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <Package className="h-5 w-5 text-premium-secondary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold text-premium-primary uppercase tracking-wider truncate">
          {product.sku}
        </p>
        <p className="text-sm font-semibold text-neutral-900 truncate leading-tight mt-0.5">
          {product.name}
        </p>
        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${cls}`}>
          {label}
        </span>
      </div>

      {/* Drag hint icon */}
      <GripVertical className="h-4 w-4 text-premium-muted/30 group-hover:text-premium-muted shrink-0 transition-colors" />
    </div>
  );
}
