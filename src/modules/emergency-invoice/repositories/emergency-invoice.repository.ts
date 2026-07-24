import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@/generated/prisma';
import type {
  FindManyEmergencyInvoicesOptions,
  EmergencyInvoice,
} from '../types/emergency-invoice.types';

// ──────────────────────────────────────────
// Include shape for full invoice with items
// ──────────────────────────────────────────

const emergencyInvoiceWithItemsInclude = {
  items: true,
} satisfies Prisma.EmergencyInvoiceInclude;

export type EmergencyInvoiceWithItems = Prisma.EmergencyInvoiceGetPayload<{
  include: typeof emergencyInvoiceWithItemsInclude;
}>;

// ──────────────────────────────────────────
// Repository
// ──────────────────────────────────────────

export class EmergencyInvoiceRepository {
  /**
   * Build date filter based on period shorthand or explicit range
   */
  private buildFilter(
    options: FindManyEmergencyInvoicesOptions,
  ): Prisma.EmergencyInvoiceWhereInput {
    const where: Prisma.EmergencyInvoiceWhereInput = {};

    if (options.period) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (options.period === 'today') {
        where.invoiceDate = { gte: startOfDay };
      } else if (options.period === 'thisWeek') {
        const dayOfWeek = now.getDay(); // 0=Sun
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - dayOfWeek);
        where.invoiceDate = { gte: startOfWeek };
      } else if (options.period === 'thisMonth') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        where.invoiceDate = { gte: startOfMonth };
      }
    } else {
      if (options.fromDate || options.toDate) {
        where.invoiceDate = {};
        if (options.fromDate) {
          (where.invoiceDate as Prisma.DateTimeFilter).gte = new Date(options.fromDate);
        }
        if (options.toDate) {
          const end = new Date(options.toDate);
          end.setHours(23, 59, 59, 999);
          (where.invoiceDate as Prisma.DateTimeFilter).lte = end;
        }
      }
    }

    if (options.search) {
      where.OR = [
        { invoiceCode: { contains: options.search, mode: 'insensitive' } },
        { items: { some: { productName: { contains: options.search, mode: 'insensitive' } } } },
      ];
    }

    return where;
  }

  /**
   * Find paginated list of invoices with optional filters
   */
  async findMany(options: FindManyEmergencyInvoicesOptions): Promise<EmergencyInvoiceWithItems[]> {
    const { page = 1, limit = 20 } = options;
    const where = this.buildFilter(options);
    const skip = (page - 1) * limit;

    return await prisma.emergencyInvoice.findMany({
      where,
      include: emergencyInvoiceWithItemsInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  /**
   * Count total matching invoices
   */
  async count(options: FindManyEmergencyInvoicesOptions): Promise<number> {
    const where = this.buildFilter(options);
    return await prisma.emergencyInvoice.count({ where });
  }

  /**
   * Find invoice by ID
   */
  async findById(id: string): Promise<EmergencyInvoiceWithItems | null> {
    return await prisma.emergencyInvoice.findUnique({
      where: { id },
      include: emergencyInvoiceWithItemsInclude,
    });
  }

  /**
   * Count invoices created today (for invoice code sequence)
   */
  async countToday(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return await prisma.emergencyInvoice.count({
      where: { createdAt: { gte: startOfDay } },
    });
  }

  /**
   * Create a new invoice with items in a transaction
   */
  async create(data: {
    invoiceCode: string;
    invoiceDate?: Date;
    note?: string;
    totalAmount: number;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      discountPercent: number;
    }>;
  }): Promise<EmergencyInvoiceWithItems> {
    return await prisma.emergencyInvoice.create({
      data: {
        invoiceCode: data.invoiceCode,
        invoiceDate: data.invoiceDate,
        note: data.note,
        totalAmount: data.totalAmount,
        items: {
          create: data.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            discountPercent: item.discountPercent,
          })),
        },
      },
      include: emergencyInvoiceWithItemsInclude,
    });
  }

  /**
   * Update an invoice with new items in a transaction
   */
  async update(
    id: string,
    data: {
      invoiceDate?: Date;
      note?: string;
      totalAmount: number;
      items: Array<{
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        discountPercent: number;
      }>;
    },
  ): Promise<EmergencyInvoiceWithItems> {
    return await prisma.$transaction(async (tx) => {
      // Delete old items
      await tx.emergencyInvoiceItem.deleteMany({
        where: { invoiceId: id },
      });

      // Update invoice and create new items
      return await tx.emergencyInvoice.update({
        where: { id },
        data: {
          invoiceDate: data.invoiceDate,
          note: data.note,
          totalAmount: data.totalAmount,
          items: {
            create: data.items.map((item) => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              discountPercent: item.discountPercent,
            })),
          },
        },
        include: emergencyInvoiceWithItemsInclude,
      });
    });
  }

  /**
   * Delete invoice by ID (cascade deletes items)
   */
  async delete(id: string): Promise<void> {
    await prisma.emergencyInvoice.delete({ where: { id } });
  }
  async deleteMany(ids: string[]): Promise<number> {
    const result = await prisma.emergencyInvoice.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  /**
   * Aggregate total revenue and count for summary stats
   */
  async getSummary(options: FindManyEmergencyInvoicesOptions = {}): Promise<{
    todayRevenue: number;
    todayCount: number;
    weekRevenue: number;
    monthRevenue: number;
    averageInvoiceValue: number;
    largestInvoiceValue: number;
    filteredRevenue: number;
    filteredCount: number;
    topProducts: { name: string; quantity: number }[];
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - dayOfWeek);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere = this.buildFilter(options); // Filter for custom stats if needed

    // Base aggregations for quick stats
    const [todayAgg, weekAgg, monthAgg, todayCount, avgMaxSumAgg, filteredCount] = await Promise.all([
      prisma.emergencyInvoice.aggregate({
        _sum: { totalAmount: true },
        where: { invoiceDate: { gte: startOfDay } },
      }),
      prisma.emergencyInvoice.aggregate({
        _sum: { totalAmount: true },
        where: { invoiceDate: { gte: startOfWeek } },
      }),
      prisma.emergencyInvoice.aggregate({
        _sum: { totalAmount: true },
        where: { invoiceDate: { gte: startOfMonth } },
      }),
      prisma.emergencyInvoice.count({
        where: { invoiceDate: { gte: startOfDay } },
      }),
      prisma.emergencyInvoice.aggregate({
        _avg: { totalAmount: true },
        _max: { totalAmount: true },
        _sum: { totalAmount: true },
        where: baseWhere,
      }),
      prisma.emergencyInvoice.count({
        where: baseWhere,
      }),
    ]);

    // Calculate top products
    const itemsAgg = await prisma.emergencyInvoiceItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true },
      where: {
        invoice: baseWhere,
      },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: 5,
    });

    const topProducts = itemsAgg.map((item) => ({
      name: item.productName,
      quantity: item._sum.quantity || 0,
    }));

    return {
      todayRevenue: Number(todayAgg._sum.totalAmount ?? 0),
      todayCount,
      weekRevenue: Number(weekAgg._sum.totalAmount ?? 0),
      monthRevenue: Number(monthAgg._sum.totalAmount ?? 0),
      averageInvoiceValue: Number(avgMaxSumAgg._avg.totalAmount ?? 0),
      largestInvoiceValue: Number(avgMaxSumAgg._max.totalAmount ?? 0),
      filteredRevenue: Number(avgMaxSumAgg._sum.totalAmount ?? 0),
      filteredCount,
      topProducts,
    };
  }
}

export const emergencyInvoiceRepository = new EmergencyInvoiceRepository();
