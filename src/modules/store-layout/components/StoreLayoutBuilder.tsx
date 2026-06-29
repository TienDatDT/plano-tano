"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  Modifiers
} from "@dnd-kit/core";

import {
  Box,
  Trash2,
} from "lucide-react";
import { ShelfInstanceData } from "./ShelfLibrary";
import { LayoutCanvas } from "./LayoutCanvas";
import { useHistory } from "../hooks/useHistory";
import { storeLayoutApi } from "../api/store-layout.api";
import { shelfApi } from "@/modules/shelves/api/shelf.api";
import { toast } from "sonner";

import { LayoutHeader, LayoutConfig } from "./LayoutHeader";
import { TemplateSidebar } from "./TemplateSidebar";
import { InspectorPanel, PlacedShelfData } from "./InspectorPanel";

// Color palette for visual variety on canvas
const SHELF_COLORS = [
  "bg-emerald-100 border-emerald-300 text-emerald-700",
  "bg-teal-100 border-teal-300 text-teal-700",
  "bg-sky-100 border-sky-300 text-sky-700",
  "bg-violet-100 border-violet-300 text-violet-700",
  "bg-amber-100 border-amber-300 text-amber-700",
  "bg-rose-100 border-rose-300 text-rose-700",
];

function getShelfColor(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SHELF_COLORS[hash % SHELF_COLORS.length];
}

const GRID_SIZE = 40;

export function StoreLayoutBuilder() {
  const {
    state: shelves,
    set: setShelves,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory
  } = useHistory<PlacedShelfData[]>([]);

  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(null);

  const shelvesRef = useRef(shelves);
  useEffect(() => {
    shelvesRef.current = shelves;
  }, [shelves]);
  const [zoom, setZoom] = useState(1);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("library");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    id: "default-1",
    width: 20,
    height: 15,
    name: "Main Stationery Floor",
  });
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);

  const loadShelvesForLayout = useCallback(async (layoutId: string) => {
    try {
      const res = await shelfApi.getAll(layoutId);
      const arr = res?.data ?? res ?? [];
      const mapped: PlacedShelfData[] = arr.map((s: any) => ({
        id:       s.id,
        name:     s.name ?? s.template?.name ?? "Shelf",
        templateId: s.templateId,
        layoutId: s.layoutId,
        posX:     s.posX ?? 0,
        posY:     s.posY ?? 0,
        rotation: s.rotation ?? 0,
        width:    s.template?.layoutType === "GRID" ? (s.template?.columns ?? 2) : 2,
        height:   s.template?.layoutType === "GRID" ? (s.template?.rows    ?? 1) : 1,
        color:    getShelfColor(s.id),
      }));
      setShelves(mapped);
      resetHistory(mapped);
    } catch (e: any) {
      toast.error("Failed to load shelves for layout");
    }
  }, [setShelves, resetHistory]);

  const fetchLayouts = useCallback(async () => {
    try {
      const result = await storeLayoutApi.getAll();
      if (result?.data?.length > 0) {
        setSavedLayouts(result.data);
        const first = result.data[0];
        setLayoutConfig(first);
        loadShelvesForLayout(first.id);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load layouts");
    }
  }, [loadShelvesForLayout]);

  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const overlappingShelfIds = useMemo(() => {
    const overlapping = new Set<string>();
    for (let i = 0; i < shelves.length; i++) {
      for (let j = i + 1; j < shelves.length; j++) {
        const s1 = shelves[i];
        const s2 = shelves[j];

        const s1Width = s1.rotation % 180 !== 0 ? s1.height : s1.width;
        const s1Height = s1.rotation % 180 !== 0 ? s1.width : s1.height;
        const s2Width = s2.rotation % 180 !== 0 ? s2.height : s2.width;
        const s2Height = s2.rotation % 180 !== 0 ? s2.width : s2.height;

        const isOverlapping = !(
          s1.posX + s1Width <= s2.posX ||
          s2.posX + s2Width <= s1.posX ||
          s1.posY + s1Height <= s2.posY ||
          s2.posY + s2Height <= s1.posY
        );

        if (isOverlapping) {
          overlapping.add(s1.id);
          overlapping.add(s2.id);
        }
      }
    }
    return overlapping;
  }, [shelves]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveDragItem(null);

    if (!over || over.id !== "layout-canvas") return;

    const dragData = active.data.current;
    if (!dragData) return;

    if (dragData.type === "new-shelf") {
      const { shelf: template } = dragData as { shelf: ShelfInstanceData };
      const activeRect = active.rect.current.translated;
      const canvasEl = document.getElementById("layout-canvas-el");

      let finalX = 0;
      let finalY = 0;

      if (activeRect && canvasEl) {
        const canvasRect = canvasEl.getBoundingClientRect();
        finalX = Math.round((activeRect.left - canvasRect.left) / (GRID_SIZE * zoom));
        finalY = Math.round((activeRect.top  - canvasRect.top)  / (GRID_SIZE * zoom));
      }

      const shelfWidth  = template.layoutType === "GRID" ? (template.columns || 2) : 2;
      const shelfHeight = template.layoutType === "GRID" ? (template.rows    || 1) : 1;

      finalX = Math.max(0, Math.min(layoutConfig.width  - shelfWidth,  finalX));
      finalY = Math.max(0, Math.min(layoutConfig.height - shelfHeight, finalY));

      // OPTIMISTIC UPDATE: Create temporary shelf instance instantly
      const tempId = `temp-${Date.now()}`;
      const placed: PlacedShelfData = {
        id:         tempId,
        name:       `${template.name} #${shelves.length + 1}`,
        templateId: template.id,
        layoutId:   layoutConfig.id,
        width:      shelfWidth,
        height:     shelfHeight,
        color:      getShelfColor(tempId),
        posX:       finalX,
        posY:       finalY,
        rotation:   0,
      };

      setShelves((prev) => [...prev, placed]);
      setSelectedShelfId(tempId);
      const resolveToast = toast.loading(`Placing new ${template.name}...`);

      // Persist in background
      try {
        const res = await shelfApi.create({
          name: `${template.name} #${shelves.length + 1}`,
          templateId: template.id,
          layoutId: layoutConfig.id,
          posX: finalX,
          posY: finalY,
          rotation: 0,
        });
        const created = res.data ?? res;

        setShelves((prev) =>
          prev.map((s) =>
            s.id === tempId
              ? {
                  ...s,
                  id: created.id,
                  name: created.name ?? s.name,
                  color: getShelfColor(created.id),
                }
              : s
          )
        );
        setSelectedShelfId((prev) => (prev === tempId ? created.id : prev));
        toast.dismiss(resolveToast);
        toast.success(`Placed new ${template.name}`);
      } catch (err: any) {
        setShelves((prev) => prev.filter((s) => s.id !== tempId));
        setSelectedShelfId((prev) => (prev === tempId ? null : prev));
        toast.dismiss(resolveToast);
        toast.error(err.message || "Failed to create shelf instance");
      }

    } else if (dragData.type === "move-shelf") {
      const snappedX = Math.round(delta.x / (GRID_SIZE * zoom));
      const snappedY = Math.round(delta.y / (GRID_SIZE * zoom));

      let newX = 0, newY = 0;

      setShelves((prev) =>
        prev.map((s) => {
          if (s.id === dragData.id) {
            newX = Math.max(0, Math.min(layoutConfig.width  - s.width,  s.posX + snappedX));
            newY = Math.max(0, Math.min(layoutConfig.height - s.height, s.posY + snappedY));
            return { ...s, posX: newX, posY: newY };
          }
          return s;
        })
      );

      try {
        await shelfApi.update(dragData.id, { posX: newX, posY: newY });
      } catch (e) {
        toast.error("Failed to save shelf position");
      }
    }
  };

  const selectedShelf = useMemo(() =>
    shelves.find(s => s.id === selectedShelfId) || null,
    [shelves, selectedShelfId]);

  const updateSelectedShelf = useCallback((updates: Partial<PlacedShelfData>) => {
    setSelectedShelfId((id) => {
      if (!id) return id;
      // If deselect triggered via id: undefined from Inspector
      if (updates.id === undefined) {
        setTimeout(() => setSelectedShelfId(null), 0);
        return id;
      }
      setShelves(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      return id;
    });
  }, [setShelves]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    try {
      setSaving(true);
      const isExistingLayout = savedLayouts.some(l => l.id === layoutConfig.id);
      let activeLayoutId = layoutConfig.id;

      if (isExistingLayout) {
        await storeLayoutApi.update(layoutConfig.id, {
          name:   layoutConfig.name,
          width:  layoutConfig.width,
          height: layoutConfig.height,
        });
        setSavedLayouts(prev =>
          prev.map(l => l.id === layoutConfig.id ? { ...l, ...layoutConfig } : l)
        );
      } else {
        const { id, ...createPayload } = layoutConfig as any;
        const savedLayout = await storeLayoutApi.create(createPayload);
        activeLayoutId = savedLayout.data.id;
        setSavedLayouts(prev => [...prev, savedLayout.data]);
        setLayoutConfig(savedLayout.data);
      }

      // Batch update all shelves in DB
      if (shelves.length > 0) {
        const updates = shelves.map((s) => ({
          id: s.id,
          posX: s.posX,
          posY: s.posY,
          rotation: s.rotation ?? 0,
          name: s.name,
        }));
        await shelfApi.bulkUpdate(updates);
      }

      toast.success("Layout and shelves saved successfully!");
      await loadShelvesForLayout(activeLayoutId);
    } catch (e: any) {
      toast.error(e.message || "Failed to save layout");
    } finally {
      setSaving(false);
    }
  }, [saving, layoutConfig, savedLayouts, shelves, loadShelvesForLayout]);

  const handleDuplicateShelf = useCallback(async () => {
    if (!selectedShelf) return;
    const newX = Math.min(layoutConfig.width - selectedShelf.width, selectedShelf.posX + 1);
    const newY = Math.min(layoutConfig.height - selectedShelf.height, selectedShelf.posY + 1);
    
    // OPTIMISTIC UPDATE: duplicate shelf item instantly
    const tempId = `temp-${Date.now()}`;
    const placed: PlacedShelfData = {
      id:         tempId,
      name:       `${selectedShelf.name} (Copy)`,
      templateId: selectedShelf.templateId,
      layoutId:   layoutConfig.id,
      width:      selectedShelf.width,
      height:     selectedShelf.height,
      color:      getShelfColor(tempId),
      posX:       newX,
      posY:       newY,
      rotation:   selectedShelf.rotation ?? 0,
    };

    setShelves(prev => [...prev, placed]);
    setSelectedShelfId(tempId);
    const resolveToast = toast.loading(`Duplicating ${selectedShelf.name}...`);

    try {
      const res = await shelfApi.create({
        name: `${selectedShelf.name} (Copy)`,
        templateId: selectedShelf.templateId,
        layoutId: layoutConfig.id,
        posX: newX,
        posY: newY,
        rotation: selectedShelf.rotation ?? 0,
      });
      const created = res.data ?? res;

      setShelves(prev =>
        prev.map(s =>
          s.id === tempId
            ? {
                ...s,
                id: created.id,
                name: created.name ?? s.name,
                color: getShelfColor(created.id),
              }
            : s
        )
      );
      setSelectedShelfId(prev => (prev === tempId ? created.id : prev));
      toast.dismiss(resolveToast);
      toast.success(`Duplicated ${selectedShelf.name}`);
    } catch (err: any) {
      setShelves(prev => prev.filter(s => s.id !== tempId));
      setSelectedShelfId(prev => (prev === tempId ? null : prev));
      toast.dismiss(resolveToast);
      toast.error(err.message || "Failed to duplicate shelf");
    }
  }, [selectedShelf, layoutConfig.id, layoutConfig.width, layoutConfig.height, setShelves]);

  const handleRemoveShelf = useCallback(async () => {
    if (!selectedShelfId) return;
    const deleteTarget = selectedShelfId;
    const shelfToDelete = shelves.find(s => s.id === deleteTarget);
    if (!shelfToDelete) return;

    if (confirm(`Are you sure you want to remove this object?`)) {
      const targetIndex = shelves.findIndex(s => s.id === deleteTarget);

      // OPTIMISTIC UPDATE: remove from canvas instantly
      setShelves(prev => prev.filter(s => s.id !== deleteTarget));
      setSelectedShelfId(null);
      const resolveToast = toast.loading(`Removing ${shelfToDelete.name}...`);

      try {
        await shelfApi.delete(deleteTarget);
        toast.dismiss(resolveToast);
        toast.success("Object removed successfully");
      } catch (e: any) {
        // Rollback on failure
        setShelves(prev => {
          const list = [...prev];
          if (targetIndex >= 0 && targetIndex <= list.length) {
            list.splice(targetIndex, 0, shelfToDelete);
          } else {
            list.push(shelfToDelete);
          }
          return list;
        });
        setSelectedShelfId(deleteTarget);
        toast.dismiss(resolveToast);
        toast.error(e.message || "Failed to remove object");
      }
    }
  }, [selectedShelfId, shelves, setShelves]);

  const handleDeleteLayout = useCallback(async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      setShowDeleteConfirm(false);
      
      await storeLayoutApi.delete(layoutConfig.id);
      toast.success("Layout and all shelves deleted successfully");
      
      const remainingLayouts = savedLayouts.filter(l => l.id !== layoutConfig.id);
      setSavedLayouts(remainingLayouts);
      
      if (remainingLayouts.length > 0) {
        const nextLayout = remainingLayouts[0];
        setLayoutConfig(nextLayout);
        loadShelvesForLayout(nextLayout.id);
      } else {
        setLayoutConfig({ id: "new", name: "New Layout", width: 20, height: 15 });
        setShelves([]);
        resetHistory([]);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete layout");
    } finally {
      setDeleting(false);
    }
  }, [deleting, layoutConfig.id, savedLayouts, loadShelvesForLayout, setShelves, resetHistory]);

  const handleResetLayout = useCallback(async () => {
    if (confirm("Reset current layout? This will delete all shelves on this layout in the database. Continue?")) {
      try {
        for (const shelf of shelves) {
          await shelfApi.delete(shelf.id);
        }
        setShelves([]);
        setSelectedShelfId(null);
        toast.success("Layout reset successfully");
      } catch (e: any) {
        toast.error("Failed to delete shelves during reset");
      }
    }
  }, [shelves, setShelves]);

  const handleUpdateLayoutConfig = useCallback((updates: Partial<LayoutConfig>) => {
    setLayoutConfig(p => ({ ...p, ...updates }));
  }, []);

  const handleSelectLayout = useCallback((selectedId: string) => {
    if (selectedId === "new") {
      const newId = Math.random().toString(36).substr(2, 9);
      setLayoutConfig({ id: newId, width: 20, height: 15, name: "New Layout" });
      setShelves([]);
      resetHistory([]);
      return;
    }
    const layout = savedLayouts.find(l => l.id === selectedId);
    if (layout) {
      setLayoutConfig({ id: layout.id, width: layout.width, height: layout.height, name: layout.name });
      loadShelvesForLayout(layout.id);
    }
  }, [savedLayouts, loadShelvesForLayout, setShelves, resetHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent deleting shelf if user is actively writing in input boxes
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')
        ) {
          return;
        }

        if (selectedShelfId) {
          const deleteTarget = selectedShelfId;
          const currentShelves = shelvesRef.current;
          const shelfToDelete = currentShelves.find(s => s.id === deleteTarget);
          if (shelfToDelete) {
            const targetIndex = currentShelves.findIndex(s => s.id === deleteTarget);

            // OPTIMISTIC UPDATE: remove from canvas instantly
            setShelves(prev => prev.filter(s => s.id !== deleteTarget));
            setSelectedShelfId(null);

            shelfApi.delete(deleteTarget)
              .then(() => {
                toast.success("Shelf deleted successfully");
              })
              .catch(() => {
                // Rollback on failure
                setShelves(prev => {
                  const list = [...prev];
                  if (targetIndex >= 0 && targetIndex <= list.length) {
                    list.splice(targetIndex, 0, shelfToDelete);
                  } else {
                    list.push(shelfToDelete);
                  }
                  return list;
                });
                setSelectedShelfId(deleteTarget);
                toast.error("Failed to delete shelf");
              });
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedShelfId, setShelves, handleSave]);

  const snapToGridModifier = useSnapToGridModifier(GRID_SIZE, zoom);

  // Unsaved changes selector
  const originalLayout = useMemo(() => {
    return savedLayouts.find(l => l.id === layoutConfig.id);
  }, [savedLayouts, layoutConfig.id]);

  const hasUnsavedChanges = useMemo(() => {
    if (canUndo) return true;
    if (!originalLayout) return true; // Brand new unsaved layout
    return (
      layoutConfig.name !== originalLayout.name ||
      layoutConfig.width !== originalLayout.width ||
      layoutConfig.height !== originalLayout.height
    );
  }, [canUndo, layoutConfig, originalLayout]);

  const placedShelfIdsMemo = useMemo(() => new Set(shelves.map(s => s.id)), [shelves]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragItem(null)}
      modifiers={[snapToGridModifier]}
    >
      <div className="relative flex flex-col xl:flex-row h-[calc(100vh-140px)] min-w-0 gap-6 overflow-hidden p-2">
        {/* Left Sidebar: Library & Templates */}
        <TemplateSidebar
          leftSidebarOpen={leftSidebarOpen}
          onCloseLeftSidebar={() => setLeftSidebarOpen(false)}
          activeTab={activeTab}
          onSetActiveTab={setActiveTab}
          placedShelfIds={placedShelfIdsMemo}
        />

        {/* Main Content: Canvas & Controls */}
        <main className="flex flex-1 flex-col gap-4 min-w-0 h-full">
          <LayoutHeader
            layoutConfig={layoutConfig}
            savedLayouts={savedLayouts}
            shelvesCount={shelves.length}
            canUndo={canUndo}
            canRedo={canRedo}
            zoom={zoom}
            saving={saving}
            deleting={deleting}
            hasUnsavedChanges={hasUnsavedChanges}
            onUpdateLayoutConfig={handleUpdateLayoutConfig}
            onSelectLayout={handleSelectLayout}
            onUndo={undo}
            onRedo={redo}
            onZoomIn={() => setZoom(z => Math.min(2, z + 0.1))}
            onZoomOut={() => setZoom(z => Math.max(0.5, z - 0.1))}
            onReset={handleResetLayout}
            onSave={handleSave}
            onDeleteLayout={() => setShowDeleteConfirm(true)}
            onOpenLeftSidebar={() => setLeftSidebarOpen(true)}
            onOpenRightSidebar={() => setRightSidebarOpen(true)}
          />

          <div className="flex-1 overflow-auto rounded-3xl border border-premium-border bg-premium-bg/10 custom-scrollbar">
            <div className="min-w-fit min-h-fit p-12 flex items-start justify-start">
              <div style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                width: layoutConfig.width * GRID_SIZE,
                height: layoutConfig.height * GRID_SIZE
              }}>
                <LayoutCanvas
                  layoutWidth={layoutConfig.width}
                  layoutHeight={layoutConfig.height}
                  gridSize={GRID_SIZE}
                  shelves={shelves}
                  selectedShelfId={selectedShelfId}
                  overlappingShelfIds={overlappingShelfIds}
                  onSelectShelf={setSelectedShelfId}
                  zoom={zoom}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Inspector */}
        <InspectorPanel
          selectedShelf={selectedShelf}
          overlappingShelfIds={overlappingShelfIds}
          rightSidebarOpen={rightSidebarOpen}
          onCloseRightSidebar={() => setRightSidebarOpen(false)}
          onUpdateShelf={updateSelectedShelf}
          onDuplicateShelf={handleDuplicateShelf}
          onRemoveShelf={handleRemoveShelf}
        />
      </div>

      {/* Premium custom confirmation delete modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-md transition-opacity">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-premium-border bg-white p-6 shadow-2xl transition-transform scale-100">
            <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-4 ring-red-50">
                <Trash2 className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-neutral-900">{"Delete Store Layout?"}</h3>
                <p className="text-xs text-premium-muted px-4">
                  {"Are you sure you want to delete"}<span className="font-bold text-neutral-800">"{layoutConfig.name}"</span>{"This action is permanent and will permanently delete all placed shelf items on this layout from the database."}</p>
              </div>
              <div className="flex w-full items-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-premium-border bg-white py-2.5 text-xs font-bold text-neutral-700 transition-all hover:bg-premium-bg active:scale-95"
                >
                  {"Cancel"}</button>
                <button
                  onClick={handleDeleteLayout}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-soft transition-all hover:bg-red-700 hover:shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{"Confirm Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DragOverlay dropAnimation={null}>
        {activeDragItem ? (
          activeDragItem.type === "new-shelf" ? (
            <div className="overlay-wrapper">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <div
                  className={`rounded-2xl border-2 shadow-2xl cursor-grabbing flex flex-col p-2.5 opacity-90 border-premium-primary bg-white`}
                  style={{
                    width: `${(activeDragItem.shelf.layoutType === "GRID" ? (activeDragItem.shelf.columns || 2) : 2) * GRID_SIZE}px`,
                    height: `${(activeDragItem.shelf.layoutType === "GRID" ? (activeDragItem.shelf.rows || 1) : 1) * GRID_SIZE}px`,
                  }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-premium-subtle text-premium-primary shadow-sm">
                    <Box className="h-4 w-4" />
                  </div>
                  <div className="mt-auto">
                    <p className="truncate text-[11px] font-bold tracking-tight text-neutral-900">
                      {activeDragItem.shelf.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function useSnapToGridModifier(gridSize: number, zoom: number = 1) {
  return useMemo<Modifiers[number]>(() => {
    return ({ transform, active }) => {
      // Only snap move-shelf during drag. new-shelf snaps exactly on drop instead of mid-drag.
      if (active?.data?.current?.type === "move-shelf") {
        const adjustedGrid = gridSize * zoom;
        return {
          ...transform,
          x: Math.round(transform.x / adjustedGrid) * adjustedGrid,
          y: Math.round(transform.y / adjustedGrid) * adjustedGrid,
        };
      }
      return transform;
    };
  }, [gridSize, zoom]);
}
