"use client";

import React from "react";
import { X, Info, Box, Copy, Trash2, Layout } from "lucide-react";

interface PlacedShelfData {
  id: string;
  name: string;
  templateId: string;
  layoutId: string;
  posX: number;
  posY: number;
  rotation: number;
  width: number;
  height: number;
  color: string;
}

interface InspectorPanelProps {
  selectedShelf: PlacedShelfData | null;
  overlappingShelfIds: Set<string>;
  rightSidebarOpen: boolean;
  onCloseRightSidebar: () => void;
  onUpdateShelf: (updates: Partial<PlacedShelfData>) => void;
  onDuplicateShelf: () => void;
  onRemoveShelf: () => void;
}

function InspectorPanelComponent({
  selectedShelf,
  overlappingShelfIds,
  rightSidebarOpen,
  onCloseRightSidebar,
  onUpdateShelf,
  onDuplicateShelf,
  onRemoveShelf,
}: InspectorPanelProps) {
  const isSelected = !!selectedShelf;

  return (
    <aside
      className={`absolute right-2 z-30 xl:relative xl:flex w-80 shrink-0 flex-col gap-6 overflow-hidden rounded-3xl border border-premium-border bg-white p-6 shadow-2xl xl:shadow-sm transition-all h-[calc(100%-16px)] xl:h-full ${
        rightSidebarOpen ? "translate-x-0" : "translate-x-[120%] xl:translate-x-0"
      } ${
        !isSelected
          ? "xl:opacity-40 xl:pointer-events-none xl:grayscale-[0.5]"
          : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-premium-subtle text-premium-primary">
            <Info className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
            {"Inspector"}</h3>
        </div>
        <div className="flex items-center gap-1">
          {isSelected && (
            <button
              onClick={() => onUpdateShelf({ id: undefined })} // trigger deselect by returning null from outer handler
              className="hidden xl:flex p-1.5 rounded-lg text-premium-muted hover:bg-premium-bg transition-colors"
              title={"Deselect object"}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onCloseRightSidebar}
            className="xl:hidden p-1.5 rounded-lg text-premium-muted hover:bg-premium-bg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedShelf ? (
        <div className="flex flex-col gap-8 flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-premium-border bg-premium-bg/20 p-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${selectedShelf.color}`}
              >
                <Box className="h-6 w-6" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <input
                  type="text"
                  value={selectedShelf.name}
                  onChange={(e) => onUpdateShelf({ name: e.target.value })}
                  className="font-bold text-neutral-900 bg-transparent border-none focus:ring-0 p-0 text-sm w-full outline-none border-b border-transparent hover:border-premium-border focus:border-premium-primary"
                />
                <span className="text-[10px] text-premium-muted font-mono truncate">
                  {selectedShelf.id}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">
                  {"X Position"}</label>
                <input
                  type="number"
                  value={selectedShelf.posX}
                  onChange={(e) =>
                    onUpdateShelf({ posX: parseInt(e.target.value) || 0 })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-premium-border bg-premium-bg/10 text-sm font-bold focus:border-premium-primary focus:ring-2 focus:ring-premium-primary/10 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">
                  {"Y Position"}</label>
                <input
                  type="number"
                  value={selectedShelf.posY}
                  onChange={(e) =>
                    onUpdateShelf({ posY: parseInt(e.target.value) || 0 })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-premium-border bg-premium-bg/10 text-sm font-bold focus:border-premium-primary focus:ring-2 focus:ring-premium-primary/10 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">
                  {"Width (Cells)"}</label>
                <input
                  type="number"
                  value={selectedShelf.width}
                  onChange={(e) =>
                    onUpdateShelf({
                      width: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-premium-border bg-premium-bg/10 text-sm font-bold focus:border-premium-primary focus:ring-2 focus:ring-premium-primary/10 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">
                  {"Height (Cells)"}</label>
                <input
                  type="number"
                  value={selectedShelf.height}
                  onChange={(e) =>
                    onUpdateShelf({
                      height: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-premium-border bg-premium-bg/10 text-sm font-bold focus:border-premium-primary focus:ring-2 focus:ring-premium-primary/10 transition-all outline-none"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-premium-muted">
                  {"Rotation"}</label>
                <select
                  value={selectedShelf.rotation ?? 0}
                  onChange={(e) =>
                    onUpdateShelf({ rotation: parseInt(e.target.value) || 0 })
                  }
                  className="w-full h-10 px-3 rounded-xl border border-premium-border bg-premium-bg/10 text-sm font-bold focus:border-premium-primary focus:ring-2 focus:ring-premium-primary/10 transition-all outline-none"
                >
                  <option value={0}>0°</option>
                  <option value={90}>90°</option>
                  <option value={180}>180°</option>
                  <option value={270}>270°</option>
                </select>
              </div>
            </div>

            {overlappingShelfIds.has(selectedShelf.id) && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-red-600">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold">{"Collision Warning"}</p>
                  <p className="text-[10px] leading-tight opacity-80 font-medium">
                    {"This object overlaps with another. Reposition to avoid spatial conflicts."}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto space-y-3 pt-6 border-t border-premium-border">
            <button
              onClick={onDuplicateShelf}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-premium-border bg-white py-3 text-xs font-bold text-neutral-700 transition-all hover:bg-premium-bg active:scale-[0.98]"
            >
              <Copy className="h-4 w-4" />
              <span>{"Duplicate Object"}</span>
            </button>
            <button
              onClick={onRemoveShelf}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 text-xs font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98]"
            >
              <Trash2 className="h-4 w-4" />
              <span>{"Remove Object"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-50">
          <div className="h-16 w-16 rounded-full bg-premium-bg flex items-center justify-center">
            <Layout className="h-8 w-8 text-premium-muted" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900">
              {"No Object Selected"}</p>
            <p className="text-xs text-premium-muted mt-1">
              {"Select an item on the canvas to edit its properties."}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

export const InspectorPanel = React.memo(InspectorPanelComponent);
export type { PlacedShelfData };
