"use client";

import { useDroppable, useDraggable } from "@dnd-kit/core";
import { ShelfItem } from "../types";
import { Package, Plus } from "lucide-react";

interface ShelfGridProps {
  columns: number;
  rows: number;
  items: ShelfItem[];
  selectedItemId: string | null;
  onItemClick: (item: ShelfItem) => void;
}

export function ShelfGrid({
  columns,
  rows,
  items,
  selectedItemId,
  onItemClick,
}: ShelfGridProps) {
  const cells: { x: number; y: number; item?: ShelfItem }[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const item = items.find((i) => i.positionX === x && i.positionY === y);
      cells.push({ x, y, item });
    }
  }

  return (
    <div className="p-5 bg-premium-surface rounded-2xl border border-premium-border shadow-soft">
      {/* Row labels + grid */}
      <div className="flex gap-2">
        {/* Y-axis labels */}
        <div
          className="flex flex-col gap-px shrink-0"
          style={{ paddingTop: "2px" }}
        >
          {Array.from({ length: rows }, (_, y) => (
            <div
              key={y}
              className="flex items-center justify-center text-[10px] font-extrabold text-premium-muted/50 uppercase"
              style={{ height: "148px" }}
            >
              {String.fromCharCode(65 + y)}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {/* X-axis labels */}
          <div
            className="grid gap-px mb-1"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }, (_, x) => (
              <div
                key={x}
                className="text-center text-[10px] font-extrabold text-premium-muted/50 uppercase"
              >
                {x + 1}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid gap-px bg-premium-border/60 border border-premium-border/40 rounded-xl overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, 148px)`,
            }}
          >
            {cells.map(({ x, y, item }) => (
              <GridCell
                key={`${x}-${y}`}
                x={x}
                y={y}
                item={item}
                isSelected={!!item && item.id === selectedItemId}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Shelf base visual */}
      <div className="mt-3 h-3 mx-8 bg-gradient-to-b from-premium-secondary/40 to-premium-secondary/20 rounded-full border border-premium-secondary/30 shadow-inner" />
    </div>
  );
}

/* ── Individual Cell ── */
function GridCell({
  x,
  y,
  item,
  isSelected,
  onItemClick,
}: {
  x: number;
  y: number;
  item?: ShelfItem;
  isSelected: boolean;
  onItemClick: (item: ShelfItem) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${x}-${y}`,
    data: { x, y },
  });

  const isEmpty = !item;

  return (
    <div
      ref={setNodeRef}
      className={`relative group bg-premium-surface w-full h-full transition-all duration-150 flex flex-col items-center justify-center p-2
        ${isSelected ? "ring-2 ring-inset ring-premium-primary bg-premium-primary/5" : ""}
        ${isOver && isEmpty ? "bg-premium-primary/10 ring-2 ring-inset ring-premium-primary/40" : ""}
        ${isOver && !isEmpty ? "bg-amber-50 ring-2 ring-inset ring-amber-400/40" : ""}
        ${!isSelected && !isOver ? "hover:bg-premium-bg/40" : ""}
      `}
    >
      {/* Cell coordinate badge */}
      <span className="absolute top-1.5 left-2 text-[8px] font-extrabold text-premium-muted/25 uppercase tracking-tighter pointer-events-none select-none">
        {String.fromCharCode(65 + y)}
        {x + 1}
      </span>

      {item ? (
        <DraggableShelfItem
          item={item}
          isSelected={isSelected}
          onClick={() => onItemClick(item)}
        />
      ) : (
        /* Empty slot */
        <div
          className={`flex flex-col items-center gap-1.5 transition-opacity ${
            isOver ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-premium-bg border-2 border-dashed border-premium-border flex items-center justify-center">
            <Plus className="h-3.5 w-3.5 text-premium-muted/40" />
          </div>
          <span className="text-[9px] font-bold text-premium-muted/40 uppercase tracking-widest">
            {isOver ? "Drop here" : "Empty"}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Draggable Item inside Cell ── */
function DraggableShelfItem({
  item,
  isSelected,
  onClick,
}: {
  item: ShelfItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `item-${item.id}`,
    data: { type: "move", item },
  });

  if (!item.variant) return null;
  const { variant } = item;

  const stockBadgeColor =
    variant.stock === 0
      ? "bg-red-500"
      : variant.stock <= 15
      ? "bg-orange-400"
      : "bg-premium-primary";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full h-full flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-150 ${
        isDragging ? "opacity-0" : isSelected ? "scale-105" : "hover:scale-105"
      }`}
    >
      {/* Product card */}
      <div className="relative">
        <div
          className={`w-[68px] h-[68px] rounded-2xl flex items-center justify-center overflow-hidden border-2 shadow-card transition-all ${
            isSelected
              ? "border-premium-primary bg-premium-subtle shadow-lg"
              : "border-premium-border bg-premium-surface group-hover:border-premium-secondary"
          }`}
        >
          {variant.imageUrl ? (
            <img
              src={variant.imageUrl}
              alt={variant.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <Package
              className={`h-7 w-7 ${isSelected ? "text-premium-primary" : "text-premium-secondary"}`}
            />
          )}
        </div>

        {/* Stock badge */}
        <div
          className={`absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 ${stockBadgeColor} text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow ring-2 ring-white`}
        >
          {variant.stock > 99 ? "99+" : variant.stock}
        </div>
      </div>

      {/* Label */}
      <div className="mt-2 px-1 w-full text-center">
        <p
          className={`text-[10px] font-bold leading-tight truncate w-full ${
            isSelected ? "text-premium-primary" : "text-neutral-800"
          }`}
        >
          {variant.name}
        </p>
        <p className="text-[9px] font-bold text-premium-muted/70 uppercase tracking-tighter mt-0.5">
          {variant.sku}
        </p>
      </div>
    </div>
  );
}
