"use client";

import React from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { PlacedShelf } from "./PlacedShelf";
import { CanvasGrid } from "./CanvasGrid";

interface Shelf {
  id: string;
  name: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
  color: string;
  rotation?: number;
}

interface LayoutCanvasProps {
  layoutWidth: number; // cells
  layoutHeight: number; // cells
  gridSize: number; // px per cell
  shelves: Shelf[];
  selectedShelfId: string | null;
  overlappingShelfIds: Set<string>;
  onSelectShelf: (id: string | null) => void;
  zoom: number;
}

function LayoutCanvasComponent({
  layoutWidth,
  layoutHeight,
  gridSize,
  shelves,
  selectedShelfId,
  overlappingShelfIds,
  onSelectShelf,
  zoom,
}: LayoutCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "layout-canvas",
  });

  const { active } = useDndContext();

  const canvasWidth = layoutWidth * gridSize;
  const canvasHeight = layoutHeight * gridSize;

  // Calculate snap preview if something is being dragged over
  const snapPreview = React.useMemo(() => {
    if (!active || !isOver) return null;
    const dragData = active.data.current;
    if (!dragData || dragData.type !== "new-shelf" || !dragData.shelf) return null;
    const { shelf } = dragData;
    return {
      width:  shelf.layoutType === "GRID" ? (shelf.columns || 2) : 2,
      height: shelf.layoutType === "GRID" ? (shelf.rows    || 1) : 1,
      color:  "bg-premium-subtle border-premium-primary text-premium-primary",
    };
  }, [active, isOver]);

  return (
    <div
      ref={setNodeRef}
      id="layout-canvas-el"
      className={`layout-canvas-element relative mx-auto rounded-3xl bg-white shadow-card ring-1 transition-all overflow-hidden cursor-crosshair ${isOver ? "ring-premium-primary ring-2" : "ring-premium-border"
        }`}
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
      }}
      onClick={() => onSelectShelf(null)}
    >
      {/* Background Grid & Coordinates */}
      <CanvasGrid
        layoutWidth={layoutWidth}
        layoutHeight={layoutHeight}
        gridSize={gridSize}
      />

      {/* Snap Highlight Overlay */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none bg-premium-primary/5 animate-pulse" />
      )}

      {/* Placed Shelves */}
      {shelves.map((shelf) => (
        <PlacedShelf
          key={shelf.id}
          id={shelf.id}
          name={shelf.name}
          width={shelf.width}
          height={shelf.height}
          posX={shelf.posX}
          posY={shelf.posY}
          rotation={shelf.rotation ?? 0}
          color={shelf.color}
          gridSize={gridSize}
          zoom={zoom}
          isSelected={selectedShelfId === shelf.id}
          hasOverlap={overlappingShelfIds.has(shelf.id)}
          onSelect={() => onSelectShelf(shelf.id)}
        />
      ))}

      {/* Empty State Overlay if no shelves */}
      {shelves.length === 0 && !active && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 opacity-30">
            <div className="mx-auto h-16 w-16 rounded-full border-2 border-dashed border-premium-primary flex items-center justify-center">
              <LayoutCanvas.EmptyIcon />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-premium-primary">{"Empty Drafting Canvas"}</p>
              <p className="text-[10px] text-premium-muted uppercase tracking-widest">{"Select a template or drag items here"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const LayoutCanvas = React.memo(LayoutCanvasComponent) as any;

LayoutCanvas.EmptyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-premium-primary">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);
