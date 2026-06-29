"use client";

import { useEffect, useState, useCallback } from "react";
import { StockInManagementHeader } from "./StockInManagementHeader";
import { StockInListFilterBar } from "./StockInListFilterBar";
import { StockInListTable, StockInReceipt } from "./StockInListTable";
import { toast } from "sonner";

interface StockInListProps {
  onCreate: () => void;
  onViewDetail: (id: string) => void;
}

export function StockInList({ onCreate, onViewDetail }: StockInListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [receipts, setReceipts] = useState<StockInReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stock-in");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      
      const mapped: StockInReceipt[] = json.data.map((r: any) => ({
        id: r.id,
        code: `SIN-${r.createdAt.slice(0, 10).replace(/-/g, "")}-${r.id.slice(0, 4).toUpperCase()}`,
        supplier: r.supplier.name,
        date: new Date(r.createdAt).toLocaleDateString("en-US", { 
          month: "short", day: "numeric", year: "numeric" 
        }),
        totalItems: r._count.items,
        totalValue: r.items?.reduce((sum: number, item: any) => sum + (Number(item.importPrice) * item.quantity), 0) || 0,
        status: r.status === "CONFIRMED" ? "Completed" : r.status === "DRAFT" ? "Draft" : "Cancelled",
      }));
      setReceipts(mapped);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setSupplierFilter("all");
  };

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch = 
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || r.supplier.includes(supplierFilter);
    
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  return (
    <div className="flex min-h-screen flex-col bg-premium-bg p-6 lg:p-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <StockInManagementHeader onCreate={onCreate} />

        <section className="rounded-2xl border border-premium-border bg-white px-5 py-4 shadow-sm">
          <StockInListFilterBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            supplierFilter={supplierFilter}
            onSupplierFilterChange={setSupplierFilter}
            onReset={handleReset}
          />
        </section>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StockInListTable 
            receipts={filteredReceipts} 
            onViewDetail={onViewDetail} 
          />
        </div>
      </div>
    </div>
  );
}
