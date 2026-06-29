"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/shared/components/ui/Drawer";
import { Save, Hash, Type } from "lucide-react";

interface UnitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: any;
  onSubmit: (data: any) => void;
}

export function UnitDrawer({
  isOpen,
  onClose,
  unit,
  onSubmit,
}: UnitDrawerProps) {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
  });

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name || "",
        symbol: unit.symbol || "",
      });
    } else {
      setFormData({
        name: "",
        symbol: "",
      });
    }
  }, [unit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={unit ? "Edit Unit" : "Add New Unit"}
      description={
        unit
          ? "Update the details of the selected measurement unit."
          : "Define a new measurement unit for inventory tracking."
      }
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-neutral-100 py-3 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-200"
          >
            {"Cancel"}</button>
          <button
            form="unit-form"
            type="submit"
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-premium-primary py-3 text-sm font-bold text-white shadow-soft transition-all hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            {unit ? "Save Changes" : "Create Unit"}
          </button>
        </div>
      }
    >
      <form id="unit-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="flex items-center gap-2 text-sm font-bold text-neutral-700"
          >
            <Type className="h-4 w-4" />
            {"Unit Name"}</label>
          <input
            id="name"
            type="text"
            required
            placeholder={"e.g., Piece, Box, Pack"}
            className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm font-medium transition-all focus:border-premium-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-premium-primary/5"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Symbol Field */}
        <div className="space-y-2">
          <label
            htmlFor="symbol"
            className="flex items-center gap-2 text-sm font-bold text-neutral-700"
          >
            <Hash className="h-4 w-4" />
            {"Symbol"}</label>
          <input
            id="symbol"
            type="text"
            placeholder={"e.g., pcs, box, pk"}
            className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm font-medium transition-all focus:border-premium-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-premium-primary/5"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          />
          <p className="text-[10px] font-medium text-premium-muted">
            {"Internal short-hand representation of the unit."}</p>
        </div>
      </form>
    </Drawer>
  );
}
