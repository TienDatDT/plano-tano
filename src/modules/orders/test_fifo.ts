import { orderService } from "./services/order.service";
import { stockInService } from "../stock-in/services/stock-in.service";
import { prisma } from "../../shared/lib/prisma";

async function testFIFO() {
  console.log("--- Testing FIFO Logic ---");
  
  try {
    // 1. Cleanup existing test data if any
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.batch.deleteMany({});
    await prisma.stockInItem.deleteMany({});
    await prisma.stockIn.deleteMany({});

    // 2. Setup variants
    const variant = await prisma.productVariant.findFirst();
    if (!variant) {
      console.error("No variants found in DB. Please seed first.");
      return;
    }
    console.log(`Testing with variant: ${variant.sku}`);

    // 3. Create 3 batches of stock (via StockIn confirm)
    console.log("Creating 3 batches...");
    
    // Batch 1 (Oldest)
    const si1 = await prisma.stockIn.create({ data: { supplierId: (await prisma.supplier.findFirst())!.id } });
    await prisma.stockInItem.create({ data: { stockInId: si1.id, variantId: variant.id, quantity: 10, importPrice: 1000 } });
    await stockInService.confirmStockIn(si1.id);
    
    // Batch 2
    const si2 = await prisma.stockIn.create({ data: { supplierId: (await prisma.supplier.findFirst())!.id } });
    await prisma.stockInItem.create({ data: { stockInId: si2.id, variantId: variant.id, quantity: 10, importPrice: 2000 } });
    await stockInService.confirmStockIn(si2.id);

    // Batch 3 (Newest)
    const si3 = await prisma.stockIn.create({ data: { supplierId: (await prisma.supplier.findFirst())!.id } });
    await prisma.stockInItem.create({ data: { stockInId: si3.id, variantId: variant.id, quantity: 10, importPrice: 3000 } });
    await stockInService.confirmStockIn(si3.id);

    // Check batches
    let batches = await prisma.batch.findMany({ where: { variantId: variant.id }, orderBy: { createdAt: 'asc' } });
    console.log(`Current batches: ${batches.map(b => `[${b.id.slice(0,4)}] qty:${b.quantity} price:${b.importPrice}`).join(", ")}`);

    // 4. Create an order for 15 units (should use all of Batch 1 and 5 from Batch 2)
    console.log("Ordering 15 units...");
    const order = await orderService.createOrder({
      items: [{ variantId: variant.id, quantity: 15, salePrice: 5000 }]
    });

    console.log(`Order created with ${order.items.length} items.`);
    
    // 5. Verify batch quantities
    batches = await prisma.batch.findMany({ where: { variantId: variant.id }, orderBy: { createdAt: 'asc' } });
    console.log(`Updated batches: ${batches.map(b => `[${b.id.slice(0,4)}] qty:${b.quantity}`).join(", ")}`);

    if (batches[0].quantity === 0 && batches[1].quantity === 5 && batches[2].quantity === 10) {
      console.log("✅ FIFO SUCCESS: Oldest batches used correctly.");
    } else {
      console.log("❌ FIFO FAILURE: Quantities do not match expectations.");
    }

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testFIFO();
