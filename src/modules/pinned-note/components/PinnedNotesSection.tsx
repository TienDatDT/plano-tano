'use client';

import { useState, useEffect } from 'react';
import { Plus, Calculator } from 'lucide-react';
import { pinnedNoteApi } from '../api/pinned-note.api';
import { PinnedNoteCard } from './PinnedNoteCard';
import { CreatePinnedNoteModal } from './CreatePinnedNoteModal';
import type { PinnedNote } from '../types/pinned-note.types';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableNoteCard({ note, onEdit, onDelete }: { note: PinnedNote; onEdit: (n: PinnedNote) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} className="min-w-[280px] max-w-[320px] shrink-0 snap-start h-full">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing h-full outline-none">
        <PinnedNoteCard note={note} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

const TABS = [
  { id: 'SGK', label: 'Sách giáo khoa' },
  { id: 'BAI_TAP', label: 'Bộ bài tập' },
  { id: 'TIENG_ANH', label: 'Bộ tiếng anh' },
];

export function PinnedNotesSection() {
  const [notes, setNotes] = useState<PinnedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PinnedNote | null>(null);
  const [activeTab, setActiveTab] = useState('SGK');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setNotes((items) => {
        const activeNotes = items.filter(n => n.tab === activeTab || (!n.tab && activeTab === 'SGK'));
        const otherNotes = items.filter(n => n.tab !== activeTab && !(!n.tab && activeTab === 'SGK'));

        const oldIndex = activeNotes.findIndex(n => n.id === active.id);
        const newIndex = activeNotes.findIndex(n => n.id === over.id);

        const newActiveNotes = arrayMove(activeNotes, oldIndex, newIndex);

        // Update orders sequentially
        const updatedActiveNotes = newActiveNotes.map((note, index) => ({
          ...note,
          order: index,
        }));

        // Fire API request in background
        const payload = updatedActiveNotes.map(n => ({ id: n.id, order: n.order }));
        pinnedNoteApi.reorderPinnedNotes(payload).catch(() => {
          toast.error('Lỗi khi lưu vị trí mới');
          loadNotes();
        });

        // Ensure order array returns combined with other tabs, then we can sort it by order to keep local state correct
        const allNotes = [...updatedActiveNotes, ...otherNotes];
        return allNotes.sort((a, b) => a.order - b.order);
      });
    }
  };

  const filteredNotes = notes.filter(note => note.tab === activeTab || (!note.tab && activeTab === 'SGK'));

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

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="py-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
          <p className="text-sm text-neutral-500 font-medium">Chưa có mẫu nào trong nhóm này</p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 text-indigo-600 font-bold text-sm hover:underline"
          >
            Tạo mẫu ngay
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredNotes.map(n => n.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-200 items-stretch">
              {filteredNotes.map((note) => (
                <SortableNoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CreatePinnedNoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadNotes}
        initialData={editingNote}
      />
    </div>
  );
}
