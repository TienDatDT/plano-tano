import { supplierService } from '@/modules/supplier/services/supplier.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const data = await request.json();
    const updated = await supplierService.updateSupplier(params.id, data);
    return createResponse(updated);
  } catch (error: any) {
    return createError(error.message, 400);
  }
}

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const supplier = await supplierService.getSupplierById(params.id);

    if (!supplier) {
      return createError("Supplier is not found", 404);
    }
    return createResponse(supplier);
  } catch (error: any) {
    return createError(error.message, 500);
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await supplierService.deleteSupplier(params.id);
    return createResponse({ success: true });
  } catch (error: any) {
    return createError(error.message, 400);
  }
}
