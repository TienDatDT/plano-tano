import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@/generated/prisma';

export class PosRepository {
  /**
   * Fetch all active products, active variants, and active batches with quantity > 0
   */
  async findAvailableProducts() {
    return await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        variants: {
          some: {
            status: 'ACTIVE',
            batches: {
              some: {
                quantity: { gt: 0 },
              },
            },
          },
        },
      },
      include: {
        category: true,
        variants: {
          where: {
            status: 'ACTIVE',
            batches: {
              some: {
                quantity: { gt: 0 },
              },
            },
          },
          include: {
            unit: true,
            batches: {
              where: {
                quantity: { gt: 0 },
              },
              orderBy: {
                expDate: 'asc', // FIFO/FEFO by expiration date
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Find a specific batch by ID, optionally inside a transaction
   */
  async findBatchById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return await client.batch.findUnique({
      where: { id },
      include: {
        variant: true,
      },
    });
  }

  /**
   * Execute order creation, items creation, and stock decrement within an atomic transaction
   */
  async executeCheckout(data: {
    status: 'PENDING' | 'COMPLETED';
    totalAmount: number;
    items: Array<{
      batchId: string;
      variantId: string;
      quantity: number;
      salePrice: number;
    }>;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate stock and decrement for each item
      for (const item of data.items) {
        const batch = await tx.batch.findUnique({
          where: { id: item.batchId },
        });

        if (!batch) {
          throw new Error(`Batch with ID ${item.batchId} not found.`);
        }

        if (batch.variantId !== item.variantId) {
          throw new Error(`Batch ${item.batchId} does not belong to variant ${item.variantId}.`);
        }

        if (batch.quantity < item.quantity) {
          throw new Error(`Insufficient stock for batch lot ${batch.lotNumber}. Requested: ${item.quantity}, Available: ${batch.quantity}`);
        }

        // Decrement stock
        await tx.batch.update({
          where: { id: item.batchId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 2. Create the Order and its OrderItems nested
      const createdOrder = await tx.order.create({
        data: {
          status: data.status,
          totalAmount: data.totalAmount,
          items: {
            create: data.items.map((item) => ({
              batchId: item.batchId,
              variantId: item.variantId,
              quantity: item.quantity,
              salePrice: item.salePrice,
            })),
          },
        },
        include: {
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
        },
      });

      return createdOrder;
    });
  }
}

export const posRepository = new PosRepository();
