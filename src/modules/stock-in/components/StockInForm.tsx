"use client";

import { useState } from "react";

interface Supplier {
  id: string;
  name: string;
  contact?: string;
}

interface StockInFormProps {
  suppliers: Supplier[];
  selectedSupplierId: string;
  onSupplierChange: (id: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
}

export function StockInForm({
  suppliers,
  selectedSupplierId,
  onSupplierChange,
  note,
  onNoteChange,
}: StockInFormProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-premium-border bg-premium-surface p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">{"General Information"}</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="supplier" className="block text-xs font-medium text-premium-muted">
              {"Supplier"}</label>
            <div className="mt-1.5 relative">
              <select
                id="supplier"
                value={selectedSupplierId}
                onChange={(e) => onSupplierChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-premium-border bg-premium-bg/40 px-4 py-2.5 text-sm outline-none ring-premium-secondary/30 transition-all focus:border-premium-secondary focus:bg-premium-surface focus:ring-4"
              >
                <option value="" disabled>{"Select a supplier..."}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-premium-muted">
                <IconChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="date" className="block text-xs font-medium text-premium-muted">
              {"Receipt Date"}</label>
            <input
              id="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="mt-1.5 w-full rounded-xl border border-premium-border bg-premium-bg/40 px-4 py-2.5 text-sm outline-none ring-premium-secondary/30 transition-all focus:border-premium-secondary focus:bg-premium-surface focus:ring-4"
            />
          </div>
        </div>
        <div className="mt-5">
          <label htmlFor="note" className="block text-xs font-medium text-premium-muted">
            {"Internal Note"}</label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={"e.g. Fragile items included, checked by Alex..."}
            className="mt-1.5 w-full rounded-xl border border-premium-border bg-premium-bg/40 px-4 py-3 text-sm outline-none ring-premium-secondary/30 transition-all focus:border-premium-secondary focus:bg-premium-surface focus:ring-4"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-premium-border bg-premium-subtle/30 p-6 flex flex-col justify-center">
        <p className="text-xs font-medium uppercase tracking-wider text-premium-muted">{"Reference Status"}</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-premium-primary/10 text-premium-primary">
              <IconCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{"Inventory Verified"}</p>
              <p className="text-xs text-premium-muted">{"Ready for adjustment"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-premium-secondary/20 text-premium-primary">
              <IconTruck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{"Logistics Tracked"}</p>
              <p className="text-xs text-premium-muted">{"Supplier ID locked"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconTruck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a1 1 0 001 1h2M14 18h-2M14 18h5a1 1 0 001-1v-3.65a1 1 0 00-.22-.624l-2.782-3.48A1 1 0 0015.246 9H14M6 18h2a2 2 0 002-2v-5a2 2 0 00-2-2H4a2 2 0 00-2 2v5a2 2 0 002 2h2z" />
    </svg>
  );
}
