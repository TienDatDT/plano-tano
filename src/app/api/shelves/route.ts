import { shelfService } from '@/modules/shelves/services/shelf.service';
import { createResponse, createError } from '@/shared/lib/api-response';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const search = searchParams.get("search") ?? undefined;
    const layoutId = searchParams.get("layoutId") ?? undefined;
    const layoutType = searchParams.get("layoutType") as 'DIMENSION' | 'GRID' | null;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 10;
    const sortBy = (searchParams.get("sortBy") as 'name' | 'createdAt' | 'posX' | 'posY') ?? 'createdAt';
    const sortOrder = (searchParams.get("sortOrder") as 'asc' | 'desc') ?? 'desc';
    const all = searchParams.get("all") === 'true';

    if (all) {
      const data = await shelfService.getAllShelves(layoutId);
      return createResponse(data);
    }

    const result = await shelfService.getShelves({
      search,
      layoutId,
      layoutType: layoutType ?? undefined,
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
    const shelf = await shelfService.createShelf(data);
    return createResponse(shelf, 201);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return createError(error.message, status);
  }
}
