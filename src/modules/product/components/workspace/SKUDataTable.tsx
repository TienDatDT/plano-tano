"use client";

import { useState, useRef, useEffect } from "react";
import { Package, Pencil, Trash2, Copy, Check, ChevronsUpDown } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/components/ui/Table";
import type { ProductJson } from "@/modules/product/lib/serializeProduct";
import { useTranslation } from "react-i18next";

interface SKUDataTableProps {
  variants: ProductJson["variants"];
  selectedRowIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  onUpdateVariant: (id: string, data: Partial<ProductJson["variants"][number]>) => Promise<void>;
  onDeleteVariant: (id: string) => void;
  onEditVariant: (id: string) => void;
}

export function SKUDataTable({
  variants,
  selectedRowIds,
  onToggleRow,
  onToggleAll,
  onUpdateVariant,
  onDeleteVariant,
  onEditVariant,
}: SKUDataTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'salePrice' | 'costPrice' } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const {i18n} = useTranslation();
  const locales= i18n.language;

  const allSelected = variants.length > 0 && selectedRowIds.size === variants.length;
  const indeterminate = selectedRowIds.size > 0 && selectedRowIds.size < variants.length;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleEditSubmit = async (variant: ProductJson["variants"][number]) => {
    if (!editingCell) return;
    
    const numValue = parseFloat(editValue);
    if (isNaN(numValue) || numValue < 0) {
      setEditingCell(null);
      return;
    }

    // Only save if changed
    const currentValue = variant[editingCell.field];
    if (numValue === currentValue) {
      setEditingCell(null);
      return;
    }

    setSavingId(variant.id);
    try {
      await onUpdateVariant(variant.id, { [editingCell.field]: numValue });
    } finally {
      setSavingId(null);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, variant: ProductJson["variants"][number]) => {
    if (e.key === "Enter") {
      handleEditSubmit(variant);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleCopySKU = (sku: string) => {
    navigator.clipboard.writeText(sku);
    // Could show a toast here
  };

  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 rounded-xl mt-4">
        <Package className="h-10 w-10 text-premium-secondary/40 mb-3" />
        <p className="text-sm font-medium text-premium-muted">{"This product has no variants yet."}</p>
        <button
          onClick={() => onEditVariant("new")} // A bit hacky, normally parent handles "new" via onAddVariant
          className="mt-4 text-sm font-bold text-premium-primary hover:underline hidden"
        >
          Create the first SKU</button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-premium-surface/50 border-b border-premium-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] px-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = indeterminate;
                  }}
                  onChange={onToggleAll}
                  className="rounded border-premium-border text-premium-primary focus:ring-premium-primary"
                />
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1 cursor-pointer hover:text-neutral-900">
                  {"SKU"}<ChevronsUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>{"product.unit"}</TableHead>
              <TableHead className="text-right">{"product.costPrice"}</TableHead>
              <TableHead className="text-right">{"product.salePrice"}</TableHead>
              <TableHead className="text-center">{"Total Stock"}</TableHead>
              <TableHead className="text-center">{"Status"}</TableHead>
              <TableHead className="text-right pr-4">{"Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((v) => {
              const isSelected = selectedRowIds.has(v.id);
              const isSaving = savingId === v.id;
              // For status, assume it's true/false or 'ACTIVE'/'INACTIVE'
              // Prisma Boolean @default(true) or VariantStatus enum. We added an enum VariantStatus
              const isActive = v.status === "ACTIVE";

              const stock = v.batches?.reduce((sum, b) => sum + b.quantity, 0) ?? 0;

              function formatPrice(costPrice: number, locales: string): import("react").ReactNode | Iterable<import("react").ReactNode> {
                throw new Error("Function not implemented.");
              }

              return (
                <TableRow 
                  key={v.id} 
                  className={`group transition-colors ${isSelected ? 'bg-premium-subtle/30' : ''} ${isSaving ? 'opacity-50' : ''}`}
                >
                  <TableCell className="px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleRow(v.id)}
                      className="rounded border-premium-border text-premium-primary focus:ring-premium-primary"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-premium-primary">
                        {v.sku}
                      </span>
                      <button 
                        onClick={() => handleCopySKU(v.sku)}
                        className="text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={"Copy SKU"}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-premium-muted text-sm">
                    {v.unit.symbol ? `${v.unit.name} (${v.unit.symbol})` : v.unit.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingCell?.id === v.id && editingCell.field === 'costPrice' ? (
                      <input
                        ref={inputRef}
                        type="number"
                        className="w-24 text-right border border-premium-primary rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-premium-primary/20"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEditSubmit(v)}
                        onKeyDown={(e) => handleKeyDown(e, v)}
                      />
                    ) : (
                      <div 
                        className="font-medium text-neutral-600 cursor-pointer hover:text-premium-primary hover:underline decoration-dashed decoration-premium-primary/40 underline-offset-4"
                        onClick={() => {
                          setEditValue(v.costPrice !== null ? String(v.costPrice) : "");
                          setEditingCell({ id: v.id, field: 'costPrice' });
                        }}
                      >
                        {v.costPrice !== null ? formatPrice(v.costPrice, locales) : "—"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingCell?.id === v.id && editingCell.field === 'salePrice' ? (
                      <input
                        ref={inputRef}
                        type="number"
                        className="w-24 text-right border border-premium-primary rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-premium-primary/20"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEditSubmit(v)}
                        onKeyDown={(e) => handleKeyDown(e, v)}
                      />
                    ) : (
                      <div 
                        className="font-semibold text-neutral-900 cursor-pointer hover:text-premium-primary hover:underline decoration-dashed decoration-premium-primary/40 underline-offset-4"
                        onClick={() => {
                          setEditValue(String(v.salePrice));
                          setEditingCell({ id: v.id, field: 'salePrice' });
                        }}
                      >
                        {formatPrice(v.salePrice, locales)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded-md text-xs font-bold ${stock > 0 ? 'bg-neutral-100 text-neutral-700' : 'bg-red-50 text-red-600'}`}>
                      {stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      isActive 
                        ? "bg-green-50 text-green-700 border border-green-200/50" 
                        : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-neutral-400'}`} />
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditVariant(v.id)}
                        className="p-1.5 text-neutral-400 hover:text-premium-primary hover:bg-premium-subtle rounded-md transition-all"
                        title={"Edit Details"}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteVariant(v.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                        title={"Delete SKU"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
