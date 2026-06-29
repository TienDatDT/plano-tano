import { planogramService } from '@/modules/planogram/services/planogram.service';
import { createResponse, createError } from '@/shared/lib/api-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const shelfId = searchParams.get("shelfId") ?? undefined;
    const layoutId = searchParams.get("layoutId") ?? undefined;
    const batchId = searchParams.get("batchId") ?? undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 20;
    const sortBy = (searchParams.get("sortBy") as 'createdAt' | 'updatedAt' | 'quantity') ?? 'createdAt';
    const sortOrder = (searchParams.get("sortOrder") as 'asc' | 'desc') ?? 'desc';

    const result = await planogramService.getItems({
      shelfId,
      layoutId,
      batchId,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return createResponse(result);
  } catch (error: any) {
    return createError(error.message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await planogramService.assignItem(data);
    return createResponse(item, 201);
  } catch (error: any) {
    const status =
      error.message.includes('not found') ? 404 :
      error.message.includes('already occupied') ? 409 : 400;
    return createError(error.message, status);
  }
}
