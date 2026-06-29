import { prisma } from '@/shared/lib/prisma';
import {
  CreateStoreLayoutDTO,
  UpdateStoreLayoutDTO,
  StoreLayoutFilterDTO,
} from '../dtos/store-layout.dto';

export class StoreLayoutRepository {
  async findMany(filter: StoreLayoutFilterDTO = {}) {
    const {
      search,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const skip = (page - 1) * limit;

    const [layouts, total] = await Promise.all([
      prisma.storeLayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { shelves: true } },
        },
      }),
      prisma.storeLayout.count({ where }),
    ]);

    return {
      data: layouts.map(({ _count, ...rest }) => ({
        ...rest,
        shelfCount: _count.shelves,
      })),
      total,
    };
  }

  async findById(id: string) {
    return prisma.storeLayout.findUnique({
      where: { id },
      include: {
        shelves: {
          orderBy: { createdAt: 'asc' },
          include: {
            template: true,
            cells: {
              include: {
                items: {
                  include: {
                    batch: {
                      include: {
                        variant: {
                          include: {
                            product: true,
                            unit: true,
                          },
                        },
                      },
                    },
                    cell: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll() {
    const layouts = await prisma.storeLayout.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { shelves: true } },
      },
    });

    return layouts.map(({ _count, ...rest }) => ({
      ...rest,
      shelfCount: _count.shelves,
    }));
  }

  async create(data: CreateStoreLayoutDTO) {
    return prisma.storeLayout.create({
      data: {
        name: data.name,
        width: data.width,
        height: data.height,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: UpdateStoreLayoutDTO) {
    return prisma.storeLayout.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.width !== undefined && { width: data.width }),
        ...(data.height !== undefined && { height: data.height }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async delete(id: string) {
    return prisma.$transaction([
      prisma.shelf.deleteMany({ where: { layoutId: id } }),
      prisma.storeLayout.delete({ where: { id } }),
    ]);
  }

  async existsByName(name: string, excludeId?: string) {
    const layout = await prisma.storeLayout.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!layout;
  }
}
