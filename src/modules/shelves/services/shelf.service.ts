import { ShelfRepository } from '../repositories/shelf.repository';
import { prisma } from '@/shared/lib/prisma';
import {
  CreateShelfDTO,
  UpdateShelfDTO,
  ShelfFilterDTO,
  CreateShelfCellDTO,
} from '../dtos/shelf.dto';

export class ShelfService {
  private repository: ShelfRepository;

  constructor() {
    this.repository = new ShelfRepository();
  }

  async getShelves(filter: ShelfFilterDTO = {}) {
    const page = Number(filter.page) || 1;
    const limit = Math.min(Number(filter.limit) || 10, 100);

    const { data, total } = await this.repository.findMany({ ...filter, page, limit });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllShelves(layoutId?: string) {
    return this.repository.findAll(layoutId);
  }

  async getShelfById(id: string) {
    const shelf = await this.repository.findById(id);
    if (!shelf) {
      throw new Error(`Shelf with ID ${id} not found`);
    }
    return shelf;
  }

  async createShelf(data: CreateShelfDTO) {
    // Resolve layoutId – if not provided, use the first/active StoreLayout
    let resolvedLayoutId = data.layoutId;
    if (!resolvedLayoutId) {
      const defaultLayout = await prisma.storeLayout.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      }) ?? await prisma.storeLayout.findFirst({ orderBy: { createdAt: 'asc' } });
      if (!defaultLayout) throw new Error('No StoreLayout found. Please create a store layout first.');
      resolvedLayoutId = defaultLayout.id;
    } else {
      const layout = await prisma.storeLayout.findUnique({ where: { id: resolvedLayoutId } });
      if (!layout) throw new Error(`Store layout with ID ${resolvedLayoutId} not found`);
    }

    // Verify template exists
    const template = await prisma.shelfTemplate.findUnique({ where: { id: data.templateId } });
    if (!template) {
      throw new Error(`Shelf template with ID ${data.templateId} not found`);
    }

    const shelf = await this.repository.create({
      ...data,
      layoutId: resolvedLayoutId,
      posX: data.posX ?? 0,
      posY: data.posY ?? 0,
    });

    // Auto-create cells for GRID type based on template dimensions
    if (template.layoutType === 'GRID' && template.rows && template.columns) {
      await this.repository.bulkCreateCells(shelf.id, template.rows, template.columns);
    }

    return this.repository.findById(shelf.id);
  }

  async updateShelf(id: string, data: UpdateShelfDTO) {
    await this.getShelfById(id);

    if (data.name !== undefined && !String(data.name).trim()) {
      throw new Error('Shelf name cannot be empty');
    }

    if (data.layoutId !== undefined) {
      if (data.layoutId === null || data.layoutId === '') {
        delete data.layoutId;
      } else {
        const layout = await prisma.storeLayout.findUnique({ where: { id: data.layoutId } });
        if (!layout) {
          throw new Error(`Store layout with ID ${data.layoutId} not found`);
        }
      }
    }

    return this.repository.update(id, {
      ...data,
      ...(data.name !== undefined && { name: data.name.trim() }),
    });
  }

  async bulkUpdateShelves(items: { id: string; posX: number; posY: number; rotation?: number; name?: string }[]) {
    if (!items || items.length === 0) return [];

    const updates = items.map((item) => {
      return prisma.shelf.update({
        where: { id: item.id },
        data: {
          posX: item.posX,
          posY: item.posY,
          ...(item.rotation !== undefined && { rotation: item.rotation }),
          ...(item.name !== undefined && { name: item.name }),
        },
      });
    });

    return prisma.$transaction(updates);
  }

  async deleteShelf(id: string) {
    await this.getShelfById(id);
    return this.repository.delete(id);
  }

  // ─── Cell operations ────────────────────────────────────────────────────────

  async getCellsByShelf(shelfId: string) {
    await this.getShelfById(shelfId);
    return this.repository.findCellsByShelfId(shelfId);
  }

  async addCell(shelfId: string, data: CreateShelfCellDTO) {
    await this.getShelfById(shelfId);
    if (data.row < 0) throw new Error('Row must be >= 0');
    if (data.column < 0) throw new Error('Column must be >= 0');
    return this.repository.upsertCell(shelfId, data.row, data.column);
  }

  async deleteCell(shelfId: string, cellId: string) {
    const cell = await this.repository.findCellById(cellId);
    if (!cell || cell.shelfId !== shelfId) {
      throw new Error(`Cell ${cellId} not found on shelf ${shelfId}`);
    }
    return this.repository.deleteCell(cellId);
  }

  async initGridCells(shelfId: string, rows: number, columns: number) {
    const shelf = await this.getShelfById(shelfId);
    if ((shelf as any).layoutType !== 'GRID') {
      throw new Error('Grid cells can only be initialised on GRID-type shelves');
    }
    if (rows <= 0 || columns <= 0) throw new Error('Rows and columns must be positive');
    return this.repository.bulkCreateCells(shelfId, rows, columns);
  }
}

export const shelfService = new ShelfService();
