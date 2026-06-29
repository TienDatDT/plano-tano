import { planogramService } from '@/modules/planogram/services/planogram.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await planogramService.bulkAssign(data);
    return createResponse(result, 201);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return createError(error.message, status);
  }
}
