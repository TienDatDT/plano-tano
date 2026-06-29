import { prisma } from "@/shared/lib/prisma";
import { OrderStatus } from "@/generated/prisma";
import { orderRepository, FindManyOrdersOptions } from '../repositories/order.repository';

export interface CreateOrderInput {
  items: Array<{
    variantId: string;
    quantity: number;
    salePrice: number;
  }>;
}

export class OrderService {
  /**
   * Keep original FIFO createOrder method to prevent breaking existing modules/tests
   */
  async createOrder(data: CreateOrderInput) {
    return prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsToCreate = [];

      for (const itemRequest of data.items) {
        const { variantId, quantity: requestedQuantity, salePrice } = itemRequest;

        // 1. Find batches for this variant in FIFO order (oldest first)
        const batches = await tx.batch.findMany({
          where: {
            variantId,
            quantity: { gt: 0 },
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
        if (totalAvailable < requestedQuantity) {
          throw new Error(`Insufficient stock for variant ${variantId}. Requested: ${requestedQuantity}, Available: ${totalAvailable}`);
        }

        // 2. Consume from batches
        let remainingToFulfill = requestedQuantity;
        for (const batch of batches) {
          if (remainingToFulfill <= 0) break;

          const consumeAmount = Math.min(batch.quantity, remainingToFulfill);
          
          // Update batch quantity
          await tx.batch.update({
            where: { id: batch.id },
            data: { quantity: { decrement: consumeAmount } },
          });

          // Prepare order item
          orderItemsToCreate.push({
            batchId: batch.id,
            variantId: variantId,
            quantity: consumeAmount,
            salePrice: salePrice,
          });

          remainingToFulfill -= consumeAmount;
          totalAmount += Number(salePrice) * consumeAmount;
        }
      }

      // 3. Create the order
      const order = await tx.order.create({
        data: {
          totalAmount,
          status: OrderStatus.COMPLETED, // Mark as completed for now as it's a direct checkout
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
  }

  /**
   * Get paginated orders matching options
   */
  async getOrders(options: FindManyOrdersOptions) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    
    const [data, total] = await Promise.all([
      orderRepository.findMany({ ...options, page, limit }),
      orderRepository.count(options),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get single order details with full nested relationships
   */
  async getOrderById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error(`Order with ID ${id} not found.`);
    }
    return order;
  }

  /**
   * Update order status or handle atomic stock restoration on cancel
   */
  async updateOrderStatus(id: string, status: OrderStatus) {
    // 1. Fetch current order
    const order = await this.getOrderById(id);

    if (order.status === 'CANCELLED') {
      throw new Error('Cannot update status of a cancelled order.');
    }

    if (status === 'CANCELLED') {
      // Trigger atomic cancel + stock restoration inside transaction
      return await orderRepository.cancelOrder(id);
    }

    // Direct status update (COMPLETED, PENDING, etc.)
    return await orderRepository.updateStatus(id, status);
  }
}

export const orderService = new OrderService();
