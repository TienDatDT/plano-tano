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

  const isItemDiscount = invoice.discountMode === 'ITEM';
  const isInvoiceDiscount = invoice.discountMode === 'INVOICE';
  const subTotal =
    invoice.items?.reduce((sum, item) => {
      return sum + Number(item.quantity) * Number(item.unitPrice);
    }, 0) ?? 0;

  const totalDiscount = subTotal - Number(invoice.totalAmount);
  const hasInvoiceDiscount = totalDiscount > 0 && !hasDiscount;
  const showDiscountColumn = isItemDiscount && hasDiscount;

  const invoiceDiscountPercent =
    subTotal > 0
      ? Math.round((totalDiscount / subTotal) * 100 * 10) / 10
      : 0;
  console.log({
    subTotal,
    totalAmount: invoice.totalAmount,
    totalDiscount,
    hasDiscount,
    hasInvoiceDiscount,
    discountMode: invoice.discountMode,
  });
  return (
    <div
      ref={ref}
      style={{ width: 302 }} // tăng nhẹ để chứa chữ to hơn (80mm - margin, ~302px)
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
        <h1 className="text-2xl font-black uppercase tracking-widest text-center mb-1 text-black">
          Nhà sách Kim Ngân
        </h1>
        <p className="text-black text-sm text-center leading-snug font-medium">
          Chuyên cung cấp văn phòng phẩm, sách giáo khoa, dụng cụ học tập...
        </p>
        <p className="text-black text-sm text-center mt-0.5 font-medium">
          Địa chỉ: 242 Ấp Thị 1, xã Long Điền, tỉnh An Giang.
        </p>
        <p className="text-black text-sm text-center font-medium">
          SĐT/ Zalo : 0397 169 935
        </p>
      </div>

      {/* ── TITLE ── */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold uppercase tracking-wider mb-1 text-black">
          Hóa Đơn Bán Hàng
        </h2>
        <p className="text-base font-bold text-black">Mã: {invoice.invoiceCode}</p>
        <p className="text-sm text-black font-medium mt-0.5">Ngày: {formattedDate}</p>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table className="w-full text-left border-collapse mb-4">
        <thead>
          <tr className="border-y-2 border-black">
            <th className="py-1.5 pr-1 w-6 text-center font-bold text-base text-black">#</th>
            <th className="py-1.5 px-1 font-bold text-base text-black">Sản phẩm</th>
            <th className="py-1.5 px-1 w-8 text-center font-bold text-base text-black">SL</th>
            {showDiscountColumn && (
              <th className="py-1.5 px-1 w-10 text-center font-bold text-base text-black">
                CK
              </th>
            )}
            <th className="py-1.5 pl-1 w-20 text-right font-bold text-base text-black">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => {
            const discountPercent =
              Number((item as { discountPercent?: number }).discountPercent) || 0;

            const originalPrice = Number(item.quantity) * Number(item.unitPrice);

            // Chỉ giảm từng dòng khi đang dùng chiết khấu theo sản phẩm
            const lineTotal =
              showDiscountColumn
                ? originalPrice - (originalPrice * discountPercent) / 100
                : originalPrice;

            return (
              <tr key={item.id} className="border-b border-gray-700">
                <td className="py-2.5 pr-1 text-center text-black text-sm font-medium">{index + 1}</td>
                <td className="py-2.5 px-1 text-sm leading-snug">
                  <div className="font-bold text-black text-base">{item.productName}</div>
                  {/* Đơn giá xuống dòng cho gọn trên khổ 80mm */}
                  <div className="text-black text-sm font-medium">
                    {new Intl.NumberFormat('vi-VN').format(Number(item.unitPrice))} x {item.quantity}
                  </div>
                </td>
                <td className="py-2.5 px-1 text-center text-sm font-bold text-black">{item.quantity}</td>
                {showDiscountColumn && (
                  <td className="py-2.5 px-1 text-center">
                    {discountPercent > 0 ? (
                      <span className="inline-block bg-gray-200 rounded px-1 py-0.5 text-black font-bold text-base">
                        -{discountPercent}%
                      </span>
                    ) : (
                      <span className="text-black text-sm">—</span>
                    )}
                  </td>
                )}
                <td className="py-2.5 pl-1 text-right font-bold text-base text-black">
                  {showDiscountColumn && discountPercent > 0 && (
                    <div className="text-black line-through font-medium text-base mb-0.5">
                      {new Intl.NumberFormat('vi-VN').format(originalPrice)}
                    </div>
                  )}
                  <div className="text-base">
                    {new Intl.NumberFormat('vi-VN').format(lineTotal)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── TOTALS ── */}
      <div className="flex flex-col items-end mb-4 border-t-2 border-black pt-3 space-y-1.5">

        {(isItemDiscount || isInvoiceDiscount) && (
          <div className="flex justify-between w-full">
            <span className="text-black text-sm font-medium">Tạm tính:</span>
            <span className="text-black text-sm font-bold">
              {new Intl.NumberFormat('vi-VN').format(subTotal)} ₫
            </span>
          </div>
        )}

        {isItemDiscount && totalDiscount > 0 && (
          <div className="flex justify-between w-full">
            <span className="text-black text-sm font-medium">Chiết khấu:</span>
            <span className="text-sm font-bold text-black">
              -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
            </span>
          </div>
        )}

        {isInvoiceDiscount && invoiceDiscountPercent > 0 && (
          <div className="flex justify-between w-full">
            <span className="text-black text-sm font-medium">
              Chiết khấu HĐ ({invoiceDiscountPercent}%):
            </span>
            <span className="text-sm font-bold text-black">
              -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
            </span>
          </div>
        )}

        {(hasDiscount || hasInvoiceDiscount) && (
          <div className="w-full border-t border-black pt-1" />
        )}

        <div className="flex justify-between w-full items-baseline">
          <span className="font-bold uppercase text-base tracking-wide text-black">Tổng cộng:</span>
          <span className="font-black text-3xl text-black">
            {formatCurrency(Number(invoice.totalAmount), 'vi')}
          </span>
        </div>

        {invoice.note && (
          <div className="w-full mt-1 text-lg italic text-black font-medium border-t border-gray-700 pt-2">
            <strong>Ghi chú:</strong> {invoice.note}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="text-center mt-6 pt-4 border-t border-black">
        <p className="font-bold text-base mb-1 text-black">Cảm ơn quý khách!</p>
        <p className="text-black text-sm font-medium">Hẹn gặp lại</p>
      </div>
    </div>
  );
});

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';