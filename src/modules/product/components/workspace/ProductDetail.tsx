"use client";

import { Pencil, Plus, Package, Trash2 } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/shared/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/components/ui/Table";
import type { ProductJson } from "@/modules/product/lib/serializeProduct";

const priceFmt = new Intl.NumberForma"vi-VN";

interface ProductDetailProps {
  product: ProductJson | null;
  onEditProduct: () => void;
  onAddVariant: () => void;
  onEditVariant: (id: string) => void;
  onDeleteVariant: (id: string) => void;
}

export function ProductDetail({
  product,
  onEditProduct,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
}: ProductDetailProps) {
  if (!product) {
    return (
      <Card className="flex flex-col items-center justify-center py-24 text-center">
        <Package className="h-12 w-12 text-premium-secondary/40 mb-4" />
        <CardTitle className="text-neutral-900">{"No Product Selected"}</CardTitle>
        <CardDescription>{"Choose a product from the list to manage its variants."}</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900">{product.name}</h2>
          <p className="text-sm text-premium-muted mt-1 line-clamp-2">
            {product.description || "No description provided."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onEditProduct}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-premium-surface border border-premium-border text-premium-muted hover:text-premium-primary hover:bg-premium-subtle transition-all shadow-sm"
            title={"Edit Product"}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onAddVariant}
            className="flex items-center gap-2 rounded-xl bg-premium-primary px-4 py-2 text-sm font-bold text-white shadow-soft hover:opacity-90 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{"Add Variant"}</span>
          </button>
        </div>
      </div>

      {product.variants.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
          <Plus className="h-10 w-10 text-premium-secondary/40 mb-3" />
          <p className="text-sm font-medium text-premium-muted">{"This product has no variants yet."}</p>
          <button
            onClick={onAddVariant}
            className="mt-4 text-sm font-bold text-premium-primary hover:underline"
          >
            {"Create the first SKU"}</button>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{"SKU"}</TableHead>
              <TableHead>{"Price"}</TableHead>
              <TableHead>{"Unit"}</TableHead>
              <TableHead className="text-right">{"Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product.variants.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-xs font-bold text-premium-primary">
                  {v.sku}
                </TableCell>
                <TableCell className="font-semibold text-neutral-900">
                  {priceFmt.format(v.salePrice as any)}
                </TableCell>
                <TableCell className="text-premium-muted">
                  {v.unit.symbol ? `${v.unit.name} (${v.unit.symbol})` : v.unit.name}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEditVariant(v.id)}
                      className="p-2 text-premium-muted hover:text-premium-primary hover:bg-premium-subtle rounded-lg transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteVariant(v.id)}
                      className="p-2 text-premium-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
