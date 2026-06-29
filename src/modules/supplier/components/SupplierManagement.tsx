"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotify } from "@/shared/hooks/use-notify";
import { useConfirm } from "@/shared/hooks/use-confirm";
import { SupplierHeader } from "./SupplierHeader";
import { SupplierTable } from "./SupplierTable";
import { SupplierDrawer } from "./SupplierDrawer";
import { SupplierFilterBar } from "./SupplierFilterBar";
import { BulkActionBar } from "./BulkActionBar";
import { supplierApi } from "@/modules/supplier/api/supplier.api";
import { useSelection } from "@/shared/hooks/use-selection";
import { useBulkDelete } from "@/shared/hooks/use-bulk-delete";
import type { SupplierRow, SupplierFormValues, SupplierStatus } from "../types/supplier.types";

export function SupplierManagement() {
  const notify = useNotify();
  const confirm = useConfirm();

  // --- Data State ---
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Local Search & Filter State ---
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SupplierStatus | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const activeFiltersCount = (search ? 1 : 0) + (status !== "all" ? 1 : 0);
  // --- Drawer State ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRow | null>(null);

  // --- Actions ---
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await supplierApi.getAll();
      const data = result.data ?? result;
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      notify.error(e.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // --- Filtering Logic (Client-side) ---
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      // 1. Search Filter
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        s.name.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q);
      
      // 2. Status Filter (Advanced)
      const matchesStatus = status === "all" || s.status === status;
      
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, status]);

  // Pagination Logic
  const paginatedSuppliers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, page, pageSize]);

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);

  // --- Selection Logic ---
  const selection = useSelection<SupplierRow>({
    items: paginatedSuppliers,
    getKey: (item) => item.id,
    canSelect: (item) => item.canDelete !== false,
  });

  // --- Bulk Delete Logic ---
  const { isDeleting: isBulkDeleting, deleteItems: handleBulkDeleteAction } = useBulkDelete({
    bulkDeleteFn: supplierApi.bulkDelete,
    singleDeleteFn: supplierApi.delete,
    onSuccess: (deletedIds) => {
      setSuppliers((prev) => prev.filter((s) => !deletedIds.includes(s.id)));
      selection.clearSelection();
      
      // If we deleted everything on this page, and there's a previous page, go back
      if (page > 1 && deletedIds.length === paginatedSuppliers.length) {
        setPage(page - 1);
      }
    },
    onComplete: (result) => {
      if (result.success > 0 && result.failed === 0) {
        notify.success(`Successfully deleted ${result.success} supplier(s) 🎉`);
      } else if (result.success > 0 && result.failed > 0) {
        notify.warning(`Deleted ${result.success} supplier(s), but ${result.failed} failed.`);
      } else if (result.failed > 0) {
        notify.error(`Failed to delete ${result.failed} supplier(s).`);
      }
    },
  });

  // --- Event Handlers ---
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: SupplierStatus | "all") => {
    setStatus(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const handleAdd = () => {
    setSelectedSupplier(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = async (supplier: SupplierRow) => {
    try {
      const data = await supplierApi.getById(supplier.id);
      setSelectedSupplier(data.data ?? data);
      setIsDrawerOpen(true);
    } catch (error: any) {
      notify.error(error.message || "Failed to load supplier");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Remove this supplier?",
      description: "Any active orders or contracts might be affected. This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });

    if (isConfirmed) {
      try {
        await supplierApi.delete(id);
        notify.success("Supplier removed 🎉");
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
        if (selectedSupplier?.id === id) setIsDrawerOpen(false);
      } catch (err: any) {
        notify.error(err.message || "Failed to delete");
      }
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;

    const isConfirmed = await confirm({
      title: `Delete ${ids.length} supplier${ids.length > 1 ? "s" : ""}?`,
      description: "Any active orders or contracts might be affected. This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });

    if (isConfirmed) {
      await handleBulkDeleteAction(ids);
    }
  };

  const handleSubmit = async (data: SupplierFormValues) => {
    try {
      setIsSubmitting(true);
      if (selectedSupplier) {
        await supplierApi.update(selectedSupplier.id, data);
      } else {
        await supplierApi.create(data);
      }
      setIsDrawerOpen(false);
      notify.success("Supplier saved successfully 🎉");
      await fetchSuppliers();
    } catch (err: any) {
      notify.error(err.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-premium-bg p-6 lg:p-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Simple Search Header */}
        <SupplierHeader 
          total={suppliers.length} 
          onAdd={handleAdd} 
          search={search}
          onSearchChange={handleSearchChange}
        />

        {/* Advanced Filters Area */}
        <section className="rounded-2xl border border-premium-border bg-white px-5 py-4 shadow-sm">
          <SupplierFilterBar
            search={search}
            onSearchChange={handleSearchChange}
            status={status}
            onStatusChange={handleStatusChange}
            activeFiltersCount={activeFiltersCount}
            onReset={handleResetFilters}
          />
        </section>

        {/* Data Table Area */}
        <div className="space-y-6">
          <SupplierTable
            suppliers={paginatedSuppliers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReset={handleResetFilters}
            isLoading={loading}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggle}
            onToggleAll={selection.toggleAll}
            isAllSelected={selection.isAllSelected}
            isIndeterminate={selection.isIndeterminate}
          />

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-premium-border pt-6">
              <p className="text-xs font-medium text-premium-muted">
                {"Showing"}<span className="text-neutral-900">{(page - 1) * pageSize + 1}</span> {"to"}{" "}
                <span className="text-neutral-900">{Math.min(page * pageSize, filteredSuppliers.length)}</span> {"of"}{" "}
                <span className="text-neutral-900">{filteredSuppliers.length}</span> {"results"}</p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg border border-premium-border px-3 py-1.5 text-xs font-bold text-premium-muted transition-all hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  {"Previous"}</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all",
                      page === i + 1
                        ? "bg-premium-primary text-white shadow-soft"
                        : "text-premium-muted hover:bg-premium-bg"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg border border-premium-border px-3 py-1.5 text-xs font-bold text-premium-muted transition-all hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  {"Next"}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BulkActionBar
        count={selection.count}
        onClear={selection.clearSelection}
        onDelete={handleBulkDelete}
        isDeleting={isBulkDeleting}
      />

      <SupplierDrawer
        key={selectedSupplier?.id ?? "new"}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        supplier={selectedSupplier}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
