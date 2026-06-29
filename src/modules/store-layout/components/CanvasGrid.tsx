"use client";

import React from "react";

interface CanvasGridProps {
  layoutWidth: number;
  layoutHeight: number;
  gridSize: number;
}

function CanvasGridComponent({
  layoutWidth,
  layoutHeight,
  gridSize,
}: CanvasGridProps) {
  return (
    <>
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2ede7 1px, transparent 1px),
            linear-gradient(to bottom, #e2ede7 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {/* Grid Coordinates (Subtle labels) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 text-[8px] font-bold text-premium-muted">
        {Array.from({ length: Math.ceil(layoutWidth / 5) }).map((_, i) => (
          <span
            key={`x-${i}`}
            className="absolute left-1"
            style={{ left: `${i * 5 * gridSize + 4}px`, top: "4px" }}
          >
            {i * 5}
          </span>
        ))}
        {Array.from({ length: Math.ceil(layoutHeight / 5) }).map((_, i) => (
          <span
            key={`y-${i}`}
            className="absolute left-1"
            style={{ top: `${i * 5 * gridSize + 4}px`, left: "4px" }}
          >
            {i * 5}
          </span>
        ))}
      </div>
    </>
  );
}

// Memoize CanvasGrid to prevent background coordinates calculations and repaints when dragging elements
export const CanvasGrid = React.memo(CanvasGridComponent);
