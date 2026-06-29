import { shelfService } from '@/modules/shelves/services/shelf.service';
import { createResponse, createError } from '@/shared/lib/api-response';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const cells = await shelfService.getCellsByShelf(id);
    return createResponse(cells);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 500;
    return createError(error.message, status);
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const data = await request.json();
    const cell = await shelfService.addCell(id, data);
    return createResponse(cell, 201);
  } catch (error: any) {
    const status = error.message.includes('not found') ? 404 : 400;
    return createError(error.message, status);
  }
}
