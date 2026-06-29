import { prisma } from '@/shared/lib/prisma';
import { AssignItemDTO, UpdateItemDTO, PlanogramFilterDTO } from '../dtos/planogram.dto';

/**
 * ShelfItem schema:
 *   - batchId, cellId, quantity (NO shelfId directly)
 *   - relations: batch → Batch, cell → ShelfCell → Shelf
 */
const itemInclude = {
  cell: {
    include: {
      shelf: {
        select: {
          id: true,
          name: true,
          layoutId: true,
          posX: true,
          posY: true,
        },
      },
    },
  },
  batch: {
    include: {
      variant: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
          unit: { select: { id: true, name: true, symbol: true } },
        },
      },
    },
  },
} as const;

export class PlanogramRepository {
  async findMany(filter: PlanogramFilterDTO = {}) {
    const {
      shelfId,
      layoutId,
      batchId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where = {
      // ShelfItem has no shelfId – filter via nested cell relation
      ...(shelfId && { cell: { shelfId } }),
      ...(batchId && { batchId }),
      ...(layoutId && { cell: { shelf: { layoutId } } }),
    };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.shelfItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: itemInclude,
      }),
      prisma.shelfItem.count({ where }),
    ]);

    return { data: items, total };
  }

  async findById(id: string) {
    return prisma.shelfItem.findUnique({
      where: { id },
      include: itemInclude,
    });
  }

  async findByShelfId(shelfId: string) {
    // ShelfItem has no shelfId – go through ShelfCell
    return prisma.shelfItem.findMany({
      where: { cell: { shelfId } },
      include: itemInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByCellId(cellId: string) {
    return prisma.shelfItem.findFirst({
      where: { cellId },
      include: itemInclude,
    });
  }

  async create(data: AssignItemDTO) {
    // ShelfItem only stores cellId + batchId + quantity (no shelfId field)
    return prisma.shelfItem.create({
      data: {
        cellId: data.cellId,
        batchId: data.batchId,
        quantity: data.quantity,
      },
      include: itemInclude,
    });
  }

  async update(id: string, data: UpdateItemDTO) {
    return prisma.shelfItem.update({
      where: { id },
      data: {
        ...(data.batchId !== undefined && { batchId: data.batchId }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.cellId !== undefined && { cellId: data.cellId }),
      },
      include: itemInclude,
    });
  }

  async delete(id: string) {
    return prisma.shelfItem.delete({ where: { id } });
  }

  async deleteByShelfId(shelfId: string) {
    // ShelfItem has no shelfId – go through cell relation
    return prisma.shelfItem.deleteMany({
      where: { cell: { shelfId } },
    });
  }

  async deleteByCellId(cellId: string) {
    return prisma.shelfItem.deleteMany({ where: { cellId } });
  }

  async bulkCreate(items: AssignItemDTO[]) {
    // ShelfItem only stores cellId + batchId + quantity (no shelfId)
    return prisma.$transaction(
      items.map((item) =>
        prisma.shelfItem.create({
          data: {
            cellId: item.cellId,
            batchId: item.batchId,
            quantity: item.quantity,
          },
        })
      )
    );
  }

  async getSnapshotByLayout(layoutId: string) {
    return prisma.shelf.findMany({
      where: { layoutId },
      include: {
        template: true,
        cells: {
          orderBy: [{ row: 'asc' }, { column: 'asc' }],
          include: {
            items: {
              include: {
                batch: {
                  include: {
                    variant: {
                      include: {
                        product: { select: { id: true, name: true, imageUrl: true } },
                        unit: { select: { id: true, name: true, symbol: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
