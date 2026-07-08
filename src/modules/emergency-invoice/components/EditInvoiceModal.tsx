'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X, Loader2, Edit3 } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/formatters';
import { updateEmergencyInvoiceSchema } from '../types/emergency-invoice.types';
import type { UpdateEmergencyInvoiceInput, EmergencyInvoice } from '../types/emergency-invoice.types';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';

interface Props {
  invoice: EmergencyInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (id: string, data: UpdateEmergencyInvoiceInput) => Promise<void>;
}

export function EditInvoiceModal({ invoice, isOpen, onClose, onSuccess, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);


  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateEmergencyInvoiceInput>({
    resolver: zodResolver(updateEmergencyInvoiceSchema),
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

  
  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen && invoice) {
      // Format invoiceDate for datetime-local input
      const dateStr = invoice.invoiceDate ?? invoice.createdAt;
      const formattedDate = new Date(dateStr).toISOString().slice(0, 16);

      reset({
        invoiceDate: formattedDate,
        note: invoice.note || '',
        items: invoice.items?.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        })) || [{ productName: '', quantity: 1, unitPrice: 0 }],
      });
    }
  }, [isOpen, invoice, reset]);
  useKeyboardShortcut([
    {
      key: "Enter",
      ctrl: true,
      callback: () => 
        append({ productName: "", quantity: 1, unitPrice: 0 })
    },
  ]);

  const handleFormSubmit = async (data: UpdateEmergencyInvoiceInput) => {
    if (!invoice) return;
    try {
      setSubmitting(true);
      await onSubmit(invoice.id, data);
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-premium-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[image:var(--image-gold-gradient)] text-white flex items-center justify-center shadow-gold">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-900">
                Chỉnh sửa hóa đơn {invoice.invoiceCode}
              </h2>
              <p className="text-[10px] text-premium-muted font-semibold">
                Cập nhật thông tin chi tiết hóa đơn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          id="edit-invoice-form"
          onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "Enter") {
            e.preventDefault();

            append({
              productName: "",
              quantity: 1,
              unitPrice: 0,
            });
          }
        }}
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
                  Thời gian hóa đơn
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
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
                  Danh sách sản phẩm
                </label>
                <button
                  type="button"
                  onClick={() => append({ productName: '', quantity: 1, unitPrice: 0 })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-premium-subtle hover:bg-premium-accent border border-premium-border rounded-xl text-[10px] font-black text-premium-primary transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm sản phẩm
                </button>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 gap-2 px-1">
                <div className="col-span-5 text-[9px] font-bold text-premium-muted uppercase tracking-wider">
                  Tên sản phẩm
                </div>
                <div className="col-span-2 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">
                  SL
                </div>
                <div className="col-span-3 text-[9px] font-bold text-premium-muted uppercase tracking-wider">
                  Đơn giá (₫)
                </div>
                <div className="col-span-2 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-right">
                  Thành tiền
                </div>
              </div>

              {/* Item rows */}
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const qty = Number(watchedItems?.[index]?.quantity) || 0;
                  const price = Number(watchedItems?.[index]?.unitPrice) || 0;
                  const lineTotal = qty * price;

                  return (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                      {/* Product name */}
                      <div className="col-span-5">
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

                      {/* Quantity */}
                      <div className="col-span-2">
                        <input
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          type="number"
                          min={1}
                          className="w-full h-9 px-2 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 text-center focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all"
                        />
                      </div>

                      {/* Unit price */}
                      <div className="col-span-3">
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
                      <div className="col-span-1 text-right">
                        <span className="text-xs font-black text-neutral-700">
                          {lineTotal > 0
                            ? formatCurrency(lineTotal, 'vi').replace('₫', '').trim()
                            : '—'}
                        </span>
                      </div>

                      {/* Remove button */}
                      <div className="col-span-1 flex justify-end">
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
          <div className="shrink-0 px-6 py-5 border-t border-premium-border bg-premium-bg/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-premium-muted font-bold uppercase tracking-wider">
                  Tổng cộng
                </p>
                <p className="text-2xl font-black text-neutral-900 mt-0.5 tracking-tight">
                  {formatCurrency(grandTotal, 'vi')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-premium-border text-xs font-bold text-neutral-600 hover:bg-slate-50 transition-all"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  form="edit-invoice-form"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[image:var(--image-gold-gradient)] text-white text-xs font-black shadow-gold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
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
