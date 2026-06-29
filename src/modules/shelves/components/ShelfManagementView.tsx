"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, LayoutGrid, Grid3x3, Loader2 } from "lucide-react";
import { ShelfCard } from "./ShelfCard";
import { ShelfForm } from "./ShelfForm";
import { ShelfInstanceForm } from "./ShelfInstanceForm";
import { ShelfInstanceList } from "./ShelfInstanceList";
import { Drawer } from "@/shared/components/ui/Drawer";
import { useAdminSearch } from "@/modules/admin/context/AdminSearchContext";
import { toast } from "sonner";
import { shelfTemplateApi } from "../api/shelf-template.api";
import { shelfApi } from "../api/shelf.api";
import { ShelfTemplate } from "../dtos/shelf-template.dto";

type ActiveTab = "templates" | "shelves";

export function ShelfManagementView() {
  const { query } = useAdminSearch();
  const [activeTab, setActiveTab] = useState<ActiveTab>("templates");

  // ── Template state ───────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<ShelfTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShelfTemplate | null>(null);

  // ── Shelf instance state ─────────────────────────────────────────────────
  const [instanceDrawerOpen, setInstanceDrawerOpen] = useState(false);
  const [instanceSaving, setInstanceSaving] = useState(false);

  // ── Shelf instance counter (triggers list refresh) ───────────────────────
  const [instanceRefreshKey, setInstanceRefreshKey] = useState(0);

  // ── Load templates ────────────────────────────────────────────────────────
  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const result = await shelfTemplateApi.getMany();
      if (result) setTemplates(result.data ?? result);
    } catch (e: any) {
      toast.error(e.message || "Failed to load shelf templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = useMemo(() => {
    const kw = query.toLowerCase();
    return templates.filter(
      (s) =>
        (s.name?.toLowerCase() || "").includes(kw) ||
        (s.description?.toLowerCase() || "").includes(kw)
    );
  }, [templates, query]);

  // ── Template handlers ─────────────────────────────────────────────────────
  const handleEditTemplate = (t: ShelfTemplate) => {
    setEditingTemplate(t);
    setTemplateDrawerOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this shelf template? Shelves using it will be affected.")) return;
    try {
      await shelfTemplateApi.delete(id);
      setTemplates((prev) => prev.filter((s) => s.id !== id));
      toast.success("Template deleted");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete template");
    }
  };

  const handleTemplateSubmit = async (data: any) => {
    try {
      if (editingTemplate) {
        const updated = await shelfTemplateApi.update(editingTemplate.id, data);
        setTemplates((prev) =>
          prev.map((s) => (s.id === editingTemplate.id ? updated : s))
        );
        toast.success("Template updated");
      } else {
        const created = await shelfTemplateApi.create({
          ...data,
          width: data.width || 300,
          height: data.height || 200,
          rows: data.rows || 1,
          columns: data.columns || 1,
        });
        setTemplates((prev) => [created, ...prev]);
        toast.success("Template created");
      }
      setTemplateDrawerOpen(false);
      setEditingTemplate(null);
    } catch (e: any) {
      toast.error(e.message ?? (editingTemplate ? "Update failed" : "Create failed"));
    }
  };

  // ── Shelf instance handler ────────────────────────────────────────────────
  const handleInstanceSubmit = async (data: { name: string; templateId: string }) => {
    setInstanceSaving(true);
    try {
      await shelfApi.create({
        name: data.name || undefined,
        templateId: data.templateId,
        // layoutId auto-resolved by service (picks first/active layout)
      });
      toast.success("Shelf created successfully! Cells have been auto-generated.");
      setInstanceDrawerOpen(false);
      setInstanceRefreshKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create shelf");
    } finally {
      setInstanceSaving(false);
    }
  };

  // ── Tab config ────────────────────────────────────────────────────────────
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "templates",
      label: "Templates",
      icon: <LayoutGrid className="h-4 w-4" />,
      count: templates.length,
    },
    {
      id: "shelves",
      label: "Shelves",
      icon: <Grid3x3 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-premium-primary">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">{"Workspace"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            {activeTab === "templates" ? "Shelf Templates" : "Shelf Instances"}
          </h1>
          <p className="text-sm text-premium-muted">
            {activeTab === "templates"
              ? "Define reusable shelf blueprints with dimensions and grid layout."
              : "Create actual shelves from templates. Each shelf gets auto-generated cells."}
          </p>
        </div>

        {activeTab === "templates" ? (
          <button
            onClick={() => { setEditingTemplate(null); setTemplateDrawerOpen(true); }}
            className="flex items-center gap-2 rounded-2xl bg-premium-primary px-6 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 hover:shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5" />
            {"New Template"}</button>
        ) : (
          <button
            onClick={() => setInstanceDrawerOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-premium-primary px-6 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-premium-primary/90 hover:shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5" />
            {"Create Shelf"}</button>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 bg-premium-bg p-1.5 rounded-2xl border border-premium-border w-fit shadow-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-premium-surface shadow-sm text-premium-primary"
                : "text-premium-muted hover:text-neutral-900"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-premium-primary text-white"
                    : "bg-premium-border text-premium-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "templates" && (
        <>
          {loadingTemplates ? (
            <div className="flex items-center justify-center py-24 gap-3 text-premium-muted">
              <Loader2 className="w-6 h-6 animate-spin text-premium-primary" />
              <span className="text-sm font-semibold">{"Loading templates…"}</span>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((tmpl) => (
                <ShelfCard
                  key={tmpl.id}
                  shelf={tmpl}
                  layoutType={tmpl.layoutType}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onOpenEditor={(id) => {
                    // Switch to shelves tab to create an instance of this template
                    setActiveTab("shelves");
                    setInstanceDrawerOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-premium-border bg-premium-bg/20 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-premium-subtle text-premium-primary">
                <LayoutGrid className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-neutral-900">
                {query ? `No templates match "${query}"` : "No templates yet"}
              </h3>
              <p className="mt-1 text-sm text-premium-muted">
                {query ? "Try a different search term." : "Create your first shelf template to get started."}
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === "shelves" && (
        <ShelfInstanceList
          key={instanceRefreshKey}
          onOpenPlanogram={(shelfId) => {
            window.location.href = `/admin/planogram?shelf=${shelfId}`;
          }}
        />
      )}

      {/* ── Drawers ── */}
      <Drawer
        isOpen={templateDrawerOpen}
        onClose={() => { setTemplateDrawerOpen(false); setEditingTemplate(null); }}
        title={editingTemplate ? "Edit Template" : "New Shelf Template"}
        description={
          editingTemplate
            ? "Update the dimensions or structure of this template."
            : "Define a reusable shelf blueprint with dimensions and grid configuration."
        }
      >
        <ShelfForm
          initialData={editingTemplate || undefined}
          onSubmit={handleTemplateSubmit}
          onCancel={() => { setTemplateDrawerOpen(false); setEditingTemplate(null); }}
        />
      </Drawer>

      <Drawer
        isOpen={instanceDrawerOpen}
        onClose={() => setInstanceDrawerOpen(false)}
        title={"Create Shelf"}
        description={"Instantiate a real shelf from a template. Cells will be auto-generated based on the template grid."}
      >
        <ShelfInstanceForm
          onSubmit={handleInstanceSubmit}
          onCancel={() => setInstanceDrawerOpen(false)}
          isLoading={instanceSaving}
        />
      </Drawer>
    </div>
  );
}
