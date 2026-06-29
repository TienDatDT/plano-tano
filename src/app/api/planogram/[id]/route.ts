import { planogramService } from '@/modules/planogram/services/planogram.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const item = await planogramService.getItemById(id);
    return createResponse(item);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return createError(error.message, status);
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const data = await request.json();
    const updated = await planogramService.updateItem(id, data);
    return createResponse(updated);
  } catch (error: any) {
    const status =
      error.message.includes('not found') ? 404 :
      error.message.includes('already occupied') ? 409 : 400;
    return createError(error.message, status);
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await planogramService.removeItem(id);
    return createResponse({ success: true });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return createError(error.message, status);
  }
}
