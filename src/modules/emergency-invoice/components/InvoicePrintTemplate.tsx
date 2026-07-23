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
      <div className="flex flex-col items-center mb-4 border-b-2 border-black pb-3">
        <h1 className="text-xl font-black uppercase tracking-widest text-center mb-1 text-black">
          Nhà sách Kim Ngân
        </h1>
        <p className="text-black text-xs text-center leading-snug font-medium">
          Chuyên cung cấp văn phòng phẩm, sách giáo khoa, dụng cụ học tập...
        </p>
        <p className="text-black text-xs text-center mt-0.5 font-medium">
          Địa chỉ: 242 Ấp Thị 1, xã Long Điền, tỉnh An Giang.
        </p>
        <p className="text-black text-xs text-center font-medium">
          SĐT/ Zalo : 0397 169 935
        </p>
      </div>

      {/* ── TITLE ── */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-1 text-black">
          Hóa Đơn Bán Hàng
        </h2>
        <p className="text-sm font-bold text-black">Mã: {invoice.invoiceCode}</p>
        <p className="text-xs text-black font-medium mt-0.5">Ngày: {formattedDate}</p>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table className="w-full text-left border-collapse mb-4">
        <thead>
          <tr className="border-y-2 border-black">
            <th className="py-1.5 pr-1 w-6 text-center font-bold text-xs text-black">#</th>
            <th className="py-1.5 px-1 font-bold text-xs text-black">Sản phẩm</th>
            <th className="py-1.5 px-1 w-8 text-center font-bold text-xs text-black">SL</th>
            {hasDiscount && (
              <th className="py-1.5 px-1 w-10 text-center font-bold text-xs text-black">CK</th>
            )}
            <th className="py-1.5 pl-1 w-20 text-right font-bold text-xs text-black">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => {
            const discountPercent =
              Number((item as { discountPercent?: number }).discountPercent) || 0;
            const originalPrice = Number(item.quantity) * Number(item.unitPrice);
            const lineTotal = originalPrice - (originalPrice * discountPercent) / 100;

            return (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="py-2 pr-1 text-center text-black text-xs font-medium">{index + 1}</td>
                <td className="py-2 px-1 text-xs leading-snug">
                  <div className="font-bold text-black">{item.productName}</div>
                  {/* Đơn giá xuống dòng cho gọn trên khổ 80mm */}
                  <div className="text-black text-xs font-medium">
                    {new Intl.NumberFormat('vi-VN').format(Number(item.unitPrice))} x {item.quantity}
                  </div>
                </td>
                <td className="py-2 px-1 text-center text-xs font-bold text-black">{item.quantity}</td>
                {hasDiscount && (
                  <td className="py-2 px-1 text-center">
                    {discountPercent > 0 ? (
                      <span className="inline-block bg-gray-200 rounded px-1 py-0.5 text-black font-bold text-xs">
                        -{discountPercent}%
                      </span>
                    ) : (
                      <span className="text-black text-xs">—</span>
                    )}
                  </td>
                )}
                <td className="py-2 pl-1 text-right font-bold text-xs text-black">
                  {discountPercent > 0 && (
                    <div className="text-black line-through font-medium text-xs mb-0.5">
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
      <div className="flex flex-col items-end mb-4 border-t-2 border-black pt-3 space-y-1.5">

        {(hasDiscount || hasInvoiceDiscount) && (
          <div className="flex justify-between w-full">
            <span className="text-black text-xs font-medium">Tạm tính:</span>
            <span className="text-black text-xs font-bold">
              {new Intl.NumberFormat('vi-VN').format(subTotal)} ₫
            </span>
          </div>
        )}

        {hasDiscount && totalDiscount > 0 && (
          <div className="flex justify-between w-full">
            <span className="text-black text-xs font-medium">Chiết khấu:</span>
            <span className="text-xs font-bold text-black">
              -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
            </span>
          </div>
        )}

        {hasInvoiceDiscount && (
          <div className="flex justify-between w-full">
            <span className="text-black text-xs font-medium">
              Chiết khấu HĐ
              {(() => {
                const pct = Math.round((totalDiscount / subTotal) * 100 * 10) / 10;
                return pct > 0 ? ` (${pct}%)` : '';
              })()}:
            </span>
            <span className="text-xs font-bold text-black">
              -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
            </span>
          </div>
        )}

        {(hasDiscount || hasInvoiceDiscount) && (
          <div className="w-full border-t border-black pt-1" />
        )}

        <div className="flex justify-between w-full items-baseline">
          <span className="font-bold uppercase text-sm tracking-wide text-black">Tổng cộng:</span>
          <span className="font-black text-2xl text-black">
            {formatCurrency(Number(invoice.totalAmount), 'vi')}
          </span>
        </div>

        {invoice.note && (
          <div className="w-full mt-1 text-xs italic text-black font-medium border-t border-gray-700 pt-2">
            Ghi chú: {invoice.note}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="text-center mt-6 pt-4 border-t border-black">
        <p className="font-bold text-sm mb-1 text-black">Cảm ơn quý khách!</p>
        <p className="text-black text-xs font-medium">Hẹn gặp lại</p>
      </div>
    </div>
  );
});

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';