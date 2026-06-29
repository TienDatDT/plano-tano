import { emergencyInvoiceService } from '@/modules/emergency-invoice/services/emergency-invoice.service';
import { createResponse, createError } from '@/shared/lib/api-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'today' | 'thisWeek' | 'thisMonth' | 'custom' | null;
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;
    const search = searchParams.get('search') || undefined;

    const summary = await emergencyInvoiceService.getSummary({
      period: period ?? undefined,
      fromDate,
      toDate,
      search,
    });
    return createResponse(summary);
  } catch (error: any) {
    return createError(error.message || 'Không thể tải thống kê', 500);
  }
}
