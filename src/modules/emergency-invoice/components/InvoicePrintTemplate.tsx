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

  const hasDiscount = invoice.items?.some(
    (item) => Number((item as { discountPercent?: number }).discountPercent) > 0
  );

  const subTotal =
    invoice.items?.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.unitPrice);
    }, 0) ?? 0;

  const totalDiscount = subTotal - Number(invoice.totalAmount);
  const hasInvoiceDiscount = totalDiscount > 0 && !hasDiscount;

  return (
    <div
      ref={ref}
      style={{ width: 272 }} // 80mm - 2x5mm margin = 70mm ≈ 265px → 272px
      className="bg-white text-black"
    >
      <style type="text/css" media="print">
        {`
          @page { size: 80mm auto; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `}
      </style>

      {/* ── HEADER ── */}
      <div className="flex flex-col items-center mb-4 border-b-2 border-gray-300 pb-3">
        <h1 className="text-lg font-black uppercase tracking-widest text-center mb-1">
          Nhà sách Kim Ngân
        </h1>
        <p className="text-gray-600 text-xs text-center leading-snug">
          Chuyên cung cấp văn phòng phẩm, sách giáo khoa, dụng cụ học tập...
        </p>
        <p className="text-gray-800 text-xs text-center mt-0.5">
          Địa chỉ: 242 Tỉnh lộ 942, Long Điền, An Giang
        </p>
        <p className="text-gray-800 text-xs text-center">
          SĐT: 0296 3625 370
        </p>
      </div>

      {/* ── TITLE ── */}
      <div className="text-center mb-4">
        <h2 className="text-base font-bold uppercase tracking-wider mb-1">
          Hóa Đơn Bán Hàng
        </h2>
        <p className="text-xs font-semibold">Mã: {invoice.invoiceCode}</p>
        <p className="text-xs text-gray-600 mt-0.5">Ngày: {formattedDate}</p>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table className="w-full text-left border-collapse mb-4">
        <thead>
          <tr className="border-y-2 border-gray-800">
            <th className="py-1.5 pr-1 w-6 text-center font-bold text-xs">#</th>
            <th className="py-1.5 px-1 font-bold text-xs">Sản phẩm</th>
            <th className="py-1.5 px-1 w-8 text-center font-bold text-xs">SL</th>
            {hasDiscount && (
              <th className="py-1.5 px-1 w-10 text-center font-bold text-xs">CK</th>
            )}
            <th className="py-1.5 pl-1 w-20 text-right font-bold text-xs">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => {
            const discountPercent =
              Number((item as { discountPercent?: number }).discountPercent) || 0;
            const originalPrice = Number(item.quantity) * Number(item.unitPrice);
            const lineTotal = originalPrice - (originalPrice * discountPercent) / 100;

            return (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2 pr-1 text-center text-gray-500 text-xs">{index + 1}</td>
                <td className="py-2 px-1 text-xs leading-snug">
                  <div className="font-semibold">{item.productName}</div>
                  {/* Đơn giá xuống dòng cho gọn trên khổ 80mm */}
                  <div className="text-gray-500 text-[10px]">
                    {new Intl.NumberFormat('vi-VN').format(Number(item.unitPrice))} x {item.quantity}
                  </div>
                </td>
                <td className="py-2 px-1 text-center text-xs">{item.quantity}</td>
                {hasDiscount && (
                  <td className="py-2 px-1 text-center">
                    {discountPercent > 0 ? (
                      <span className="inline-block bg-gray-100 rounded px-1 py-0.5 text-gray-700 font-bold text-[10px]">
                        -{discountPercent}%
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                )}
                <td className="py-2 pl-1 text-right font-bold text-xs">
                  {discountPercent > 0 && (
                    <div className="text-gray-400 line-through font-normal text-[10px] mb-0.5">
                      {new Intl.NumberFormat('vi-VN').format(originalPrice)}
                    </div>
                  )}
                  <div>{new Intl.NumberFormat('vi-VN').format(lineTotal)}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── TOTALS ── */}
      <div className="flex flex-col items-end mb-4 border-t-2 border-gray-800 pt-3 space-y-1.5">

        {(hasDiscount || hasInvoiceDiscount) && (
          <div className="flex justify-between w-full">
            <span className="text-gray-500 text-xs">Tạm tính:</span>
            <span className="text-gray-600 text-xs">
              {new Intl.NumberFormat('vi-VN').format(subTotal)} ₫
            </span>
          </div>
        )}

        {hasDiscount && totalDiscount > 0 && (
          <div className="flex justify-between w-full">
            <span className="text-gray-500 text-xs">Chiết khấu:</span>
            <span className="text-xs font-bold text-gray-700">
              -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
            </span>
          </div>
        )}

        {hasInvoiceDiscount && (
          <div className="flex justify-between w-full">
            <span className="text-gray-500 text-xs">
              Chiết khấu HĐ
              {(() => {
                const pct = Math.round((totalDiscount / subTotal) * 100 * 10) / 10;
                return pct > 0 ? ` (${pct}%)` : '';
              })()}:
            </span>
            <span className="text-xs font-bold text-gray-700">
              -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
            </span>
          </div>
        )}

        {(hasDiscount || hasInvoiceDiscount) && (
          <div className="w-full border-t border-gray-300 pt-1" />
        )}

        <div className="flex justify-between w-full items-baseline">
          <span className="font-bold uppercase text-xs tracking-wide">Tổng cộng:</span>
          <span className="font-black text-xl">
            {formatCurrency(Number(invoice.totalAmount), 'vi')}
          </span>
        </div>

        {invoice.note && (
          <div className="w-full mt-1 text-xs italic text-gray-600 border-t border-gray-200 pt-2">
            Ghi chú: {invoice.note}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="text-center mt-6 pt-4 border-t border-gray-300">
        <p className="font-bold text-sm mb-1">Cảm ơn quý khách!</p>
        <p className="text-gray-500 text-xs">Hẹn gặp lại</p>
      </div>
    </div>
  );
});

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';