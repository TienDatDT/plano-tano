import { prisma } from '@/shared/lib/prisma';
import { OrderStatus, VariantStatus } from '@/generated/prisma';

export class AnalyticsRepository {
  /**
   * Fetch completed orders and items with batch, variant, product, and category data.
   * Leverages Prisma relations to avoid N+1 queries.
   */
  async getCompletedOrders(start: Date, end: Date) {
    return await prisma.order.findMany({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: {
          include: {
            batch: true,
            variant: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Fetch active product variants, their related products, category info, and active stock batch rows.
   */
  async getInventoryStats() {
    return await prisma.productVariant.findMany({
      where: {
        status: VariantStatus.ACTIVE,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        batches: true,
      },
    });
  }

  /**
   * Fetch overall pending orders count for operational intelligence backlog metrics.
   */
  async getPendingOrdersCount() {
    return await prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();


