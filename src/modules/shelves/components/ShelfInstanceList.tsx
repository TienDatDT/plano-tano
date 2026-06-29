"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LayoutGrid, Trash2, Package, Grid3x3, Ruler,
  AlertCircle, Loader2, RefreshCw, ChevronRight
} from "lucide-react";
import { shelfApi } from "../api/shelf.api";
import { toast } from "sonner";

interface ShelfInstance {
  id: string;
  name: string | null;
  templateId: string;
  layoutId: string;
  posX: number;
  posY: number;
  rotation: number;
  cellCount: number;
  itemCount: number;
  template: {
    id: string;
    name: string;
    layoutType: string;
    rows: number | null;
    columns: number | null;
    width: number | null;
    height: number | null;
  } | null;
  layout: {
    id: string;
    name: string;
  } | null;
}

interface ShelfInstanceListProps {
  onOpenPlanogram?: (shelfId: string) => void;
}

export function ShelfInstanceList({ onOpenPlanogram }: ShelfInstanceListProps) {
  const [shelves, setShelves] = useState<ShelfInstance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShelves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shelfApi.getAll();
      const arr = res?.data ?? res ?? [];
      setShelves(arr);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load shelves");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShelves();
  }, [fetchShelves]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete shelf "${name}"? This will also remove all product placements.`)) return;
    try {
      await shelfApi.delete(id);
      setShelves((prev) => prev.filter((s) => s.id !== id));
      toast.success("Shelf deleted");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete shelf");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-premium-muted">
        <Loader2 className="w-8 h-8 animate-spin text-premium-primary" />
        <p className="text-sm font-semibold">{"Loading shelves…"}</p>
      </div>
    );
  }

  if (shelves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-premium-border bg-premium-bg/20 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-premium-subtle text-premium-primary">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-neutral-900">{"No shelves created yet"}</h3>
        <p className="mt-1 text-sm text-premium-muted">
          {"Create a shelf from a template using the button above."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-premium-muted uppercase tracking-widest">
          {shelves.length} {shelves.length === 1 ? "shelf" : "shelves"}
        </p>
        <button
          onClick={fetchShelves}
          className="flex items-center gap-1.5 text-xs font-bold text-premium-muted hover:text-premium-primary transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {"Refresh"}</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shelves.map((shelf) => (
          <ShelfInstanceCard
            key={shelf.id}
            shelf={shelf}
            onDelete={() => handleDelete(shelf.id, shelf.name ?? shelf.template?.name ?? "Shelf")}
            onOpenPlanogram={onOpenPlanogram ? () => onOpenPlanogram(shelf.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function ShelfInstanceCard({
  shelf,
  onDelete,
  onOpenPlanogram,
}: {
  shelf: ShelfInstance;
  onDelete: () => void;
  onOpenPlanogram?: () => void;
}) {
  const displayName = shelf.name ?? shelf.template?.name ?? "Unnamed Shelf";
  const isGrid = shelf.template?.layoutType === "GRID";
  const totalCells = isGrid
    ? (shelf.template?.rows ?? 0) * (shelf.template?.columns ?? 0)
    : 0;
  const fillPct = totalCells > 0 ? Math.round((shelf.itemCount / totalCells) * 100) : 0;

  return (
    <div className="group flex flex-col rounded-2xl border border-premium-border bg-premium-surface shadow-soft hover:shadow-md hover:border-premium-primary/30 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-premium-subtle text-premium-primary border border-premium-primary/10">
            {isGrid ? <Grid3x3 className="h-5 w-5" /> : <Ruler className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 truncate text-sm">{displayName}</p>
            <p className="text-[11px] text-premium-muted truncate">
              {shelf.template?.name ?? "No template"}
            </p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-premium-muted hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-3">
        {isGrid ? (
          <>
            <div className="rounded-xl bg-premium-bg border border-premium-border p-2.5 text-center">
              <p className="text-lg font-black text-premium-primary">{shelf.template?.rows ?? 0}</p>
              <p className="text-[9px] font-bold text-premium-muted uppercase tracking-widest">{"Rows"}</p>
            </div>
            <div className="rounded-xl bg-premium-bg border border-premium-border p-2.5 text-center">
              <p className="text-lg font-black text-premium-primary">{shelf.template?.columns ?? 0}</p>
              <p className="text-[9px] font-bold text-premium-muted uppercase tracking-widest">{"Cols"}</p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl bg-premium-bg border border-premium-border p-2.5 text-center col-span-2">
              <p className="text-sm font-black text-premium-primary">
                {shelf.template?.width}×{shelf.template?.height}
              </p>
              <p className="text-[9px] font-bold text-premium-muted uppercase tracking-widest">{"mm"}</p>
            </div>
          </>
        )}
        <div className="rounded-xl bg-premium-bg border border-premium-border p-2.5 text-center">
          <p className="text-lg font-black text-neutral-900 flex items-center justify-center gap-0.5">
            <Package className="h-3.5 w-3.5 text-premium-primary" />
            {shelf.itemCount}
          </p>
          <p className="text-[9px] font-bold text-premium-muted uppercase tracking-widest">{"Items"}</p>
        </div>
      </div>

      {/* Fill progress (GRID only) */}
      {isGrid && totalCells > 0 && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-premium-muted">{"Occupancy"}</span>
            <span className="text-[10px] font-bold text-premium-primary">{fillPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-premium-bg rounded-full border border-premium-border overflow-hidden">
            <div
              className="h-full bg-premium-primary rounded-full transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-premium-muted">
            {shelf.itemCount} {"of"}{totalCells} {"cells filled"}</p>
        </div>
      )}

      {/* Layout badge */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-1.5 text-[10px] text-premium-muted">
          <LayoutGrid className="h-3 w-3" />
          <span className="truncate">{shelf.layout?.name ?? "No layout assigned"}</span>
        </div>
      </div>

      {/* Action */}
      {onOpenPlanogram && (
        <div className="mt-auto border-t border-premium-border">
          <button
            onClick={onOpenPlanogram}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-bold text-premium-primary hover:bg-premium-subtle transition-colors"
          >
            <span>{"Edit Planogram"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
