import { posRepository } from '../repositories/pos.repository';

export interface POSProductItem {
  productId: string;
  productName: string;
  description: string | null;
  imageUrl: string | null;
  categoryName: string;
  variantId: string;
  sku: string;
  unitName: string;
  salePrice: number;
  batchId: string;
  lotNumber: string;
  expDate: Date | null;
  stockQuantity: number;
}

export interface CheckoutItemInput {
  batchId: string;
  variantId: string;
  quantity: number;
  salePrice: number;
}

export interface CheckoutInput {
  status?: 'PENDING' | 'COMPLETED';
  items: CheckoutItemInput[];
}

export class PosService {
  /**
   * Get all active product variants and batches flattened for POS catalog
   */
  async getAvailableItems(): Promise<POSProductItem[]> {
    const products = await posRepository.findAvailableProducts();
    const flattened: POSProductItem[] = [];

    for (const p of products) {
      for (const v of p.variants) {
        for (const b of v.batches) {
          flattened.push({
            productId: p.id,
            productName: p.name,
            description: p.description,
            imageUrl: p.imageUrl,
            categoryName: p.category.name,
            variantId: v.id,
            sku: v.sku,
            unitName: v.unit.name,
            salePrice: Number(v.salePrice),
            batchId: b.id,
            lotNumber: b.lotNumber,
            expDate: b.expDate,
            stockQuantity: b.quantity,
          });
        }
      }
    }

    return flattened;
  }

  /**
   * Validate cart data, check inventory stock levels, and execute checkout transaction
   */
  async checkout(input: CheckoutInput) {
    const { items, status = 'COMPLETED' } = input;

    if (!items || items.length === 0) {
      throw new Error('Shopping cart cannot be empty.');
    }

    // 1. Validate payload format and values
    for (const item of items) {
      if (!item.batchId) {
        throw new Error('Batch ID is required for each cart item.');
      }
      if (!item.variantId) {
        throw new Error('Variant ID is required for each cart item.');
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error('Quantity must be greater than zero.');
      }
      if (item.salePrice === undefined || item.salePrice < 0) {
        throw new Error('Sale price must be a positive value.');
      }
    }

    // 2. Calculate totals on the server to prevent client-side tampering
    let calculatedTotal = 0;
    for (const item of items) {
      calculatedTotal += Number(item.salePrice) * item.quantity;
    }

    // 3. Delegate to repository inside Prisma Transaction
    const order = await posRepository.executeCheckout({
      status,
      totalAmount: calculatedTotal,
      items: items.map((i) => ({
        batchId: i.batchId,
        variantId: i.variantId,
        quantity: i.quantity,
        salePrice: Number(i.salePrice),
      })),
    });

    return order;
  }
}

export const posService = new PosService();
