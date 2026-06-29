"use client";

import type { ProductJson } from "@/modules/product/lib/serializeProduct";
import { useAdminSearch } from "@/modules/admin/context/AdminSearchContext";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { ProductTablePage } from "./workspace/ProductTablePage";
import { SKUDetailPanel } from "./workspace/SKUDetailPanel";
import { BulkActionBar } from "./workspace/BulkActionBar";
import { ProductFormDrawer } from "./workspace/ProductFormDrawer";
import { VariantFormDrawer } from "./workspace/VariantFormDrawer";
import { useNotify } from "@/shared/hooks/use-notify";
import { useConfirm } from "@/shared/hooks/use-confirm";

type DrawerKind = "none" | "product-create" | "product-edit" | "variant-create" | "variant-edit";

export function ProductVariantWorkspace() {
  // const {t, locale} = useTranslation();
  const notify = useNotify();
  const confirm = useConfirm();

  const { query } = useAdminSearch();
  const [products, setProducts] = useState<ProductJson[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --- Filtering State ---
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "INACTIVE">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const [isSkuPanelOpen, setIsSkuPanelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  
  const [drawer, setDrawer] = useState<DrawerKind>("none");
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  const [variantForm, setVariantForm] = useState<{
    sku: string;
    salePrice: string;
    costPrice: string;
    status: "ACTIVE" | "INACTIVE";
    unitId: string;
  }>({
    sku: "",
    salePrice: "",
    costPrice: "",
    status: "ACTIVE",
    unitId: "",
  });

  const refreshProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to load products");
    const json = await res.json();
    setProducts(json.data);
    return json.data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [pRes, cRes, uRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
          fetch("/api/units"),
        ]);
        if (!pRes.ok || !cRes.ok || !uRes.ok) throw new Error("Failed to load data");
        
        const [plist, clistRaw, ulist] = await Promise.all([
          pRes.json(),
          cRes.json(),
          uRes.json(),
        ]);

        if (cancelled) return;
        setProducts(plist.data);
        setCategories(clistRaw.success ? clistRaw.data : clistRaw);
        setUnits(ulist.data);
        
        if (plist.data?.length > 0) {
          setSelectedId(plist.data[0].id);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Clear selections when panel state changes
  useEffect(() => {
    setSelectedRowIds(new Set());
  }, [selectedId, isSkuPanelOpen]);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      // 1. Search Query (name, category name, or variant SKU)
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        (p.category?.name && p.category.name.toLowerCase().includes(q)) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q));

      // 2. Status Filter
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      // 3. Category Filter
      const matchesCategory = categoryFilter === "all" || p.categoryId === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, query, statusFilter, categoryFilter]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (categoryFilter !== "all") count++;
    return count;
  }, [statusFilter, categoryFilter]);

  const handleResetFilters = useCallback(() => {
    setStatusFilter("all");
    setCategoryFilter("all");
  }, []);

  const totalStockCount = useMemo(() => {
    return products.reduce((total, p) => {
      const productStock = p.variants.reduce((sum, v) => {
        const variantStock = v.batches?.reduce((bSum, b) => bSum + b.quantity, 0) ?? 0;
        return sum + variantStock;
      }, 0);
      return total + productStock;
    }, 0);
  }, [products]);

  const handleExpand = (id: string) => {
    setSelectedId(id);
    setIsSkuPanelOpen(true);
  };

  const handleCollapse = () => {
    setIsSkuPanelOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Remove this product?",
      description: "All of its SKUs and variants will be deleted. This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!isConfirmed) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      notify.success("Product deleted successfully 🎉");
      if (selectedId === id) {
        setSelectedId(null);
        setIsSkuPanelOpen(false);
      }
      await refreshProducts();
    } catch (err: any) {
      notify.error(err.message || "Failed to delete product");
    }
  };

  const closeDrawer = useCallback(() => {
    setDrawer("none");
    setEditingVariantId(null);
    setFormError(null);
  }, []);

  function openProductCreate() {
    setProductForm({ name: "", description: "", categoryId: categories[0]?.id ?? "" });
    setDrawer("product-create");
  }

  function openProductEdit(id?: string) {
    const p = id ? products.find(x => x.id === id) : selected;
    if (!p) return;
    setProductForm({ name: p.name, description: p.description ?? "", categoryId: p.categoryId });
    setSelectedId(p.id);
    setDrawer("product-edit");
  }

  function openVariantCreate() {
    if (!selected) return;
    setVariantForm({ sku: "", salePrice: "", costPrice: "", status: "ACTIVE", unitId: units[0]?.id ?? "" });
    setDrawer("variant-create");
  }

  function openVariantEdit(variantId: string) {
    if (!selected) return;
    const v = selected.variants.find((x) => x.id === variantId);
    if (!v) return;
    setVariantForm({ sku: v.sku, salePrice: String(v.salePrice), costPrice: v.costPrice ? String(v.costPrice) : "", status: v.status as "ACTIVE" | "INACTIVE", unitId: v.unitId });
    setEditingVariantId(variantId);
    setDrawer("variant-edit");
  }

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim() || null,
        categoryId: productForm.categoryId,
      };
      const isEdit = drawer === "product-edit";
      const res = await fetch(isEdit ? `/api/products/${selected?.id}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      await refreshProducts();
      if (!isEdit) setSelectedId(data.id);
      closeDrawer();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const payload = {
        sku: variantForm.sku.trim(),
        salePrice: parseFloat(variantForm.salePrice),
        unitId: variantForm.unitId,
        costPrice: variantForm.costPrice ? parseFloat(variantForm.costPrice) : null,
        status: variantForm.status,
      };
      const isEdit = drawer === "variant-edit";
      const url = isEdit 
        ? `/api/products/${selected.id}/variants/${editingVariantId}`
        : `/api/products/${selected.id}/variants`;
      
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      await refreshProducts();
      closeDrawer();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteVariant(variantId: string) {
    if (!selected || !window.confirm("Delete this variant?")) return;
    try {
      const res = await fetch(`/api/products/${selected.id}/variants/${variantId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      await refreshProducts();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const toggleRow = useCallback((id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!selected) return;
    if (selectedRowIds.size === selected.variants.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(selected.variants.map((v) => v.id)));
    }
  }, [selected, selectedRowIds.size]);

  const updateVariant = async (id: string, data: Partial<ProductJson["variants"][number]>) => {
    if (!selected) return;
    const res = await fetch(`/api/products/${selected.id}/variants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Update failed");
    await refreshProducts();
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.size === 0) return;
    const isProduct = !isSkuPanelOpen;
    const entityName = isProduct ? "products" : "SKUs";
    
    const isConfirmed = await confirm({
      title: `Delete ${selectedRowIds.size} selected ${entityName}?`,
      description: `This action will permanently delete all selected ${entityName}. This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!isConfirmed) return;
    
    try {
      let res;
      if (isProduct) {
        res = await fetch("/api/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selectedRowIds) }),
        });
      } else {
        if (!selected) return;
        res = await fetch(`/api/products/${selected.id}/variants`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selectedRowIds) }),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bulk delete failed");
      }
      notify.success(`Selected ${entityName} deleted successfully 🎉`);
      await refreshProducts();
      setSelectedRowIds(new Set());
    } catch (err: any) {
      notify.error(err.message || `Bulk delete failed`);
    }
  };

  const handleBulkToggleStatus = async (active: boolean) => {
    if (selectedRowIds.size === 0) return;
    const isProduct = !isSkuPanelOpen;
    const entityName = isProduct ? "products" : "SKUs";
    const status = active ? "ACTIVE" : "INACTIVE";
    try {
      let res;
      if (isProduct) {
        res = await fetch("/api/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selectedRowIds), status }),
        });
      } else {
        if (!selected) return;
        res = await fetch(`/api/products/${selected.id}/variants`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selectedRowIds), status }),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bulk status update failed");
      }
      notify.success(`Selected ${entityName} status updated to ${status.toLowerCase()} 🎉`);
      await refreshProducts();
      setSelectedRowIds(new Set());
    } catch (err: any) {
      notify.error(err.message || "Bulk status toggle failed");
    }
  };

  const handleBulkUpdatePrice = async () => {
    if (!isSkuPanelOpen) {
      notify.error("Price update is only available for SKUs.");
      return;
    }
    const newPrice = prompt("Enter new selling price for selected SKUs:");
    if (newPrice === null) return;
    const numPrice = parseFloat(newPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      notify.error("Invalid price");
      return;
    }

    if (!selected) return;
    try {
      const res = await fetch(`/api/products/${selected.id}/variants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedRowIds), salePrice: numPrice }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bulk price update failed");
      }
      notify.success("Selected SKUs price updated successfully 🎉");
      await refreshProducts();
      setSelectedRowIds(new Set());
    } catch (err: any) {
      notify.error(err.message || "Bulk price update failed");
    }
  };

  const handleBulkChangeUnit = () => {
    if (!isSkuPanelOpen) {
      notify.error("Unit change is only available for SKUs.");
      return;
    }
    notify.error("Bulk Unit change to be implemented.");
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-premium-border bg-premium-surface">{"Loading catalog…"}</div>;
  if (loadError) return <div className="rounded-2xl border border-red-200 bg-red-50/80 px-6 py-8 text-center text-sm text-red-800">{loadError}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 sm:-m-8 p-4 sm:p-8 bg-[#f4f7f5] overflow-hidden">
      <div className="flex flex-1 min-h-0 relative gap-4">
        {/* Left Panel: Product Table */}
        <div 
          className={`transition-all duration-300 ease-in-out h-full overflow-hidden flex flex-col ${
            isSkuPanelOpen ? 'w-1/2 lg:w-[45%]' : 'w-full'
          }`}
        >
          <ProductTablePage 
            products={filteredProducts}
            selectedRowIds={selectedRowIds}
            expandedRowId={isSkuPanelOpen ? selectedId : null}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onExpand={handleExpand}
            onEdit={openProductEdit}
            onDelete={handleDeleteProduct}
            onAddProduct={openProductCreate}
            totalProducts={products.length}
            totalStock={totalStockCount}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
            activeFiltersCount={activeFiltersCount}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Panel: SKU Details */}
        {isSkuPanelOpen && selected && (
          <div className="w-1/2 lg:w-[55%] h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
            <SKUDetailPanel 
              product={selected}
              onCollapse={handleCollapse}
              onEditProduct={() => openProductEdit(selected.id)}
              onAddVariant={openVariantCreate}
              selectedRowIds={selectedRowIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              onUpdateVariant={updateVariant}
              onDeleteVariant={deleteVariant}
              onEditVariant={openVariantEdit}
            />
          </div>
        )}
      </div>

      <BulkActionBar 
        selectedCount={selectedRowIds.size}
        onClearSelection={() => setSelectedRowIds(new Set())}
        onDelete={handleBulkDelete}
        onUpdatePrice={handleBulkUpdatePrice}
        onChangeUnit={handleBulkChangeUnit}
        onToggleStatus={handleBulkToggleStatus}
      />

      <ProductFormDrawer 
        isOpen={drawer.startsWith("product")} 
        onClose={closeDrawer} 
        title={drawer === "product-create" ? "New Product" : "Edit Product"}
        description={"Provide the basic information for your product catalog."}
        form={productForm} 
        setForm={setProductForm} 
        categories={categories} 
        error={formError} 
        saving={saving} 
        onSubmit={submitProduct} 
      />

      <VariantFormDrawer 
        isOpen={drawer.startsWith("variant")} 
        onClose={closeDrawer} 
        title={drawer === "variant-create" ? "New Variant" : "Edit Variant"}
        description={`Set SKU and pricing for ${selected?.name}.`}
        form={variantForm} 
        setForm={setVariantForm} 
        units={units} 
        error={formError} 
        saving={saving} 
        onSubmit={submitVariant} 
      />
    </div>
  );
}
