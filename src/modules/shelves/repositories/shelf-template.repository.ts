// shelf-template.repository.ts

import { prisma } from '@/shared/lib/prisma';

import {
  CreateShelfTemplateDTO,
  UpdateShelfTemplateDTO,
  ShelfTemplateFilterDTO,
} from '../dtos/shelf-template.dto';

export class ShelfTemplateRepository {
  async findMany(filter: ShelfTemplateFilterDTO = {}) {
    const {
      search,
      layoutType,

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

      ...(layoutType && {
        layoutType,
      }),
    };

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      prisma.shelfTemplate.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },

        include: {
          _count: {
            select: {
              shelves: true,
            },
          },
        },
      }),

      prisma.shelfTemplate.count({
        where,
      }),
    ]);

    return {
      data: templates.map(({ _count, ...rest }) => ({
        ...rest,

        shelfCount: _count.shelves,
      })),

      total,
    };
  }

  async findAll() {
    const templates = await prisma.shelfTemplate.findMany({
      orderBy: {
        name: 'asc',
      },

      include: {
        _count: {
          select: {
            shelves: true,
          },
        },
      },
    });

    return templates.map(({ _count, ...rest }) => ({
      ...rest,

      shelfCount: _count.shelves,
    }));
  }

  async findById(id: string) {
    return prisma.shelfTemplate.findUnique({
      where: { id },

      include: {
        _count: {
          select: {
            shelves: true,
          },
        },
      },
    });
  }

  async create(data: CreateShelfTemplateDTO) {
    return prisma.shelfTemplate.create({
      data: {
        name: data.name,

        description: data.description ?? null,

        layoutType: data.layoutType,

        width: data.width ?? null,
        height: data.height ?? null,

        rows: data.rows ?? null,
        columns: data.columns ?? null,
      },
    });
  }

  async update(
    id: string,
    data: UpdateShelfTemplateDTO
  ) {
    return prisma.shelfTemplate.update({
      where: { id },

      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.layoutType !== undefined && {
          layoutType: data.layoutType,
        }),

        ...(data.width !== undefined && {
          width: data.width,
        }),

        ...(data.height !== undefined && {
          height: data.height,
        }),

        ...(data.rows !== undefined && {
          rows: data.rows,
        }),

        ...(data.columns !== undefined && {
          columns: data.columns,
        }),
      },
    });
  }

  async delete(id: string) {
    return prisma.shelfTemplate.delete({
      where: { id },
    });
  }
}