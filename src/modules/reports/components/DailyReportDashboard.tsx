"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Calendar as CalendarIcon,
  ChevronDown,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Sparkles
} from "lucide-react";
import { KpiCard } from "./KpiCard";
import { DailyReportCharts } from "./DailyReportCharts";
import { DailyReportTable } from "./DailyReportTable";
import { reportsApi } from "../api/reports.api";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";

export function DailyReportDashboard() {
  const [filterType, setFilterType] = useState<"7" | "14" | "30" | "today" | "custom">("7");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refetching, setRefetching] = useState<boolean>(false);

  const [dashboardData, setDashboardData] = useState<{
    summary: {
      totalRevenue: number;
      revenueGrowth: number;
      totalOrders: number;
      ordersGrowth: number;
      totalProfit: number;
      profitGrowth: number;
    };
    dailyBreakdown: Array<{
      date: string;
      dateLabel: string;
      revenue: number;
      orders: number;
      profit: number;
      aov: number;
    }>;
  }>({
    summary: {
      totalRevenue: 0,
      revenueGrowth: 0,
      totalOrders: 0,
      ordersGrowth: 0,
      totalProfit: 0,
      profitGrowth: 0,
    },
    dailyBreakdown: [],
  });

  // Calculate pre-filled dates depending on range type selection
  const resolvedDates = useMemo(() => {
    const today = new Date();
    let start = subDays(today, 6); // default last 7 days inclusive
    let end = today;

    if (filterType === "today") {
      start = today;
      end = today;
    } else if (filterType === "14") {
      start = subDays(today, 13);
    } else if (filterType === "30") {
      start = subDays(today, 29);
    } else if (filterType === "custom") {
      return {
        startDate: startDate || format(subDays(today, 6), "yyyy-MM-dd"),
        endDate: endDate || format(today, "yyyy-MM-dd"),
      };
    }

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  }, [filterType, startDate, endDate]);

  const loadDashboard = async (isRefetch = false) => {
    try {
      if (isRefetch) setRefetching(true);
      else setLoading(true);

      const res = await reportsApi.getDashboardData(
        resolvedDates.startDate,
        resolvedDates.endDate
      );

      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load report metrics");
    } finally {
      setLoading(false);
      setRefetching(false);
    }
  };

  // Reload statistics when query variables or intervals shift
  useEffect(() => {
    loadDashboard(false);
  }, [filterType, startDate, endDate]);

  // Client-side CSV Exporter Utility
  const handleExportCSV = () => {
    const { dailyBreakdown } = dashboardData;
    if (!dailyBreakdown || dailyBreakdown.length === 0) {
      toast.error("No analytics records available to export!");
      return;
    }

    // Format headers and mapping lines
    const headers = ["Date", "Revenue ($)", "Orders Count", "Net Profit ($)", "Average Order Value ($)"];
    const rows = dailyBreakdown.map(item => [
      item.date,
      item.revenue.toFixed(2),
      item.orders,
      item.profit.toFixed(2),
      item.aov.toFixed(2),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download", 
      `Tanaplano_PerformanceReport_${resolvedDates.startDate}_to_${resolvedDates.endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Performance report successfully exported!");
  };

  const chartData = useMemo(() => {
    return dashboardData.dailyBreakdown.map(d => ({
      date: d.dateLabel,
      revenue: d.revenue,
      orders: d.orders,
    }));
  }, [dashboardData.dailyBreakdown]);

  // Cast reports structure for table view compatibility
  const tableReports = useMemo(() => {
    return dashboardData.dailyBreakdown.map((d, index) => ({
      id: `report-${index}`,
      date: new Date(d.date),
      totalRevenue: d.revenue,
      totalOrders: d.orders,
      totalProfit: d.profit,
    }));
  }, [dashboardData.dailyBreakdown]);

  return (
    <div className="space-y-8 select-none">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase">{"Daily Performance"}</h1>
          <p className="text-sm text-premium-muted mt-1">{"Real-time analytical insights compiled directly from checkout transactions"}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Sync Refetch */}
          <button
            onClick={() => loadDashboard(true)}
            disabled={loading || refetching}
            className="h-10 w-10 flex items-center justify-center border border-premium-border hover:border-premium-primary/30 rounded-xl bg-white text-neutral-500 hover:text-premium-primary hover:bg-slate-50 transition-all shadow-soft"
            title={"Force refresh database aggregation"}
          >
            <RefreshCw className={`w-4 h-4 ${refetching ? "animate-spin text-premium-primary" : ""}`} />
          </button>

          {/* Date Options Select */}
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none h-10 rounded-xl border border-premium-border bg-white pl-4 pr-10 text-xs font-bold text-neutral-800 shadow-soft transition-all hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-premium-primary focus:border-transparent"
            >
              <option value="today">{"Today Only"}</option>
              <option value="7">{"Last 7 Days"}</option>
              <option value="14">{"Last 14 Days"}</option>
              <option value="30">{"Last 30 Days"}</option>
              <option value="custom">{"Custom Date Range"}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-muted" />
          </div>

          {/* Export CSV trigger */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 h-10 rounded-xl bg-premium-primary px-4 text-xs font-bold text-white shadow-soft transition-all hover:bg-premium-primary/95 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>{"Export CSV"}</span>
          </button>
        </div>
      </div>

      {/* Custom range date-pickers row */}
      {filterType === "custom" && (
        <div className="flex flex-wrap items-center gap-4 p-5 bg-white border border-premium-border rounded-3xl shadow-soft animate-in slide-in-from-top-2 duration-350">
          <div className="flex items-center gap-2 text-xs text-premium-muted font-bold">
            <CalendarIcon className="w-4 h-4 text-premium-primary" />
            <span>{"Select custom range:"}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-premium-border px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none"
            />
            <span className="text-xs text-premium-muted font-bold">{"to"}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-premium-border px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-premium-border rounded-3xl p-6 h-28 animate-pulse" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white border border-premium-border rounded-3xl p-6 h-80 animate-pulse" />
            <div className="bg-white border border-premium-border rounded-3xl p-6 h-80 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* KPI Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-3">
            <KpiCard
              title={"Total Sales Revenue"}
              value={`$${dashboardData.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              trend={{ value: Math.abs(dashboardData.summary.revenueGrowth), isUp: dashboardData.summary.revenueGrowth >= 0 }}
              description={"Sum of COMPLETED receipts"}
            />
            <KpiCard
              title={"Total Transactions"}
              value={dashboardData.summary.totalOrders}
              icon={ShoppingBag}
              trend={{ value: Math.abs(dashboardData.summary.ordersGrowth), isUp: dashboardData.summary.ordersGrowth >= 0 }}
              description={"Completed checkout counts"}
            />
            <KpiCard
              title={"Net Profit margin"}
              value={`$${dashboardData.summary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={TrendingUp}
              trend={{ value: Math.abs(dashboardData.summary.profitGrowth), isUp: dashboardData.summary.profitGrowth >= 0 }}
              description={"Gross revenue - Batch costs"}
            />
          </div>

          {/* Performance Charts */}
          <DailyReportCharts data={chartData} />

          {/* Breakdown Table */}
          <DailyReportTable reports={tableReports} />
        </div>
      )}
    </div>
  );
}
