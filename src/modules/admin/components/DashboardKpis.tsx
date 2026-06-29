"use client";

import React from "react";
import {
  Package,
  ShoppingBag,
  CreditCard,
  Clock,
  Activity,
  AlertTriangle,
  AlertOctagon,
  Coins,
  Layers,
  Award,
  Tag,
  BarChart3
} from "lucide-react";
import { KpiCard } from "@/modules/reports/components/KpiCard";
import { formatCurrency } from "@/shared/lib/formatters";
import { useTranslation } from "react-i18next";

interface DashboardKpisProps {
  data?: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    totalProfit: number;
    profitGrowth: number;
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyStockCount: number;
    totalInventoryValueCost: number;
    totalInventoryValueRetail: number;
    inventoryHealthScore: number;
    pendingOrdersCount: number;
    completedOrdersCount: number;
    averageOrderValue: number;
    averageOrderValueGrowth: number;
    inventoryTurnover: number;
    bestSellingProduct: { name: string; sku: string; quantity: number };
    topCategory: { name: string; revenue: number };
  };
  isLoading: boolean;
}

export function DashboardKpis({ data, isLoading }: DashboardKpisProps) {
  const { t } = useTranslation();
  // 1. Loader skeleton layout matching card sizes
  if (isLoading || !data) {
    return (
      <div className="space-y-10 animate-pulse">
        {/* Core performance row */}
        <div className="space-y-3">
          <div className="h-4 w-40 bg-premium-subtle/50 rounded-lg" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[142px] bg-premium-subtle/10 border border-premium-border/40 rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-10 w-10 bg-premium-subtle/30 rounded-xl" />
                  <div className="h-5 w-12 bg-premium-subtle/30 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-premium-subtle/30 rounded-md" />
                  <div className="h-6 w-32 bg-premium-subtle/30 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operations pipeline row */}
        <div className="space-y-3">
          <div className="h-4 w-40 bg-premium-subtle/50 rounded-lg" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[142px] bg-premium-subtle/10 border border-premium-border/40 rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-10 w-10 bg-premium-subtle/30 rounded-xl" />
                  <div className="h-5 w-12 bg-premium-subtle/30 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-premium-subtle/30 rounded-md" />
                  <div className="h-6 w-32 bg-premium-subtle/30 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory stock health row */}
        <div className="space-y-3">
          <div className="h-4 w-40 bg-premium-subtle/50 rounded-lg" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[142px] bg-premium-subtle/10 border border-premium-border/40 rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <div className="h-10 w-10 bg-premium-subtle/30 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-premium-subtle/30 rounded-md" />
                  <div className="h-6 w-16 bg-premium-subtle/30 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Formatting variables
  const formattedRetailValue = formatCurrency(data.totalInventoryValueRetail);
  const formattedAssetValue = formatCurrency(data.totalInventoryValueCost);
  const formattedAov = formatCurrency(data.averageOrderValue);
  const bestSellingDesc = data.bestSellingProduct.quantity > 0
    ? `${data.bestSellingProduct.name} (${data.bestSellingProduct.quantity} sold)`
    : t(" common.noProducts");
  const topCategoryDesc = data.topCategory.revenue > 0
    ? `${data.topCategory.name} (${formatCurrency(data.topCategory.revenue)})`
    : t("common.noProducts");

  return (
    <div className="space-y-10">

      {/* SECTION A: Core Performance Metrics */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-premium-muted/50 px-1">
          {"1. " + t("salesRevenue.title")}
        </h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <KpiCard
            title={t("salesRevenue.retailInventoryValue")}
            value={formattedRetailValue}
            icon={CreditCard}
            trend={{ value: data.revenueGrowth, isUp: data.revenueGrowth >= 0 }}
            description={t("salesRevenue.valuationAtCurrentSalePrices")}
          />
          <KpiCard
            title={t("salesRevenue.averageOrderValue")}
            value={formattedAov}
            icon={Award}
            trend={{ value: data.averageOrderValueGrowth, isUp: data.averageOrderValueGrowth >= 0 }}
            description={t("salesRevenue.averageOrderValueDescription")}
          />
          <KpiCard
            title={t("salesRevenue.completedOperations")}
            value={data.completedOrdersCount}
            icon={ShoppingBag}
            trend={{ value: data.ordersGrowth, isUp: data.ordersGrowth >= 0 }}
            description={t("salesRevenue.completedOperationsDescription")}
          />
        </div>
      </div>

      {/* SECTION B: Operations & Business Insights */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-premium-muted/50 px-1">
          {`2. ${t("operations.title")}`}
        </h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <KpiCard
            title={t("operations.inventoryTurnover")}
            value={`${data.inventoryTurnover}x`}
            icon={BarChart3}
            description={t("operations.inventoryTurnoverDescription")}
          />
          <KpiCard
            title={t("operations.bestSellingProduct")}
            value={data.bestSellingProduct.sku}
            icon={Tag}
            description={bestSellingDesc}
          />
          <KpiCard
            title={t("operations.topCategory")}
            value={data.topCategory.name}
            icon={Layers}
            description={topCategoryDesc}
          />
        </div>
      </div>

      {/* SECTION C: Inventory Backlog & Stock Health */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-premium-muted/50 px-1">
          {`3. ${t("inventory.title")}`}
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title={t("inventory.inventoryHealthScore")}
            value={`${data.inventoryHealthScore}%`}
            icon={Activity}
            description={t("inventory.inventoryHealthScoreDescription")}
          />
          <KpiCard
            title={t("inventory.totalSkuVariants")}
            value={data.totalProducts}
            icon={Package}
            description={t("inventory.totalSkuVariantsDescription")}
          />
          {/* Custom style for Low Stock alert indicator */}
          <div className="relative">
            <KpiCard
              title={t("inventory.lowStockProducts")}
              value={data.lowStockCount}
              icon={AlertTriangle}
              description={t("inventory.lowStockProductsDescription")}
            />
            {data.lowStockCount > 0 && (
              <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </div>
          {/* Custom style for Out of Stock danger indicator */}
          <div className="relative">
            <KpiCard
              title={t("inventory.outOfStockProducts")}
              value={data.outOfStockCount}
              icon={AlertOctagon}
              description={t("inventory.outOfStockProductsDescription")}
            />
            {data.outOfStockCount > 0 && (
              <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>
        </div>

        {/* Supplementary Backlog and Cost row */}
        <div className="grid gap-6 sm:grid-cols-2 mt-4">
          <KpiCard
            title={t("inventory.assetCostValue")}
            value={formattedAssetValue}
            icon={Coins}
            description={t("inventory.assetCostValueDescription")}
          />
          <div className="relative">
            <KpiCard
              title={t("inventory.pendingBacklog")}
              value={data.pendingOrdersCount}
              icon={Clock}
              description={t("inventory.pendingBacklogDescription")}
            />
            {data.pendingOrdersCount > 0 && (
              <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-premium-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-premium-primary"></span>
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
