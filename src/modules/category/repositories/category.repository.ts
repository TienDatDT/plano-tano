import { prisma } from '@/shared/lib/prisma';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dtos/category.dto';

export class CategoryRepository {
  async findAll() {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } }
      }
    });

    return categories.map(c => {
      const { _count, ...rest } = c;
      return {
        ...rest,
        productCount: _count.products
      };
    });
  }

  async findById(id: string) {
    return await prisma.category.findUnique({
      where: { id },
    });
  }

  async create(data: CreateCategoryDTO) {
    return await prisma.category.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  }

  async update(id: string, data: UpdateCategoryDTO) {
    return await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  }

  async delete(id: string) {
    return await prisma.category.delete({
      where: { id },
    });
  }
}
