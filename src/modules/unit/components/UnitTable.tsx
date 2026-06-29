"use client";

import { Edit2, Trash2, Hash } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/components/ui/Table";

interface Unit {
  id: string;
  name: string;
  symbol: string | null;
}

interface UnitTableProps {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: (id: string) => void;
}

export function UnitTable({ units, onEdit, onDelete }: UnitTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* <TableHead className="w-[100px]">ID</TableHead> */}
          <TableHead>{"Unit Name"}</TableHead>
          <TableHead>{"Symbol"}</TableHead>
          <TableHead className="text-right">{"Actions"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {units.length === 0 ? (
          <TableRow>
            <TableCell className="h-32 text-center text-premium-muted">
              {"No units defined yet."}</TableCell>
          </TableRow>
        ) : (
          units.map((unit) => (
            <TableRow key={unit.id} className="group">
                {/* <TableCell className="font-mono text-xs text-premium-muted">
                  {unit.id}
                </TableCell> */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-premium-subtle text-premium-primary">
                    <Hash className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-neutral-900">{unit.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-md bg-premium-bg px-2 py-1 text-xs font-bold text-premium-primary ring-1 ring-inset ring-premium-border/50">
                  {unit.symbol || "-"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(unit)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-premium-surface text-premium-muted shadow-sm ring-1 ring-premium-border transition-all hover:bg-premium-primary hover:text-white hover:ring-premium-primary"
                    title={"Edit Unit"}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(unit.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-premium-surface text-premium-muted shadow-sm ring-1 ring-premium-border transition-all hover:bg-red-50 hover:text-red-500 hover:ring-red-200"
                    title={"Delete Unit"}
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
