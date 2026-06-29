"use client";

import React, { useState, useEffect, useMemo } from "react";
import { OrderTable, OrderStatus } from "./OrderTable";
import { OrderDetailDrawer } from "./OrderDetailDrawer";
import { ordersApi } from "../api/orders.api";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  FileSpreadsheet,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export function OrderList() {
  // State for active drawers
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Catalog queries
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalAmount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch orders from API
  const loadOrders = async (targetPage: number = 1) => {
    try {
      setLoading(true);
      const res = await ordersApi.getOrders({
        page: targetPage,
        limit: 10,
        search: searchQuery || undefined,
        status: selectedStatus === "ALL" ? undefined : (selectedStatus as OrderStatus),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      });

      if (res.success) {
        setOrders(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load orders catalog");
    } finally {
      setLoading(false);
    }
  };

  // Reload when query conditions change
  useEffect(() => {
    loadOrders(1);
  }, [searchQuery, selectedStatus, startDate, endDate, sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadOrders(newPage);
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleSort = (column: "createdAt" | "totalAmount") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    toast.success("Filters reset successfully");
  };

  // Dashboard Stats (Calculated on current page for visual richness)
  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status !== "CANCELLED").reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
    const completedCount = orders.filter(o => o.status === "COMPLETED").length;

    return {
      revenue: totalRevenue,
      average: avgOrder,
      completed: completedCount,
      totalOrders: pagination.total,
    };
  }, [orders, pagination.total]);

  return (
    <div className="flex flex-col gap-8 select-none">
      
      {/* Dynamic Backoffice Dashboard Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Orders count */}
        <div className="bg-white border border-premium-border rounded-3xl p-6 flex items-center justify-between shadow-soft hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">{"Total Sales Invoices"}</p>
            <h3 className="text-2xl font-black text-neutral-800 mt-1 tracking-tight">
              {dashboardStats.totalOrders}
            </h3>
            <p className="text-[10px] text-premium-primary font-bold mt-1.5 flex items-center gap-1">
              <span>{"All register logs"}</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-premium-subtle text-premium-primary flex items-center justify-center border border-premium-primary/10">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Total Page Revenue */}
        <div className="bg-white border border-premium-border rounded-3xl p-6 flex items-center justify-between shadow-soft hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">{"Gross Page Sales"}</p>
            <h3 className="text-2xl font-black text-neutral-800 mt-1 tracking-tight">
              ${dashboardStats.revenue.toFixed(2)}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{"Excluding cancelled"}</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Order */}
        <div className="bg-white border border-premium-border rounded-3xl p-6 flex items-center justify-between shadow-soft hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">{"Average Cart Sale"}</p>
            <h3 className="text-2xl font-black text-neutral-800 mt-1 tracking-tight">
              ${dashboardStats.average.toFixed(2)}
            </h3>
            <p className="text-[10px] text-premium-muted font-bold mt-1.5">
              {"Across"}{orders.length} {"page items"}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Fulfillments completed */}
        <div className="bg-white border border-premium-border rounded-3xl p-6 flex items-center justify-between shadow-soft hover:shadow-md transition-all">
          <div>
            <p className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">{"Fulfillments Closed"}</p>
            <h3 className="text-2xl font-black text-neutral-800 mt-1 tracking-tight">
              {dashboardStats.completed}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold mt-1.5">
              {"Completed status on page"}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-150">
            <Layers className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Control Panel: Filters, Date Selectors, Reset */}
      <div className="flex flex-col gap-5 p-6 bg-white border border-premium-border rounded-3xl shadow-soft shrink-0">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-premium-primary" />
            <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wide">{"Invoice Filter Panel"}</h4>
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-neutral-500 hover:text-neutral-800 rounded-xl text-[10px] font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{"Reset Settings"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-premium-muted uppercase">{"Search"}</label>
            <div className="relative">
              <Search className="w-4 h-4 text-premium-muted absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={"Search order UUID or items name..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 h-10 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 placeholder-premium-muted focus:outline-none focus:ring-1 focus:ring-premium-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Status Dropdown Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-premium-muted uppercase">{"Status"}</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 border border-premium-border rounded-xl px-3 text-xs font-bold text-neutral-800 bg-white focus:outline-none focus:ring-1 focus:ring-premium-primary"
            >
              <option value="ALL">{"All Statuses"}</option>
              <option value="PENDING">{"PENDING"}</option>
              <option value="COMPLETED">{"COMPLETED"}</option>
              <option value="CANCELLED">{"CANCELLED"}</option>
              <option value="REFUNDED">{"REFUNDED"}</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-premium-muted uppercase">{"From Date"}</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-premium-muted absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 h-10 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary"
              />
            </div>
          </div>

          {/* Date Range End */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-premium-muted uppercase">{"To Date"}</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-premium-muted absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 h-10 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main Order Table Grid / Loading skeletons */}
      {loading ? (
        <div className="w-full bg-white border border-premium-border rounded-3xl p-6 space-y-4 animate-pulse">
          <div className="h-8 bg-slate-100 rounded w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="h-6 bg-slate-100 rounded w-1/6" />
                <div className="h-6 bg-slate-100 rounded w-1/4" />
                <div className="h-6 bg-slate-100 rounded w-1/6" />
                <div className="h-6 bg-slate-100 rounded w-1/8 text-right" />
                <div className="h-6 bg-slate-100 rounded w-1/8 text-center" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Paginated Orders Table */}
          <OrderTable
            orders={orders}
            onOrderClick={handleOrderClick}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Table Pagination row */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-premium-border rounded-2xl px-6 py-4 shadow-soft">
              <p className="text-xs text-premium-muted font-bold">
                {"Showing Page"}<span className="text-neutral-800 font-extrabold">{pagination.page}</span> {"of"}{" "}
                <span className="text-neutral-800 font-extrabold">{pagination.totalPages}</span> {"pages"}<span className="ml-1 text-[10px] text-premium-muted">({pagination.total} {"total orders log)"}</span>
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-premium-border bg-white text-neutral-500 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-premium-border bg-white text-neutral-500 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Detailed Order view panel Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdated={() => loadOrders(pagination.page)}
      />

    </div>
  );
}
