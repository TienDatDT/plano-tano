import type { 
  PinnedNote, 
  CreatePinnedNoteInput, 
  UpdatePinnedNoteInput 
} from '../types/pinned-note.types';

const BASE = '/api/pinned-notes';

export const pinnedNoteApi = {
  getPinnedNotes: async (): Promise<{ success: boolean; data: PinnedNote[] }> => {
    const res = await fetch(BASE, { cache: 'no-store' });
    if (!res.ok) throw new Error('Không thể tải danh sách mẫu báo giá');
    return res.json();
  },
  
  getPinnedNoteById: async (id: string): Promise<{ success: boolean; data: PinnedNote }> => {
    const res = await fetch(`${BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Không thể tải chi tiết mẫu báo giá');
    return res.json();
  },

  createPinnedNote: async (data: CreatePinnedNoteInput): Promise<{ success: boolean; data: PinnedNote }> => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể tạo mẫu báo giá');
    return res.json();
  },

  updatePinnedNote: async (id: string, data: UpdatePinnedNoteInput): Promise<{ success: boolean; data: PinnedNote }> => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Không thể cập nhật mẫu báo giá');
    return res.json();
  },

  deletePinnedNote: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Không thể xóa mẫu báo giá');
    return res.json();
  },

  reorderPinnedNotes: async (items: { id: string; order: number }[]): Promise<{ success: boolean }> => {
    const res = await fetch(`${BASE}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Không thể lưu thứ tự');
    return res.json();
  },
};
