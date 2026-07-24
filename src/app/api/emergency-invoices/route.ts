import { NextRequest } from 'next/server';
import { emergencyInvoiceService } from '@/modules/emergency-invoice/services/emergency-invoice.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const period = searchParams.get('period') as 'today' | 'thisWeek' | 'thisMonth' | null;
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;

    const search = searchParams.get('search') || undefined;

    const result = await emergencyInvoiceService.getInvoices({
      page,
      limit,
      period: period ?? undefined,
      fromDate,
      toDate,
      search,
    });

    return createResponse(result);
  } catch (error: any) {
    return createError(error.message || 'Không thể tải danh sách hóa đơn', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const invoice = await emergencyInvoiceService.createInvoice(body);
    return createResponse(invoice, 201);
  } catch (error: any) {
    return createError(error.message || 'Không thể tạo hóa đơn', 400);
  }
}

