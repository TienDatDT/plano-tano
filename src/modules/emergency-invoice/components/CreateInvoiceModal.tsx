'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X, Loader2, FileText } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/formatters';
import { createEmergencyInvoiceSchema } from '../types/emergency-invoice.types';
import type { CreateEmergencyInvoiceInput } from '../types/emergency-invoice.types';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: CreateEmergencyInvoiceInput) => Promise<void>;
}

export function CreateInvoiceModal({ isOpen, onClose, onSuccess, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEmergencyInvoiceInput>({
    resolver: zodResolver(createEmergencyInvoiceSchema),
    defaultValues: {
      invoiceDate: '',
      note: '',
      items: [{ productName: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  // Calculate grand total from form values
  const grandTotal = watchedItems?.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0) ?? 0;

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      reset({
        invoiceDate: '',
        note: '',
        items: [{ productName: '', quantity: 1, unitPrice: 0 }],
      });
    }
  }, [isOpen, reset]);
  useKeyboardShortcut([
      {
        key: "Enter",
        ctrl: true,
        callback: () => 
          append({ productName: "", quantity: 1, unitPrice: 0 })
      },
    ]);

  const handleFormSubmit = async (data: CreateEmergencyInvoiceInput) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-premium-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-[image:var(--image-gold-gradient)] text-white flex items-center justify-center shadow-gold">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-neutral-900 truncate">Tạo hóa đơn nhanh</h2>
              <p className="text-[10px] text-premium-muted font-semibold truncate">
                Nhập thông tin sản phẩm và tạo hóa đơn ngay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 shrink-0 rounded-xl hover:bg-slate-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          id="create-invoice-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
                  Thời gian hóa đơn (tùy chọn)
                </label>
                <input
                  {...register('invoiceDate')}
                  type="datetime-local"
                  max={new Date().toISOString().slice(0, 16)}
                  className="w-full h-10 px-3 border border-premium-border rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all bg-white"
                />
                {errors.invoiceDate && (
                  <p className="text-[9px] text-red-500 font-bold mt-1">
                    {errors.invoiceDate.message}
                  </p>
                )}
              </div>

              {/* Note field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
                  Ghi chú (tuỳ chọn)
                </label>
                <input
                  {...register('note')}
                  type="text"
                  placeholder="Ghi chú cho hóa đơn..."
                  className="w-full h-10 px-3 border border-premium-border rounded-xl text-xs font-semibold text-neutral-800 placeholder-premium-muted focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all bg-white"
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
                  Danh sách sản phẩm
                </label>
                <button
                  type="button"
                  onClick={() => append({ productName: '', quantity: 1, unitPrice: 0 })}
                  className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 bg-premium-subtle hover:bg-premium-accent border border-premium-border rounded-xl text-[10px] font-black text-premium-primary transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm sản phẩm
                </button>
              </div>

              {/* Column headers - chỉ hiện từ md trở lên; mobile dùng layout dạng card với label riêng cho từng ô */}
              <div className="hidden md:grid md:grid-cols-12 gap-2 px-1">
                <div className="col-span-5 text-[9px] font-bold text-premium-muted uppercase tracking-wider">
                  Tên sản phẩm
                </div>
                <div className="col-span-2 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">
                  SL
                </div>
                <div className="col-span-3 text-[9px] font-bold text-premium-muted uppercase tracking-wider">
                  Đơn giá (₫)
                </div>
                <div className="col-span-1 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-right">
                  Thành tiền
                </div>
                <div className="col-span-1" />
              </div>

              {/* Item rows */}
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const qty = Number(watchedItems?.[index]?.quantity) || 0;
                  const price = Number(watchedItems?.[index]?.unitPrice) || 0;
                  const lineTotal = qty * price;

                  return (
                    <div
                      key={field.id}
                      className="rounded-2xl border border-premium-border p-3 space-y-2 md:rounded-none md:border-0 md:p-0 md:space-y-0 md:grid md:grid-cols-12 md:gap-2 md:items-center"
                    >
                      {/* Tên sản phẩm + nút xoá (mobile nằm cùng dòng) */}
                      <div className="flex items-start gap-2 md:contents">
                        <div className="flex-1 md:col-span-5">
                          <label className="mb-1 block text-[9px] font-bold text-premium-muted uppercase tracking-wider md:hidden">
                            Tên sản phẩm
                          </label>
                          <input
                            {...register(`items.${index}.productName`)}
                            type="text"
                            placeholder="Tên sản phẩm..."
                            className="w-full h-9 px-3 border border-premium-border rounded-xl text-xs font-semibold text-neutral-800 placeholder-premium-muted focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all"
                          />
                          {errors.items?.[index]?.productName && (
                            <p className="text-[9px] text-red-500 mt-0.5 font-bold">
                              {errors.items[index]?.productName?.message}
                            </p>
                          )}
                        </div>

                        {/* Nút xoá - chỉ hiện trên mobile/tablet, đặt cạnh tên sản phẩm */}
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-neutral-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 md:hidden"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Số lượng / Đơn giá / Thành tiền */}
                      <div className="grid grid-cols-3 gap-2 md:contents">
                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-center text-[9px] font-bold text-premium-muted uppercase tracking-wider md:hidden">
                            SL
                          </label>
                          <input
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            type="number"
                            min={1}
                            className="w-full h-9 px-2 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 text-center focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all"
                          />
                        </div>

                        {/* Unit price */}
                        <div className="md:col-span-3">
                          <label className="mb-1 block text-[9px] font-bold text-premium-muted uppercase tracking-wider md:hidden">
                            Đơn giá (₫)
                          </label>
                          <input
                            {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                            type="number"
                            min={0}
                            step={500}
                            placeholder="0"
                            className="w-full h-9 px-3 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all"
                          />
                        </div>

                        {/* Line total */}
                        <div className="flex flex-col md:col-span-1 md:items-end md:justify-self-end">
                          <span className="mb-1 text-[9px] font-bold text-premium-muted uppercase tracking-wider md:hidden">
                            Thành tiền
                          </span>
                          <span className="text-xs font-black text-neutral-700">
                            {lineTotal > 0
                              ? formatCurrency(lineTotal, 'vi').replace('₫', '').trim()
                              : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Nút xoá - chỉ hiện trên desktop, nằm trong cột riêng để khớp lưới 12 cột */}
                      <div className="hidden md:col-span-1 md:flex md:justify-end">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="h-8 w-8 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Items validation error */}
              {errors.items?.root?.message && (
                <p className="text-xs text-red-500 font-bold">{errors.items.root.message}</p>
              )}
              {typeof errors.items?.message === 'string' && (
                <p className="text-xs text-red-500 font-bold">{errors.items.message}</p>
              )}
            </div>
          </div>

          {/* Footer – grand total + submit */}
          <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-t border-premium-border bg-premium-bg/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] text-premium-muted font-bold uppercase tracking-wider">
                  Tổng cộng
                </p>
                <p className="text-2xl font-black text-neutral-900 mt-0.5 tracking-tight">
                  {formatCurrency(grandTotal, 'vi')}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-2.5 rounded-xl border border-premium-border text-xs font-bold text-neutral-600 hover:bg-slate-50 transition-all sm:flex-none"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  form="create-invoice-form"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[image:var(--image-gold-gradient)] text-white text-xs font-black shadow-gold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed sm:flex-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo hóa đơn'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}