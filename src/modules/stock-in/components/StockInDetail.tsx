import { useState, useCallback, useEffect } from "react";
import { StockInHeader } from "./StockInHeader";
import { StockInForm } from "./StockInForm";
import { StockInTable, StockInItem } from "./StockInTable";
import { StockInFilterBar } from "./StockInFilterBar";
import { toast } from "sonner";

interface StockInDetailProps {
  onBack: () => void;
  initialData?: { id: string }; 
}

export function StockInDetail({ onBack, initialData }: StockInDetailProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<StockInItem[]>([]);
  const [status, setStatus] = useState<string>("DRAFT");
  
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial data (Suppliers & Products)
  useEffect(() => {
    async function loadResources() {
      try {
        setLoading(true);
        const [supRes, prodRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/products"),
        ]);
        
        const supJson = await supRes.json();
        const prodJson = await prodRes.json();
        
        if (!supRes.ok) throw new Error(supJson.error || "Failed to load suppliers");
        if (!prodRes.ok) throw new Error(prodJson.error || "Failed to load products");
        
        setSuppliers(supJson.data);
        
        // Extract variants from products
        const allVariants = prodJson.data.flatMap((p: any) => 
          p.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            name: p.name,
            variantName: v.unit.name,
            price: Number(v.salePrice)
          }))
        );
        setVariants(allVariants);

        // If editing/viewing, load the receipt
        if (initialData?.id) {
          const recRes = await fetch(`/api/stock-in/${initialData.id}`);
          const recJson = await recRes.json();
          if (!recRes.ok) throw new Error(recJson.error || "Failed to load receipt");
          
          const r = recJson.data;
          setSelectedSupplierId(r.supplierId);
          setNote(r.notes || "");
          setStatus(r.status);
          setItems(r.items.map((item: any) => ({
            id: item.id,
            variantId: item.variantId,
            sku: item.variant.sku,
            name: item.variant.product?.name || "Product",
            quantity: item.quantity,
            importPrice: Number(item.importPrice)
          })));
        } else {
          // Initialize with one empty item for new receipt
          setItems([{ id: `item-${Math.random().toString(36).slice(2, 9)}`, variantId: "", quantity: 1, importPrice: 0 }]);
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, [initialData]);

  const handleAddItem = useCallback(() => {
    const newItem: StockInItem = {
      id: `item-${Math.random().toString(36).slice(2, 9)}`,
      variantId: "",
      quantity: 1,
      importPrice: 0,
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateItem = useCallback((id: string, updates: Partial<StockInItem>) => {
    setItems((prev) => 
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const handleResetFilters = () => {
    setSearch("");
  };

  const handleSave = async () => {
    if (status === "CONFIRMED") {
      toast.error("Cannot edit a confirmed receipt");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        supplierId: selectedSupplierId,
        notes: note,
        items: items.map(i => ({
          variantId: i.variantId,
          quantity: i.quantity,
          importPrice: i.importPrice
        }))
      };

      const res = await fetch("/api/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      toast.success("Draft saved successfully");
      onBack();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!initialData?.id) {
      toast.error("Save as draft first before confirming");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/stock-in/${initialData.id}/confirm`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Confirmation failed");

      toast.success("Stock receipt confirmed and inventory updated!");
      setStatus("CONFIRMED");
      onBack();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = selectedSupplierId !== "" && items.length > 0 && items.every(i => i.variantId !== "" && i.quantity > 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-premium-bg">
        <p className="text-premium-muted animate-pulse">{"Loading receipt details..."}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-premium-bg p-6 lg:p-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <StockInHeader 
          onSave={handleSave} 
          isSaving={isSaving} 
          isValid={isValid}
          onCancel={onBack}
          onConfirm={status === "DRAFT" && initialData?.id ? handleConfirm : undefined}
          isConfirmed={status === "CONFIRMED"}
        />
        
        {/* Advanced Filters Area */}
        <section className="rounded-2xl border border-premium-border bg-white px-5 py-4 shadow-sm">
          <StockInFilterBar
            search={search}
            onSearchChange={setSearch}
            onReset={handleResetFilters}
          />
        </section>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StockInForm
            suppliers={suppliers}
            selectedSupplierId={selectedSupplierId}
            onSupplierChange={setSelectedSupplierId}
            note={note}
            onNoteChange={setNote}
          />
          
          <section aria-labelledby="items-title" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="items-title" className="text-lg font-semibold text-neutral-900 px-1">
                {"Receipt Items"}</h2>
              <div className="flex items-center gap-2 text-xs font-medium text-premium-muted bg-premium-subtle/40 px-3 py-1.5 rounded-full border border-premium-border/50">
                <IconSpreadsheet className="h-3.5 w-3.5" />
                {"Spreadsheet Mode"}</div>
            </div>
            
            <StockInTable
              items={items}
              variants={variants}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={handleUpdateItem}
            />
          </section>
          
          <div className="p-8 rounded-2xl border-2 border-dashed border-premium-border bg-white/50 flex flex-col items-center justify-center text-center opacity-60">
            <div className="h-12 w-12 rounded-full bg-premium-bg flex items-center justify-center text-premium-muted mb-3">
              <IconCloudUpload className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-neutral-800">{"Attach delivery documents"}</p>
            <p className="text-xs text-premium-muted mt-1">{"Drag and drop scanned PDF or JPG receipts here (Future feature)"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSpreadsheet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6h16.5M9 3.75v16.5m6-16.5v16.5" />
    </svg>
  );
}

function IconCloudUpload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
  );
}
