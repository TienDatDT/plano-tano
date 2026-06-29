import { prisma } from '@/shared/lib/prisma';
import type { Prisma } from '@/generated/prisma';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/product.dto';

export const productWithRelationsInclude = {
  category: true,
  variants: {
    include: { 
      unit: true,
      batches: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productWithRelationsInclude;
}>;

export class ProductRepository {
  async findAll() {
    return await prisma.product.findMany({
      include: productWithRelationsInclude,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: productWithRelationsInclude,
    });
  }

  async create(data: CreateProductDTO) {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        categoryId: data.categoryId,
        ...(data.status !== undefined && { status: data.status }),
      },
      include: productWithRelationsInclude,
    });
  }

  async update(id: string, data: UpdateProductDTO) {
    return await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: productWithRelationsInclude,
    });
  }

  async delete(id: string) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]) {
    return await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async updateManyStatus(ids: string[], status: 'ACTIVE' | 'INACTIVE') {
    return await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }
}
