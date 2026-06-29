"use client";

import { Eye, Edit3, MoreVertical, Package } from "lucide-react";

export interface StockInReceipt {
  id: string;
  code: string;
  supplier: string;
  date: string;
  totalItems: number;
  totalValue: number;
  status: "Draft" | "Completed" | "Cancelled";
}

interface StockInListTableProps {
  receipts: StockInReceipt[];
  onViewDetail: (id: string) => void;
}

export function StockInListTable({ receipts, onViewDetail }: StockInListTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-premium-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-premium-border bg-premium-subtle/30">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted">{"Receipt Code"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted">{"Supplier"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted">{"Date"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted text-center">{"Items"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted text-right">{"Total Value"}</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-premium-muted">{"Status"}</th>
              <th className="px-4 py-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-premium-border/60">
            {receipts.map((receipt) => (
              <tr 
                key={receipt.id} 
                className="group hover:bg-premium-bg/40 transition-colors cursor-pointer"
                onClick={() => onViewDetail(receipt.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-premium-subtle/50 text-premium-primary">
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-neutral-900">{receipt.code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-700 font-medium">{receipt.supplier}</td>
                <td className="px-6 py-4 text-premium-muted">{receipt.date}</td>
                <td className="px-6 py-4 text-center font-medium">{receipt.totalItems}</td>
                <td className="px-6 py-4 text-right font-bold text-premium-primary">
                  ₫{receipt.totalValue.toLocaleString("vi-VN")}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${getStatusStyles(receipt.status)}`}>
                    {receipt.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 hover:bg-premium-subtle rounded-lg text-premium-primary transition-colors"
                      title={"View Details"}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 hover:bg-premium-subtle rounded-lg text-premium-primary transition-colors"
                      title={"More Actions"}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {receipts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-10 py-16 text-center text-premium-muted text-sm italic">
                  {"No stock-in receipts found matching your criteria."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-700 ring-green-600/20";
    case "Draft":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "Cancelled":
      return "bg-red-50 text-red-700 ring-red-600/20";
    default:
      return "bg-gray-50 text-gray-700 ring-gray-600/20";
  }
}
