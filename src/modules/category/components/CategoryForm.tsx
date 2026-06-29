"use client";

import { useForm } from "react-hook-form";
import { X, Save, AlertCircle } from "lucide-react";

interface CategoryFormValues {
  name: string;
  description: string;
}

interface CategoryFormProps {
  initialData?: CategoryFormValues;
  onSubmit: (data: CategoryFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CategoryFormValues>({
    defaultValues: initialData || {
      name: "",
      description: "",
    },
  });
    const handleFormSubmit = async (data: any) => {
      await onSubmit(data);

      reset({
        name: "",
        description: ""
      })
    }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="flex items-center gap-1.5 text-sm font-bold text-neutral-800"
          >
            {"Category Name"}<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder={"e.g. Fine Liners & Inks"}
              className={`w-full rounded-xl bg-premium-bg/50 px-4 py-3 text-sm font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 ${errors.name
                  ? "border-red-300 bg-red-50 ring-red-200"
                  : "border-premium-border ring-premium-primary/20"
                } border`}
            />
            {errors.name && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.name.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-bold text-neutral-800"
          >
            {"Description"}</label>
          <textarea
            id="description"
            {...register("description")}
            placeholder={"Describe the items in this category..."}
            rows={4}
            className="w-full rounded-xl border border-premium-border bg-premium-bg/50 px-4 py-3 text-sm font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-premium-primary/20"
          />
        </div>

        {/* Tip Card */}
        <div className="rounded-xl bg-premium-subtle/50 p-4 ring-1 ring-premium-border/50">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-premium-primary">
            <AlertCircle className="h-3.5 w-3.5" />
            {"Quick Tip"}</h4>
          <p className="mt-2 text-xs leading-relaxed text-premium-muted font-medium">
            {"Categories help you filter products efficiently in the POS and inventory manager.Use clear, descriptive names for better organization."}</p>
        </div>
      </div>

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
          className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-premium-primary px-4 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{initialData ? "Save Changes" : "Create Category"}</span>
        </button>
      </div>
    </form>
  );
}
