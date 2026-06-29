"use client";

import React from "react";
import {
  Library,
  Map,
  Undo2,
  Redo2,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Info,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface LayoutConfig {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface LayoutHeaderProps {
  layoutConfig: LayoutConfig;
  savedLayouts: any[];
  shelvesCount: number;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  saving: boolean;
  deleting: boolean;
  hasUnsavedChanges: boolean;
  onUpdateLayoutConfig: (updates: Partial<LayoutConfig>) => void;
  onSelectLayout: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onSave: () => void;
  onDeleteLayout: () => void;
  onOpenLeftSidebar: () => void;
  onOpenRightSidebar: () => void;
}

function LayoutHeaderComponent({
  layoutConfig,
  savedLayouts,
  shelvesCount,
  canUndo,
  canRedo,
  zoom,
  saving,
  deleting,
  hasUnsavedChanges,
  onUpdateLayoutConfig,
  onSelectLayout,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onReset,
  onSave,
  onDeleteLayout,
  onOpenLeftSidebar,
  onOpenRightSidebar,
}: LayoutHeaderProps) {
  const isExistingLayout = savedLayouts.some((l) => l.id === layoutConfig.id);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between rounded-2xl border border-premium-border bg-premium-surface p-4 shadow-soft gap-4">
      {/* Left zone: Title, Layout selector, Dimensions */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <button
          className="xl:hidden p-2 bg-premium-bg hover:bg-premium-subtle rounded-xl border border-premium-border transition-colors shrink-0"
          onClick={onOpenLeftSidebar}
          title={"Open Templates Library"}
        >
          <Library className="h-5 w-5 text-premium-primary" />
        </button>
        <div className="hidden xl:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-premium-subtle text-premium-primary">
          <Map className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 w-full">
            <input
              type="text"
              value={layoutConfig.name}
              onChange={(e) => onUpdateLayoutConfig({ name: e.target.value })}
              className="text-sm font-bold text-neutral-900 bg-transparent border-none p-0 focus:ring-0 w-44 hover:bg-premium-bg/30 px-1 rounded transition-colors focus:bg-white focus:ring-1 focus:ring-premium-primary/20"
              title={"Edit Layout Name"}
            />
            <div className="flex items-center gap-1.5">
              <select
                value={layoutConfig.id}
                onChange={(e) => onSelectLayout(e.target.value)}
                className="text-xs bg-premium-bg border-premium-border rounded-lg py-1 px-2 font-medium focus:ring-0 focus:border-premium-primary outline-none cursor-pointer"
              >
                {savedLayouts.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
                <option value="new">{"+ Create New Layout"}</option>
              </select>

              {/* Delete Layout Trigger */}
              {isExistingLayout && savedLayouts.length > 0 && (
                <button
                  onClick={onDeleteLayout}
                  disabled={deleting}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-30 shrink-0"
                  title={"Delete current floor plan layout"}
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center gap-1 bg-premium-bg/50 rounded px-1">
              <input
                type="number"
                value={layoutConfig.width}
                onChange={(e) =>
                  onUpdateLayoutConfig({
                    width: Math.max(10, parseInt(e.target.value) || 10),
                  })
                }
                className="w-10 text-[10px] font-bold text-center bg-transparent border-none p-0 text-premium-primary focus:ring-0"
                title={"Grid width (cells)"}
              />
              <span className="text-[10px] text-premium-muted font-bold">×</span>
              <input
                type="number"
                value={layoutConfig.height}
                onChange={(e) =>
                  onUpdateLayoutConfig({
                    height: Math.max(10, parseInt(e.target.value) || 10),
                  })
                }
                className="w-10 text-[10px] font-bold text-center bg-transparent border-none p-0 text-premium-primary focus:ring-0"
                title={"Grid height (cells)"}
              />
            </div>
            <div className="h-1 w-1 rounded-full bg-premium-border" />
            <span className="text-[10px] font-medium text-premium-muted whitespace-nowrap">
              {shelvesCount} {"objects"}</span>

            {/* Unsaved changes indicator badge */}
            {hasUnsavedChanges && (
              <>
                <div className="h-1 w-1 rounded-full bg-premium-border" />
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 animate-pulse">
                  <AlertCircle className="h-2.5 w-2.5" />
                  {"Unsaved Changes"}</span>
              </>
            )}
          </div>
        </div>
        <button
          className="xl:hidden p-2 bg-premium-bg hover:bg-premium-subtle rounded-xl border border-premium-border transition-colors shrink-0 ml-auto"
          onClick={onOpenRightSidebar}
          title={"Open Inspector"}
        >
          <Info className="h-5 w-5 text-premium-primary" />
        </button>
      </div>

      {/* Right zone: History, Zoom, Reset, Save actions */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
        {/* History Controls */}
        <div className="flex items-center gap-0.5 bg-premium-bg/30 p-1 rounded-xl border border-premium-border">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-premium-muted hover:bg-white hover:text-premium-primary disabled:opacity-20 disabled:hover:bg-transparent transition-all"
            title={"Undo (Ctrl+Z)"}
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-premium-muted hover:bg-white hover:text-premium-primary disabled:opacity-20 disabled:hover:bg-transparent transition-all"
            title={"Redo (Ctrl+Shift+Z)"}
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 overflow-hidden rounded-xl border border-premium-border bg-premium-bg/30 p-1">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.5}
            className="rounded-lg p-1.5 text-premium-muted hover:bg-white hover:text-premium-primary transition-colors disabled:opacity-20"
            title={"Zoom Out"}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[44px] text-center text-[11px] font-bold text-neutral-600">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 2.0}
            className="rounded-lg p-1.5 text-premium-muted hover:bg-white hover:text-premium-primary transition-colors disabled:opacity-20"
            title={"Zoom In"}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-premium-muted transition-all hover:bg-red-50 hover:text-red-600 active:scale-95 shrink-0"
          title={"Reset current layout (deletes all shelves)"}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{"Reset"}</span>
        </button>

        {/* Save Changes button */}
        <button
          onClick={onSave}
          disabled={saving || deleting || !hasUnsavedChanges}
          className="flex items-center gap-1.5 rounded-xl bg-premium-primary px-4 py-2.5 text-xs font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 hover:shadow-md disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none disabled:cursor-not-allowed active:scale-95 shrink-0"
          title={"Save layout and shelves changes (Ctrl+S)"}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>{saving ? "Saving…" : "Save Changes"}</span>
        </button>
      </div>
    </div>
  );
}

export const LayoutHeader = React.memo(LayoutHeaderComponent);
export type { LayoutConfig };
