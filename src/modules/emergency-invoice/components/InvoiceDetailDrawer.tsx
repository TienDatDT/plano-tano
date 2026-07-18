'use client';

import { X, Printer } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/formatters';
import type { EmergencyInvoice } from '../types/emergency-invoice.types';

interface Props {
  invoice: EmergencyInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (invoice: EmergencyInvoice) => void;
}

export function InvoiceDetailDrawer({ invoice, isOpen, onClose, onPrint }: Props) {
  if (!isOpen || !invoice) return null;

  const invoiceDate = new Date(invoice.invoiceDate ?? invoice.createdAt);
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(invoiceDate);

  // ── Tính toán chiết khấu ──
  const hasDiscount = invoice.items?.some(
    (item) => Number((item as { discountPercent?: number }).discountPercent) > 0
  );

  const subTotal =
    invoice.items?.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.unitPrice);
    }, 0) ?? 0;

  const totalDiscount = subTotal - Number(invoice.totalAmount);
  const hasInvoiceDiscount = totalDiscount > 0 && !hasDiscount;
  const showDiscountSection = totalDiscount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-premium-border bg-premium-bg/50">
          <div>
            <h2 className="text-sm font-black text-neutral-900">{invoice.invoiceCode}</h2>
            <p className="text-[10px] text-premium-muted font-semibold mt-0.5">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(invoice)}
              className="h-8 w-8 rounded-xl hover:bg-white border border-transparent hover:border-premium-border flex items-center justify-center text-indigo-500 hover:text-indigo-700 transition-all"
              title="In / Xuất PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl hover:bg-white border border-transparent hover:border-premium-border flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── ITEMS ── */}
        <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
          {invoice.items && invoice.items.length > 0 ? (
            <>
              {/* Table header */}
              <div className={`grid gap-2 pb-2 border-b border-slate-100 ${hasDiscount ? 'grid-cols-13' : 'grid-cols-12'}`}>
                <span className="col-span-1 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">
                  #
                </span>
                <span className={`${hasDiscount ? 'col-span-3' : 'col-span-4'} text-[9px] font-bold text-premium-muted uppercase tracking-wider`}>
                  Sản phẩm
                </span>
                <span className="col-span-2 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">
                  SL
                </span>
                <span className="col-span-3 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-right">
                  Đơn giá
                </span>
                {hasDiscount && (
                  <span className="col-span-1 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">
                    CK
                  </span>
                )}
                <span className="col-span-3 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-right">
                  T.Tiền
                </span>
              </div>

              {/* Rows */}
              {invoice.items.map((item, index) => {
                const discountPercent =
                  Number((item as { discountPercent?: number }).discountPercent) || 0;
                const originalPrice = Number(item.quantity) * Number(item.unitPrice);
                const lineTotal = originalPrice - (originalPrice * discountPercent) / 100;

                return (
                  <div
                    key={item.id}
                    className={`grid gap-2 py-1.5 border-b border-slate-50 items-start ${hasDiscount ? 'grid-cols-13' : 'grid-cols-12'}`}
                  >
                    <span className="col-span-1 text-[10px] text-premium-muted text-center pt-0.5">
                      {index + 1}
                    </span>
                    <span className={`${hasDiscount ? 'col-span-3' : 'col-span-4'} text-xs font-semibold text-neutral-800 break-words leading-tight`}>
                      {item.productName}
                    </span>
                    <span className="col-span-2 text-xs font-bold text-neutral-600 text-center pt-0.5">
                      x{item.quantity}
                    </span>
                    <span className="col-span-3 text-xs text-neutral-500 text-right pt-0.5">
                      {new Intl.NumberFormat('vi-VN').format(Number(item.unitPrice))}
                    </span>

                    {/* Cột chiết khấu — chỉ render khi có ít nhất 1 dòng có CK */}
                    {hasDiscount && (
                      <span className="col-span-1 text-center pt-0.5">
                        {discountPercent > 0 ? (
                          <span className="inline-block text-[9px] font-black text-emerald-600 bg-emerald-50 rounded px-1 py-0.5 leading-none">
                            -{discountPercent}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300">—</span>
                        )}
                      </span>
                    )}

                    {/* Thành tiền */}
                    <div className="col-span-3 text-right">
                      {discountPercent > 0 && (
                        <p className="text-[9px] text-slate-400 line-through leading-none mb-0.5">
                          {new Intl.NumberFormat('vi-VN').format(originalPrice)}
                        </p>
                      )}
                      <span className="text-xs font-bold text-neutral-800">
                        {new Intl.NumberFormat('vi-VN').format(lineTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="text-xs text-neutral-400 italic text-center py-4">Không có sản phẩm</p>
          )}
        </div>

        {/* ── GHI CHÚ ── */}
        {invoice.note && (
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
            <p className="text-[10px] text-amber-700 font-semibold italic">📝 {invoice.note}</p>
          </div>
        )}

        {/* ── FOOTER TỔNG ── */}
        <div className="px-6 py-5 border-t border-premium-border bg-premium-bg/30 space-y-2">

          {/* Tạm tính + chiết khấu — chỉ hiện khi có giảm giá */}
          {showDiscountSection && (
            <div className="space-y-1.5 pb-2 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-premium-muted font-semibold">Tạm tính</span>
                <span className="text-xs text-neutral-500">
                  {new Intl.NumberFormat('vi-VN').format(subTotal)} ₫
                </span>
              </div>

              {/* CK từng sản phẩm */}
              {hasDiscount && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-premium-muted font-semibold">Chiết khấu SP</span>
                  <span className="text-xs font-bold text-emerald-600">
                    -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
                  </span>
                </div>
              )}

              {/* CK toàn hóa đơn */}
              {hasInvoiceDiscount && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-premium-muted font-semibold">
                    Chiết khấu HĐ
                    {(() => {
                      const pct = Math.round((totalDiscount / subTotal) * 100 * 10) / 10;
                      return pct > 0 ? ` (${pct}%)` : '';
                    })()}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tổng cộng */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-premium-muted uppercase tracking-wider">
              Tổng cộng
            </span>
            <span className="text-xl font-black text-neutral-900">
              {formatCurrency(Number(invoice.totalAmount), 'vi')}
            </span>
          </div>

          {/* Ngày tạo / cập nhật */}
          <div className="flex items-center justify-between text-[10px] text-premium-muted font-medium border-t border-slate-200 pt-3">
            <span>Ngày tạo: {new Date(invoice.createdAt).toLocaleString('vi-VN')}</span>
            <span>Cập nhật: {new Date(invoice.updatedAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}