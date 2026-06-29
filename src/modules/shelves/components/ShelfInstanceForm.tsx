"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Save, LayoutGrid, Loader2 } from "lucide-react";
import { shelfTemplateApi } from "../api/shelf-template.api";
import { ShelfTemplate } from "../dtos/shelf-template.dto";

interface ShelfInstanceFormValues {
  name: string;
  templateId: string;
}

interface ShelfInstanceFormProps {
  onSubmit: (data: ShelfInstanceFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ShelfInstanceForm({ onSubmit, onCancel, isLoading }: ShelfInstanceFormProps) {
  const [templates, setTemplates] = useState<ShelfTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShelfInstanceFormValues>({
    defaultValues: { name: "", templateId: "" },
  });

  const selectedTemplateId = watch("templateId");
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  useEffect(() => {
    shelfTemplateApi
      .getMany({ limit: 100 })
      .then((res) => setTemplates(res.data ?? res?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-neutral-700">
          {"Shelf Name"}<span className="text-premium-muted font-normal">{"(optional)"}</span>
        </label>
        <input
          {...register("name")}
          placeholder={"e.g. Front Display A"}
          className="w-full rounded-xl border border-premium-border bg-premium-bg/30 px-4 py-3 text-sm outline-none transition-all focus:border-premium-primary focus:bg-white focus:ring-4 focus:ring-premium-primary/5"
        />
        <p className="text-xs text-premium-muted">
          {"Leave blank to use the template name."}</p>
      </div>

      {/* Template Selector */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-neutral-700">
          {"Shelf Template"}<span className="text-red-500">*</span>
        </label>

        {loadingTemplates ? (
          <div className="flex items-center gap-2 py-4 text-premium-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{"Loading templates…"}</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            {"No templates found. Create a shelf template first."}</div>
        ) : (
          <div className="grid gap-2">
            {templates.map((tmpl) => (
              <label
                key={tmpl.id}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                  selectedTemplateId === tmpl.id
                    ? "border-premium-primary bg-premium-subtle"
                    : "border-premium-border bg-white hover:border-premium-primary/30"
                }`}
              >
                <input
                  type="radio"
                  value={tmpl.id}
                  {...register("templateId", { required: "Please select a template" })}
                  className="hidden"
                />
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    selectedTemplateId === tmpl.id
                      ? "border-premium-primary bg-premium-primary text-white"
                      : "border-premium-border bg-premium-bg text-premium-muted"
                  }`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-neutral-900">{tmpl.name}</p>
                  {tmpl.description && (
                    <p className="mt-0.5 truncate text-xs text-premium-muted">{tmpl.description}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-[11px] font-bold text-premium-muted">
                    <span className="rounded-md bg-premium-bg px-2 py-0.5 border border-premium-border uppercase tracking-wide">
                      {tmpl.layoutType}
                    </span>
                    {tmpl.layoutType === "GRID" && (
                      <span>{tmpl.rows} {"rows ×"}{tmpl.columns} {"columns"}</span>
                    )}
                    {tmpl.layoutType === "DIMENSION" && (
                      <span>{tmpl.width}{"mm ×"}{tmpl.height}{"mm"}</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
        {errors.templateId && (
          <p className="text-xs text-red-500">{errors.templateId.message}</p>
        )}
      </div>

      {/* Preview */}
      {selectedTemplate && selectedTemplate.layoutType === "GRID" && (
        <div className="rounded-xl border border-premium-border bg-premium-bg p-4">
          <p className="mb-2 text-xs font-bold text-premium-muted uppercase tracking-widest">
            {"Grid Preview"}</p>
          <div
            className="w-full overflow-hidden rounded-lg border border-premium-border/50"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(selectedTemplate.columns ?? 1, 8)}, 1fr)`,
              gap: "2px",
            }}
          >
            {Array.from({
              length: Math.min((selectedTemplate.rows ?? 1) * (selectedTemplate.columns ?? 1), 32),
            }).map((_, i) => (
              <div key={i} className="aspect-square bg-white border border-premium-border/30 rounded-sm" />
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-premium-muted">
            {selectedTemplate.rows} {"rows ×"}{selectedTemplate.columns} {"cols ="}{" "}
            {(selectedTemplate.rows ?? 0) * (selectedTemplate.columns ?? 0)} {"cells"}{(selectedTemplate.rows ?? 0) * (selectedTemplate.columns ?? 0) > 32 && " (preview truncated)"}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-premium-border bg-white px-4 py-3 text-sm font-bold text-premium-muted hover:bg-neutral-50 transition-colors"
        >
          {"Cancel"}</button>
        <button
          type="submit"
          disabled={isLoading || loadingTemplates}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-premium-primary px-4 py-3 text-sm font-bold text-white shadow-soft hover:bg-premium-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {"Create Shelf"}</button>
      </div>
    </form>
  );
}
