import React from 'react';
import { formatCurrency } from '@/shared/lib/formatters';
import type { EmergencyInvoice } from '../types/emergency-invoice.types';

interface Props {
  invoice: EmergencyInvoice;
}

export const InvoicePrintTemplate = React.forwardRef<HTMLDivElement, Props>(({ invoice }, ref) => {
  const invoiceDate = new Date(invoice.invoiceDate ?? invoice.createdAt);
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(invoiceDate);

  return (
    <div ref={ref} className="p-8 bg-white text-black text-sm max-w-[800px] mx-auto hidden print:block print:p-0">
      {/* Print Specific Styles - This class hides the content normally, but shows it on print */}
      <style type="text/css" media="print">
        {`
          @page { size: A5; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-hidden { display: none !important; }
        `}
      </style>

      {/* Header */}
      <div className="flex flex-col items-center mb-8 border-b pb-4 border-gray-300">
        <h1 className="text-2xl font-black uppercase tracking-widest text-center mb-2">TanaPlano</h1>
        <p className="text-gray-600 text-xs text-center">Quản lý Cửa Hàng Chuyên Nghiệp</p>
        <p className="text-gray-600 text-xs text-center mt-1">SĐT: 1900 xxxx - Email: support@tanaplano.vn</p>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Hóa Đơn Bán Hàng</h2>
        <p className="text-sm font-semibold">Mã: {invoice.invoiceCode}</p>
        <p className="text-sm text-gray-600 mt-1">Ngày: {formattedDate}</p>
      </div>

      {/* Items Table */}
      <div className="w-full mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-y-2 border-gray-800">
              <th className="py-2 pr-2 w-10 text-center font-bold">STT</th>
              <th className="py-2 px-2 font-bold">Sản phẩm</th>
              <th className="py-2 px-2 w-16 text-center font-bold">SL</th>
              <th className="py-2 px-2 w-28 text-right font-bold">Đơn giá</th>
              <th className="py-2 pl-2 w-32 text-right font-bold">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 pr-2 text-center text-gray-600">{index + 1}</td>
                <td className="py-3 px-2 font-semibold">{item.productName}</td>
                <td className="py-3 px-2 text-center">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-gray-600">
                  {new Intl.NumberFormat('vi-VN').format(Number(item.unitPrice))}
                </td>
                <td className="py-3 pl-2 text-right font-bold">
                  {new Intl.NumberFormat('vi-VN').format(Number(item.totalPrice))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex flex-col items-end mb-8 border-t-2 border-gray-800 pt-4">
        <div className="flex justify-between w-64 mb-2">
          <span className="font-bold text-gray-600 uppercase">Tổng cộng:</span>
          <span className="font-black text-xl">
            {formatCurrency(Number(invoice.totalAmount), 'vi')}
          </span>
        </div>
        {invoice.note && (
          <div className="w-full mt-4 text-sm italic text-gray-600">
            Ghi chú: {invoice.note}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 pt-8 border-t border-gray-300">
        <p className="font-bold text-lg mb-1">Cảm ơn quý khách!</p>
        <p className="text-gray-500 text-xs">Hẹn gặp lại</p>
      </div>
    </div>
  );
});

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';
