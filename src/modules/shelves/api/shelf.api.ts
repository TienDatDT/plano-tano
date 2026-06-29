import type {
  CreateShelfDTO,
  UpdateShelfDTO,
  ShelfFilterDTO,
  CreateShelfCellDTO,
} from '../dtos/shelf.dto';

const BASE = '/api/shelves';

export const shelfApi = {
  async getAll(layoutId?: string) {
    const params = new URLSearchParams({ all: 'true' });
    if (layoutId) params.set("layoutId", layoutId);

    const res = await fetch(`${BASE}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch shelves');
    return res.json();
  },

  async getPaginated(filter: ShelfFilterDTO = {}) {
    const params = new URLSearchParams();
    if (filter.search) params.set("search", filter.search);
    if (filter.layoutId) params.set("layoutId", filter.layoutId);
    if (filter.layoutType) params.set("layoutType", filter.layoutType);
    if (filter.page) params.set("page", filter.page.toString());
    if (filter.limit) params.set("limit", filter.limit.toString());
    if (filter.sortBy) params.set("sortBy", filter.sortBy);
    if (filter.sortOrder) params.set("sortOrder", filter.sortOrder);

    const res = await fetch(`${BASE}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch shelves');
    return res.json();
  },

  async getById(id: string) {
    const res = await fetch(`${BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch shelf');
    return res.json();
  },

  async create(payload: CreateShelfDTO) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create shelf');
    return res.json();
  },

  async update(id: string, payload: UpdateShelfDTO) {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update shelf');
    return res.json();
  },

  async bulkUpdate(payload: { id: string; posX: number; posY: number; rotation?: number; name?: string }[]) {
    const res = await fetch(`${BASE}/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to bulk update shelves');
    return res.json();
  },

  async delete(id: string) {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete shelf');
    return res.json();
  },

  // ─── Cells ───────────────────────────────────────────────────────────────────
  async getCells(shelfId: string) {
    const res = await fetch(`${BASE}/${shelfId}/cells`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch cells');
    return res.json();
  },

  async addCell(shelfId: string, payload: CreateShelfCellDTO) {
    const res = await fetch(`${BASE}/${shelfId}/cells`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to add cell');
    return res.json();
  },

  async deleteCell(shelfId: string, cellId: string) {
    const res = await fetch(`${BASE}/${shelfId}/cells/${cellId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete cell');
    return res.json();
  },
};
