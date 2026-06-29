"use client";

import { AlertTriangle } from "lucide-react";
import { Drawer } from "@/shared/components/ui/Drawer";

interface VariantFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  form: {
    sku: string;
    salePrice: string;
    costPrice: string;
    status: "ACTIVE" | "INACTIVE";
    unitId: string;
  };
  setForm: (form: any) => void;
  units: any[];
  error: string | null;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function VariantFormDrawer({
  isOpen,
  onClose,
  title,
  description,
  form,
  setForm,
  units,
  error,
  saving,
  onSubmit,
}: VariantFormDrawerProps) {
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
            <label htmlFor="vf-sku" className="text-xs font-bold uppercase tracking-widest text-premium-muted">
              {"Stock Keeping Unit (SKU)"}</label>
            <input
              id="vf-sku"
              required
              autoFocus
              value={form.sku}
              onChange={(e) => setForm((f: any) => ({ ...f, sku: e.target.value }))}
              placeholder={"e.g. PENCIL-BLUE-01"}
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 font-mono text-xs outline-none transition-all focus:border-premium-primary/50 focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="vf-price" className="text-xs font-bold uppercase tracking-widest text-premium-muted">
              {"Sale Price"}</label>
            <input
              id="vf-price"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.salePrice}
              onChange={(e) => setForm((f: any) => ({ ...f, salePrice: e.target.value }))}
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary/50 focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="vf-cost-price" className="text-xs font-bold uppercase tracking-widest text-premium-muted">
              {"Cost Price (Optional)"}</label>
            <input
              id="vf-cost-price"
              type="number"
              step="0.01"
              min="0"
              value={form.costPrice}
              onChange={(e) => setForm((f: any) => ({ ...f, costPrice: e.target.value }))}
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary/50 focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="vf-status" className="text-xs font-bold uppercase tracking-widest text-premium-muted">
              {"Status"}</label>
            <select
              id="vf-status"
              required
              value={form.status}
              onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary/50 focus:bg-white focus:ring-4 focus:ring-premium-primary/5 appearance-none cursor-pointer"
            >
              <option value="ACTIVE">{"Active"}</option>
              <option value="INACTIVE">{"Inactive"}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="vf-unit" className="text-xs font-bold uppercase tracking-widest text-premium-muted">
              {"Unit of Measure"}</label>
            <select
              id="vf-unit"
              required
              value={form.unitId}
              onChange={(e) => setForm((f: any) => ({ ...f, unitId: e.target.value }))}
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary/50 focus:bg-white focus:ring-4 focus:ring-premium-primary/5 appearance-none cursor-pointer"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.symbol ? `${u.name} (${u.symbol})` : u.name}
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
            {"Cancel"}</button>
          <button
            type="submit"
            disabled={saving}
            className="flex-[2] rounded-xl bg-premium-primary py-3 text-sm font-bold text-white shadow-soft hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Processing..." : title.includes("New") ? "Add Variant" : "Save Changes"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
