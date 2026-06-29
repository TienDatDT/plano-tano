"use client";

import React from "react";
import {
  Maximize2,
  Calendar,
  Edit3,
  Trash2,
  ExternalLink,
  Box,
  Grid3X3,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { Card } from "@/shared/components/ui/Card";
import { ShelfTemplate } from "../dtos/shelf-template.dto";

interface ShelfCardProps {
  shelf: ShelfTemplate;
  layoutType: "DIMENSION" | "GRID";
  onEdit: (shelf: ShelfTemplate) => void;
  onDelete: (id: string) => void;
  onOpenEditor: (id: string) => void;
}

export function ShelfCard({
  shelf,
  onEdit,
  onDelete,
  onOpenEditor,
}: ShelfCardProps) {
  return (
    <Card className="group relative overflow-hidden border-premium-border bg-premium-surface p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      {/* Header */}
      <div className="h-2 w-full bg-premium-secondary/30 transition-colors group-hover:bg-premium-primary/40" />

      <div className="flex flex-col p-6">
        {/* Top */}
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-premium-subtle text-premium-primary">
            {shelf.layoutType === "GRID" ? (
              <Grid3X3 className="h-6 w-6" />
            ) : (
              <Box className="h-6 w-6" />
            )}
          </div>

          <div className="flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={() => onEdit(shelf)}
              className="rounded-lg p-2 text-premium-muted hover:bg-premium-bg hover:text-premium-primary"
            >
              <Edit3 className="h-4 w-4" />
            </button>

            <button
              onClick={() => onDelete(shelf.id)}
              className="rounded-lg p-2 text-premium-muted hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="mt-4">
          <h3 className="line-clamp-1 text-lg font-bold text-neutral-900">
            {shelf.name}
          </h3>
          <p className="mt-1 min-h-[40px] line-clamp-2 text-sm text-premium-muted">
            {shelf.description || "No description provided."}
          </p>
        </div>

        {/* Info */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {/* Layout */}
          <div className="flex flex-col gap-1 rounded-xl bg-premium-bg/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-premium-primary/70">
              {"Layout"}</span>

            <div className="flex items-center gap-2 text-neutral-800">
              {shelf.layoutType === "GRID" ? (
                <>
                  <Grid3X3 className="h-3.5 w-3.5 text-premium-primary" />
                  <span className="text-sm font-semibold">
                    {shelf.rows} {"tầng ×"}{shelf.columns} ô
                  </span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-premium-primary" />
                  <span className="text-sm font-semibold">
                    {shelf.width} × {shelf.height}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Created */}
          <div className="flex flex-col gap-1 rounded-xl bg-premium-bg/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-premium-primary/70">
              {"Created At"}</span>
            <div className="flex items-center gap-2 text-neutral-800">
              <Calendar className="h-3.5 w-3.5 text-premium-primary" />
              <span className="text-sm font-semibold">
                {shelf.createdAt && isValid(new Date(shelf.createdAt)) ? format(new Date(shelf.createdAt), "MMM dd, yyyy") : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* Grid Preview */}
        {shelf.layoutType === "GRID" && shelf.rows && shelf.columns && (
          <div className="mt-4 rounded-xl bg-premium-bg/30 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-premium-primary/70">
              {"Preview"}</span>

            <div
              className="mt-2 grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${shelf.columns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: shelf.rows * shelf.columns }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 rounded bg-premium-secondary/40"
                />
              ))}
            </div>
          </div>
        )}
        {/* Actions */}
        <div className="mt-4 flex gap-2 border-t border-premium-border pt-4">
          <button
            onClick={() => onOpenEditor(shelf.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-premium-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-premium-primary/90 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {"Use Template"}</button>
        </div>
      </div>
    </Card>
  );
}
