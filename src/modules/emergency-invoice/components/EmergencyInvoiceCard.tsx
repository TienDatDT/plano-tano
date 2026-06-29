'use client';

import { Trash2, Eye, Edit3, Printer } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/formatters';
import type { EmergencyInvoice } from '../types/emergency-invoice.types';

interface Props {
  invoice: EmergencyInvoice;
  index: number;
  onDelete: (id: string) => void;
  onView: (invoice: EmergencyInvoice) => void;
  onEdit: (invoice: EmergencyInvoice) => void;
  onPrint: (invoice: EmergencyInvoice) => void;
}

// Pastel color palette for sticky notes – cycles by index
const CARD_COLORS = [
  {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    header: 'bg-amber-100',
    code: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    header: 'bg-sky-100',
    code: 'text-sky-700',
    dot: 'bg-sky-400',
  },
  {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    header: 'bg-emerald-100',
    code: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    header: 'bg-rose-100',
    code: 'text-rose-700',
    dot: 'bg-rose-400',
  },
  {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    header: 'bg-violet-100',
    code: 'text-violet-700',
    dot: 'bg-violet-400',
  },
];

// Deterministic slight random rotation per card (based on index)
const ROTATIONS = [-2, 1.5, -1, 2, -1.5, 1, -0.5, 2, -1, 1.5];

export function EmergencyInvoiceCard({ invoice, index, onDelete, onView, onEdit, onPrint }: Props) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const rotation = ROTATIONS[index % ROTATIONS.length];

  const invoiceDate = new Date(invoice.invoiceDate ?? invoice.createdAt);
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(invoiceDate);

  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`${color.bg} ${color.border} border rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] hover:rotate-0 cursor-pointer group flex flex-col overflow-hidden`}
    >
      {/* Header strip */}
      <div className={`${color.header} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
          <span className={`text-xs font-black ${color.code} tracking-wide`}>
            {invoice.invoiceCode}
          </span>
        </div>
        <span className="text-[10px] text-neutral-500 font-semibold">{formattedDate}</span>
      </div>

      {/* Body – product list */}
      <div className="px-4 py-3 flex-1 space-y-1.5" onClick={() => onView(invoice)}>
        {invoice.items && invoice.items.length > 0 ? (
          invoice.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-700 truncate flex-1">
                {item.productName}
              </span>
              <span className="text-xs text-neutral-500 font-bold shrink-0">
                x{item.quantity}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-neutral-400 italic">Không có sản phẩm</p>
        )}

        {invoice.note && (
          <p className="text-[10px] text-neutral-400 italic pt-1 border-t border-neutral-200 mt-2">
            {invoice.note}
          </p>
        )}
      </div>

      {/* Footer – total + actions */}
      <div className="px-4 py-3 border-t border-neutral-200/70 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Tổng tiền</p>
          <p className="text-base font-black text-neutral-800">
            {formatCurrency(Number(invoice.totalAmount), 'vi')}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(invoice);
            }}
            className="h-7 w-7 rounded-lg bg-white/80 hover:bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-blue-600 transition-colors shadow-sm"
            title="Xem chi tiết"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(invoice);
            }}
            className="h-7 w-7 rounded-lg bg-white/80 hover:bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-amber-600 transition-colors shadow-sm"
            title="Chỉnh sửa"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrint(invoice);
            }}
            className="h-7 w-7 rounded-lg bg-white/80 hover:bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-indigo-600 transition-colors shadow-sm"
            title="In hóa đơn"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(invoice.id);
            }}
            className="h-7 w-7 rounded-lg bg-white/80 hover:bg-red-50 border border-neutral-200 hover:border-red-200 flex items-center justify-center text-neutral-600 hover:text-red-600 transition-colors shadow-sm"
            title="Xóa hóa đơn"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
