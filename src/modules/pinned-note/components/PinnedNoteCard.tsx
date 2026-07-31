'use client';

import { useState } from 'react';
import { Trash2, Edit, Calculator } from 'lucide-react';
import type { PinnedNote } from '../types/pinned-note.types';

interface PinnedNoteCardProps {
  note: PinnedNote;
  onEdit: (note: PinnedNote) => void;
  onDelete: (id: string) => void;
}

export function PinnedNoteCard({ note, onEdit, onDelete }: PinnedNoteCardProps) {
  const [crossedOutIds, setCrossedOutIds] = useState<Set<string>>(new Set());

  const handleToggleCrossOut = (itemId: string) => {
    setCrossedOutIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Tính toán tổng tiền
  const originalTotal = note.items.reduce((sum, item) => sum + item.price, 0);
  const currentTotal = note.items.reduce((sum, item) => {
    if (crossedOutIds.has(item.id)) return sum;
    return sum + item.price;
  }, 0);

  return (
    <div className="flex flex-col bg-white border border-premium-border rounded-2xl p-4 shadow-soft transition-all hover:shadow-md h-full">
      <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
        <h3 className="text-sm font-bold text-neutral-900 truncate pr-2 flex-1 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-premium-primary" />
          {note.title}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Sửa ghi chú"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
                onDelete(note.id);
              }
            }}
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa ghi chú"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[120px] max-h-[200px] pr-1 scrollbar-thin scrollbar-thumb-neutral-200">
        {note.items.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-4">Chưa có mục nào</p>
        ) : (
          <ul className="space-y-1">
            {note.items.map((item) => {
              const isCrossed = crossedOutIds.has(item.id);
              return (
                <li
                  key={item.id}
                  onClick={() => handleToggleCrossOut(item.id)}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all text-xs
                    ${isCrossed ? 'bg-neutral-50 text-neutral-400' : 'hover:bg-indigo-50/50 text-neutral-700'}
                  `}
                >
                  <span className={`font-medium transition-all ${isCrossed ? 'line-through decoration-neutral-400' : ''}`}>
                    {item.name}
                  </span>
                  <span className={`font-semibold transition-all ${isCrossed ? 'line-through decoration-neutral-400' : ''}`}>
                    {new Intl.NumberFormat('vi-VN').format(item.price)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-neutral-100 flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Tổng gốc:</span>
          <span className={crossedOutIds.size > 0 ? 'line-through' : ''}>
            {new Intl.NumberFormat('vi-VN').format(originalTotal)}đ
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-900">Thành tiền:</span>
          <span className="text-sm font-black text-premium-primary">
            {new Intl.NumberFormat('vi-VN').format(currentTotal)}đ
          </span>
        </div>
      </div>
    </div>
  );
}
