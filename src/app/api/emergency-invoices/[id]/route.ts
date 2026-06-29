import { NextRequest } from 'next/server';
import { emergencyInvoiceService } from '@/modules/emergency-invoice/services/emergency-invoice.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const invoice = await emergencyInvoiceService.getInvoiceById(id);
    return createResponse(invoice);
  } catch (error: any) {
    return createError(error.message || 'Không tìm thấy hóa đơn', 404);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const invoice = await emergencyInvoiceService.updateInvoice(id, body);
    return createResponse(invoice);
  } catch (error: any) {
    return createError(error.message || 'Không thể cập nhật hóa đơn', 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await emergencyInvoiceService.deleteInvoice(id);
    return createResponse({ id });
  } catch (error: any) {
    return createError(error.message || 'Không thể xóa hóa đơn', 400);
  }
}
