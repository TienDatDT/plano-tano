import { NextRequest } from 'next/server';
import { orderService } from '@/modules/orders/services/order.service';
import { createResponse, createError } from '@/shared/lib/api-response';
import { OrderStatus } from '@/generated/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const order = await orderService.getOrderById(id);
    return createResponse(order);
  } catch (error: any) {
    return createError(error.message || 'Failed to retrieve order details', 404);
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return createError('Status is required for update.', 400);
    }

    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      return createError(`Invalid status. Allowed values: ${validStatuses.join(', ')}`, 400);
    }

    const updatedOrder = await orderService.updateOrderStatus(id, status as OrderStatus);
    return createResponse(updatedOrder);
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    return createError(error.message || 'Failed to update order status', statusCode);
  }
}
