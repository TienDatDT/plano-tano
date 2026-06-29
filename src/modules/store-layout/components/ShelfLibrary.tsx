"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Grid3x3, Ruler, Search, Loader2, AlertCircle,
  RefreshCw, ExternalLink
} from "lucide-react";
import { shelfTemplateApi } from "@/modules/shelves/api/shelf-template.api";

export interface ShelfInstanceData {
  id: string;
  name: string;
  layoutType: string;
  rows: number;
  columns: number;
  width: number | null;
  height: number | null;
}

interface ShelfLibraryProps {
  /** Unused but kept for backwards compatibility */
  placedShelfIds?: Set<string>;
}

export function ShelfLibrary({ placedShelfIds = new Set() }: ShelfLibraryProps) {
  const [templates, setTemplates] = useState<ShelfInstanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await shelfTemplateApi.getAll();
      const arr = res?.data ?? res ?? [];
      setTemplates(
        arr.map((t: any) => ({
          id:         t.id,
          name:       t.name ?? "Unnamed Template",
          layoutType: t.layoutType ?? "GRID",
          rows:       t.rows    ?? 0,
          columns:    t.columns ?? 0,
          width:      t.width   ?? null,
          height:     t.height  ?? null,
        }))
      );
    } catch (e) {
      console.error("Failed to load templates:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-premium-primary">
          {"Shelf Templates"}</h3>
        <p className="text-xs text-premium-muted">
          {"Drag shelf templates onto the canvas to create new shelf instances."}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-premium-muted" />
        <input
          type="text"
          placeholder={"Search templates…"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-premium-border bg-white py-2.5 pl-9 pr-4 text-sm font-medium focus:border-premium-primary focus:outline-none focus:ring-2 focus:ring-premium-primary/10 transition-all"
        />
      </div>

      {/* Create link */}
      <a
        href="/admin/shelves"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[11px] font-bold text-premium-primary hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        {"Manage Templates in Shelf Management"}</a>

      {/* Refresh */}
      <button
        onClick={fetchTemplates}
        className="flex items-center gap-1.5 text-[11px] font-bold text-premium-muted hover:text-premium-primary transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        {"Refresh list"}</button>

      {/* List */}
      <div className="flex flex-col gap-3 mt-1">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-premium-muted">
            <Loader2 className="w-5 h-5 animate-spin text-premium-primary" />
            <span className="text-xs font-semibold">{"Loading…"}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <AlertCircle className="w-8 h-8 text-premium-border mx-auto" />
            <p className="text-xs font-medium text-premium-muted">
              {searchQuery ? `No templates matching "${searchQuery}"` : "No templates created yet."}
            </p>
          </div>
        ) : (
          filtered.map((template) => (
            <DraggableShelfItem
              key={template.id}
              shelf={template}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableShelfItem({
  shelf,
}: {
  shelf: ShelfInstanceData;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `template-${shelf.id}`,
    data: {
      type: "new-shelf",
      shelf,
    },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const isGrid = shelf.layoutType === "GRID";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group rounded-xl border-2 p-4 transition-all ${
        isDragging
          ? "border-premium-primary bg-premium-subtle opacity-60 cursor-grabbing"
          : "border-dashed border-premium-border bg-premium-surface cursor-grab hover:border-premium-primary hover:bg-premium-subtle"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-premium-border bg-premium-bg text-premium-primary">
          {isGrid ? <Grid3x3 className="h-5 w-5" /> : <Ruler className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-neutral-900">{shelf.name}</p>
          <div className="mt-0.5 flex items-center gap-2 text-[10px] font-medium text-premium-muted">
            <span className="rounded bg-premium-bg px-1.5 py-0.5 border border-premium-border uppercase tracking-wide font-bold">
              {shelf.layoutType}
            </span>
            {isGrid ? (
              <span>{shelf.rows}{"r ×"}{shelf.columns}c</span>
            ) : (
              <span>{shelf.width}×{shelf.height}{"mm"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mini grid preview */}
      {isGrid && shelf.rows > 0 && shelf.columns > 0 && (
        <div
          className="mt-3 grid gap-0.5 opacity-20 group-hover:opacity-40 transition-opacity"
          style={{
            gridTemplateColumns: `repeat(${Math.min(shelf.columns, 10)}, 1fr)`,
          }}
        >
          {Array.from({
            length: Math.min(shelf.rows * shelf.columns, 30),
          }).map((_, i) => (
            <div key={i} className="h-2 rounded-[2px] bg-premium-primary" />
          ))}
        </div>
      )}
    </div>
  );
}
