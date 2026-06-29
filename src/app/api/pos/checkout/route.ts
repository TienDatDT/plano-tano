import { NextRequest } from 'next/server';
import { posService } from '@/modules/pos/services/pos.service';
import { createResponse, createError } from '@/shared/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await posService.checkout(body);
    return createResponse(order, 201);
  } catch (error: any) {
    const status = error.message.includes('Insufficient stock') || error.message.includes('cart cannot be empty')
      ? 400
      : 500;
    return createError(error.message || 'Checkout failed', status);
  }
}
