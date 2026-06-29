"use client";

import { AlertTriangle, TrendingDown, TrendingUp, Package } from "lucide-react";

export interface StockItem {
  id: string;
  productName: string;
  categoryName: string;
  sku: string;
  unitName: string;
  unitSymbol: string | null;
  totalQuantity: number;
  batchCount: number;
}

interface StockTableProps {
  items: StockItem[];
  isLoading: boolean;
}

export function StockTable({ items, isLoading }: StockTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-premium-subtle border-t-premium-primary" />
        <p className="mt-4 text-sm font-medium text-premium-muted">{"Calculating inventory levels..."}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-premium-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-premium-border bg-premium-subtle/30">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted">{"Product / SKU"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted">{"Category"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted text-center">{"Batches"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted text-right">{"In Stock"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted text-center">{"Status"}</th>
              <th className="px-4 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-premium-border/60">
            {items.map((item) => (
              <tr key={item.id} className="group hover:bg-premium-bg/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-neutral-900">{item.productName}</span>
                    <span className="text-xs font-mono text-premium-primary">{item.sku}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-premium-subtle/50 px-2.5 py-0.5 text-xs font-medium text-premium-primary">
                    {item.categoryName}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-medium text-neutral-600">
                  {item.batchCount}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`text-base font-extrabold ${item.totalQuantity > 0 ? "text-premium-primary" : "text-red-500"}`}>
                      {item.totalQuantity.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-premium-muted">
                      {item.unitName} {item.unitSymbol ? `(${item.unitSymbol})` : ""}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {item.totalQuantity === 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-600/20">
                        <AlertTriangle className="h-3 w-3" />
                        {"Out of Stock"}</span>
                    ) : item.totalQuantity < 10 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 ring-1 ring-inset ring-amber-600/20">
                        <TrendingDown className="h-3 w-3" />
                        {"Low Stock"}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600 ring-1 ring-inset ring-green-600/20">
                        <TrendingUp className="h-3 w-3" />
                        {"Healthy"}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="rounded-lg p-2 text-premium-muted opacity-0 hover:bg-premium-subtle hover:text-premium-primary group-hover:opacity-100 transition-all">
                    <Package className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-10 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <Package className="h-12 w-12 text-premium-border mb-4" />
                    <p className="text-sm italic text-premium-muted">{"No inventory records found matching your criteria."}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
