"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { AlertCircle, Box, GripVertical } from "lucide-react";

interface PlacedShelfProps {
  id: string;
  name: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
  rotation?: number;
  isSelected: boolean;
  hasOverlap: boolean;
  color: string;
  gridSize: number;
  zoom: number;
  onSelect: () => void;
}

function PlacedShelfComponent({
  id,
  name,
  width,
  height,
  posX,
  posY,
  rotation = 0,
  isSelected,
  hasOverlap,
  color,
  gridSize,
  zoom,
  onSelect,
}: PlacedShelfProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `placed-${id}`,
    data: {
      type: "move-shelf",
      id,
      name,
      width,
      height,
      posX,
      posY,
      color,
      rotation,
    },
  });

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${posX * gridSize}px`,
    top: `${posY * gridSize}px`,
    width: `${width * gridSize}px`,
    height: `${height * gridSize}px`,
    transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
    transform: [
      transform ? `translate3d(${transform.x / zoom}px, ${transform.y / zoom}px, 0)` : '',
      rotation ? `rotate(${rotation}deg)` : ''
    ].filter(Boolean).join(' ') || undefined,
    transformOrigin: "center center",
    zIndex: isDragging ? 100 : isSelected ? 50 : 10,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group cursor-grab overflow-hidden rounded-2xl border-2 shadow-sm transition-all active:cursor-grabbing ${
        isSelected
          ? "border-premium-primary ring-4 ring-premium-primary/10 shadow-lg"
          : hasOverlap
          ? "border-red-400 bg-red-50 ring-4 ring-red-100 shadow-md"
          : `${color} hover:shadow-md hover:border-premium-primary/30`
      } ${isDragging ? "opacity-40 scale-[1.02] shadow-2xl z-[100]" : ""}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
        backgroundSize: `8px 8px`
      }} />

      {/* Content Area */}
      <div className="relative h-full w-full flex flex-col p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-110 ${
            isSelected ? "bg-premium-primary text-white" : "bg-white/80 text-premium-primary"
          }`}>
            <Box className="h-4 w-4" />
          </div>
          
          <div className="flex flex-col items-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-3 w-3 text-premium-muted" />
          </div>
        </div>
        
        <div className="mt-auto space-y-0.5">
          <p className={`truncate text-[11px] font-bold tracking-tight ${hasOverlap ? "text-red-700" : "text-neutral-900"}`}>
            {name}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/50 text-premium-muted">
                {width}×{height}
            </span>
            {hasOverlap && (
                <div className="flex items-center gap-1 text-red-500 animate-pulse">
                    <AlertCircle className="h-2.5 w-2.5" />
                    <span className="text-[8px] font-black uppercase">{"Collision"}</span>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Resize Handle Placeholder (Visual only for now) */}
      <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-premium-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function areEqual(prevProps: PlacedShelfProps, nextProps: PlacedShelfProps) {
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.posX === nextProps.posX &&
    prevProps.posY === nextProps.posY &&
    prevProps.rotation === nextProps.rotation &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.hasOverlap === nextProps.hasOverlap &&
    prevProps.color === nextProps.color &&
    prevProps.gridSize === nextProps.gridSize &&
    prevProps.zoom === nextProps.zoom
  );
}

export const PlacedShelf = React.memo(PlacedShelfComponent, areEqual);
