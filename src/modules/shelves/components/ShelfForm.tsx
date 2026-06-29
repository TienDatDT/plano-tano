"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { ShelfLayoutType } from "../dtos/shelf.dto";

interface ShelfFormValues {
  name: string;
  description: string | null;
  layoutType: ShelfLayoutType;

  width?: number;
  height?: number;

  rows?: number;
  columns?: number;
}

interface ShelfFormProps {
  initialData?: ShelfFormValues;
  onSubmit: (data: ShelfFormValues) => void;
  onCancel: () => void;
}

export function ShelfForm({
  initialData,
  onSubmit,
  onCancel,
}: ShelfFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<ShelfFormValues>({
    shouldUnregister: true,
    defaultValues: initialData || {
      name: "",
      description: "",
      layoutType: "DIMENSION",
      width: 100,
      height: 200,
    },
  });

  const layoutType = watch("layoutType");

  useEffect(() => {
    if (layoutType === "DIMENSION") {
      resetField("width");
      resetField("height");
    } else {
      resetField("rows");
      resetField("columns");
    }
  }, [layoutType, resetField]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-700">
            {"Shelf Name"}</label>

          <input
            {...register("name", {
              required: "Shelf name is required",
            })}
            className={`w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary focus:bg-white focus:ring-4 focus:ring-premium-primary/5 ${errors.name ? "border-red-300" : ""
              }`}
          />

          {errors.name && (
            <p className="text-xs text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-700">
            {"Description"}</label>

          <textarea
            {...register("description")}
            rows={3}
            className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
          />
        </div>

        {/* Layout Type */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-neutral-700">
            {"Layout Type"}</label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setValue("layoutType", "DIMENSION")
              }
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${layoutType === "DIMENSION"
                ? "border-premium-primary bg-premium-primary text-white"
                : "border-premium-border bg-white text-premium-muted"
                }`}
            >
              {"Theo kích thước"}</button>

            <button
              type="button"
              onClick={() => setValue("layoutType", "GRID")}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${layoutType === "GRID"
                ? "border-premium-primary bg-premium-primary text-white"
                : "border-premium-border bg-white text-premium-muted"
                }`}
            >
              {"Theo ô (Grid)"}</button>
          </div>
        </div>

        {/* Dynamic Fields */}
        {layoutType === "DIMENSION" ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Width */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">
                {"Width (mm)"}</label>

              <input
                type="number"
                {...register("width", {
                  valueAsNumber: true,
                  required: "Width is required",
                  min: {
                    value: 100,
                    message: "Min 100mm",
                  },
                })}
                className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none focus:border-premium-primary focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
              />

              {errors.width && (
                <p className="text-xs text-red-500">
                  {errors.width.message}
                </p>
              )}
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">
                {"Height (mm)"}</label>

              <input
                type="number"
                {...register("height", {
                  valueAsNumber: true,
                  required: "Height is required",
                  min: {
                    value: 100,
                    message: "Min 100mm",
                  },
                })}
                className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none focus:border-premium-primary focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
              />

              {errors.height && (
                <p className="text-xs text-red-500">
                  {errors.height.message}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Rows */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">
                {"Rows (tầng)"}</label>

              <input
                type="number"
                {...register("rows", {
                  valueAsNumber: true,
                  required: "Rows required",
                  min: {
                    value: 1,
                    message: "Min 1",
                  },
                })}
                className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none focus:border-premium-primary focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
              />

              {errors.rows && (
                <p className="text-xs text-red-500">
                  {errors.rows.message}
                </p>
              )}
            </div>

            {/* Columns */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">
                {"Columns (ô)"}</label>

              <input
                type="number"
                {...register("columns", {
                  valueAsNumber: true,
                  required: "Columns required",
                  min: {
                    value: 1,
                    message: "Min 1",
                  },
                })}
                className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none focus:border-premium-primary focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
              />

              {errors.columns && (
                <p className="text-xs text-red-500">
                  {errors.columns.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-premium-border bg-white px-4 py-3 text-sm font-bold text-premium-muted hover:bg-neutral-50"
        >
          {"Cancel"}</button>

        <button
          type="submit"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-premium-primary px-4 py-3 text-sm font-bold text-white shadow-soft hover:bg-premium-primary/90"
        >
          <Save className="h-4 w-4" />

          {initialData ? "Update Shelf" : "Save Shelf"}
        </button>
      </div>
    </form>
  );
}