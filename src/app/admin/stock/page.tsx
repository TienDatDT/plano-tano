"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { StockHeader } from "@/modules/stock/components/StockHeader";
import { StockFilterBar } from "@/modules/stock/components/StockFilterBar";
import { StockTable, StockItem } from "@/modules/stock/components/StockTable";
import { toast } from "sonner";

export default function StockManagementPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stock");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch stock");
      setItems(json.data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.categoryName));
    return Array.from(cats).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || item.categoryName === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("all");
  };

  return (
    <div className="flex min-h-screen flex-col bg-premium-bg p-6 lg:p-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <StockHeader onRefresh={fetchStock} isLoading={loading} />

        <section className="rounded-2xl border border-premium-border bg-white px-5 py-4 shadow-sm">
          <StockFilterBar
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={categories}
            onReset={handleReset}
          />
        </section>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StockTable items={filteredItems} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
