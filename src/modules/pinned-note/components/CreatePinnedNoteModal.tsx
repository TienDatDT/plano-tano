'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { pinnedNoteApi } from '../api/pinned-note.api';
import type { PinnedNote, CreatePinnedNoteInput } from '../types/pinned-note.types';

interface CreatePinnedNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: PinnedNote | null; // Dùng cho Edit
}

export function CreatePinnedNoteModal({ isOpen, onClose, onSuccess, initialData }: CreatePinnedNoteModalProps) {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<{ id: string; name: string; price: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setItems(initialData.items.map(i => ({
          id: Math.random().toString(),
          name: i.name,
          price: i.price.toString()
        })));
      } else {
        setTitle('');
        setItems([{ id: Math.random().toString(), name: '', price: '' }]);
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'Enter')) {
        const target = e.target as HTMLElement;
        const isTextInput = target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text';

        if (isTextInput) return; // Không chặn gõ chữ N hoa

        e.preventDefault();
        e.stopPropagation();
        setItems(prev => [...prev, { id: Math.random().toString(), name: '', price: '' }]);
      }
    };
    // Dùng capture phase để ưu tiên nhận event trước các phím tắt khác
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems(prev => [...prev, { id: Math.random().toString(), name: '', price: '' }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: 'name' | 'price', value: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên mẫu');
      return;
    }

    const validItems = items.filter(i => i.name.trim() && i.price.trim());
    if (validItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất một mục có tên và giá');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreatePinnedNoteInput = {
        title,
        items: validItems.map(i => {
          let parsedPrice = Number(i.price) || 0;
          if (parsedPrice > 0 && parsedPrice <= 999) {
            parsedPrice = parsedPrice * 1000;
          }
          return {
            name: i.name.trim(),
            price: parsedPrice,
          };
        }),
      };

      if (initialData) {
        await pinnedNoteApi.updatePinnedNote(initialData.id, payload);
        toast.success('Cập nhật mẫu báo giá thành công!');
      } else {
        await pinnedNoteApi.createPinnedNote(payload);
        toast.success('Tạo mẫu báo giá mới thành công!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(initialData ? 'Lỗi khi cập nhật' : 'Lỗi khi tạo mới');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h3 className="text-lg font-black text-neutral-900">
            {initialData ? 'Chỉnh sửa mẫu báo giá' : 'Tạo mẫu báo giá'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-neutral-200">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Tên mẫu báo giá (VD: Bộ SGK Lớp 1)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tên..."
                className="w-full px-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-premium-primary/20 focus:border-premium-primary transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-neutral-700">Danh sách các cuốn sách</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-xs font-bold text-premium-primary hover:text-premium-primary/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm mục
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-400 w-5 text-center shrink-0">{index + 1}.</span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      placeholder="Tên sách/mục..."
                      className="flex-1 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium-primary/20 focus:border-premium-primary transition-all"
                    />
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                      placeholder="Giá (VNĐ)..."
                      className="w-28 shrink-0 px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium-primary/20 focus:border-premium-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-neutral-100 flex items-center justify-end gap-3 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-premium-primary text-white text-sm font-bold rounded-xl shadow-md hover:bg-premium-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {initialData ? 'Lưu thay đổi' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
