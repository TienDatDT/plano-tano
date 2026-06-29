import { ProductRepository } from '../repositories/product.repository';
import { VariantRepository } from '../repositories/variant.repository';
import type { CreateVariantDTO, UpdateVariantDTO } from '../dtos/product.dto';

type VariantWithUnit = NonNullable<
  Awaited<ReturnType<VariantRepository['findById']>>
>;

function serializeVariant(v: VariantWithUnit) {
  return {
    ...v,
    salePrice: Number(v.salePrice),
    costPrice: v.costPrice ? Number(v.costPrice) : null,
  };
}

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code: string }).code === 'P2002'
  );
}

export class VariantService {
  private variants: VariantRepository;
  private products: ProductRepository;

  constructor() {
    this.variants = new VariantRepository();
    this.products = new ProductRepository();
  }

  async createVariant(productId: string, data: CreateVariantDTO) {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    if (!data.sku?.trim()) {
      throw new Error('SKU is required');
    }
    if (data.salePrice < 0) {
      throw new Error('Price cannot be negative');
    }
    if (!data.unitId) {
      throw new Error('Unit is required');
    }

    try {
      const row = await this.variants.createForProduct(productId, data);
      return serializeVariant(row);
    } catch (e: unknown) {
      if (isUniqueViolation(e)) {
        throw new Error('A variant with this SKU already exists');
      }
      throw e;
    }
  }

  async updateVariant(
    productId: string,
    variantId: string,
    data: UpdateVariantDTO,
  ) {
    const existing = await this.variants.findById(variantId);
    if (!existing || existing.productId !== productId) {
      throw new Error('Variant not found for this product');
    }
    if (data.sku !== undefined && !data.sku.trim()) {
      throw new Error('SKU cannot be empty');
    }
    if (data.salePrice !== undefined && data.salePrice < 0) {
      throw new Error('Price cannot be negative');
    }

    try {
      const row = await this.variants.update(variantId, data);
      return serializeVariant(row);
    } catch (e: unknown) {
      if (isUniqueViolation(e)) {
        throw new Error('A variant with this SKU already exists');
      }
      throw e;
    }
  }

  async deleteVariant(productId: string, variantId: string) {
    const existing = await this.variants.findById(variantId);
    if (!existing || existing.productId !== productId) {
      throw new Error('Variant not found for this product');
    }
    await this.variants.delete(variantId);
  }

  async deleteVariants(productId: string, ids: string[]) {
    if (!ids.length) throw new Error('No ids provided');
    return await this.variants.deleteMany(productId, ids);
  }

  async updateVariantsStatus(
    productId: string,
    ids: string[],
    status: 'ACTIVE' | 'INACTIVE',
  ) {
    if (!ids.length) throw new Error('No ids provided');
    return await this.variants.updateManyStatus(productId, ids, status);
  }

  async updateVariantsPrice(
    productId: string,
    ids: string[],
    price: number,
  ) {
    if (!ids.length) throw new Error('No ids provided');
    if (price < 0) throw new Error('Price cannot be negative');
    return await this.variants.updateManyPrice(productId, ids, price);
  }
}

export const variantService = new VariantService();
