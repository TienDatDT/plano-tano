import type {
  CreateStoreLayoutDTO,
  UpdateStoreLayoutDTO,
  StoreLayoutFilterDTO,
} from '../dtos/store-layout.dto';

const BASE = '/api/store-layouts';

export const storeLayoutApi = {
  async getAll() {
    const res = await fetch(`${BASE}?all=true`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch store layouts');
    return res.json();
  },

  async getPaginated(filter: StoreLayoutFilterDTO = {}) {
    const params = new URLSearchParams();
    if (filter.search) params.set("search", String(filter.search));
    if (filter.isActive !== undefined) params.set("isActive", String(filter.isActive));
    if (filter.page) params.set("page", String(filter.page));
    if (filter.limit) params.set("limit", String(filter.limit));
    if (filter.sortBy) params.set("sortBy", String(filter.sortBy));
    if (filter.sortOrder) params.set("sortOrder", String(filter.sortOrder));

    const res = await fetch(`${BASE}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch store layouts');
    return res.json();
  },

  async getById(id: string) {
    const res = await fetch(`${BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch store layout');
    return res.json();
  },

  async create(payload: CreateStoreLayoutDTO) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();

      console.error("UPDATE API ERROR:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });

      throw new Error(errorText || 'Failed to update store layout');
    }
    return res.json();
  },

  async update(id: string, payload: UpdateStoreLayoutDTO) {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();

      console.error("UPDATE API ERROR:", {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });

      throw new Error(errorText || 'Failed to update store layout');
    }
  },

  async delete(id: string) {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete store layout');
    return res.json();
  },
};
