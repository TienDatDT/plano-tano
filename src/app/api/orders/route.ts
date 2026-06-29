import { NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/services/order.service';
import { createResponse, createError } from '@/shared/lib/api-response';
import { OrderStatus } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || undefined;
    const status = (searchParams.get("status") as OrderStatus) || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const sortBy = (searchParams.get("sortBy") as 'createdAt' | 'totalAmount') || 'createdAt';
    const sortOrder = (searchParams.get("sortOrder") as 'asc' | 'desc') || 'desc';

    const result = await orderService.getOrders({
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    });

    return createResponse(result);
  } catch (error: any) {
    return createError(error.message || 'Failed to retrieve orders', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await orderService.createOrder(body);
    return createResponse(order, 201);
  } catch (error: any) {
    return createError(error.message || 'Order creation failed', 400);
  }
}
