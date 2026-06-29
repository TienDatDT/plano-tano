"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext, DragOverlay, useSensor, useSensors,
  PointerSensor, DragEndEvent, DragStartEvent,
} from "@dnd-kit/core";
import { ProductSidebar } from "./ProductSidebar";
import { ShelfGrid } from "./ShelfGrid";
import { ShelfItemDrawer } from "./ShelfItemDrawer";
import { ProductVariant, ShelfItem, Shelf } from "../types";
import { planogramApi } from "../api/planogram.api";
import { shelfApi } from "../../shelves/api/shelf.api";
import {
  Save, RotateCcw, Package, LayoutGrid, ChevronDown,
  CheckCircle2, AlertCircle, Loader2, Info,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

export function PlanogramWorkspace() {
  const searchParams = useSearchParams();
  const initialShelfId = searchParams.get("shelf");

  // ── Data state ────────────────────────────────────────────────────────────
  const [shelves, setShelves]     = useState<Shelf[]>([]);
  const [products, setProducts]   = useState<ProductVariant[]>([]);
  const [activeShelfId, setActiveShelfId] = useState<string | null>(initialShelfId);
  const [itemsByShelf, setItemsByShelf]   = useState<Record<string, ShelfItem[]>>({});

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loadingShelf, setLoadingShelf]   = useState(false);
  const [loadingInit, setLoadingInit]     = useState(true);
  const [saving, setSaving]               = useState(false);
  const [savedToast, setSavedToast]       = useState(false);
  const [errorToast, setErrorToast]       = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<any>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [shelfPickerOpen, setShelfPickerOpen] = useState(false);

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 3500);
  };

  // ── Load shelves list + products on mount ─────────────────────────────────
  useEffect(() => {
    async function init() {
      setLoadingInit(true);
      try {
        // All shelf instances (no layoutId filter — planogram is layout-agnostic)
        const shelvesRes = await shelfApi.getAll();
        const rawShelves = shelvesRes?.data ?? shelvesRes ?? [];

        const mapped: Shelf[] = rawShelves.map((s: any) => ({
          id:         s.id,
          name:       s.name ?? s.template?.name ?? "Unnamed Shelf",
          rows:       s.template?.rows    ?? 0,
          columns:    s.template?.columns ?? 0,
          posX:       s.posX    ?? 0,
          posY:       s.posY    ?? 0,
          rotation:   s.rotation ?? 0,
          templateId: s.templateId,
          template:   s.template,
          cells:      (s.cells ?? []).map((c: any) => ({
            id: c.id, row: c.row, column: c.column,
          })),
        }));

        setShelves(mapped);

        // Auto-select: prefer URL param, then first available
        if (!activeShelfId && mapped.length > 0) {
          setActiveShelfId(mapped[0].id);
        }

        // Stock / products
        const stockRes  = await fetch("/api/stock");
        const stockJson = await stockRes.json();
        setProducts(
          (stockJson?.data ?? [])
            .filter((s: any) => s.totalQuantity > 0)
            .map((s: any) => ({
              id:       s.id,
              sku:      s.sku,
              name:     s.productName,
              stock:    s.totalQuantity,
              price:    0,
              category: s.categoryName,
              batches:  s.batches ?? [],
            }))
        );
      } catch (e: any) {
        showError(e.message ?? "Failed to load workspace");
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, []);

  // ── Load items when active shelf changes ──────────────────────────────────
  useEffect(() => {
    if (!activeShelfId || itemsByShelf[activeShelfId] !== undefined) return;

    async function loadItems() {
      setLoadingShelf(true);
      try {
        // Items for this shelf
        const res  = await planogramApi.getByShelf(activeShelfId!);
        const arr  = res?.data ?? res ?? [];

        // Freshen cells for this shelf
        const shelfRes  = await shelfApi.getById(activeShelfId!);
        const shelfData = shelfRes?.data ?? shelfRes;
        const cells = (shelfData?.cells ?? []).map((c: any) => ({
          id: c.id, row: c.row, column: c.column,
        }));
        setShelves((prev) =>
          prev.map((s) => (s.id === activeShelfId ? { ...s, cells } : s))
        );

        const mapped: ShelfItem[] = arr.map((item: any) => ({
          id:        item.id,
          shelfId:   activeShelfId!,
          cellId:    item.cellId,
          batchId:   item.batchId,
          variantId: item.batch?.variant?.id ?? "",
          positionX: item.cell?.column ?? 0,
          positionY: item.cell?.row    ?? 0,
          quantity:  item.quantity,
          variant: {
            id:       item.batch?.variant?.id       ?? "",
            sku:      item.batch?.variant?.sku       ?? "",
            name:     item.batch?.variant?.product?.name ?? "Unknown",
            stock:    0,
            price:    Number(item.batch?.variant?.salePrice ?? 0),
            imageUrl: item.batch?.variant?.product?.imageUrl,
          },
        }));
        setItemsByShelf((prev) => ({ ...prev, [activeShelfId!]: mapped }));
      } catch (e: any) {
        showError(e.message ?? "Failed to load shelf items");
      } finally {
        setLoadingShelf(false);
      }
    }
    loadItems();
  }, [activeShelfId]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeShelf  = shelves.find((s) => s.id === activeShelfId) ?? null;
  const items        = activeShelfId ? (itemsByShelf[activeShelfId] ?? []) : [];
  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null;
  const totalCells   = (activeShelf?.rows ?? 0) * (activeShelf?.columns ?? 0);
  const fillPct      = totalCells > 0 ? Math.round((items.length / totalCells) * 100) : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragData(e.active.data.current);
    setSelectedItemId(null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveDragData(null);
    if (!over || !activeShelfId || !activeShelf) return;

    const data     = active.data.current;
    const overData = over.data.current as { x: number; y: number } | undefined;
    if (!data || !overData) return;
    const { x, y } = overData;

    const targetCell = activeShelf.cells?.find((c) => c.column === x && c.row === y);
    if (!targetCell) {
      showError("Cell not found. The shelf may not have cells generated yet.");
      return;
    }

    setItemsByShelf((prev) => {
      const shelfItems       = [...(prev[activeShelfId] ?? [])];
      const existingAtTarget = shelfItems.find((i) => i.positionX === x && i.positionY === y);

      // ── Drop NEW product from sidebar ──
      if (data.type === "new") {
        if (existingAtTarget) return prev; // occupied
        const product = data.product as ProductVariant;
        const batchId = product.batches?.[0]?.id;
        if (!batchId) { showError(`No batch available for "${product.name}"`); return prev; }

        const newItem: ShelfItem = {
          id:        `draft-${Date.now()}`,
          shelfId:   activeShelfId,
          cellId:    targetCell.id,
          batchId,
          variantId: product.id,
          positionX: x,
          positionY: y,
          quantity:  1,
          variant:   product,
        };
        return { ...prev, [activeShelfId]: [...shelfItems, newItem] };
      }

      // ── MOVE existing item ──
      if (data.type === "move") {
        const moving  = data.item as ShelfItem;
        const oldCell = activeShelf.cells?.find(
          (c) => c.column === moving.positionX && c.row === moving.positionY
        );
        return {
          ...prev,
          [activeShelfId]: shelfItems.map((i) => {
            if (i.id === moving.id)
              return { ...i, positionX: x, positionY: y, cellId: targetCell.id };
            if (existingAtTarget && i.id === existingAtTarget.id)
              return { ...i, positionX: moving.positionX, positionY: moving.positionY, cellId: oldCell?.id ?? i.cellId };
            return i;
          }),
        };
      }
      return prev;
    });
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleRemoveItem = (id: string) => {
    if (!activeShelfId) return;
    setItemsByShelf((prev) => ({
      ...prev,
      [activeShelfId]: (prev[activeShelfId] ?? []).filter((i) => i.id !== id),
    }));
    setSelectedItemId(null);
  };

  const handleReset = () => {
    if (!activeShelfId || !confirm("Clear all products from this shelf?")) return;
    setItemsByShelf((prev) => ({ ...prev, [activeShelfId]: [] }));
    setSelectedItemId(null);
  };

  const handleSave = async () => {
    if (!activeShelfId) return;
    setSaving(true);
    try {
      await planogramApi.clearShelf(activeShelfId);
      const shelfItems = itemsByShelf[activeShelfId] ?? [];
      if (shelfItems.length > 0) {
        await planogramApi.bulkAssign({
          items: shelfItems.map((i) => ({
            shelfId:  i.shelfId,
            cellId:   i.cellId,
            batchId:  i.batchId,
            quantity: i.quantity ?? 1,
          })),
        });
      }
      // Evict cache so next open re-fetches real IDs
      setItemsByShelf((prev) => { const c = { ...prev }; delete c[activeShelfId]; return c; });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (e: any) {
      showError(e.message ?? "Failed to save planogram");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectShelf = (id: string) => {
    setActiveShelfId(id);
    setSelectedItemId(null);
    setShelfPickerOpen(false);
  };

  // ── Render: loading ───────────────────────────────────────────────────────
  if (loadingInit) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-premium-muted">
        <Loader2 className="w-8 h-8 animate-spin text-premium-primary" />
        <p className="text-sm font-semibold">{"Loading workspace…"}</p>
      </div>
    );
  }

  // ── Render: no shelves ────────────────────────────────────────────────────
  if (shelves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-premium-muted">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-premium-subtle text-premium-primary">
          <LayoutGrid className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-neutral-900">{"No shelves found"}</p>
          <p className="text-sm text-premium-muted mt-1">
            {"Go to"}{" "}
            <a href="/admin/shelves" className="text-premium-primary font-bold hover:underline">
              {"Shelf Management → Shelves tab"}</a>{" "}
            {"to create a shelf from a template first."}</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        {/* Shelf picker */}
        <div className="relative">
          <button
            id="planogram-shelf-picker"
            onClick={() => setShelfPickerOpen((p) => !p)}
            className="flex items-center gap-3 px-5 py-3 bg-premium-surface border border-premium-border rounded-2xl shadow-sm hover:border-premium-primary/50 transition-all text-sm font-bold text-neutral-900"
          >
            <LayoutGrid className="h-4 w-4 text-premium-primary" />
            <span>{activeShelf?.name ?? "Select shelf"}</span>
            {activeShelf && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-premium-subtle text-premium-primary">
                {activeShelf.columns}×{activeShelf.rows}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 text-premium-muted transition-transform ${shelfPickerOpen ? "rotate-180" : ""}`}
            />
          </button>

          {shelfPickerOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-premium-surface border border-premium-border rounded-2xl shadow-soft z-30 overflow-hidden">
              {shelves.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectShelf(s.id)}
                  className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition-colors ${
                    s.id === activeShelfId
                      ? "bg-premium-subtle text-premium-primary font-bold"
                      : "hover:bg-premium-bg text-neutral-700"
                  }`}
                >
                  <span className="text-sm font-semibold">{s.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-premium-bg text-premium-muted border border-premium-border">
                    {s.columns}×{s.rows}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 px-5 py-2.5 bg-premium-surface border border-premium-border rounded-2xl shadow-sm text-xs font-bold text-premium-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-premium-primary" />
            <span>{items.length} {"filled"}</span>
          </div>
          <div className="w-px h-4 bg-premium-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full border border-premium-border" />
            <span>{Math.max(0, totalCells - items.length)} {"empty"}</span>
          </div>
          <div className="w-px h-4 bg-premium-border" />
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-premium-bg rounded-full border border-premium-border overflow-hidden">
              <div
                className="h-full bg-premium-primary rounded-full transition-all duration-500"
                style={{ width: `${fillPct}%` }}
              />
            </div>
            <span>{fillPct}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-premium-muted hover:text-neutral-900 hover:bg-premium-bg rounded-xl transition-all"
          >
            <RotateCcw className="h-4 w-4" /> {"Reset"}</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-premium-primary text-white text-sm font-bold rounded-xl shadow-soft hover:bg-premium-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {"Save Layout"}</button>
        </div>
      </div>

      {/* ── Hint banner ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 mb-4 bg-premium-subtle/60 border border-premium-secondary/30 rounded-xl text-xs text-premium-muted">
        <Info className="h-3.5 w-3.5 text-premium-primary shrink-0" />
        <span>
          <strong className="text-premium-primary">{"Drag"}</strong> {"products from the left sidebar into cells.Click a placed product to inspect or remove it."}{" "}
          <strong className="text-premium-primary">{"Swap"}</strong> {"by dragging onto an occupied slot."}</span>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-340px)] min-h-[520px]">
        {/* Sidebar */}
        <div className="col-span-3 min-w-0">
          <ProductSidebar products={products} />
        </div>

        {/* Grid canvas */}
        <div className="col-span-9 flex flex-col gap-4 min-w-0 overflow-auto custom-scrollbar">
          {/* Grid label */}
          <div className="flex items-center gap-3 px-1">
            <div className="h-px flex-1 bg-premium-border" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-premium-muted flex items-center gap-1.5">
              <LayoutGrid className="h-3 w-3" />
              {activeShelf?.columns ?? 0} {"cols ·"}{activeShelf?.rows ?? 0} {"rows"}</span>
            <div className="h-px flex-1 bg-premium-border" />
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {loadingShelf ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-premium-primary" />
              </div>
            ) : activeShelf ? (
              activeShelf.rows === 0 || activeShelf.columns === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-premium-muted">
                  <AlertCircle className="w-8 h-8 opacity-30" />
                  <p className="text-sm font-semibold">
                    {"This shelf has no grid cells."}{" "}
                    <span className="text-premium-primary">{"Only GRID-type templates"}</span> {"generate cells automatically."}</p>
                </div>
              ) : (
                <ShelfGrid
                  rows={activeShelf.rows}
                  columns={activeShelf.columns}
                  items={items}
                  selectedItemId={selectedItemId}
                  onItemClick={(item) =>
                    setSelectedItemId((prev) => (prev === item.id ? null : item.id))
                  }
                />
              )
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Drawers & Toasts ── */}
      <ShelfItemDrawer
        isOpen={!!selectedItemId}
        onClose={() => setSelectedItemId(null)}
        item={selectedItem}
        onRemove={handleRemoveItem}
      />

      {/* Toast: success */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-neutral-900 text-white text-sm font-bold shadow-2xl transition-all duration-500 ${
          savedToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <CheckCircle2 className="h-4 w-4 text-premium-secondary" />
        {"Planogram saved successfully"}</div>

      {/* Toast: error */}
      {errorToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-red-600 text-white text-sm font-bold shadow-2xl">
          <AlertCircle className="h-4 w-4" />
          {errorToast}
        </div>
      )}

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeDragData ? (
          <div className="pointer-events-none">
            {activeDragData.type === "new" ? (
              <div className="w-52 flex items-center gap-3 p-3 rounded-2xl border-2 border-premium-primary bg-premium-surface shadow-2xl opacity-90 rotate-1">
                <div className="w-10 h-10 bg-premium-bg rounded-xl border border-premium-border flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5 text-premium-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold text-premium-primary uppercase tracking-wider truncate">
                    {activeDragData.product.sku}
                  </p>
                  <p className="text-xs font-bold text-neutral-900 truncate">
                    {activeDragData.product.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-premium-surface rounded-2xl shadow-2xl border-2 border-premium-primary flex items-center justify-center opacity-90 rotate-2">
                <Package className="h-8 w-8 text-premium-primary" />
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
