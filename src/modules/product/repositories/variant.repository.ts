import { prisma } from '@/shared/lib/prisma';
import type { CreateVariantDTO, UpdateVariantDTO } from '../dtos/product.dto';

const variantInclude = { unit: true } as const;

export class VariantRepository {
  async findById(variantId: string) {
    return await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: variantInclude,
    });
  }

  async createForProduct(productId: string, data: CreateVariantDTO) {
    return await prisma.productVariant.create({
      data: {
        productId,
        sku: data.sku.trim(),
        salePrice: data.salePrice,
        unitId: data.unitId,
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: variantInclude,
    });
  }

  async update(variantId: string, data: UpdateVariantDTO) {
    return await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(data.sku !== undefined && { sku: data.sku.trim() }),
        ...(data.salePrice !== undefined && { salePrice: data.salePrice }),
        ...(data.unitId !== undefined && { unitId: data.unitId }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: variantInclude,
    });
  }

  async delete(variantId: string) {
    return await prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  async deleteMany(productId: string, ids: string[]) {
    return await prisma.productVariant.deleteMany({
      where: { id: { in: ids }, productId },
    });
  }

  async updateManyStatus(productId: string, ids: string[], status: 'ACTIVE' | 'INACTIVE') {
    return await prisma.productVariant.updateMany({
      where: { id: { in: ids }, productId },
      data: { status },
    });
  }

  async updateManyPrice(productId: string, ids: string[], price: number) {
    return await prisma.productVariant.updateMany({
      where: { id: { in: ids }, productId },
      data: { salePrice: price },
    });
  }
}
