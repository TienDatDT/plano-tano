"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Trash2, Truck } from "lucide-react";
import { SupplierForm } from "./SupplierForm";
import type { SupplierRow, SupplierFormValues } from "../types/supplier.types";
import { useTranslation } from "react-i18next";

interface SupplierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: SupplierRow | null;
  onSubmit: (data: SupplierFormValues) => Promise<void>;
  onDelete?: (id: string) => void;
  isSubmitting?: boolean;
}

export function SupplierDrawer({
  isOpen,
  onClose,
  supplier,
  onSubmit,
  onDelete,
  isSubmitting,
}: SupplierDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!mounted) return null;

  const initialData: Partial<SupplierFormValues> | undefined = supplier
    ? {
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        status: supplier.status,
      }
    : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-neutral-900/10 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l border-premium-border bg-white shadow-2xl transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={supplier ? "Edit supplier" : "New supplier"}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative border-b border-premium-border bg-premium-bg/30 px-6 py-8">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-premium-muted transition-all hover:bg-premium-subtle hover:text-neutral-900"
              aria-label={t("supplierDrawer.closePanel")}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-premium-primary shadow-soft ring-1 ring-premium-border/50">
                <Truck className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-neutral-900">
                  {supplier ? t("supplierDrawer.editTitle") : t("supplierDrawer.newTitle")}
                </h2>
                <p className="text-sm font-medium text-premium-muted">
                  {supplier
                    ? t("supplierDrawer.editDescription")
                    : t("supplierDrawer.newDescription")}
                </p>
              </div>
            </div>

            {supplier && onDelete && (
              <button
                onClick={() => onDelete(supplier.id)}
                className="mt-6 flex w-fit items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-500 ring-1 ring-red-100 transition-all hover:bg-red-100 active:scale-[0.98]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t("supplierDrawer.deleteSupplier")}</span>
              </button>
            )}
          </div>

          {/* Form body */}
          <div className="flex-1 overflow-hidden">
            <SupplierForm
              key={supplier?.id ?? "new"}
              initialData={initialData}
              onSubmit={onSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </>
  );
}
