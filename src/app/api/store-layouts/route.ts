import { storeLayoutService } from '@/modules/store-layout/services/store-layout.service';
import { createResponse, createError } from '@/shared/lib/api-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const search = searchParams.get("search") ?? undefined;
    const isActiveParam = searchParams.get("isActive");
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 10;
    const sortBy = (searchParams.get("sortBy") as 'name' | 'createdAt' | 'updatedAt') ?? 'createdAt';
    const sortOrder = (searchParams.get("sortOrder") as 'asc' | 'desc') ?? 'desc';
    const all = searchParams.get("all") === 'true';

    if (all) {
      const data = await storeLayoutService.getAllLayouts();
      return createResponse(data);
    }

    const result = await storeLayoutService.getLayouts({
      search,
      isActive: isActiveParam !== null ? isActiveParam === 'true' : undefined,
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
    const layout = await storeLayoutService.createLayout(data);
    return createResponse(layout, 201);
  } catch (error: any) {
    const status = error.message.includes('already exists') ? 409 : 400;
    return createError(error.message, status);
  }
}
