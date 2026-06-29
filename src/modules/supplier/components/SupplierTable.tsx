"use client";

import { Edit2, Trash2, Truck, Calendar, Phone, AlertCircle, ArrowUpDown } from "lucide-react";
import type { SupplierRow } from "../types/supplier.types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SupplierTableProps {
  suppliers: SupplierRow[];
  onEdit: (supplier: SupplierRow) => void;
  onDelete: (id: string) => void;
  onReset?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  // Selection Props
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string, shiftKey: boolean) => void;
  onToggleAll?: () => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SupplierTable({ 
  suppliers, 
  onEdit, 
  onDelete, 
  onReset,
  isLoading, 
  isError,
  selectedIds = new Set(),
  onToggleSelection,
  onToggleAll,
  isAllSelected = false,
  isIndeterminate = false,
}: SupplierTableProps) {
  
  // --- SUB-COMPONENTS FOR CLEANER CODE ---
  
  const TableHeader = ({ label, className, hideOnMobile = false, sortable = false }: any) => (
    <th className={cn(
      "px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-premium-muted/80",
      hideOnMobile && "hidden sm:table-cell",
      className
    )}>
      <div className={cn("flex items-center gap-1.5", sortable && "cursor-pointer hover:text-premium-primary transition-colors")}>
        {label}
        {sortable && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </div>
    </th>
  );

  // --- RENDER LOGIC ---

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-red-100 bg-red-50/30">
        <AlertCircle className="h-12 w-12 text-red-500/80 mb-4" />
        <h3 className="text-lg font-bold text-red-900">{"Failed to load data"}</h3>
        <p className="text-sm text-red-600/80 mt-1">{"Please check your connection or try again later."}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors"
        >
          {"Retry Connection"}</button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-premium-border bg-white shadow-card transition-all">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-premium-border bg-premium-bg/50">
              {onToggleSelection && (
                <th className="px-6 py-4 w-[50px]">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected || isIndeterminate}
                      onChange={onToggleAll}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      className={cn(
                        "h-4 w-4 cursor-pointer rounded-md border-premium-border text-premium-primary transition-all focus:ring-premium-primary focus:ring-offset-1",
                        isIndeterminate && "bg-premium-primary"
                      )}
                    />
                  </div>
                </th>
              )}
              <TableHeader label={"Supplier Name"} sortable />
              <TableHeader label={"Contact Info"} hideOnMobile />
              <TableHeader label={"Phone"} hideOnMobile />
              <TableHeader label={"Status"} />
              <TableHeader label={"Created"} hideOnMobile className="md:table-cell" />
              <th className="px-6 py-4 pr-8 text-right text-[10px] font-bold uppercase tracking-wider text-premium-muted/80">
                {"Actions"}</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-premium-border">
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  {onToggleSelection && (
                    <td className="px-6 py-5">
                      <div className="h-4 w-4 rounded bg-neutral-100" />
                    </td>
                  )}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-neutral-100" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded bg-neutral-100" />
                        <div className="h-3 w-20 rounded bg-neutral-50 sm:hidden" />
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-5 sm:table-cell">
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-neutral-100" />
                      <div className="h-3 w-32 rounded bg-neutral-50" />
                    </div>
                  </td>
                  <td className="hidden px-6 py-5 sm:table-cell">
                    <div className="h-4 w-28 rounded bg-neutral-100" />
                  </td>
                  <td className="px-6 py-5">
                    <div className="h-6 w-16 rounded-full bg-neutral-100" />
                  </td>
                  <td className="hidden px-6 py-5 md:table-cell">
                    <div className="h-4 w-24 rounded bg-neutral-100" />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="ml-auto h-8 w-16 rounded-xl bg-neutral-100" />
                  </td>
                </tr>
              ))
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={onToggleSelection ? 7 : 6} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-premium-bg text-premium-primary/40 ring-[12px] ring-premium-bg/40">
                      <Truck size={48} strokeWidth={1.2} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900">{"No results found"}</h3>
                    <p className="mt-2 max-w-[320px] text-sm font-medium leading-relaxed text-premium-muted">
                      {"Your search or filters didn't match any suppliers. Try broadening your criteria."}</p>
                    {onReset && (
                      <button
                        onClick={onReset}
                        className="mt-8 px-6 py-2.5 bg-premium-primary text-white rounded-xl text-sm font-bold shadow-soft hover:bg-premium-primary/90 transition-all active:scale-95"
                      >
                        {"Reset all filters"}</button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => {
                const isSelected = selectedIds.has(supplier.id);
                const canSelect = supplier.canDelete !== false;

                return (
                  <tr
                    key={supplier.id}
                    className={cn(
                      "group border-l-4 transition-all hover:bg-premium-bg/30",
                      isSelected
                        ? "border-l-premium-primary bg-premium-primary/5"
                        : "border-l-transparent hover:border-l-premium-primary/30"
                    )}
                    onClick={(e) => {
                      // Prevent row click when clicking on buttons or checkboxes
                      const target = e.target as HTMLElement;
                      if (target.closest("button") || target.closest("input")) return;
                      
                      if (onToggleSelection && canSelect) {
                        onToggleSelection(supplier.id, e.shiftKey);
                      } else {
                        onEdit(supplier);
                      }
                    }}
                  >
                    {onToggleSelection && (
                      <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!canSelect}
                            onChange={(e) => {
                              // Using nativeEvent.shiftKey here since React Synthetic event might not capture it well inside onChange sometimes
                              onToggleSelection(supplier.id, (e.nativeEvent as any).shiftKey);
                            }}
                            title={!canSelect ? "Cannot select this supplier (likely has active orders)" : ""}
                            className="h-4 w-4 cursor-pointer rounded-md border-premium-border text-premium-primary transition-all focus:ring-premium-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-5 cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      onEdit(supplier);
                    }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-premium-bg text-premium-primary transition-all group-hover:bg-premium-primary group-hover:text-white shadow-sm">
                        <span className="text-xs font-bold font-mono uppercase">
                          {supplier.name.substring(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate font-bold text-neutral-900 group-hover:text-premium-primary transition-colors">
                          {supplier.name}
                        </span>
                        <p className="mt-0.5 block truncate text-[11px] font-medium text-premium-muted sm:hidden">
                          {supplier.contact}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-6 py-5 sm:table-cell">
                    <div className="font-bold text-neutral-800">{supplier.contact}</div>
                    <div className="mt-0.5 text-xs font-medium text-premium-muted">{supplier.email}</div>
                  </td>

                  <td className="hidden px-6 py-5 sm:table-cell">
                    <div className="flex items-center gap-2 text-neutral-700 font-medium">
                      <Phone className="h-3.5 w-3.5 text-premium-muted" />
                      <span>{supplier.phone}</span>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold ring-1 ring-inset transition-all",
                        supplier.status === true
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : "bg-neutral-50 text-neutral-600 ring-neutral-500/20"
                      )}
                    >
                      <span className={cn(
                        "mr-1.5 h-1.5 w-1.5 rounded-full",
                        supplier.status === true ? "bg-green-600" : "bg-neutral-400"
                      )} />
                      {supplier.status === true ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="hidden px-6 py-5 md:table-cell">
                    <div className="flex items-center gap-2 text-premium-muted font-medium">
                      <Calendar className="h-3.5 w-3.5 opacity-50" />
                      <span>{formatDate(supplier.createdAt)}</span>
                    </div>
                  </td>

                  <td
                    className="px-6 py-5 pr-6 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(supplier)}
                        className="rounded-xl p-2.5 text-premium-muted transition-all hover:bg-white hover:text-premium-primary hover:shadow-sm"
                        title={"Edit Supplier"}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(supplier.id)}
                        className="rounded-xl p-2.5 text-premium-muted transition-all hover:bg-red-50 hover:text-red-500 hover:shadow-sm"
                        title={"Delete Supplier"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
