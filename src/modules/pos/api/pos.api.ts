import type { POSProductItem, CheckoutInput } from '../services/pos.service';

const BASE = '/api/pos';

export const posApi = {
  /**
   * Get all active products & batches with positive stock levels
   */
  async getAvailableProducts(): Promise<{ success: boolean; data: POSProductItem[] }> {
    const res = await fetch(`${BASE}/products`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to load available products');
    }
    return res.json();
  },

  /**
   * Checkout items
   */
  async checkout(payload: CheckoutInput): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${BASE}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Checkout failed');
    }

    return res.json();
  },
};
