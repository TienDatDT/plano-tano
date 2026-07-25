"use client";

import { Package, ChevronsUpDown } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/components/ui/Table";
import type { ProductJson } from "@/modules/product/lib/serializeProduct";

interface ProductTableProps {
  products: ProductJson[];
  selectedRowIds: Set<string>;
  expandedRowId: string | null;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onExpand: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({
  products,
  selectedRowIds,
  expandedRowId,
  onToggleRow,
  onToggleAll,
  onExpand,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const allSelected = products.length > 0 && selectedRowIds.size === products.length;
  const indeterminate = selectedRowIds.size > 0 && selectedRowIds.size < products.length;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-premium-border shadow-sm">
        <Package className="h-12 w-12 text-premium-secondary/40 mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 mb-1">{"No products found"}</h3>
        <p className="text-sm text-premium-muted max-w-sm">
          {"Get started by adding a new product to your catalog."}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-premium-border bg-white shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-premium-surface/80 border-b border-premium-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] px-4">
                <input
                  type="checkbox"
                  checked={allSelected || indeterminate}
                  ref={(input) => {
                    if (input) input.indeterminate = indeterminate;
                  }}
                  onChange={onToggleAll}
                  className="h-4 w-4 cursor-pointer rounded-md border-premium-border text-premium-primary transition-all focus:ring-premium-primary focus:ring-offset-1"
                />
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1 cursor-pointer hover:text-neutral-900">
                  {"Product Name"} <ChevronsUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>{"Category"} <ChevronsUpDown className="h-3 w-3" /></TableHead>
              <TableHead className="text-center">{"Total SKU"}</TableHead>
              <TableHead className="text-center">{"Total Stock"}</TableHead>
              <TableHead className="text-center">{"Status"}</TableHead>
              <TableHead className="text-right">{"Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const isSelected = selectedRowIds.has(p.id);
              const isExpanded = expandedRowId === p.id;
              const isActive = p.status === "ACTIVE";
              
              const totalStock = p.variants.reduce((sum, v) => {
                const variantStock = v.batches?.reduce((bSum, b) => bSum + b.quantity, 0) ?? 0;
                return sum + variantStock;
              }, 0);

              return (
                <TableRow 
                  key={p.id} 
                  className={`group transition-colors ${
                    isExpanded 
                      ? 'bg-premium-primary/5 border-l-4 border-l-premium-primary' 
                      : isSelected 
                        ? 'bg-premium-primary/5 border-l-4 border-l-premium-primary/40' 
                        : 'hover:bg-premium-bg/30 border-l-4 border-l-transparent hover:border-l-premium-primary/30'
                  }`}
                >
                  <TableCell className="px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow(p.id)}
                      className="h-4 w-4 cursor-pointer rounded-md border-premium-border text-premium-primary transition-all focus:ring-premium-primary focus:ring-offset-1"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-neutral-900 group-hover:text-premium-primary transition-colors line-clamp-1">
                      {p.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold uppercase tracking-wider text-premium-muted bg-premium-surface px-2.5 py-1 rounded-lg">
                      {p.category?.name || "Uncategorized"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-mono text-sm font-medium text-neutral-700">
                      {p.variants.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg text-xs font-bold ${totalStock > 0 ? 'bg-neutral-100 text-neutral-700' : 'bg-red-50 text-red-600'}`}>
                      {totalStock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      isActive 
                        ? "bg-green-50 text-green-700 border border-green-200/50" 
                        : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-neutral-400'}`} />
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onEdit(p.id)}
                        className="p-1.5 text-premium-muted hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        title={"Edit Product"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-1.5 text-premium-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={"Delete Product"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                      <button 
                        onClick={() => onExpand(p.id)}
                        className={`ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${isExpanded ? 'bg-premium-primary text-white shadow-soft' : 'bg-premium-surface border border-premium-border text-premium-primary hover:bg-premium-bg'}`}
                      >
                        {isExpanded ? 'Editing SKUs' : 'Manage SKUs'}
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
