import type {
  AssignItemDTO,
  UpdateItemDTO,
  PlanogramFilterDTO,
  BulkAssignItemDTO,
} from '../dtos/planogram.dto';

const BASE = '/api/planogram';

export const planogramApi = {
  async getItems(filter: PlanogramFilterDTO = {}) {
    const params = new URLSearchParams();
    if (filter.shelfId) params.set("shelfId",filter.shelfId);
    if (filter.layoutId) params.set("layoutId",filter.layoutId);
    if (filter.batchId) params.set("batchId",filter.batchId);
    if (filter.page) params.set("page",filter.page.toString());
    if (filter.limit) params.set("limit",filter.limit.toString());
    if (filter.sortBy) params.set("sortBy",filter.sortBy);
    if (filter.sortOrder) params.set("sortOrder",filter.sortOrder);

    const res = await fetch(`${BASE}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch planogram items');
    return res.json();
  },

  async getById(id: string) {
    const res = await fetch(`${BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch planogram item');
    return res.json();
  },

  async getByShelf(shelfId: string) {
    const res = await fetch(`${BASE}/shelf/${shelfId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch shelf items');
    return res.json();
  },

  async getSnapshot(layoutId: string) {
    const res = await fetch(`${BASE}/snapshot?layoutId=${layoutId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch planogram snapshot');
    return res.json();
  },

  async assignItem(payload: AssignItemDTO) {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to assign item');
    return res.json();
  },

  async updateItem(id: string, payload: UpdateItemDTO) {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update planogram item');
    return res.json();
  },

  async removeItem(id: string) {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove planogram item');
    return res.json();
  },

  async clearShelf(shelfId: string) {
    const res = await fetch(`${BASE}/shelf/${shelfId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear shelf');
    return res.json();
  },

  async bulkAssign(payload: BulkAssignItemDTO) {
    const res = await fetch(`${BASE}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to bulk assign items');
    return res.json();
  },
};
