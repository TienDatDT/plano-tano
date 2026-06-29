"use client";

import { useMemo } from "react";
import { ProductVariantSelect } from "./ProductVariantSelect";

export interface StockInItem {
  id: string;
  variantId: string;
  sku?: string;
  name?: string;
  quantity: number;
  importPrice: number;
}

interface StockInTableProps {
  items: StockInItem[];
  onUpdateItem: (id: string, updates: Partial<StockInItem>) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: () => void;
  variants: any[]; // List of available variants for selection
}

export function StockInTable({
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  variants,
}: StockInTableProps) {
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        quantity: acc.quantity + (item.quantity || 0),
        cost: acc.cost + (item.quantity || 0) * (item.importPrice || 0),
      }),
      { quantity: 0, cost: 0 }
    );
  }, [items]);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-premium-border bg-premium-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-premium-border bg-premium-subtle/50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted">{"Product Variant"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted w-32">{"SKU"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted w-32">{"Quantity"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted w-40">{"Import Price"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted w-40 text-right">{"Line Total"}</th>
              <th className="px-4 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-premium-border/60">
            {items.map((item, index) => (
              <tr key={item.id} className="group hover:bg-premium-bg/30 transition-colors">
                <td className="px-6 py-3 min-w-[300px]">
                  <ProductVariantSelect
                    value={item.variantId}
                    onChange={(variant) => 
                      onUpdateItem(item.id, { 
                        variantId: variant.id, 
                        sku: variant.sku, 
                        name: variant.name 
                      })
                    }
                    variants={variants}
                    placeholder={"Search for a product..."}
                  />
                </td>
                <td className="px-6 py-3">
                  <div className="text-neutral-500 font-mono text-xs">{item.sku || "—"}</div>
                </td>
                <td className="px-6 py-3 text-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || ""}
                    onChange={(e) => onUpdateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-premium-border/60 bg-white px-3 py-2 text-sm outline-none ring-premium-secondary/20 focus:border-premium-secondary focus:ring-4"
                  />
                </td>
                <td className="px-6 py-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-premium-muted">₫</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.importPrice || ""}
                      onChange={(e) => onUpdateItem(item.id, { importPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-premium-border/60 bg-white pl-6 pr-3 py-2 text-sm outline-none ring-premium-secondary/20 focus:border-premium-secondary focus:ring-4"
                    />
                  </div>
                </td>
                <td className="px-6 py-3 text-right font-medium text-neutral-900">
                  ₫{((item.quantity || 0) * (item.importPrice || 0)).toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-premium-muted opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-10 py-12 text-center text-premium-muted text-sm italic">
                  {"No items added yet. Click the button below to start."}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-premium-subtle/20 font-semibold text-neutral-900">
              <td colSpan={2} className="px-6 py-5 text-right uppercase tracking-wider text-xs">{"Totals"}</td>
              <td className="px-6 py-5 text-center text-lg">{totals.quantity}</td>
              <td></td>
              <td className="px-6 py-5 text-right text-lg text-premium-primary">
                ₫{totals.cost.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="border-t border-premium-border bg-premium-bg/20 p-4">
        <button
          type="button"
          onClick={onAddItem}
          className="flex items-center gap-2 rounded-xl border border-dashed border-premium-primary/40 bg-white px-5 py-2.5 text-sm font-medium text-premium-primary transition-all hover:border-premium-primary hover:bg-premium-subtle/30"
        >
          <IconPlus className="h-4 w-4" />
          {"Add product variant"}</button>
      </div>
    </div>
  );
}

function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
