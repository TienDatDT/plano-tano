'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, X, Loader2, FileText, Calculator } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/formatters';
import { createEmergencyInvoiceSchema } from '../types/emergency-invoice.types';
import type { CreateEmergencyInvoiceInput } from '../types/emergency-invoice.types';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';
import { z } from 'zod';


interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (data: CreateEmergencyInvoiceInput) => Promise<void>;
  initialData?: Partial<CreateEmergencyInvoiceInput> | null;
}

import { QuickPriceCalculator } from './QuickPriceCalculator';

// Thêm helper này ở ngoài component (trên DISCOUNT_PRESETS)
const getLocalDateTimeString = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};
const DISCOUNT_PRESETS = [0, 4, 8] as const;

export function CreateInvoiceModal({ isOpen, onClose, onSuccess, onSubmit, initialData }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [customDiscountRows, setCustomDiscountRows] = useState<Record<string, boolean>>({});
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [bulkDiscountValue, setBulkDiscountValue] = useState<number>(0);
  const [discountMode, setDiscountMode] = useState<'ITEM' | 'INVOICE'>('ITEM');
  const [invoiceDiscountPercent, setInvoiceDiscountPercent] = useState(0);
  const [calcOpen, setCalcOpen] = useState<{ index: number; rect: DOMRect } | null>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const [tape, setTape] = useState<number[]>([]);
  const [current, setCurrent] = useState('');

  const tapeSum = tape.reduce((s, v) => s + v, 0);
  const displayTotal = tapeSum + (Number(current) || 0);

  const [priceInput, setPriceInput] = useState<Record<number, string>>({});

  const formatPrice = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const parsePrice = (value: string) => {
    // Xóa dấu chấm (phân cách hàng nghìn)
    let raw = value.replace(/\./g, "");
    // Đổi phẩy thành chấm để JS hiểu là số thập phân
    raw = raw.replace(/,/g, ".");

    if (!raw) return 0;

    const number = Number(raw);

    if (Number.isNaN(number)) return 0;

    // nếu người dùng nhập dưới 1000 thì hiểu là nghìn (VD: 12,5 -> 12.5 -> 12500)
    return number < 1000 ? number * 1000 : number;
  };

  // Đóng khi click ra ngoài popover (popover tự stopPropagation nên không bị dính)
  useEffect(() => {
    if (!calcOpen) return;
    const handleClickOutside = () => setCalcOpen(null);
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [calcOpen]);


  // Đóng khi cuộn hoặc resize modal, tránh popover bị lệch khỏi vị trí neo
  useEffect(() => {
    if (!calcOpen) return;
    const scrollEl = bodyScrollRef.current;
    const close = () => setCalcOpen(null);
    scrollEl?.addEventListener('scroll', close);
    window.addEventListener('resize', close);
    return () => {
      scrollEl?.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
    };
  }, [calcOpen]);



  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof createEmergencyInvoiceSchema>,
    any,
    z.output<typeof createEmergencyInvoiceSchema>
  >({
    resolver: zodResolver(createEmergencyInvoiceSchema),
    defaultValues: {
      invoiceDate: getLocalDateTimeString(), // ← thay vì ''
      note: '',
      items: [{ productName: '', quantity: 1, unitPrice: 0, discountPercent: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  const getLineTotal = (quantity?: number, unitPrice?: number, discountPercent?: number) => {
    const qty = Number(quantity) || 0;
    const price = Number(unitPrice) || 0;
    const discount = Number(discountPercent) || 0;
    const raw = qty * price;
    return raw - (raw * discount) / 100;
  };

  const subTotal =
    watchedItems?.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0) ?? 0;

  const grandTotal =
    discountMode === 'ITEM'
      ? watchedItems?.reduce((sum, item) => {
        return sum + getLineTotal(item.quantity, item.unitPrice, item.discountPercent);
      }, 0) ?? 0
      : subTotal - (subTotal * invoiceDiscountPercent) / 100;

  useEffect(() => {
    if (!isOpen) {
      // Reset khi đóng — luôn về trạng thái trống
      reset({
        invoiceDate: getLocalDateTimeString(),
        note: '',
        items: [{ productName: '', quantity: 1, unitPrice: 0, discountPercent: 0 }],
      });
      setCustomDiscountRows({});
      setSelectedRows({});
      setBulkDiscountValue(0);
      setDiscountMode('ITEM');
      setInvoiceDiscountPercent(0);
      return;
    }

    // Khi mở: nếu có initialData (duplicate) → prefill, ngược lại mở trống
    if (initialData) {
      const items =
        initialData.items && initialData.items.length > 0
          ? initialData.items.map((item) => ({
            productName: item.productName ?? '',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
            discountPercent: item.discountPercent ?? 0,
          }))
          : [{ productName: '', quantity: 1, unitPrice: 0, discountPercent: 0 }];

      reset({
        invoiceDate: getLocalDateTimeString(),
        note: initialData.note ?? '',
        items,
      });

      // Nếu có item với discountPercent không nằm trong preset → hiện ô "Khác"
      const customRows: Record<string, boolean> = {};
      items.forEach((item, idx) => {
        if (!(DISCOUNT_PRESETS as readonly number[]).includes(item.discountPercent ?? 0)) {
          // field id chưa tồn tại lúc này, xử lý ở effect riêng bên dưới nếu cần
        }
      });
    } else {
      reset({
        invoiceDate: getLocalDateTimeString(),
        note: '',
        items: [{ productName: '', quantity: 1, unitPrice: 0, discountPercent: 0 }],
      });
    }
    setCustomDiscountRows({});
    setSelectedRows({});
    setBulkDiscountValue(0);
    setDiscountMode('ITEM');
    setInvoiceDiscountPercent(0);
  }, [isOpen, initialData, reset]);

  useKeyboardShortcut([
    {
      key: 'Enter',
      ctrl: true,
      callback: () =>
        append({ productName: '', quantity: 1, unitPrice: 0, discountPercent: 0 }),
    },
    {
      key: 'Escape',
      callback: () => onClose(),
    }
  ]);

  const handleFormSubmit = async (data: CreateEmergencyInvoiceInput) => {
    try {
      setSubmitting(true);
      await onSubmit({
        ...data,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate).toISOString() : data.invoiceDate,
      });
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePresetClick = (fieldId: string, index: number, value: number) => {
    setCustomDiscountRows((prev) => ({ ...prev, [fieldId]: false }));
    setValue(`items.${index}.discountPercent`, value, { shouldValidate: true });
  };

  const handleCustomClick = (fieldId: string) => {
    setCustomDiscountRows((prev) => ({ ...prev, [fieldId]: true }));
  };

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const allSelected = fields.length > 0 && fields.every((f) => selectedRows[f.id]);

  const toggleRowSelect = (fieldId: string) => {
    setSelectedRows((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows({});
    } else {
      const next: Record<string, boolean> = {};
      fields.forEach((f) => { next[f.id] = true; });
      setSelectedRows(next);
    }
  };

  const applyBulkDiscount = (value: number, isCustom: boolean) => {
    fields.forEach((field, index) => {
      if (selectedRows[field.id]) {
        setValue(`items.${index}.discountPercent`, value, { shouldValidate: true });
        setCustomDiscountRows((prev) => ({ ...prev, [field.id]: isCustom }));
      }
    });
  };

  const handleRemoveItem = (index: number, fieldId: string) => {
    remove(index);
    setSelectedRows((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal container */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">

        {/* ── HEADER ── */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-premium-border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-premium-primary" />
            <h2 className="text-sm font-black text-neutral-800 tracking-tight">
              Tạo hóa đơn nhanh
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── BODY (scrollable) ── */}
        <form
          id="create-invoice-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div ref={bodyScrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">

            {/* Row 1: Date + Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
                  Thời gian hóa đơn (tùy chọn)
                </label>
                <input
                  {...register('invoiceDate')}
                  type="datetime-local"
                  max={getLocalDateTimeString()} // ← thay vì new Date().toISOString().slice(0, 16)
                  className="w-full h-10 px-3 border border-premium-border rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all bg-white"
                />
                {errors.invoiceDate && (
                  <p className="text-[9px] text-red-500 font-bold mt-1">
                    {errors.invoiceDate.message}
                  </p>
                )}
              </div>

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

            {/* ── ITEMS SECTION ── */}
            <div className="space-y-3">

              {/* Toolbar: label + mode selector + add button */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
                    Danh sách sản phẩm
                  </label>
                  {/* Discount mode toggle */}
                  <select
                    value={discountMode}
                    onChange={(e) => setDiscountMode(e.target.value as 'ITEM' | 'INVOICE')}
                    className="h-7 rounded-lg border border-premium-border px-2 text-[10px] font-bold bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-premium-primary"
                  >
                    <option value="ITEM">CK từng sản phẩm</option>
                    <option value="INVOICE">CK toàn hóa đơn</option>
                  </select>
                  {/* Select-all link (only when > 1 item) */}
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-[9px] font-bold text-premium-primary hover:underline"
                    >
                      {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => append({ productName: '', quantity: 1, unitPrice: 0, discountPercent: 0 })}
                  className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 bg-premium-subtle hover:bg-premium-accent border border-premium-border rounded-xl text-[10px] font-black text-premium-primary transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm sản phẩm
                </button>
              </div>

              {/* Bulk discount bar – chỉ hiện khi có dòng được chọn */}
              {selectedCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-premium-primary/30 bg-premium-subtle px-3 py-2.5">
                  <span className="text-[10px] font-black text-premium-primary shrink-0">
                    Đã chọn {selectedCount} sản phẩm — áp chiết khấu nhóm:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {DISCOUNT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => applyBulkDiscount(preset, false)}
                        className="h-7 px-3 rounded-lg border border-premium-border bg-white text-[10px] font-black text-neutral-600 hover:bg-premium-accent transition-all"
                      >
                        {preset === 0 ? 'Không' : `${preset}%`}
                      </button>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={bulkDiscountValue || ''}
                        onChange={(e) => setBulkDiscountValue(Number(e.target.value))}
                        placeholder="% khác"
                        className="h-7 w-20 px-2 border border-premium-border rounded-lg text-[10px] font-bold text-neutral-800 bg-white focus:outline-none focus:ring-1 focus:ring-premium-primary"
                      />
                      <button
                        type="button"
                        onClick={() => applyBulkDiscount(bulkDiscountValue, true)}
                        className="h-7 px-3 rounded-lg bg-[image:var(--image-gold-gradient)] text-white text-[10px] font-black shadow-gold hover:opacity-90 transition-all"
                      >
                        Áp dụng
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRows({})}
                      className="h-7 px-2 rounded-lg text-[10px] font-bold text-neutral-400 hover:text-neutral-600 transition-all"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              )}

              {/* Column headers – desktop only */}
              {/*
               * Grid: 12 cols
               * [1] checkbox | [3] tên SP | [1] SL | [2] đơn giá | [3] chiết khấu | [1] thành tiền | [1] xoá
               */}
              <div className="hidden md:grid md:grid-cols-12 gap-2 px-1">
                <div className="col-span-1 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-premium-border text-premium-primary focus:ring-premium-primary cursor-pointer"
                  />
                </div>
                <div className="col-span-3 text-[9px] font-bold text-premium-muted uppercase tracking-wider">
                  Tên sản phẩm
                </div>
                <div className="col-span-1 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">
                  SL
                </div>
                <div className="col-span-2 text-[9px] font-bold text-premium-muted uppercase tracking-wider">
                  Đơn giá (₫)
                </div>
                <div className="col-span-3 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">
                  {discountMode === 'ITEM' ? 'Chiết khấu sỉ' : '—'}
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
                  const discount = Number(watchedItems?.[index]?.discountPercent) || 0;
                  const lineTotal =
                    discountMode === 'ITEM'
                      ? getLineTotal(qty, price, discount)
                      : qty * price;
                  const isCustom =
                    customDiscountRows[field.id] ??
                    !(DISCOUNT_PRESETS as readonly number[]).includes(discount);
                  const isSelected = selectedRows[field.id] ?? false;


                  return (
                    <div
                      key={field.id}
                      className={`rounded-2xl border p-3 space-y-2 transition-colors
                        md:rounded-none md:border-x-0 md:border-b md:border-t-0 md:p-0 md:py-2 md:space-y-0
                        md:grid md:grid-cols-12 md:gap-2 md:items-start
                        ${isSelected ? 'border-premium-primary/40 bg-premium-subtle/50' : 'border-premium-border bg-white'}`}
                    >
                      {/* [col-1] Checkbox – desktop; mobile: bên trong card dòng đầu */}
                      <div className="hidden md:col-span-1 md:flex md:items-center md:justify-center md:pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelect(field.id)}
                          className="h-4 w-4 rounded border-premium-border text-premium-primary focus:ring-premium-primary cursor-pointer"
                        />
                      </div>

                      {/* Mobile: checkbox + tên SP + nút xoá */}
                      <div className="flex items-start gap-2 md:contents">
                        {/* checkbox mobile */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelect(field.id)}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-premium-border text-premium-primary focus:ring-premium-primary cursor-pointer md:hidden"
                        />

                        {/* [col 2-4] Tên sản phẩm */}
                        <div className="flex-1 md:col-span-3">
                          <label className="mb-1 block text-[9px] font-bold text-premium-muted uppercase tracking-wider md:hidden">
                            Tên sản phẩm
                          </label>
                          <input
                            {...register(`items.${index}.productName`)}
                            type="text"
                            autoFocus={index === 0}
                            placeholder="Tên sản phẩm..."
                            className="w-full h-9 px-3 border border-premium-border rounded-xl text-xs font-semibold text-neutral-800 placeholder-premium-muted focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all"
                          />
                          {errors.items?.[index]?.productName && (
                            <p className="text-[9px] text-red-500 mt-0.5 font-bold">
                              {errors.items[index]?.productName?.message}
                            </p>
                          )}
                        </div>

                        {/* Nút xoá – mobile only */}
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index, field.id)}
                            className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-neutral-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 md:hidden"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* [col 5] SL + [col 6-7] Đơn giá */}
                      <div className="grid grid-cols-2 gap-2 md:contents">
                        {/* Quantity */}
                        <div className="md:col-span-1">
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
                        <div className="md:col-span-3 relative">
                          <label className="mb-1 block text-[9px] font-bold text-premium-muted uppercase tracking-wider md:hidden">
                            Đơn giá (₫)
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              {...register(`items.${index}.unitPrice`)}
                              type="text"
                              inputMode='numeric'
                              value={
                                priceInput[index] ??
                                formatPrice(watch(`items.${index}.unitPrice`) || 0)
                              }
                              onFocus={() => {
                                const price = watch(`items.${index}.unitPrice`);

                                setPriceInput(prev => ({
                                  ...prev,
                                  [index]:
                                    price > 0
                                      ? String(Math.floor(price / 1000))
                                      : "",
                                }));
                              }}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^\d,.]/g, "");

                                setPriceInput(prev => ({
                                  ...prev,
                                  [index]: value,
                                }));
                              }}
                              onBlur={(e) => {
                                const parsed = parsePrice(e.target.value);
                                setValue(
                                  `items.${index}.unitPrice`,
                                  parsed,
                                  {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  }
                                );

                                setPriceInput(prev => {
                                  const next = { ...prev };
                                  delete next[index];
                                  return next;
                                });
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();

                                  e.currentTarget.blur();
                                }
                              }}
                              min={0}
                              step={500}
                              placeholder="0"
                              onDoubleClick={(e) =>
                                setCalcOpen({ index, rect: e.currentTarget.getBoundingClientRect() })
                              }
                              className="w-full h-9 px-3 border border-premium-border rounded-xl text-xs font-bold text-right text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all"
                            />
                            <button
                              type="button"
                              onClick={(e) =>
                                setCalcOpen({ index, rect: e.currentTarget.getBoundingClientRect() })
                              }
                              title="Máy tính cộng dồn (nhấn đúp vào ô giá cũng mở được)"
                              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl border border-premium-border text-neutral-400 hover:text-premium-primary hover:border-premium-primary/40 transition-all"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {calcOpen?.index === index && (
                            <QuickPriceCalculator
                              anchorRect={calcOpen.rect}
                              onApply={(total) => {
                                setValue(`items.${index}.unitPrice`, total, { shouldValidate: true });
                                setPriceInput((prev) => {
                                  const next = { ...prev };
                                  delete next[index];
                                  return next;
                                });
                              }}
                              onClose={() => setCalcOpen(null)}
                            />
                          )}
                        </div>
                      </div>

                      {/* [col 8-10] Chiết khấu – ẩn khi mode INVOICE */}
                      <div className="md:col-span-2">
                        {discountMode === 'ITEM' ? (
                          <>
                            <label className="mb-1 block text-[9px] font-bold text-premium-muted uppercase tracking-wider md:hidden">
                              Chiết khấu sỉ
                            </label>

                            <select
                              value={
                                isCustom
                                  ? 'custom'
                                  : discount === 0
                                    ? '0'
                                    : String(discount)
                              }
                              onChange={(e) => {
                                const value = e.target.value;

                                if (value === 'custom') {
                                  handleCustomClick(field.id);
                                } else {
                                  handlePresetClick(field.id, index, Number(value));
                                }
                              }}
                              className="h-9 w-full rounded-xl border border-premium-border bg-white px-3 text-xs font-bold text-neutral-700 focus:outline-none focus:ring-1 focus:ring-premium-primary"
                            >
                              <option value="0">Không</option>
                              {DISCOUNT_PRESETS.filter((p) => p !== 0).map((preset) => (
                                <option key={preset} value={preset}>
                                  {preset}%
                                </option>
                              ))}
                              <option value="custom">Khác...</option>
                            </select>

                            {isCustom && (
                              <div className="relative mt-1.5">
                                <input
                                  {...register(`items.${index}.discountPercent`, {
                                    valueAsNumber: true,
                                  })}
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={0.5}
                                  placeholder="Nhập %"
                                  className="w-full h-9 rounded-xl border border-premium-border px-3 pr-7 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-premium-primary"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-premium-muted">
                                  %
                                </span>
                              </div>
                            )}

                            {errors.items?.[index]?.discountPercent && (
                              <p className="mt-0.5 text-[9px] font-bold text-red-500">
                                {errors.items[index]?.discountPercent?.message}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="flex h-9 items-center justify-center text-[10px] text-premium-muted">
                            —
                          </div>
                        )}
                      </div>

                      {/* [col 11] Thành tiền */}
                      <div className="flex items-center justify-between md:col-span-1 md:justify-end md:pt-1">
                        <span className="text-[9px] font-bold text-premium-muted uppercase tracking-wider md:hidden">
                          Thành tiền
                        </span>
                        <div className="text-right">
                          <span className="text-xs font-black text-neutral-700">
                            {lineTotal > 0
                              ? formatCurrency(lineTotal, 'vi').replace('₫', '').trim()
                              : '—'}
                          </span>
                          {discountMode === 'ITEM' && discount > 0 && qty * price > 0 && (
                            <p className="text-[9px] font-bold text-emerald-600">-{discount}%</p>
                          )}
                        </div>
                      </div>

                      {/* [col 12] Nút xoá – desktop only */}
                      <div className="hidden md:col-span-1 md:flex md:justify-end md:pt-0.5">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index, field.id)}
                            className="h-9 w-9 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Validation errors */}
              {errors.items?.root?.message && (
                <p className="text-xs text-red-500 font-bold">{errors.items.root.message}</p>
              )}
              {typeof errors.items?.message === 'string' && (
                <p className="text-xs text-red-500 font-bold">{errors.items.message}</p>
              )}
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-t border-premium-border bg-premium-bg/30">

            {/* Invoice-level discount input – chỉ hiện khi mode INVOICE */}
            {discountMode === 'INVOICE' && (
              <div className="mb-4 flex items-center gap-3">
                <span className="text-[10px] font-bold text-premium-muted uppercase tracking-wider shrink-0">
                  Chiết khấu toàn hóa đơn
                </span>
                <div className="relative w-32">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={invoiceDiscountPercent || ''}
                    onChange={(e) => setInvoiceDiscountPercent(Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-9 px-3 pr-7 border border-premium-border rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-premium-primary transition-all bg-white"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-premium-muted">
                    %
                  </span>
                </div>
                {invoiceDiscountPercent > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600">
                    Tiết kiệm {formatCurrency(subTotal * invoiceDiscountPercent / 100, 'vi')}
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Totals */}
              <div>
                {discountMode === 'INVOICE' && invoiceDiscountPercent > 0 && (
                  <p className="text-[10px] text-premium-muted font-bold line-through">
                    {formatCurrency(subTotal, 'vi')}
                  </p>
                )}
                <p className="text-[10px] text-premium-muted font-bold uppercase tracking-wider">
                  Tổng cộng
                </p>
                <p className="text-2xl font-black text-neutral-900 mt-0.5 tracking-tight">
                  {formatCurrency(grandTotal, 'vi')}
                </p>
              </div>

              {/* Actions */}
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
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      Tạo hóa đơn
                    </>
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