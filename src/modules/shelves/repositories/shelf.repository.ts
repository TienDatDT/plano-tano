import { prisma } from '@/shared/lib/prisma';
import {
  CreateShelfDTO,
  UpdateShelfDTO,
  ShelfFilterDTO,
  CreateShelfCellDTO,
} from '../dtos/shelf.dto';

export class ShelfRepository {
  async findMany(filter: ShelfFilterDTO = {}) {
    const {
      search,
      layoutId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where = {
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),

      ...(layoutId && { layoutId }),
    };

    const skip = (page - 1) * limit;

    const [shelves, total] = await Promise.all([
      prisma.shelf.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },

        include: {
          template: true,

          cells: {
            include: {
              _count: {
                select: {
                  items: true,
                },
              },
            },
          },

          _count: {
            select: {
              cells: true,
            },
          },
        },
      }),

      prisma.shelf.count({ where }),
    ]);

    return {
      data: shelves.map((shelf) => ({
        ...shelf,

        cellCount: shelf._count.cells,

        itemCount: shelf.cells.reduce(
          (sum, cell) => sum + cell._count.items,
          0
        ),
      })),

      total,
    };
  }

  async findAll(layoutId?: string) {
    const shelves = await prisma.shelf.findMany({
      where: layoutId ? { layoutId } : undefined,

      orderBy: {
        name: 'asc',
      },

      include: {
        template: true,

        cells: {
          include: {
            _count: {
              select: {
                items: true,
              },
            },
          },
        },

        _count: {
          select: {
            cells: true,
          },
        },
      },
    });

    return shelves.map((shelf) => ({
      ...shelf,

      cellCount: shelf._count.cells,

      itemCount: shelf.cells.reduce(
        (sum, cell) => sum + cell._count.items,
        0
      ),
    }));
  }

  async findById(id: string) {
    return prisma.shelf.findUnique({
      where: { id },

      include: {
        template: true,

        layout: {
          select: {
            id: true,
            name: true,
            width: true,
            height: true,
          },
        },

        cells: {
          orderBy: [
            { row: 'asc' },
            { column: 'asc' },
          ],

          include: {
            items: {
              include: {
                batch: {
                  include: {
                    variant: {
                      include: {
                        product: {
                          select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                          },
                        },

                        unit: {
                          select: {
                            id: true,
                            name: true,
                            symbol: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async create(data: CreateShelfDTO) {
    return prisma.shelf.create({
      data: {
        name: data.name ?? null,
        templateId: data.templateId,
        layoutId: data.layoutId!,
        posX: data.posX ?? 0,
        posY: data.posY ?? 0,
        rotation: data.rotation ?? 0,
      },
      include: { template: true },
    });
  }

  async update(id: string, data: UpdateShelfDTO) {
    return prisma.shelf.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.posX !== undefined && { posX: data.posX }),
        ...(data.posY !== undefined && { posY: data.posY }),
        ...(data.rotation !== undefined && { rotation: data.rotation }),
        ...(data.templateId !== undefined && { templateId: data.templateId }),
        ...(data.layoutId && { layoutId: data.layoutId }),
      },
      include: { template: true },
    });
  }

  async delete(id: string) {
    return prisma.shelf.delete({
      where: { id },
    });
  }

  // ─────────────────────────────────────────────
  // ShelfCell
  // ─────────────────────────────────────────────

  async findCellsByShelfId(shelfId: string) {
    return prisma.shelfCell.findMany({
      where: { shelfId },

      orderBy: [
        { row: 'asc' },
        { column: 'asc' },
      ],

      include: {
        items: {
          include: {
            batch: true,
          },
        },

        _count: {
          select: {
            items: true,
          },
        },
      },
    });
  }

  async findCellById(cellId: string) {
    return prisma.shelfCell.findUnique({
      where: { id: cellId },

      include: {
        shelf: {
          include: {
            template: true,
          },
        },

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
          },
        },
      },
    });
  }

  async createCell(
    shelfId: string,
    data: CreateShelfCellDTO
  ) {
    return prisma.shelfCell.create({
      data: {
        shelfId,
        row: data.row,
        column: data.column,
      },
    });
  }

  async upsertCell(
    shelfId: string,
    row: number,
    column: number
  ) {
    return prisma.shelfCell.upsert({
      where: {
        shelfId_row_column: {
          shelfId,
          row,
          column,
        },
      },
      update: {},
      create: {
        shelfId,
        row,
        column,
      },
    });
  }

  async deleteCell(cellId: string) {
    return prisma.shelfCell.delete({
      where: {
        id: cellId,
      },
    });
  }

  async bulkCreateCells(
    shelfId: string,
    rows: number,
    columns: number
  ) {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        cells.push({ shelfId, row: r, column: c });
      }
    }
    return prisma.shelfCell.createMany({
      data: cells,
      skipDuplicates: true,
    });
  }
}