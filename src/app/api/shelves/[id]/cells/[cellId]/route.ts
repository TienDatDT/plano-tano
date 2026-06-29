import { shelfService } from '@/modules/shelves/services/shelf.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string; cellId: string }> }
) {
  try {
    const { id, cellId } = await props.params;
    await shelfService.deleteCell(id, cellId);
    return createResponse({ success: true });
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return createError(error.message, status);
  }
}
