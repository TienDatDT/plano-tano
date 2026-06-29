import { planogramService } from '@/modules/planogram/services/planogram.service';
import { createResponse, createError } from '@/shared/lib/api-response';

/**
 * GET /api/planogram/snapshot?layoutId=xxx
 * Returns a full layout snapshot: all shelves → cells → assigned items
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const layoutId = searchParams.get("layoutId");

    if (!layoutId) {
      return createError('layoutId query param is required', 400);
    }

    const snapshot = await planogramService.getSnapshotByLayout(layoutId);
    return createResponse(snapshot);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return createError(error.message, status);
  }
}
