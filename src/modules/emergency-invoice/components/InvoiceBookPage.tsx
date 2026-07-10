'use client';

import React from 'react';
import { formatCurrency } from '@/shared/lib/formatters';
import type { EmergencyInvoice } from '../types/emergency-invoice.types';

interface InvoiceBookPageProps {
  invoice: EmergencyInvoice;
}

// forwardRef bắt buộc để react-pageflip điều khiển trang,
// đồng thời dùng chính ref này để chụp html2canvas khi export PDF
const InvoiceBookPage = React.forwardRef<HTMLDivElement, InvoiceBookPageProps>(
  ({ invoice }, ref) => {
    const total =
      invoice.totalAmount;

    return (
      <div
        ref={ref}
        className="page bg-white w-full h-full p-6 flex flex-col border border-premium-border"
      >
        <div className="mb-4 border-b border-premium-border pb-3">
          <h3 className="text-sm font-black text-neutral-900">
            Hóa đơn {invoice.invoiceCode}
          </h3>
          <p className="text-[10px] text-premium-muted font-semibold mt-0.5">
            {new Date(invoice.invoiceDate).toLocaleString('vi-VN')}
          </p>
          {invoice.note && (
            <p className="text-[10px] text-neutral-500 italic mt-1">{invoice.note}</p>
          )}
        </div>

        <div className="flex-1 space-y-1.5 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-premium-muted uppercase tracking-wider px-1">
            <div className="col-span-6">Tên sản phẩm</div>
            <div className="col-span-2 text-center">SL</div>
            <div className="col-span-4 text-right">Thành tiền</div>
          </div>

          {invoice.items?.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 text-xs px-1 py-0.5">
              <div className="col-span-6 font-semibold text-neutral-800 truncate">
                {item.productName}
              </div>
              <div className="col-span-2 text-center font-bold text-neutral-700">
                {item.quantity}
              </div>
              <div className="col-span-4 text-right font-black text-neutral-900">
                {formatCurrency(item.quantity * Number(item.unitPrice), 'vi')}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-premium-border flex items-center justify-between">
          <span className="text-[10px] font-bold text-premium-muted uppercase tracking-wider">
            Tổng cộng
          </span>
          <span className="text-base font-black text-neutral-900">
            {formatCurrency(total, 'vi')}
          </span>
        </div>
      </div>
    );
  }
);

InvoiceBookPage.displayName = 'InvoiceBookPage';
export default InvoiceBookPage;