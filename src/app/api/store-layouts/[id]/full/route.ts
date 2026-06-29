import { storeLayoutService } from '@/modules/store-layout/services/store-layout.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const layout = await storeLayoutService.getLayoutById(id);
    return createResponse(layout);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return createError(error.message, status);
  }
}
