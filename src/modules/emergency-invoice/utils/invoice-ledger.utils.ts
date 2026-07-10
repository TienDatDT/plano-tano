// utils/invoice-ledger.utils.ts
import type { EmergencyInvoice } from '../types/emergency-invoice.types';

export interface LedgerRow {
  date: string;       // hiển thị: dd/mm/yyyy
  description: string; // Diễn giải: mã HĐ + tên sản phẩm
  amount: number;
}

const MAX_ROWS_PER_PAGE = 15; // số dòng tối đa trên 1 trang sổ (giống ảnh mẫu)

function buildDescription(invoice: EmergencyInvoice): string {
  const items = invoice.items?.map((i) => i.productName).join(', ') || '';
  const notePart = invoice.note ? ` - ${invoice.note}` : '';
  return `${invoice.invoiceCode}${notePart}${items ? ` (${items})` : ''}`;
}

/**
 * Gom hóa đơn theo NGÀY, mỗi ngày là 1 nhóm.
 * Nếu 1 ngày có quá nhiều hóa đơn (> MAX_ROWS_PER_PAGE) thì tách thành nhiều trang liên tiếp.
 * Trả về mảng các trang, mỗi trang là 1 mảng LedgerRow.
 */
export function groupInvoicesIntoLedgerPages(
  invoices: EmergencyInvoice[]
): LedgerRow[][] {
  // Sắp xếp theo ngày tăng dần trước khi gom nhóm
  const sorted = [...invoices].sort(
    (a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()
  );

  const groupedByDate = new Map<string, LedgerRow[]>();

  for (const invoice of sorted) {
    const dateKey = new Date(invoice.invoiceDate).toLocaleDateString('vi-VN');
    const row: LedgerRow = {
      date: dateKey,
      description: buildDescription(invoice),
      amount: invoice.totalAmount,
    };

    if (!groupedByDate.has(dateKey)) groupedByDate.set(dateKey, []);
    groupedByDate.get(dateKey)!.push(row);
  }

  const pages: LedgerRow[][] = [];
  for (const rows of groupedByDate.values()) {
    for (let i = 0; i < rows.length; i += MAX_ROWS_PER_PAGE) {
      pages.push(rows.slice(i, i + MAX_ROWS_PER_PAGE));
    }
  }

  return pages.length ? pages : [[]];
}