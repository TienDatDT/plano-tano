import { shelfService } from '@/modules/shelves/services/shelf.service';
import { createResponse, createError } from '@/shared/lib/api-response';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    if (!Array.isArray(data)) {
      return createError('Payload must be an array of updates', 400);
    }
    const result = await shelfService.bulkUpdateShelves(data);
    return createResponse(result);
  } catch (error: any) {
    return createError(error.message || 'Failed to bulk update shelves', 500);
  }
}
