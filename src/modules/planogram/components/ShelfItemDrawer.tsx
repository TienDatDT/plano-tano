"use client";

import { ShelfItem } from "../types";
import {
  X,
  Package,
  Tag,
  MapPin,
  BarChart2,
  Trash2,
  MoveHorizontal,
  Info,
} from "lucide-react";

interface ShelfItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShelfItem | null;
  onRemove: (id: string) => void;
}

export function ShelfItemDrawer({
  isOpen,
  onClose,
  item,
  onRemove,
}: ShelfItemDrawerProps) {
  const variant = item?.variant ?? null;

  const stockStatus =
    !variant
      ? null
      : variant.stock === 0
      ? { label: "Out of Stock", cls: "bg-red-50 text-red-600 border-red-200" }
      : variant.stock <= 15
      ? { label: "Low Stock", cls: "bg-orange-50 text-orange-600 border-orange-200" }
      : { label: "In Stock", cls: "bg-premium-subtle text-premium-primary border-premium-secondary/30" };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-neutral-900/10 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          isOpen && item ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-[380px] bg-premium-surface z-50 flex flex-col border-l border-premium-border shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen && item ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-premium-border shrink-0">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-premium-primary mb-0.5">
              {"Position Details"}</p>
            <h2 className="text-lg font-bold text-neutral-900">{"Shelf Item"}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-premium-bg text-premium-muted hover:text-neutral-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {variant && item ? (
            <div className="p-6 space-y-6">

              {/* Product identity block */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-premium-bg border border-premium-border flex items-center justify-center overflow-hidden shrink-0">
                  {variant.imageUrl ? (
                    <img
                      src={variant.imageUrl}
                      alt={variant.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-premium-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-premium-primary">
                    {variant.sku}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 leading-snug mt-0.5">
                    {variant.name}
                  </h3>
                  {variant.variantName && (
                    <p className="text-xs text-premium-muted mt-0.5">{variant.variantName}</p>
                  )}
                  {stockStatus && (
                    <span
                      className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full border ${stockStatus.cls}`}
                    >
                      {stockStatus.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-premium-border" />

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<MapPin className="h-4 w-4 text-premium-primary" />}
                  label={"Cell Position"}
                  value={`${String.fromCharCode(65 + item.positionY)}${item.positionX + 1}`}
                  sub={`X: ${item.positionX} · Y: ${item.positionY}`}
                />
                <StatCard
                  icon={<BarChart2 className="h-4 w-4 text-premium-primary" />}
                  label={"Stock Available"}
                  value={String(variant.stock)}
                  sub="units in warehouse"
                />
                <StatCard
                  icon={<Tag className="h-4 w-4 text-premium-primary" />}
                  label={"Unit Price"}
                  value={`$${variant.price.toFixed(2)}`}
                  sub="retail price"
                />
                <StatCard
                  icon={<MoveHorizontal className="h-4 w-4 text-premium-primary" />}
                  label={"Quantity"}
                  value={String(item.quantity ?? 1)}
                  sub="on this slot"
                />
              </div>

              {/* Info block */}
              <div className="rounded-2xl border border-premium-border bg-premium-bg/40 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-premium-muted shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-neutral-800">{"Move or Replace"}</p>
                    <p className="text-xs text-premium-muted leading-relaxed">
                      {"Drag this card to another empty cell to move it. Drop a new product from the sidebar on top of this slot to replace it."}</p>
                  </div>
                </div>
              </div>

              {/* Category tag */}
              {variant.category && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-premium-muted">
                    {"Category"}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-premium-subtle text-premium-primary border border-premium-secondary/30">
                    {variant.category}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full py-24 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-premium-subtle flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-premium-secondary" />
              </div>
              <p className="text-sm font-bold text-neutral-800">{"No item selected"}</p>
              <p className="text-xs text-premium-muted mt-1">
                {"Click on a product in the shelf grid to view details here."}</p>
            </div>
          )}
        </div>

        {/* ── Footer — only when an item is selected ── */}
        {item && variant && (
          <div className="shrink-0 border-t border-premium-border p-5 space-y-3 bg-premium-bg/30">
            <button
              onClick={() => {
                onRemove(item.id);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all text-sm"
            >
              <Trash2 className="h-4 w-4" />
              {"Remove from Shelf"}</button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ── Reusable Stat Card ── */
function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-premium-bg/50 border border-premium-border space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-premium-muted">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
      <p className="text-[10px] text-premium-muted">{sub}</p>
    </div>
  );
}
