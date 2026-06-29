import { supplierService } from '@/modules/supplier/services/supplier.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET() {
  try {
    const suppliers = await supplierService.getSuppliers();
    return createResponse(suppliers);
  } catch (error: any) {
    return createError(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newSupplier = await supplierService.createSupplier(data);
    return createResponse(newSupplier, 201);
  } catch (error: any) {
    return createError(error.message, 400);
  }
}

/** Bulk delete: DELETE /api/suppliers  body: { ids: string[] } */
export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return createError('ids must be a non-empty array', 400);
    }

    const result = await supplierService.deleteSuppliers(ids);
    return createResponse(result);
  } catch (error: any) {
    return createError(error.message, 400);
  }
}
