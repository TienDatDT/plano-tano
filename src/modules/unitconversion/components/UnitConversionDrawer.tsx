"use client";

import { useEffect, useState } from "react";
import { Drawer } from "@/shared/components/ui/Drawer";
import { Save, Layers, ArrowRight, Info, AlertCircle } from "lucide-react";

interface UnitConversionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversion?: any;
  units: any[];
  products: any[];
  conversions: any[];
  onSubmit: (data: any) => void;
}

export function UnitConversionDrawer({
  isOpen,
  onClose,
  conversion,
  units,
  products,
  conversions,
  onSubmit,
}: UnitConversionDrawerProps) {
  const [formData, setFormData] = useState({
    productId: "",
    fromUnitId: "",
    toUnitId: "",
    ratio: 1,
  });

  useEffect(() => {
    if (conversion) {
      setFormData({
        productId: conversion.productId || "",
        fromUnitId: conversion.fromUnitId || "",
        toUnitId: conversion.toUnitId || "",
        ratio: conversion.ratio || 1,
      });
    } else {
      setFormData({
        productId: products[0]?.id || "",
        fromUnitId: units[0]?.id || "",
        toUnitId: units[1]?.id || units[0]?.id || "",
        ratio: 1,
      });
    }
  }, [conversion, isOpen, products, units]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicate conversion pairs (Prevent duplicate from-to for the same product)
    const isDuplicate = conversions.some(c => 
      c.id !== conversion?.id &&
      c.productId === formData.productId &&
      c.fromUnitId === formData.fromUnitId &&
      c.toUnitId === formData.toUnitId
    );

    if (isDuplicate) {
      alert("A conversion for this product and unit pair already exists.");
      return;
    }

    if (formData.fromUnitId === formData.toUnitId) {
      alert("Source and target units must be different.");
      return;
    }

    onSubmit(formData);
  };

  const fromUnit = units.find(u => u.id === formData.fromUnitId);
  const toUnit = units.find(u => u.id === formData.toUnitId);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={conversion ? "Edit Conversion" : "Add New Conversion"}
      description={"Define the relationship between different units for a specific product."}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-neutral-100 py-3 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-200"
          >
            {"Cancel"}</button>
          <button
            form="conv-form"
            type="submit"
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-premium-primary py-3 text-sm font-bold text-white shadow-soft transition-all hover:opacity-90"
          >
            <Save className="h-4 w-4" />
            {conversion ? "Save Changes" : "Create Conversion"}
          </button>
        </div>
      }
    >
      <form id="conv-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Product Select */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-700">
            <Layers className="h-4 w-4" />
            {"Product"}</label>
          <select
            className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm font-medium transition-all focus:border-premium-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-premium-primary/5"
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          >
            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* From Unit */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">{"From Unit"}</label>
            <select
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm font-medium focus:border-premium-primary focus:bg-white"
              value={formData.fromUnitId}
              onChange={(e) => setFormData({ ...formData, fromUnitId: e.target.value })}
            >
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {/* To Unit */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">{"To Unit"}</label>
            <select
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm font-medium focus:border-premium-primary focus:bg-white"
              value={formData.toUnitId}
              onChange={(e) => setFormData({ ...formData, toUnitId: e.target.value })}
            >
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        {/* Ratio Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-700">
            {"Conversion Ratio"}</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm font-medium focus:border-premium-primary focus:bg-white"
              value={formData.ratio}
              onChange={(e) => setFormData({ ...formData, ratio: parseFloat(e.target.value) || 0 })}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-xs font-bold text-premium-muted">{toUnit?.symbol || toUnit?.name} {"per"}{fromUnit?.symbol || fromUnit?.name}</span>
            </div>
          </div>
        </div>

        {/* Conversion Preview Card */}
        <div className="rounded-2xl bg-premium-bg p-4 ring-1 ring-premium-border/50">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-premium-primary">
            <Info className="h-3 w-3" />
            {"Conversion Preview"}</div>
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-center">
              <div className="text-sm font-bold text-neutral-900">1</div>
              <div className="text-[10px] font-medium text-premium-muted">{fromUnit?.name}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-premium-primary" />
            <div className="text-center">
              <div className="text-sm font-bold text-neutral-900">{formData.ratio}</div>
              <div className="text-[10px] font-medium text-premium-muted">{toUnit?.name}</div>
            </div>
          </div>
          <p className="mt-2 text-center text-xs italic text-premium-muted">
            {"\"We track this product by"}{toUnit?.name?.toLowerCase()}{"s, but can buy/sell in"}{fromUnit?.name?.toLowerCase()}{"s.\""}</p>
        </div>

        {/* Validation Warning */}
        {formData.fromUnitId === formData.toUnitId && (
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 p-4 text-xs font-medium text-orange-700 ring-1 ring-orange-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {"Source and Target units must be different to create a valid conversion."}</div>
        )}
      </form>
    </Drawer>
  );
}
