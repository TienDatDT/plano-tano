import { startOfDay, endOfDay, differenceInMilliseconds, format, eachDayOfInterval } from 'date-fns';
import { analyticsRepository } from '../repositories/analytics.repository';

export interface DailyBreakdownItem {
  date: string; // "YYYY-MM-DD"
  dateLabel: string; // "MMM dd"
  revenue: number;
  orders: number;
  profit: number;
  aov: number;
}

export class AnalyticsService {
  /**
   * Helper to parse dates and return current & previous date boundaries
   */
  private getPeriodBoundaries(startDateStr?: string, endDateStr?: string) {
    const now = new Date();

    // Default to last 7 days if not provided
    const end = endDateStr ? endOfDay(new Date(endDateStr)) : endOfDay(now);
    const start = startDateStr
      ? startOfDay(new Date(startDateStr))
      : startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)); // Last 7 days inclusive

    const durationMs = differenceInMilliseconds(end, start);

    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(start.getTime() - durationMs - 1);

    return { start, end, prevStart, prevEnd };
  }

  /**
   * Helper to calculate aggregate metrics from a list of completed orders
   */
  private calculateMetrics(orders: any[]) {
    let revenue = 0;
    let profit = 0;
    const ordersCount = orders.length;

    for (const order of orders) {
      revenue += Number(order.totalAmount);
      for (const item of order.items) {
        const itemRevenue = Number(item.salePrice) * item.quantity;
        const itemCost = Number(item.batch?.importPrice || item.salePrice) * item.quantity;
        profit += (itemRevenue - itemCost);
      }
    }

    return { revenue, profit, ordersCount };
  }

  /**
   * Helper to compute dynamic growth percentage
   */
  private calculateGrowth(current: number, previous: number): number {
    if (previous <= 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  /**
   * Core dynamic summary & daily breakdown generator
   */
  async getDashboardData(startDateStr?: string, endDateStr?: string) {
    const { start, end, prevStart, prevEnd } = this.getPeriodBoundaries(startDateStr, endDateStr);

    // 1. Fetch current orders, previous orders, inventory stats, and pending orders
    const [currentOrders, prevOrders, inventoryStats, pendingOrdersCount] = await Promise.all([
      analyticsRepository.getCompletedOrders(start, end),
      analyticsRepository.getCompletedOrders(prevStart, prevEnd),
      analyticsRepository.getInventoryStats(),
      analyticsRepository.getPendingOrdersCount(),
    ]);

    // 2. Compute KPI Metrics
    const currentStats = this.calculateMetrics(currentOrders);
    const prevStats = this.calculateMetrics(prevOrders);

    const revenueGrowth = this.calculateGrowth(currentStats.revenue, prevStats.revenue);
    const ordersGrowth = this.calculateGrowth(currentStats.ordersCount, prevStats.ordersCount);
    const profitGrowth = this.calculateGrowth(currentStats.profit, prevStats.profit);

    // 3. Compute Stock Valuation and Alerts (Healthy, Low Stock, Out of Stock)
    let totalInventoryValueCost = 0;
    let totalInventoryValueRetail = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyStockCount = 0;

    for (const variant of inventoryStats) {
      const totalQty = variant.batches.reduce((sum, b) => sum + b.quantity, 0);
      const variantCost = variant.batches.reduce((sum, b) => sum + (b.quantity * Number(b.importPrice)), 0);
      const variantRetail = totalQty * Number(variant.salePrice);

      totalInventoryValueCost += variantCost;
      totalInventoryValueRetail += variantRetail;

      if (totalQty === 0) {
        outOfStockCount++;
      } else if (totalQty < 10) {
        lowStockCount++;
      } else {
        healthyStockCount++;
      }
    }

    const healthScore = inventoryStats.length > 0
      ? Math.round((healthyStockCount / inventoryStats.length) * 100)
      : 100;

    // 4. Compute Average Order Value (AOV) & Growth
    const currentAOV = currentStats.ordersCount > 0 ? (currentStats.revenue / currentStats.ordersCount) : 0;
    const prevAOV = prevStats.ordersCount > 0 ? (prevStats.revenue / prevStats.ordersCount) : 0;
    const aovGrowth = this.calculateGrowth(currentAOV, prevAOV);

    // 5. Compute COGS and Inventory Turnover Ratio
    let cogs = 0;
    for (const order of currentOrders) {
      for (const item of order.items) {
        const itemCost = Number(item.batch?.importPrice || item.variant?.costPrice || Number(item.salePrice) * 0.6) * item.quantity;
        cogs += itemCost;
      }
    }
    const inventoryTurnover = totalInventoryValueCost > 0
      ? Number((cogs / totalInventoryValueCost).toFixed(2))
      : 0.0;

    // 6. Aggregate Best Selling Product Variant in the period
    const soldQtyMap = new Map<string, { name: string; sku: string; quantity: number }>();
    for (const order of currentOrders) {
      for (const item of order.items) {
        const variantId = item.variantId;
        const productName = item.variant?.product?.name || 'Unknown';
        // const unitSymbol = item.variant?.unit?.symbol || '';
        const displayName = productName;

        const existing = soldQtyMap.get(variantId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          soldQtyMap.set(variantId, {
            name: displayName,
            sku: item.variant?.sku || 'SKU',
            quantity: item.quantity
          });
        }
      }
    }
    let bestSellingProduct = { name: 'N/A', sku: 'N/A', quantity: 0 };
    for (const item of soldQtyMap.values()) {
      if (item.quantity > bestSellingProduct.quantity) {
        bestSellingProduct = item;
      }
    }

    // 7. Aggregate Top Selling Category in the period
    const categoryRevenueMap = new Map<string, number>();
    for (const order of currentOrders) {
      for (const item of order.items) {
        const categoryName = item.variant?.product?.category?.name || 'Uncategorized';
        const itemRevenue = Number(item.salePrice) * item.quantity;
        categoryRevenueMap.set(categoryName, (categoryRevenueMap.get(categoryName) || 0) + itemRevenue);
      }
    }
    let topCategory = { name: 'N/A', revenue: 0 };
    for (const [name, revenue] of categoryRevenueMap.entries()) {
      if (revenue > topCategory.revenue) {
        topCategory = { name, revenue: Number(revenue.toFixed(2)) };
      }
    }

    // 8. Build Daily Breakdown Map
    const daysInterval = eachDayOfInterval({ start, end });
    const dailyMap = new Map<string, DailyBreakdownItem>();

    for (const day of daysInterval) {
      const dateKey = format(day, 'yyyy-MM-dd');
      dailyMap.set(dateKey, {
        date: dateKey,
        dateLabel: format(day, 'MMM dd'),
        revenue: 0,
        orders: 0,
        profit: 0,
        aov: 0,
      });
    }

    // Populate actual order totals
    for (const order of currentOrders) {
      const dateKey = format(new Date(order.createdAt), 'yyyy-MM-dd');
      const dayData = dailyMap.get(dateKey);

      if (dayData) {
        dayData.orders += 1;
        dayData.revenue += Number(order.totalAmount);

        for (const item of order.items) {
          const itemRevenue = Number(item.salePrice) * item.quantity;
          const itemCost = Number(item.batch?.importPrice || item.variant?.costPrice || Number(item.salePrice) * 0.6) * item.quantity;
          dayData.profit += (itemRevenue - itemCost);
        }
      }
    }

    // Calculate AOV and round Decimals
    const dailyBreakdown = Array.from(dailyMap.values()).map((day) => {
      const revenue = Number(day.revenue.toFixed(2));
      const profit = Number(day.profit.toFixed(2));
      const aov = day.orders > 0 ? Number((revenue / day.orders).toFixed(2)) : 0;

      return {
        ...day,
        revenue,
        profit,
        aov,
      };
    });

    // Group by Category to compute safety threshold stock health
    const categoryHealthMap = new Map<string, { healthy: number; total: number }>();
    for (const variant of inventoryStats) {
      const categoryName = variant.product?.category?.name || 'Uncategorized';
      const totalQty = variant.batches.reduce((sum, b) => sum + b.quantity, 0);
      const isHealthy = totalQty >= 10;

      const existing = categoryHealthMap.get(categoryName) || { healthy: 0, total: 0 };
      existing.total += 1;
      if (isHealthy) existing.healthy += 1;
      categoryHealthMap.set(categoryName, existing);
    }

    const categoryStockHealth = Array.from(categoryHealthMap.entries()).map(([name, stats]) => {
      const healthPct = stats.total > 0 ? Math.round((stats.healthy / stats.total) * 100) : 100;
      return {
        categoryName: name,
        healthPct,
      };
    });

    return {
      summary: {
        totalRevenue: Number(currentStats.revenue.toFixed(2)),
        revenueGrowth,
        totalOrders: currentStats.ordersCount,
        ordersGrowth,
        totalProfit: Number(currentStats.profit.toFixed(2)),
        profitGrowth,
        totalProducts: inventoryStats.length,
        lowStockCount,
        outOfStockCount,
        healthyStockCount,
        totalInventoryValueCost: Number(totalInventoryValueCost.toFixed(2)),
        totalInventoryValueRetail: Number(totalInventoryValueRetail.toFixed(2)),
        inventoryHealthScore: healthScore,
        pendingOrdersCount,
        completedOrdersCount: currentStats.ordersCount,
        averageOrderValue: Number(currentAOV.toFixed(2)),
        averageOrderValueGrowth: aovGrowth,
        inventoryTurnover,
        bestSellingProduct,
        topCategory,
      },
      dailyBreakdown,
      categoryStockHealth,
    };
  }


  /**
   * GET /analytics/revenue-trend
   */
  async getRevenueTrend(startDateStr?: string, endDateStr?: string) {
    const data = await this.getDashboardData(startDateStr, endDateStr);
    return data.dailyBreakdown.map((d) => ({
      date: d.dateLabel,
      revenue: d.revenue,
    }));
  }

  /**
   * GET /analytics/order-volume
   */
  async getOrderVolume(startDateStr?: string, endDateStr?: string) {
    const data = await this.getDashboardData(startDateStr, endDateStr);
    return data.dailyBreakdown.map((d) => ({
      date: d.dateLabel,
      orders: d.orders,
    }));
  }

  /**
   * GET /analytics/daily-breakdown
   */
  async getDailyBreakdown(startDateStr?: string, endDateStr?: string) {
    const data = await this.getDashboardData(startDateStr, endDateStr);
    return data.dailyBreakdown;
  }
}

export const analyticsService = new AnalyticsService();
