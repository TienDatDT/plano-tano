import { posService } from '@/modules/pos/services/pos.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function GET() {
  try {
    const products = await posService.getAvailableItems();
    return createResponse(products);
  } catch (error: any) {
    return createError(error.message || 'Failed to fetch available products', 500);
  }
}
