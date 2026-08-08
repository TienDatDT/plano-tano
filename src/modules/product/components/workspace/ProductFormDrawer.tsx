"use client";

import { AlertTriangle } from "lucide-react";
import { Drawer } from "@/shared/components/ui/Drawer";
import { useTranslation } from "react-i18next";

interface ProductFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  form: {
    name: string;
    description: string;
    categoryId: string;
  };
  setForm: (form: any) => void;
  categories: any[];
  error: string | null;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProductFormDrawer({
  isOpen,
  onClose,
  title,
  description,
  form,
  setForm,
  categories,
  error,
  saving,
  onSubmit,
}: ProductFormDrawerProps) {
  const { t } = useTranslation();
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100 italic">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="pf-name" className="text-xs font-bold uppercase tracking-widest text-premium-muted">
              {t("products.table.productName")}
            </label>
            <input
              id="pf-name"
              required
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
              placeholder={"e.g. Premium Fountain Pen"}
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary/50 focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pf-desc" className="text-xs font-bold uppercase tracking-widest text-premium-muted">
              {t("products.description")}
            </label>
            <textarea
              id="pf-desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
              placeholder={t("products.descriptPlaceholder")}
              className="w-full resize-none rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary/50 focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pf-cat" className="text-xs font-bold uppercase tracking-widest text-premium-muted">
              {t("products.table.category")}
            </label>
            <select
              id="pf-cat"
              required
              value={form.categoryId}
              onChange={(e) => setForm((f: any) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary/50 focus:bg-white focus:ring-4 focus:ring-premium-primary/5 appearance-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-premium-border py-3 text-sm font-bold text-premium-muted hover:bg-premium-bg transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-[2] rounded-xl bg-premium-primary py-3 text-sm font-bold text-white shadow-soft hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "common.processing" : title.includes("New") ? t("products.addProduct") : t("common.save")}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
