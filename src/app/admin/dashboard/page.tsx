"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardKpis } from "@/modules/admin/components/DashboardKpis";
import { DashboardQuickActions } from "@/modules/admin/components/DashboardQuickActions";
import { DashboardCharts } from "@/modules/admin/components/DashboardCharts";
import { Calendar, RefreshCw, AlertTriangle, ChevronRight } from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";
import { reportsApi } from "@/modules/reports/api/reports.api";
import { useTranslation } from "react-i18next";

export default function AdminDashboardPage() {

  const { t } = useTranslation();
  // Date states
  const [preset, setPreset] = useState<number | 'month' | null>(30);
  const [startDate, setStartDate] = useState<string>(
    format(subDays(new Date(), 29), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  // Fetch states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncDiffText, setSyncDiffText] = useState<string>("just now");

  // Handler to set pre-defined date filters
  const handlePresetChange = (value: number | 'month') => {
    setPreset(value);
    const today = new Date();
    if (value === 'month') {
      setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
    } else {
      setStartDate(format(subDays(today, value - 1), "yyyy-MM-dd"));
    }
    setEndDate(format(today, "yyyy-MM-dd"));
  };

  // Core API loader
  const loadDashboardData = useCallback(async (showIndicator = true) => {
    if (showIndicator) setIsLoading(true);
    setError(null);
    try {
      const res = await reportsApi.getDashboardData(startDate, endDate);
      if (res.success) {
        setDashboardData(res.data);
        setLastSynced(new Date());
        setSyncDiffText("just now");
      } else {
        setError("Failed to calculate analytics dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Load on mount and filter changes
  useEffect(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Handle ticking difference for synced indicator
  useEffect(() => {
    if (!lastSynced) return;
    const interval = setInterval(() => {
      const diffMs = new Date().getTime() - lastSynced.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) {
        setSyncDiffText("just now");
      } else {
        setSyncDiffText(`${diffMins}m ago`);
      }
    }, 30000); // tick every 30s
    return () => clearInterval(interval);
  }, [lastSynced]);

  // Format today's business header date
  const formattedCurrentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Dynamic synchronized footer note
  const footerSyncText = "TanaPlano Inventory System V2.0 • Data synchronized {time} ago";

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Executive Header Controls */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 font-sans flex items-center gap-2 flex-wrap">
            <span>{t('executiveOverview.title1')}</span>
            <span className="text-premium-primary">{t('executiveOverview.title2')}</span>
          </h1>
          <p className="text-premium-muted font-medium text-sm sm:text-base">
            {t('executiveOverview.subtitle')}
          </p>
        </div>

        {/* Date Filters & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-white border border-premium-border rounded-xl p-1 shadow-sm">
            <button
              onClick={() => handlePresetChange(7)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${preset === 7
                ? "bg-premium-primary text-white shadow-sm"
                : "text-premium-muted hover:bg-premium-bg hover:text-premium-primary"
                }`}
            >
              {t("dashboard.sevenDays")}</button>
            <button
              onClick={() => handlePresetChange(30)}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${preset === 30
                ? "bg-premium-primary text-white shadow-sm"
                : "text-premium-muted hover:bg-premium-bg hover:text-premium-primary"
                }`}
            >
              {t("dashboard.thirtyDays")}</button>
            <button
              onClick={() => handlePresetChange("month")}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${preset === "month"
                ? "bg-premium-primary text-white shadow-sm"
                : "text-premium-muted hover:bg-premium-bg hover:text-premium-primary"
                }`}
            >
              {t("dashboard.month")}
            </button>
          </div>

          {/* Calendar Picker Inputs */}
          <div className="flex items-center gap-2 bg-white border border-premium-border rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="h-4 w-4 text-premium-muted/70" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPreset(null);
              }}
              className="text-xs font-bold bg-transparent border-none outline-none text-neutral-800 focus:ring-0 w-28 cursor-pointer"
            />
            <span className="text-xs text-premium-muted/50 font-bold">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPreset(null);
              }}
              className="text-xs font-bold bg-transparent border-none outline-none text-neutral-800 focus:ring-0 w-28 cursor-pointer"
            />
          </div>

          {/* Manual Sync Trigger */}
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-premium-border text-premium-muted transition-all hover:bg-premium-bg hover:text-premium-primary shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
            aria-label="Refresh stats"
            title={"Synchronize data"}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-premium-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* Live sync details banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-premium-subtle/10 border border-premium-border/40 rounded-2xl -mt-5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-premium-muted font-semibold">{"Vital Statistics"}</span>
        </div>
        <span className="text-xs font-bold text-premium-primary tracking-wide mt-1 sm:mt-0">{formattedCurrentDate}</span>
      </div>

      {/* Main Error Handling / Retrying state */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-red-50/20 border border-red-200/50 rounded-3xl p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-4 ring-1 ring-inset ring-red-500/10">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 mb-1">{"An error occurred"}</h3>
          <p className="text-xs text-premium-muted max-w-sm mb-6">{error}</p>
          <button
            onClick={() => loadDashboardData(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-102 active:scale-98"
          >
            {"Try Again"}
          </button>
        </div>
      ) : (
        <>
          {/* KPI Dashboard Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-premium-muted/50">
                {t('dashboard.vitalStatistics')}
              </h2>
            </div>
            <DashboardKpis data={dashboardData?.summary} isLoading={isLoading} />
          </section>

          {/* Charts Visualization Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-premium-muted/50">
                {t('dashboard.performanceInsights')}
              </h2>
            </div>
            <DashboardCharts data={dashboardData} isLoading={isLoading} />
          </section>
        </>
      )}

      {/* Quick Action Operations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-premium-muted/50">
            {t('dashboard.rapidOperations')}
          </h2>
        </div>
        <DashboardQuickActions />
      </section>

      {/* Dynamic Footer Timestamp Note */}
      <footer className="mt-8 border-t border-premium-border/40 pt-8 pb-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-premium-muted/40">
          {footerSyncText}
        </p>
      </footer>
    </div>
  );
}
