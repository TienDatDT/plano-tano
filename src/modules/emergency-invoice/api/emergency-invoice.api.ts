import type {
  CreateEmergencyInvoiceInput,
  UpdateEmergencyInvoiceInput,
  EmergencyInvoice,
  EmergencyInvoiceSummary,
  FindManyEmergencyInvoicesOptions,
  PaginatedEmergencyInvoices,
} from '../types/emergency-invoice.types';

const BASE = '/api/emergency-invoices';

export const emergencyInvoiceApi = {
  /**
   * Fetch paginated list of invoices
   */
  async getInvoices(
    options: FindManyEmergencyInvoicesOptions = {},
  ): Promise<{ success: boolean; data: PaginatedEmergencyInvoices }> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', String(options.page));
    if (options.limit) params.append('limit', String(options.limit));
    if (options.period) params.append('period', options.period);
    if (options.fromDate) params.append('fromDate', options.fromDate);
    if (options.toDate) params.append('toDate', options.toDate);
    if (options.search) params.append('search', options.search);

    const res = await fetch(`${BASE}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể tải danh sách hóa đơn');
    }
    return res.json();
  },

  /**
   * Fetch single invoice by ID
   */
  async getInvoiceById(id: string): Promise<{ success: boolean; data: EmergencyInvoice }> {
    const res = await fetch(`${BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể tải chi tiết hóa đơn');
    }
    return res.json();
  },

  /**
   * Create a new invoice
   */
  async createInvoice(
    data: CreateEmergencyInvoiceInput,
  ): Promise<{ success: boolean; data: EmergencyInvoice }> {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể tạo hóa đơn');
    }
    return res.json();
  },

  /**
   * Update an invoice
   */
  async updateInvoice(
    id: string,
    data: UpdateEmergencyInvoiceInput,
  ): Promise<{ success: boolean; data: EmergencyInvoice }> {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể cập nhật hóa đơn');
    }
    return res.json();
  },

  /**
   * Delete an invoice by ID
   */
  async deleteInvoice(id: string): Promise<{ success: boolean; data: { id: string } }> {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể xóa hóa đơn');
    }
    return res.json();
  },

  /**
   * Bulk delete multiple invoices by IDs
   */
  async bulkDeleteInvoices(
    ids: string[],
  ): Promise<{ success: boolean; data: { deletedCount: number } }> {
    const res = await fetch(`${BASE}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể xóa các hóa đơn đã chọn');
    }
    return res.json();
  },

  /**
   * Get dashboard summary stats
   */
  async getSummary(
    options: FindManyEmergencyInvoicesOptions = {},
  ): Promise<{ success: boolean; data: EmergencyInvoiceSummary }> {
    const params = new URLSearchParams();
    if (options.period) params.append('period', options.period);
    if (options.fromDate) params.append('fromDate', options.fromDate);
    if (options.toDate) params.append('toDate', options.toDate);
    if (options.search) params.append('search', options.search);

    const res = await fetch(`${BASE}/summary?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Không thể tải thống kê');
    }
    return res.json();
  },
};