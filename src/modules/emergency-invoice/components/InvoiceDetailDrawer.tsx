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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
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

        {/* Items */}
        <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
          {invoice.items && invoice.items.length > 0 ? (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-100">
                <span className="col-span-1 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">#</span>
                <span className="col-span-4 text-[9px] font-bold text-premium-muted uppercase tracking-wider">Sản phẩm</span>
                <span className="col-span-2 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-center">SL</span>
                <span className="col-span-3 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-right">Đơn giá</span>
                <span className="col-span-2 text-[9px] font-bold text-premium-muted uppercase tracking-wider text-right">T.Tiền</span>
              </div>

              {invoice.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 py-1.5 border-b border-slate-50 items-center">
                  <span className="col-span-1 text-[10px] text-premium-muted text-center">{index + 1}</span>
                  <span className="col-span-4 text-xs font-semibold text-neutral-800 truncate">{item.productName}</span>
                  <span className="col-span-2 text-xs font-bold text-neutral-600 text-center">x{item.quantity}</span>
                  <span className="col-span-3 text-xs text-neutral-500 text-right">
                    {new Intl.NumberFormat('vi-VN').format(Number(item.unitPrice))}
                  </span>
                  <span className="col-span-2 text-xs font-bold text-neutral-800 text-right">
                    {new Intl.NumberFormat('vi-VN').format(Number(item.totalPrice))}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p className="text-xs text-neutral-400 italic text-center py-4">Không có sản phẩm</p>
          )}
        </div>

        {/* Note */}
        {invoice.note && (
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
            <p className="text-[10px] text-amber-700 font-semibold italic">📝 {invoice.note}</p>
          </div>
        )}

        {/* Footer total */}
        <div className="px-6 py-5 border-t border-premium-border bg-premium-bg/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-premium-muted uppercase tracking-wider">Tổng cộng</span>
            <span className="text-xl font-black text-neutral-900">
              {formatCurrency(Number(invoice.totalAmount), 'vi')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-premium-muted font-medium border-t border-slate-200 pt-3">
            <span>Ngày tạo: {new Date(invoice.createdAt).toLocaleString('vi-VN')}</span>
            <span>Cập nhật: {new Date(invoice.updatedAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
