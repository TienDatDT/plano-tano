import { planogramService } from '@/modules/planogram/services/planogram.service';
import { createResponse, createError } from '@/shared/lib/api-response';

/**
 * DELETE /api/planogram/shelf/[shelfId]
 * Clears all items from a shelf
 */
export async function DELETE(
  request: Request,
  props: { params: Promise<{ shelfId: string }> }
) {
  try {
    const { shelfId } = await props.params;
    const result = await planogramService.clearShelf(shelfId);
    return createResponse({ deletedCount: result.count });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return createError(error.message, status);
  }
}

/**
 * GET /api/planogram/shelf/[shelfId]
 * Returns all planogram items for a given shelf
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ shelfId: string }> }
) {
  try {
    const { shelfId } = await props.params;
    const items = await planogramService.getItemsByShelf(shelfId);
    return createResponse(items);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return createError(error.message, status);
  }
}
