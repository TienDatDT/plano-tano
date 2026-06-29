const BASE = '/api/analytics';

export const reportsApi = {
  /**
   * Fetch consolidated dashboard analytics data
   */
  async getDashboardData(startDate?: string, endDate?: string): Promise<{
    success: boolean;
    data: {
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
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await fetch(`${BASE}/dashboard?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch dashboard metrics');
    }
    return res.json();
  },
};
