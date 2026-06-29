"use client";

import { Trash2, DollarSign, Scale, Power, PowerOff, X } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onUpdatePrice: () => void;
  onChangeUnit: () => void;
  onToggleStatus: (active: boolean) => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onUpdatePrice,
  onChangeUnit,
  onToggleStatus,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-2xl border border-premium-border bg-white px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in slide-in-from-bottom-8 duration-200">
      <div className="flex items-center gap-3 pr-4 border-r border-premium-border">
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-premium-primary px-2 text-xs font-bold text-white">
          {selectedCount}
        </span>
        <span className="text-sm font-bold text-neutral-800">{"Selected"}</span>
        <button
          onClick={onClearSelection}
          className="text-xs text-premium-muted hover:text-neutral-900 transition-colors flex items-center gap-0.5 ml-1"
        >
          <X className="h-3.5 w-3.5" />
          {"Clear"}</button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onUpdatePrice}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-premium-muted hover:bg-premium-bg hover:text-neutral-900 transition-all active:scale-[0.98]"
        >
          <DollarSign className="h-3.5 w-3.5" />
          {"Update Price"}</button>
        <button
          onClick={onChangeUnit}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-premium-muted hover:bg-premium-bg hover:text-neutral-900 transition-all active:scale-[0.98]"
        >
          <Scale className="h-3.5 w-3.5" />
          {"Change Unit"}</button>
        <button
          onClick={() => onToggleStatus(true)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50 transition-all active:scale-[0.98]"
        >
          <Power className="h-3.5 w-3.5" />
          {"Activate"}</button>
        <button
          onClick={() => onToggleStatus(false)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-all active:scale-[0.98]"
        >
          <PowerOff className="h-3.5 w-3.5" />
          {"Deactivate"}</button>
        <div className="w-px h-5 bg-premium-border mx-1" />
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98]"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {"Delete"}</button>
      </div>
    </div>
  );
}
