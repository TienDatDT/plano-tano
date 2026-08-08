"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Trash2, Info } from "lucide-react";
import { CategoryForm } from "../components/CategoryForm";
import { useKeyboardShortcut } from "@/shared/hooks/useKeyboardShortcut";
import { t } from "i18next";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSubmit: (data: any) => void;
  onDelete?: (id: string) => void;
}


export function CategoryDrawer({
  isOpen,
  onClose,
  category,
  onSubmit,
  onDelete,
}: CategoryDrawerProps) {
  const [mounted, setMounted] = useState(false);

  const handleCreate = useCallback(async (data: any) => {
    await onSubmit(data);
  }, [onSubmit])

  useEffect(() => {
    setMounted(true);
  }, []);

  useKeyboardShortcut([
      {
        key: "s",
        ctrl: true,
        callback: () => handleCreate(category),
      }, {
        key: "escape",
        callback: () => onClose(),
      }
    ])

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-neutral-900/10 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l border-premium-border bg-white shadow-2xl transition-transform duration-500 ease-out sm:max-w-md ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative border-b border-premium-border bg-premium-bg/30 px-6 py-8">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-premium-muted transition-all hover:bg-premium-subtle hover:text-neutral-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-premium-primary shadow-soft ring-1 ring-premium-border/50">
                <Info className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-neutral-900">
                  {category ? t("categories.editCategory") : t("categories.addCategory")}
                </h2>
                <p className="text-sm font-medium text-premium-muted">
                  {category ? t("categories.editSubtitle") : t("categories.addSubtitle")}
                </p>
              </div>
            </div>

            {category && onDelete && (
              <button
                onClick={() => onDelete(category.id)}
                className="mt-6 flex w-fit items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-500 ring-1 ring-red-100 transition-all hover:bg-red-100 active:scale-[0.98]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t("categories.deleteCategory")}</span>
              </button>
            )}
          </div>

          {/* Form */}
          <div className="flex-1 overflow-hidden">
            <CategoryForm
              key={category?.id}
              initialData={
                category
                  ? {
                    name: category.name,
                    description: category.description || "",
                  }
                  : undefined
              }
              onSubmit={handleCreate}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </>
  );
}
