import { shelfService } from '@/modules/shelves/services/shelf.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const shelf = await shelfService.getShelfById(id);
    return createResponse(shelf);
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
    const updated = await shelfService.updateShelf(id, data);
    return createResponse(updated);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return createError(error.message, status);
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    await shelfService.deleteShelf(id);
    return createResponse({ success: true });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return createError(error.message, status);
  }
}
