// app/api/emergency-invoices/bulk-delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { emergencyInvoiceService } from '../../../../modules/emergency-invoice/services/emergency-invoice.service'; // chỉnh path đúng dự án

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    const result = await emergencyInvoiceService.bulkDeleteInvoices(ids);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (e: any) {
    console.error('bulk-delete error:', e);
    return NextResponse.json(
      { success: false, error: e.message || 'Không thể xóa các hóa đơn đã chọn' },
      { status: e.message?.includes('không hợp lệ') ? 400 : 500 },
    );
  }
}