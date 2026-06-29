import { prisma } from "@/shared/lib/prisma";

export class StockRepository {
  async getVariantStockSummary() {
    // Get all variants with their product and unit info, plus summed batch quantities
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        },
        unit: true,
        batches: {
          select: {
            id: true,
            quantity: true,
            lotNumber: true
          }
        }
      }
    });

    return variants.map(v => ({
      id: v.id,
      productId: v.productId,
      productName: v.product.name,
      categoryName: v.product.category.name,
      sku: v.sku,
      unitName: v.unit.name,
      unitSymbol: v.unit.symbol,
      totalQuantity: v.batches.reduce((sum, b) => sum + b.quantity, 0),
      batchCount: v.batches.length,
      batches: v.batches
    }));
  }
}

export const stockRepository = new StockRepository();
