"use client";

import { Clock, CheckCircle2, XCircle, RefreshCcw, Eye, Copy, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

export interface OrderTableItem {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    quantity: number;
  }>;
}

interface OrderTableProps {
  orders: OrderTableItem[];
  onOrderClick: (order: any) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: "createdAt" | "totalAmount") => void;
}

const getStatusData = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return { icon: <Clock className="h-3.5 w-3.5" />, class: "bg-blue-50 text-blue-600 border-blue-200" };
    case "COMPLETED":
      return { icon: <CheckCircle2 className="h-3.5 w-3.5" />, class: "bg-emerald-50 text-emerald-600 border-emerald-200" };
    case "CANCELLED":
      return { icon: <XCircle className="h-3.5 w-3.5" />, class: "bg-red-50 text-red-600 border-red-200" };
    case "REFUNDED":
      return { icon: <RefreshCcw className="h-3.5 w-3.5" />, class: "bg-amber-50 text-amber-600 border-amber-200" };
    default:
      return { icon: null, class: "bg-slate-50 text-slate-500 border-slate-200" };
  }
};

export function OrderTable({ orders, onOrderClick, sortBy, sortOrder, onSort }: OrderTableProps) {
  
  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast.success("Order ID copied to clipboard!");
  };

  return (
    <div className="w-full bg-white border border-premium-border rounded-3xl overflow-hidden shadow-soft">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-premium-border select-none text-[11px] font-bold text-premium-muted uppercase tracking-wider">
              <th className="py-4 px-6">{"Order ID"}</th>
              <th className="py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => onSort("createdAt")}>
                <div className="flex items-center gap-1.5">
                  <span>{"Created Time"}</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-4 px-6 text-center">{"Fulfillment Items"}</th>
              <th className="py-4 px-6 text-right cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => onSort("totalAmount")}>
                <div className="flex items-center gap-1.5 justify-end">
                  <span>{"Total Bill"}</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-4 px-6 text-center">{"Status"}</th>
              <th className="py-4 px-6 text-right">{"Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-neutral-700">
            {orders.map((order) => {
              const status = getStatusData(order.status);
              const itemsCount = order.items?.length || 0;
              const unitsCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <tr
                  key={order.id}
                  onClick={() => onOrderClick(order)}
                  className="cursor-pointer hover:bg-slate-50/50 transition-colors group"
                >
                  {/* Order ID */}
                  <td className="py-4 px-6 font-mono text-xs font-bold text-premium-primary">
                    <div className="flex items-center gap-2">
                      <span className="hover:underline">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => handleCopyId(e, order.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-premium-primary hover:bg-slate-100 rounded-md transition-all"
                        title={"Copy complete UUID"}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="py-4 px-6 text-neutral-600 font-medium">
                    {new Date(order.createdAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>

                  {/* Total Items */}
                  <td className="py-4 px-6 text-center font-medium text-slate-500">
                    <span className="font-bold text-neutral-800">{itemsCount}</span> {"items"}<span className="text-[10px] text-premium-muted ml-1 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                      {unitsCount} {"units"}</span>
                  </td>

                  {/* Total Amount */}
                  <td className="py-4 px-6 text-right font-black text-neutral-800 text-sm">
                    ${Number(order.totalAmount).toFixed(2)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${status.class}`}
                    >
                      {status.icon}
                      {order.status}
                    </span>
                  </td>

                  {/* Action triggers */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOrderClick(order);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-premium-border rounded-xl bg-white text-[10px] font-bold text-neutral-600 hover:bg-slate-50 hover:text-premium-primary hover:border-premium-primary/30 transition-all shadow-soft"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{"Details"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white text-center">
          <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-premium-muted" />
          </div>
          <p className="font-bold text-sm text-neutral-700">{"No matching orders found"}</p>
          <p className="text-xs text-premium-muted mt-1">{"Try adjusting the filter criteria or date ranges."}</p>
        </div>
      )}
    </div>
  );
}
