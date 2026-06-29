import { prisma } from '@/shared/lib/prisma';
import type { Prisma, OrderStatus } from '@/generated/prisma';

export const orderWithRelationsInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: true,
          unit: true,
        },
      },
      batch: true,
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderWithRelationsInclude;
}>;

export interface FindManyOrdersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

export class OrderRepository {
  /**
   * Helper to build where clause based on filter inputs
   */
  private buildWhereClause(options: FindManyOrdersOptions): Prisma.OrderWhereInput {
    const { search, status, startDate, endDate } = options;
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } }, // ID search (Prisma matches UUID)
        {
          items: {
            some: {
              variant: {
                product: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            },
          },
        },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of that day (23:59:59) for inclusive filtering
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    return where;
  }

  /**
   * Find paginated list of orders matching filters
   */
  async findMany(options: FindManyOrdersOptions): Promise<OrderWithRelations[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where = this.buildWhereClause(options);
    const skip = (page - 1) * limit;

    return await prisma.order.findMany({
      where,
      include: orderWithRelationsInclude,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });
  }

  /**
   * Count total orders matching filters
   */
  async count(options: FindManyOrdersOptions): Promise<number> {
    const where = this.buildWhereClause(options);
    return await prisma.order.count({ where });
  }

  /**
   * Find unique order by ID with all item relations
   */
  async findById(id: string): Promise<OrderWithRelations | null> {
    return await prisma.order.findUnique({
      where: { id },
      include: orderWithRelationsInclude,
    });
  }

  /**
   * Direct status update
   */
  async updateStatus(id: string, status: OrderStatus): Promise<OrderWithRelations> {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: orderWithRelationsInclude,
    });
  }

  /**
   * Atomic cancel order inside a transaction:
   * 1. Change status to CANCELLED
   * 2. Restore stock quantity for each batch item in the order
   */
  async cancelOrder(id: string): Promise<OrderWithRelations> {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch current order with items
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order with ID ${id} not found.`);
      }

      if (order.status === 'CANCELLED') {
        throw new Error('Order is already cancelled.');
      }

      // 2. Loop order items and restore quantities
      for (const item of order.items) {
        await tx.batch.update({
          where: { id: item.batchId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // 3. Update order status to CANCELLED
      return await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: orderWithRelationsInclude,
      });
    });
  }
}

export const orderRepository = new OrderRepository();
