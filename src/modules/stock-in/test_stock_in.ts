import { stockInService } from "./services/stock-in.service";
import { prisma } from "../../shared/lib/prisma";

async function test() {
  try {
    const supplier = await prisma.supplier.findFirst();
    const variant = await prisma.productVariant.findFirst();

    if (!supplier || !variant) {
      console.log("Seed data missing");
      return;
    }

    console.log("Creating Draft StockIn...");
    const stockIn = await stockInService.createStockIn({
      supplierId: supplier.id,
      notes: "Test receipt",
      items: [
        {
          variantId: variant.id,
          quantity: 10,
          importPrice: 50000,
          lotNumber: "TEST-LOT-001"
        }
      ]
    });
    console.log("Created:", stockIn.id, "Status:", stockIn.status);

    console.log("Confirming StockIn...");
    const confirmed = await stockInService.confirmStockIn(stockIn.id);
    console.log("Confirmed Status:", confirmed.status);

    const itemsWithBatches = await prisma.stockInItem.findMany({
      where: { stockInId: stockIn.id },
      include: { batch: true }
    });
    console.log("Items with batches:", JSON.stringify(itemsWithBatches, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
