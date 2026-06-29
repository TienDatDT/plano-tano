"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import { Card } from "@/shared/components/ui/Card";
import { formatCurrency, formatCompactNumber } from "@/shared/lib/formatters";
import { BarChart3, TrendingUp, Info } from "lucide-react";
import { useTranslation } from "@/shared/lib/i18n/client";

interface DashboardChartsProps {
  data?: {
    dailyBreakdown: Array<{
      date: string;
      dateLabel: string;
      revenue: number;
      orders: number;
      profit: number;
      aov: number;
    }>;
    categoryStockHealth: Array<{
      categoryName: string;
      healthPct: number;
    }>;
  };
  isLoading: boolean;
}

export function DashboardCharts({ data, isLoading }: DashboardChartsProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const [ordersView, setOrdersView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // 2. Memoized aggregation for orders & revenue over time (Daily, Weekly, Monthly)
  const aggregatedOrdersData = useMemo(() => {
    const dailyBreakdown = data?.dailyBreakdown;
    if (!dailyBreakdown || dailyBreakdown.length === 0) return [];

    if (ordersView === 'daily') {
      return dailyBreakdown.map((d) => ({
        label: d.dateLabel,
        orders: d.orders,
        revenue: d.revenue,
      }));
    }

    if (ordersView === 'weekly') {
      const result = [];
      const len = dailyBreakdown.length;
      for (let i = 0; i < len; i += 7) {
        const chunk = dailyBreakdown.slice(i, i + 7);
        const totalOrders = chunk.reduce((sum, item) => sum + item.orders, 0);
        const totalRevenue = chunk.reduce((sum, item) => sum + item.revenue, 0);
        const first = chunk[0]?.dateLabel || '';
        const last = chunk[chunk.length - 1]?.dateLabel || '';
        result.push({
          label: `${first} - ${last}`,
          orders: totalOrders,
          revenue: totalRevenue,
        });
      }
      return result;
    }

    if (ordersView === 'monthly') {
      const monthMap = new Map<string, { orders: number; revenue: number }>();
      for (const item of dailyBreakdown) {
        const monthName = new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
          month: 'short',
          year: '2-digit',
        }).format(new Date(item.date));

        const existing = monthMap.get(monthName) || { orders: 0, revenue: 0 };
        existing.orders += item.orders;
        existing.revenue += item.revenue;
        monthMap.set(monthName, existing);
      }
      return Array.from(monthMap.entries()).map(([label, stats]) => ({
        label,
        ...stats,
      }));
    }

    return [];
  }, [data?.dailyBreakdown, ordersView, locale]);

  // 1. Loading skeleton states to match chart aspect ratio
  if (isLoading || !data) {
    return (
      <div className="grid gap-6 lg:grid-cols-2 animate-pulse">
        {[1, 2].map((i) => (
          <Card key={i} className="flex flex-col gap-6 p-6 border border-premium-border/40 bg-premium-subtle/5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-premium-subtle/20 rounded-md" />
                <div className="h-4 w-60 bg-premium-subtle/20 rounded-md" />
              </div>
              {i === 1 && (
                <div className="h-8 w-44 bg-premium-subtle/20 rounded-xl" />
              )}
            </div>
            <div className="h-[320px] bg-premium-subtle/10 border border-premium-border/30 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-premium-subtle/30" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const { dailyBreakdown, categoryStockHealth } = data;



  // Dynamic axis and currency compact values
  const formatYAxisCurrency = (val: number) => {
    return locale === 'vi' ? `${formatCompactNumber(val, locale)}₫` : `$${val}`;
  };

  // Custom tooltips
  const CustomAreaTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-2xl border border-premium-border/40 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          <p className="text-xs font-black uppercase tracking-wider text-premium-muted/70">{item.label}</p>
          <div className="mt-2.5 space-y-1">
            <p className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-premium-primary" />
              <span>{"Total Orders"}:</span>
              <span className="text-premium-primary font-black">{item.orders}</span>
            </p>
            <p className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              <span>{locale === 'vi' ? 'Doanh thu' : 'Revenue'}:</span>
              <span className="text-[#3B82F6] font-black">{formatCurrency(item.revenue, locale)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const statusLabel = item.healthPct >= 80 
        ? (locale === 'vi' ? 'An toàn' : 'Healthy')
        : item.healthPct >= 65
        ? (locale === 'vi' ? 'Cảnh báo' : 'Warning')
        : (locale === 'vi' ? 'Nguy cấp' : 'Critical');
      
      const statusColor = item.healthPct >= 80 
        ? 'text-green-600'
        : item.healthPct >= 65
        ? 'text-amber-500'
        : 'text-red-500';

      return (
        <div className="rounded-2xl border border-premium-border/40 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          <p className="text-xs font-black uppercase tracking-wider text-premium-muted/70">{item.categoryName}</p>
          <div className="mt-2.5 space-y-1">
            <p className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-premium-primary" />
              <span>{"Inventory Health Score"}:</span>
              <span className="text-premium-primary font-black">{item.healthPct}%</span>
            </p>
            <p className="text-xs font-bold flex items-center gap-1.5">
              <span className="text-premium-muted">{locale === 'vi' ? 'Trạng thái:' : 'Status:'}</span>
              <span className={`${statusColor} font-black uppercase tracking-wider`}>{statusLabel}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">

      {/* CHART 1: Orders & Sales over time */}
      <Card className="flex flex-col gap-6 p-6 transition-all duration-300 hover:shadow-card hover:scale-[1.005]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 font-sans flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-premium-primary" />
              <span>{"Orders over time"}</span>
            </h3>
            <p className="text-xs text-premium-muted font-medium mt-0.5">
              {locale === "vi" ? "Theo dõi đơn hàng & doanh thu tích lũy" : "Monitor orders volume & cash flow revenue"}
            </p>
          </div>

          {/* Dynamic View Tab Toggle */}
          <div className="flex items-center gap-0.5 bg-premium-bg border border-premium-border rounded-xl p-0.5">
            <button
              onClick={() => setOrdersView('daily')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                ordersView === 'daily'
                  ? "bg-white text-premium-primary shadow-sm"
                  : "text-premium-muted hover:text-premium-primary"
              }`}
            >
              {locale === 'vi' ? 'Ngày' : 'Daily'}
            </button>
            <button
              onClick={() => setOrdersView('weekly')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                ordersView === 'weekly'
                  ? "bg-white text-premium-primary shadow-sm"
                  : "text-premium-muted hover:text-premium-primary"
              }`}
            >
              {locale === 'vi' ? 'Tuần' : 'Weekly'}
            </button>
            <button
              onClick={() => setOrdersView('monthly')}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                ordersView === 'monthly'
                  ? "bg-white text-premium-primary shadow-sm"
                  : "text-premium-muted hover:text-premium-primary"
              }`}
            >
              {locale === 'vi' ? 'Tháng' : 'Monthly'}
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-[320px] w-full">
          {aggregatedOrdersData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BarChart3 className="h-10 w-10 text-premium-border mb-3" />
              <p className="text-sm font-semibold text-premium-muted italic">{"common.noProducts"}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregatedOrdersData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6BAF92" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6BAF92" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EDE7" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#5C7268", fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="orders"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#5C7268", fontSize: 10, fontWeight: 600 }}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxisCurrency}
                  tick={{ fill: "#3B82F6", fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="#6BAF92"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  animationDuration={1000}
                />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* CHART 2: Category stock safety threshold health */}
      <Card className="flex flex-col gap-6 p-6 transition-all duration-300 hover:shadow-card hover:scale-[1.005]">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 font-sans flex items-center gap-1.5">
            <BarChart3 className="h-5 w-5 text-premium-primary" />
            <span>{"Stock Trend"}</span>
          </h3>
          <p className="text-xs text-premium-muted font-medium mt-0.5">
            {locale === "vi" ? "Tỷ lệ tối ưu hóa hàng hóa trong mỗi danh mục" : "Inventory health ratio inside store departments"}
          </p>
        </div>

        {/* Bar Chart View */}
        <div className="h-[320px] w-full">
          {categoryStockHealth.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BarChart3 className="h-10 w-10 text-premium-border mb-3" />
              <p className="text-sm font-semibold text-premium-muted italic">{"common.noProducts"}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStockHealth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EDE7" />
                <XAxis
                  dataKey="categoryName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#5C7268", fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fill: "#5C7268", fontSize: 10, fontWeight: 600 }}
                  domain={[0, 100]}
                />
                <Tooltip cursor={{ fill: "#F4F8F6", radius: 8 }} content={<CustomBarTooltip />} />
                <Bar dataKey="healthPct" radius={[8, 8, 0, 0]} barSize={28} animationDuration={1000}>
                  {categoryStockHealth.map((entry, index) => {
                    const color = entry.healthPct >= 80 
                      ? "#6BAF92" // Healthy Green
                      : entry.healthPct >= 65
                      ? "#F59E0B" // Warning Amber
                      : "#EF4444"; // Critical Red
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dynamic Legend / Threshold metrics description */}
        <div className="flex flex-wrap items-center justify-center gap-6 border-t border-premium-border/40 pt-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[#6BAF92]" />
            <span className="text-neutral-700">{locale === 'vi' ? 'An toàn (≥ 80%)' : 'Healthy (≥ 80%)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[#F59E0B]" />
            <span className="text-neutral-700">{locale === 'vi' ? 'Cảnh báo (65% - 80%)' : 'Warning (65% - 80%)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[#EF4444]" />
            <span className="text-neutral-700">{locale === 'vi' ? 'Nguy cấp (< 65%)' : 'Critical (< 65%)'}</span>
          </div>
        </div>
      </Card>

    </div>
  );
}
