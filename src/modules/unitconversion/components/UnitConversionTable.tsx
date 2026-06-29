"use client";

import { Edit2, Trash2, ArrowRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/Table";

interface UnitConversion {
  id: string;
  productId: string;
  fromUnitId: string;
  toUnitId: string;
  ratio: number;
}

interface UnitConversionTableProps {
  conversions: UnitConversion[];
  units: any[];
  products: any[];
  onEdit: (conv: UnitConversion) => void;
}

export function UnitConversionTable({
  conversions,
  units,
  products,
  onEdit,
}: UnitConversionTableProps) {
  const getUnitName = (id: string) => units.find((u) => u.id === id)?.name || id;
  const getProductName = (id: string) => products.find((p) => p.id === id)?.name || id;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{"Product"}</TableHead>
          <TableHead>{"From Unit"}</TableHead>
          <TableHead className="w-[80px]" children={undefined}></TableHead>
          <TableHead>{"To Unit"}</TableHead>
          <TableHead>{"Ratio"}</TableHead>
          <TableHead className="text-right">{"Actions"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conversions.length === 0 ? (
          <TableRow>
            <TableCell className="h-32 text-center text-premium-muted">
              {"No unit conversions defined yet."}</TableCell>
          </TableRow>
        ) : (
          conversions.map((conv) => (
            <TableRow key={conv.id} className="group">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-neutral-900">
                    {getProductName(conv.productId)}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-premium-muted">
                    {"Product ID:"}{conv.productId}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700 ring-1 ring-neutral-200">
                  {getUnitName(conv.fromUnitId)}
                </span>
              </TableCell>
              <TableCell>
                <ArrowRight className="h-4 w-4 text-premium-primary/40" />
              </TableCell>
              <TableCell>
                <span className="rounded-lg bg-premium-subtle px-3 py-1.5 text-xs font-bold text-premium-primary ring-1 ring-premium-border/50">
                  {getUnitName(conv.toUnitId)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">
                    1 : {conv.ratio}
                  </span>
                  <p className="text-[10px] font-medium text-premium-muted">
                    (1 {getUnitName(conv.fromUnitId)} = {conv.ratio} {getUnitName(conv.toUnitId)})
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(conv)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-premium-surface text-premium-muted shadow-sm ring-1 ring-premium-border transition-all hover:bg-premium-primary hover:text-white hover:ring-premium-primary"
                    title={"Edit Conversion"}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-premium-surface text-premium-muted shadow-sm ring-1 ring-premium-border transition-all hover:bg-red-50 hover:text-red-500 hover:ring-red-200"
                    title={"Delete Conversion"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
