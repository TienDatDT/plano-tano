'use client';

import { useState, useEffect } from 'react';
import { Plus, Calculator } from 'lucide-react';
import { pinnedNoteApi } from '../api/pinned-note.api';
import { PinnedNoteCard } from './PinnedNoteCard';
import { CreatePinnedNoteModal } from './CreatePinnedNoteModal';
import type { PinnedNote } from '../types/pinned-note.types';
import { toast } from 'sonner';

export function PinnedNotesSection() {
  const [notes, setNotes] = useState<PinnedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PinnedNote | null>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await pinnedNoteApi.getPinnedNotes();
      if (res.success) {
        setNotes(res.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách mẫu báo giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await pinnedNoteApi.deletePinnedNote(id);
      toast.success('Đã xóa mẫu báo giá');
      loadNotes();
    } catch (error) {
      toast.error('Không thể xóa mẫu báo giá');
    }
  };

  const handleEdit = (note: PinnedNote) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 border border-premium-border mb-8 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-neutral-100 rounded-md animate-pulse"></div>
          <div className="h-8 w-24 bg-neutral-100 rounded-xl animate-pulse"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
           {[1, 2, 3].map((i) => (
             <div key={i} className="min-w-[280px] h-48 bg-neutral-50 rounded-2xl border border-neutral-100 animate-pulse shrink-0"></div>
           ))}
        </div>
      </div>
    );
  }

  // Nếu không có note nào và không phải trạng thái load, có thể chỉ hiển thị nút tạo
  if (notes.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 border border-premium-border mb-8 shadow-soft flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
             <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">Mẫu báo giá (Pinned Notes)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Tạo các mẫu báo giá nhanh cho các bộ sách, combo...</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 text-xs font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Tạo mẫu
        </button>

        <CreatePinnedNoteModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={loadNotes}
          initialData={editingNote}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-premium-border mb-8 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
             <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">Mẫu báo giá nhanh</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Click vào các mục để gạch ngang và trừ tiền tự động</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 text-xs font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Tạo mẫu mới
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-200">
        {notes.map((note) => (
          <div key={note.id} className="min-w-[280px] max-w-[320px] shrink-0 snap-start">
            <PinnedNoteCard 
              note={note} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          </div>
        ))}
      </div>

      <CreatePinnedNoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadNotes}
        initialData={editingNote}
      />
    </div>
  );
}
