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

  return (
    <div
      ref={ref}
      style={{ width: 302, marginTop: 0 }}
      className="bg-white text-black"
    >
      <style type="text/css" media="print">
        {`
          @page { size: 80mm auto; margin: 0mm 3mm; }
          html, body { margin: 0 !important; padding: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `}
      </style>

      {/* ── HEADER ── */}
      <div className="flex flex-col items-center mb-1.5 border-b border-black pb-1.5">
        <h1 className="text-lg font-black uppercase tracking-wide text-center leading-tight text-black">
          Nhà sách Kim Ngân
        </h1>
        <p className="text-black text-[11px] text-center leading-tight font-medium">
          Chuyên cung cấp văn phòng phẩm, sách giáo khoa, dụng cụ học tập...
        </p>
        <p className="text-black text-[11px] text-center leading-tight font-medium">
          Địa chỉ: 242 Ấp Thị 1, xã Long Điền, tỉnh An Giang.
        </p>
        <p className="text-black text-[11px] text-center leading-tight font-medium">
          SĐT/ Zalo : 0397 169 935
        </p>
      </div>

      {/* ── TITLE ── */}
      <div className="text-center mb-1.5">
        <h2 className="text-sm font-bold uppercase tracking-wide leading-tight text-black">
          Hóa Đơn Bán Hàng
        </h2>
        <p className="text-xs font-bold text-black leading-tight">Mã: {invoice.invoiceCode}</p>
        <p className="text-[11px] text-black font-medium leading-tight">Ngày: {formattedDate}</p>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table className="w-full text-left border-collapse mb-1.5">
        <thead>
          <tr className="border-y border-black">
            <th className="py-0.5 pr-1 w-5 text-center font-bold text-xs text-black">#</th>
            <th className="py-0.5 px-1 font-bold text-xs text-black">Sản phẩm</th>
            <th className="py-0.5 px-1 w-7 text-center font-bold text-xs text-black">SL</th>
            {showDiscountColumn && (
              <th className="py-0.5 px-1 w-9 text-center font-bold text-xs text-black">
                CK
              </th>
            )}
            <th className="py-0.5 pl-1 w-16 text-right font-bold text-xs text-black">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => {
            const discountPercent =
              Number((item as { discountPercent?: number }).discountPercent) || 0;

            const originalPrice = Number(item.quantity) * Number(item.unitPrice);

            const lineTotal =
              showDiscountColumn
                ? originalPrice - (originalPrice * discountPercent) / 100
                : originalPrice;

            return (
              <tr key={item.id} className="border-b border-gray-400">
                <td className="py-1 pr-1 text-center text-black text-[11px] font-medium align-top">
                  {index + 1}
                </td>
                <td className="py-1 px-1 text-[11px] leading-tight align-top">
                  <div className="font-bold text-black text-xs leading-tight">{item.productName}</div>
                  <div className="text-black text-[11px] font-medium leading-tight">
                    {new Intl.NumberFormat('vi-VN').format(Number(item.unitPrice))} x {item.quantity}
                  </div>
                </td>
                <td className="py-1 px-1 text-center text-[11px] font-bold text-black align-top">
                  {item.quantity}
                </td>
                {showDiscountColumn && (
                  <td className="py-1 px-1 text-center align-top">
                    {discountPercent > 0 ? (
                      <span className="inline-block bg-gray-200 rounded px-1 text-black font-bold text-[11px]">
                        -{discountPercent}%
                      </span>
                    ) : (
                      <span className="text-black text-[11px]">—</span>
                    )}
                  </td>
                )}
                <td className="py-1 pl-1 text-right font-bold text-xs text-black align-top">
                  {showDiscountColumn && discountPercent > 0 && (
                    <div className="text-black line-through font-medium text-[11px] leading-tight">
                      {new Intl.NumberFormat('vi-VN').format(originalPrice)}
                    </div>
                  )}
                  <div className="text-xs leading-tight">
                    {new Intl.NumberFormat('vi-VN').format(lineTotal)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── TOTALS ── */}
      <div className="flex flex-col items-end mb-1.5 border-t border-black pt-1 space-y-0.5">

        {(isItemDiscount || isInvoiceDiscount) && (
          <div className="flex justify-between w-full">
            <span className="text-black text-[11px] font-medium">Tạm tính:</span>
            <span className="text-black text-[11px] font-bold">
              {new Intl.NumberFormat('vi-VN').format(subTotal)} ₫
            </span>
          </div>
        )}

        {isItemDiscount && totalDiscount > 0 && (
          <div className="flex justify-between w-full">
            <span className="text-black text-[11px] font-medium">Chiết khấu:</span>
            <span className="text-[11px] font-bold text-black">
              -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
            </span>
          </div>
        )}

        {isInvoiceDiscount && invoiceDiscountPercent > 0 && (
          <div className="flex justify-between w-full">
            <span className="text-black text-[11px] font-medium">
              Chiết khấu HĐ ({invoiceDiscountPercent}%):
            </span>
            <span className="text-[11px] font-bold text-black">
              -{new Intl.NumberFormat('vi-VN').format(totalDiscount)} ₫
            </span>
          </div>
        )}

        {(hasDiscount || hasInvoiceDiscount) && (
          <div className="w-full border-t border-black pt-0.5" />
        )}

        <div className="flex justify-between w-full items-baseline">
          <span className="font-bold uppercase text-xs tracking-wide text-black">Tổng cộng:</span>
          <span className="font-black text-xl text-black">
            {formatCurrency(Number(invoice.totalAmount), 'vi')}
          </span>
        </div>

        {invoice.note && (
          <div className="w-full mt-0.5 text-[11px] italic text-black font-medium border-t border-gray-400 pt-1 leading-tight">
            <strong>Ghi chú:</strong> {invoice.note}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="text-center mt-1.5 pt-1.5 border-t border-black">
        <p className="font-bold text-[11px] text-black leading-tight">Cảm ơn quý khách!</p>
        <p className="text-black text-[11px] font-medium leading-tight">Hẹn gặp lại</p>
      </div>
    </div>
  );
});

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';