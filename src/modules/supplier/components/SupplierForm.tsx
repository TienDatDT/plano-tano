"use client";

import { useForm } from "react-hook-form";
import { Save, AlertCircle } from "lucide-react";
import type { SupplierFormValues } from "../types/supplier.types";

interface SupplierFormProps {
  initialData?: Partial<SupplierFormValues>;
  onSubmit: (data: SupplierFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SupplierForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SupplierFormValues>({
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      phone: "",
      status: true,
      ...initialData,
    },
  });

  const statusValue = watch("status");

  const handleFormSubmit = async (data: SupplierFormValues) => {
    await onSubmit(data);
    reset({ name: "", contact: "", email: "", phone: "", status: true });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {/* Name */}
        <div className="space-y-2">
          <label
            htmlFor="sup-name"
            className="flex items-center gap-1.5 text-sm font-bold text-neutral-800"
          >
            {"Supplier Name"}<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="sup-name"
              {...register("name", { required: "Supplier name is required" })}
              placeholder={"e.g. Aurora Desk Supply"}
              className={`w-full rounded-xl bg-premium-bg/50 px-4 py-3 text-sm font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 border ${errors.name
                  ? "border-red-300 bg-red-50 ring-red-200"
                  : "border-premium-border ring-premium-primary/20"
                }`}
            />
            {errors.name && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.name.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Contact */}
        <div className="space-y-2">
          <label
            htmlFor="sup-contact"
            className="text-sm font-bold text-neutral-800"
          >
            {"Primary Contact"}</label>
          <input
            id="sup-contact"
            {...register("contact")}
            placeholder={"Full name"}
            className="w-full rounded-xl border border-premium-border bg-premium-bg/50 px-4 py-3 text-sm font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-premium-primary/20"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="sup-email"
            className="text-sm font-bold text-neutral-800"
          >
            {"Email"}</label>
          <input
            id="sup-email"
            type="email"
            {...register("email")}
            placeholder={"orders@supplier.com"}
            className="w-full rounded-xl border border-premium-border bg-premium-bg/50 px-4 py-3 text-sm font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-premium-primary/20"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label
            htmlFor="sup-phone"
            className="text-sm font-bold text-neutral-800"
          >
            {"Phone"}</label>
          <input
            id="sup-phone"
            {...register("phone")}
            placeholder="+1 …"
            className="w-full rounded-xl border border-premium-border bg-premium-bg/50 px-4 py-3 text-sm font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-premium-primary/20"
          />
        </div>

        {/* Status toggle */}
        <div className="space-y-2">
          <span className="text-sm font-bold text-neutral-800">{"Status"}</span>
          <div className="flex gap-2">
            {([true, false] as const).map((s) => (
              <button
                type="button"
                onClick={() => setValue("status", s)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${statusValue === s
                    ? "border-premium-primary bg-[#e8f4ee] text-[#3d6b55]"
                    : "border-premium-border bg-premium-bg/50 text-premium-muted hover:border-premium-secondary"
                  }`}
              >
                {s === true ? "Active" : "Inactive"}
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="rounded-xl bg-premium-subtle/50 p-4 ring-1 ring-premium-border/50">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-premium-primary">
            <AlertCircle className="h-3.5 w-3.5" />
            {"Quick Tip"}</h4>
          <p className="mt-2 text-xs font-medium leading-relaxed text-premium-muted">
            {"Keep supplier contacts up-to-date for seamless stock-in and reorder workflows."}</p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-auto flex items-center gap-3 border-t border-premium-border bg-premium-bg/30 p-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-premium-muted shadow-sm ring-1 ring-premium-border transition-all hover:bg-neutral-50 active:scale-[0.98]"
        >
          {"Cancel"}</button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-premium-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{initialData?.name ? "Save Changes" : "Create Supplier"}</span>
        </button>
      </div>
    </form>
  );
}
