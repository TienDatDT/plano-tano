"use client";

import Link from "next/link";
import { Plus, Package, Save } from "lucide-react";

interface StockInHeaderProps {
  onSave: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  isValid?: boolean;
  isConfirmed?: boolean;
}

export function StockInHeader({ 
  onSave, 
  onConfirm, 
  onCancel, 
  isSaving = false, 
  isValid = true,
  isConfirmed = false
}: StockInHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-premium-subtle text-premium-primary shadow-sm ring-1 ring-premium-border/50">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {isConfirmed ? "Stock Entry Details" : "Create Stock Entry"}
          </h1>
          <p className="text-sm font-medium text-premium-muted">
            {isConfirmed ? "Confirmed stock receipt" : "Log new goods receipts from suppliers"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="hidden sm:inline-flex h-11 items-center justify-center rounded-xl border border-premium-border bg-white px-6 text-sm font-bold text-neutral-700 transition-all hover:bg-premium-bg active:scale-[0.98]"
          >
            {isConfirmed ? "Back" : "Cancel"}
          </button>
        )}
        
        {!isConfirmed && (
          <button
            onClick={onSave}
            disabled={isSaving || !isValid}
            className="flex items-center gap-2 rounded-xl border border-premium-primary bg-white px-6 py-2.5 text-sm font-bold text-premium-primary shadow-soft transition-all hover:bg-premium-subtle active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
        )}

        {onConfirm && !isConfirmed && (
          <button
            onClick={onConfirm}
            disabled={isSaving || !isValid}
            className="flex items-center gap-2 rounded-xl bg-premium-primary px-8 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <IconLoading className="h-4 w-4 animate-spin" />
                <span>{"Confirming..."}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{"Confirm & Update Inventory"}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function IconLoading(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" d="M12 3a9 9 0 109 9" />
    </svg>
  );
}
