"use client";

import React, { useState } from "react";
import { Drawer } from "@/shared/components/ui/Drawer";
import {
  Printer,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Copy
} from "lucide-react";
import { ordersApi } from "../api/orders.api";
import { toast } from "sonner";

interface OrderDetailDrawerProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export function OrderDetailDrawer({ order, isOpen, onClose, onStatusUpdated }: OrderDetailDrawerProps) {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "REFUNDED":
        return <RefreshCcw className="h-4 w-4 text-amber-600" />;
      default:
        return <Package className="h-4 w-4 text-slate-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-250";
      case "PENDING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      case "REFUNDED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // 1. Process Status Modification
  const handleUpdateStatus = async (newStatus: string) => {
    if (updating) return;

    if (newStatus === "CANCELLED") {
      const confirmCancel = confirm(
        "WARNING: Cancelling this order will instantly restore stock counts for all items in this bill. This transaction cannot be undone. Do you want to proceed?"
      );
      if (!confirmCancel) return;
    }

    try {
      setUpdating(true);
      const res = await ordersApi.updateStatus(order.id, newStatus);
      if (res.success) {
        toast.success(`Order status successfully updated to ${newStatus}`);
        onStatusUpdated(); // Refresh parent orders list
        onClose(); // Close drawer
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  // 2. Trigger native receipt printing
  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    toast.success("Complete UUID copied to clipboard!");
  };

  // Calculate items and units
  const itemsCount = order.items?.length || 0;
  const unitsCount = order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={`Invoice Manager`}
        description={`Sales Bill Register #${order.id.slice(0, 8).toUpperCase()}`}
        footer={
          <div className="space-y-4 shrink-0 bg-slate-50 p-6 border-t border-premium-border select-none">
            {/* Payment Summary */}
            <div className="flex justify-between items-center text-xs text-premium-muted font-bold">
              <span>{"Fulfillment quantity"}</span>
              <span>{unitsCount} {"units /"}{itemsCount} {"items"}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-neutral-800 uppercase">{"Total Bill Amount"}</span>
              <span className="text-2xl font-black text-premium-primary">
                ${Number(order.totalAmount).toFixed(2)}
              </span>
            </div>

            {/* Receipt Trigger */}
            <button
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-premium-primary py-3.5 text-xs font-bold text-white shadow-soft transition-all hover:bg-premium-primary/95 active:scale-[0.98]"
            >
              <Printer className="h-4 w-4" />
              <span>{"Print Invoice Receipt"}</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6 pb-6 select-none animate-in fade-in slide-in-from-right-4 duration-300">
          
          {/* Order Details Header Panel */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">{"Fulfillment Metadata"}</h3>
            
            <div className="rounded-2xl border border-premium-border bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-premium-muted font-bold">{"Order ID:"}</span>
                <span className="font-mono font-bold text-neutral-800 flex items-center gap-1.5">
                  #{order.id.slice(0, 8).toUpperCase()}
                  <button onClick={handleCopyId} className="text-slate-400 hover:text-premium-primary">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-premium-muted font-bold">{"Fulfillment Status:"}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${getStatusClass(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-premium-muted font-bold">{"Checkout Time:"}</span>
                <span className="font-bold text-neutral-800">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              {order.updatedAt !== order.createdAt && (
                <div className="flex justify-between">
                  <span className="text-premium-muted font-bold">{"Last Updated:"}</span>
                  <span className="font-bold text-neutral-800">
                    {new Date(order.updatedAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Admin Controls Panel */}
          {order.status !== "CANCELLED" && (
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">{"Fulfillment Controls"}</h3>
              
              <div className="p-4 bg-white border border-premium-border rounded-2xl space-y-3 shadow-soft">
                <div className="flex items-center gap-2 text-xs text-premium-muted font-bold">
                  <Layers className="w-4 h-4 text-premium-primary" />
                  <span>{"Update Order State"}</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleUpdateStatus("COMPLETED")}
                      disabled={updating}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{"Fulfill Bill"}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleUpdateStatus("CANCELLED")}
                    disabled={updating}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{"Cancel & Refund"}</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Items Summary Table */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">{"Items Checklist"}</h3>
              <span className="text-[9px] font-bold text-premium-primary bg-premium-subtle px-2 py-0.5 rounded-lg border border-premium-primary/10">
                {itemsCount} {"Active Items"}</span>
            </div>
            
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex flex-col p-4 border border-premium-border rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-soft transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 leading-snug line-clamp-1">
                        {item.variant?.product?.name || "Product Item"}
                      </h4>
                      <p className="text-[9px] text-premium-muted mt-1 font-semibold flex flex-wrap items-center gap-1">
                        <span>{"SKU:"}{item.variant?.sku}</span>
                        <span>•</span>
                        <span>{"Unit:"}{item.variant?.unit?.name}</span>
                        <span>•</span>
                        <span className="font-mono text-premium-primary">{"Lot:"}{item.batch?.lotNumber}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-neutral-800 leading-none">
                        ${(item.salePrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50 text-[10px] text-premium-muted font-bold">
                    <span> {"Fulfill Count:"}</span>
                    <span className="text-neutral-800">
                      {item.quantity} {item.variant?.unit?.name || "unit"}{"(s) × $"}{Number(item.salePrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Drawer>

      {/* POS STYLE THERMAL RECEIPT (Strictly printable only via hidden-screen / print:block style rules) */}
      <div
        id="printable-receipt"
        className="hidden print:block font-mono text-[10px] leading-tight text-black p-6 bg-white w-[80mm] max-w-[80mm] mx-auto"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-receipt, #printable-receipt * {
              visibility: visible !important;
            }
            #printable-receipt {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 80mm !important;
              padding: 5mm !important;
              margin: 0 !important;
              background: white !important;
              color: black !important;
            }
          }
        ` }} />

        {/* Store Title */}
        <div className="text-center mb-4">
          <h2 className="text-xs font-black uppercase tracking-tight">{"Tanaplano Minimart"}</h2>
          <p className="text-[8px]">{"123 Retail Lane, Saigon City"}</p>
          <p className="text-[8px]">{"Tel: +84 (28) 1234-5678"}</p>
        </div>

        <div className="border-b border-dashed border-black my-3"></div>

        {/* Invoice Metadata */}
        <div className="space-y-1 text-[8px] mb-3">
          <p>{"Order ID:"}<span className="font-bold">{order.id}</span></p>
          <p>{"Fulfillment:"}<span className="font-bold uppercase">{order.status}</span></p>
          <p>{"Cashier:"}<span className="font-bold">{"Register #001"}</span></p>
          <p>{"Date:"}<span className="font-bold">{new Date(order.createdAt).toLocaleString()}</span></p>
        </div>

        <div className="border-b border-dashed border-black my-3"></div>

        {/* Items Listing */}
        <div className="space-y-2">
          <div className="flex justify-between font-bold text-[8px] uppercase">
            <span className="w-1/2">{"Item Desc"}</span>
            <span className="w-1/6 text-center">{"Qty"}</span>
            <span className="w-1/3 text-right">{"Total"}</span>
          </div>

          <div className="space-y-1 text-[8px]">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start leading-snug">
                <div className="w-1/2">
                  <p className="font-bold line-clamp-1">{item.variant?.product?.name || "Product Item"}</p>
                  <p className="text-[7px] text-slate-500 font-mono">{"Lot:"}{item.batch?.lotNumber}</p>
                </div>
                <span className="w-1/6 text-center font-bold">{item.quantity}</span>
                <span className="w-1/3 text-right font-black">${(Number(item.salePrice) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b border-dashed border-black my-3"></div>

        {/* Calculation summary */}
        <div className="space-y-1 text-[8px] text-right">
          <div className="flex justify-between">
            <span>{"Gross Subtotal:"}</span>
            <span>${(Number(order.totalAmount) / 1.08).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>{"VAT / Tax (8%):"}</span>
            <span>${(Number(order.totalAmount) * 0.08 / 1.08).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-black">
            <span>{"Amount Paid:"}</span>
            <span>${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-3"></div>

        {/* Customer appreciation */}
        <div className="text-center text-[8px] mt-4 space-y-0.5">
          <p>{"Thank you for shopping at Tanaplano!"}</p>
          <p className="font-bold uppercase tracking-wide">{"Please keep your receipt for returns."}</p>
        </div>
      </div>
    </>
  );
}
