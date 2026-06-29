import type { FindManyOrdersOptions } from '../repositories/order.repository';

const BASE = '/api/orders';

export const ordersApi = {
  /**
   * Fetch paginated and filtered list of orders
   */
  async getOrders(options: FindManyOrdersOptions): Promise<{
    success: boolean;
    data: {
      data: any[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.search) params.append('search', options.search);
    if (options.status) params.append('status', options.status);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const res = await fetch(`${BASE}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch orders list');
    }
    return res.json();
  },

  /**
   * Fetch detailed order by ID
   */
  async getOrderById(id: string): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch order details');
    }
    return res.json();
  },

  /**
   * Update order status (or cancel order)
   */
  async updateStatus(id: string, status: string): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update order status');
    }

    return res.json();
  },
};
