import { stockInRepository } from "../repositories/stock-in.repository";
import { CreateStockInInput } from "../types/stock-in.types";
import { prisma } from "@/shared/lib/prisma";
import { StockInStatus } from "@/generated/prisma";

export class StockInService {
  async createStockIn(data: CreateStockInInput) {
    // Basic validation
    if (!data.items || data.items.length === 0) {
      throw new Error("StockIn must have at least one item");
    }
    return stockInRepository.create(data);
  }

  async getStockIns() {
    return stockInRepository.findAll();
  }

  async getStockInById(id: string) {
    return stockInRepository.findById(id);
  }

  async confirmStockIn(id: string) {
    return prisma.$transaction(async (tx) => {
      const stockIn = await tx.stockIn.findUnique({
        where: { id },
        include: { 
          items: {
            include: {
              variant: true
            }
          } 
        },
      });

      if (!stockIn) throw new Error("Stock receipt not found");
      if (stockIn.status === StockInStatus.CONFIRMED) {
        throw new Error("Stock receipt has already been confirmed");
      }

      for (const item of stockIn.items) {
        let currentVariantId = item.variantId;
        let currentQuantity = item.quantity;
        let currentUnitId = item.variant.unitId;
        const productId = item.variant.productId;

        // Recursive conversion to base unit
        let hasConversion = true;
        while (hasConversion) {
          const conversion = await tx.unitConversion.findFirst({
            where: { productId, fromUnitId: currentUnitId }
          });

          if (conversion) {
            currentQuantity = Math.floor(currentQuantity * Number(conversion.ratio));
            currentUnitId = conversion.toUnitId;
            
            // Find the variant for the new unit
            const nextVariant = await tx.productVariant.findFirst({
              where: { productId, unitId: currentUnitId }
            });

            if (!nextVariant) {
              throw new Error(`Variant for unit ${currentUnitId} not found for product ${productId}. Conversion failed.`);
            }
            currentVariantId = nextVariant.id;
          } else {
            hasConversion = false;
          }
        }

        // Create a new batch using the resolved variant and quantity
        const batch = await tx.batch.create({
          data: {
            variantId: currentVariantId,
            lotNumber: item.lotNumber || `LOT-${id.slice(0, 8)}-${Date.now()}`,
            importPrice: item.importPrice,
            quantity: currentQuantity,
            mfgDate: item.mfgDate,
            expDate: item.expDate,
          },
        });

        // Update the item to link to the newly created batch
        await tx.stockInItem.update({
          where: { id: item.id },
          data: { batchId: batch.id },
        });
      }

      // Finalize the receipt status
      return tx.stockIn.update({
        where: { id },
        data: { 
          status: StockInStatus.CONFIRMED,
          receivedAt: stockIn.receivedAt || new Date(),
        },
      });
    });
  }
}

export const stockInService = new StockInService();
