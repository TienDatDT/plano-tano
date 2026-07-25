"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useTranslation } from "react-i18next";

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function BulkActionBar({
  count,
  onClear,
  onDelete,
  isDeleting,
}: BulkActionBarProps) {
  const {t} = useTranslation();
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 animate-in slide-in-from-bottom-10 fade-in duration-300 items-center gap-4 rounded-2xl border border-premium-border bg-white px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-center gap-3 border-r border-premium-border pr-4">
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-premium-primary px-2 text-xs font-bold text-white">
          {count}
        </span>
        <span className="text-sm font-bold text-neutral-800">
          {t("supplier.bulkActionBar.supplier")}{count > 1 ? t("supplier.bulkActionBar.supplierPlural") : ""} {t("supplier.bulkActionBar.selected")}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isDeleting}
          className="h-8 text-xs text-premium-muted hover:text-neutral-900"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          {t("supplier.bulkActionBar.clear")}</Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          loading={isDeleting}
          className="h-8 px-4 text-xs shadow-none hover:shadow-soft"
        >
          {!isDeleting && <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
          {t("supplier.bulkActionBar.deleteSelected")}</Button>
      </div>
    </div>
  );
}
