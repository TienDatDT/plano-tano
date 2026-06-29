import { prisma } from '@/shared/lib/prisma';
import { PlanogramRepository } from '../repositories/planogram.repository';
import {
  AssignItemDTO,
  UpdateItemDTO,
  PlanogramFilterDTO,
  BulkAssignItemDTO,
} from '../dtos/planogram.dto';

export class PlanogramService {
  private repository: PlanogramRepository;

  constructor() {
    this.repository = new PlanogramRepository();
  }

  async getItems(filter: PlanogramFilterDTO = {}) {
    const page = Number(filter.page) || 1;
    const limit = Math.min(Number(filter.limit) || 20, 100);

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

  async getItemById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error(`Planogram item with ID ${id} not found`);
    }
    return item;
  }

  async getItemsByShelf(shelfId: string) {
    // Verify shelf exists
    const shelf = await prisma.shelf.findUnique({ where: { id: shelfId } });
    if (!shelf) {
      throw new Error(`Shelf with ID ${shelfId} not found`);
    }
    return this.repository.findByShelfId(shelfId);
  }

  async assignItem(data: AssignItemDTO) {
    if (!data.shelfId) throw new Error('shelfId is required');
    if (!data.cellId) throw new Error('cellId is required');
    if (!data.batchId) throw new Error('batchId is required');
    if (!data.quantity || data.quantity <= 0) {
      throw new Error('quantity must be a positive integer');
    }

    // Verify shelf exists
    const shelf = await prisma.shelf.findUnique({ where: { id: data.shelfId } });
    if (!shelf) throw new Error(`Shelf ${data.shelfId} not found`);

    // Verify cell belongs to shelf
    const cell = await prisma.shelfCell.findUnique({ where: { id: data.cellId } });
    if (!cell || cell.shelfId !== data.shelfId) {
      throw new Error(`Cell ${data.cellId} does not belong to shelf ${data.shelfId}`);
    }

    // Verify batch exists
    const batch = await prisma.batch.findUnique({ where: { id: data.batchId } });
    if (!batch) throw new Error(`Batch ${data.batchId} not found`);

    // Check if cell is already occupied
    const existing = await this.repository.findByCellId(data.cellId);
    if (existing) {
      throw new Error(
        `Cell is already occupied by item ${existing.id}. Remove it first or use update.`
      );
    }

    return this.repository.create(data);
  }

  async updateItem(id: string, data: UpdateItemDTO) {
    await this.getItemById(id);

    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new Error('quantity must be a positive integer');
    }

    if (data.batchId !== undefined) {
      const batch = await prisma.batch.findUnique({ where: { id: data.batchId } });
      if (!batch) throw new Error(`Batch ${data.batchId} not found`);
    }

    if (data.cellId !== undefined) {
      const item = await this.repository.findById(id);
      // ShelfItem has no shelfId – get it from the cell relation
      const currentShelfId = item!.cell.shelfId;
      const cell = await prisma.shelfCell.findUnique({ where: { id: data.cellId } });
      if (!cell || cell.shelfId !== currentShelfId) {
        throw new Error(`Cell ${data.cellId} does not belong to the same shelf`);
      }
      // Check new cell is not occupied by another item
      const occupying = await this.repository.findByCellId(data.cellId);
      if (occupying && occupying.id !== id) {
        throw new Error(`Cell ${data.cellId} is already occupied by another item`);
      }
    }

    return this.repository.update(id, data);
  }

  async removeItem(id: string) {
    await this.getItemById(id);
    return this.repository.delete(id);
  }

  async clearShelf(shelfId: string) {
    const shelf = await prisma.shelf.findUnique({ where: { id: shelfId } });
    if (!shelf) throw new Error(`Shelf ${shelfId} not found`);
    return this.repository.deleteByShelfId(shelfId);
  }

  async bulkAssign(data: BulkAssignItemDTO) {
    if (!data.items?.length) {
      throw new Error('At least one item is required for bulk assign');
    }

    // Validate all items before inserting
    for (const item of data.items) {
      if (!item.shelfId || !item.cellId || !item.batchId || item.quantity <= 0) {
        throw new Error('Each item requires shelfId, cellId, batchId, and quantity > 0');
      }
    }

    return this.repository.bulkCreate(data.items);
  }

  async getSnapshotByLayout(layoutId: string) {
    const layout = await prisma.storeLayout.findUnique({ where: { id: layoutId } });
    if (!layout) throw new Error(`Store layout ${layoutId} not found`);

    const shelves = await this.repository.getSnapshotByLayout(layoutId);

    return {
      layoutId,
      layoutName: layout.name,
      shelves: shelves.map((shelf) => ({
        shelfId: shelf.id,
        shelfName: shelf.name,
        posX: shelf.posX,
        posY: shelf.posY,
        layoutType: shelf.template.layoutType,
        rows: shelf.template.rows,
        columns: shelf.template.columns,
        cells: shelf.cells.map((cell) => ({
          cellId: cell.id,
          row: cell.row,
          column: cell.column,
          item: cell.items[0] ?? null,
        })),
      })),
    };
  }
}

export const planogramService = new PlanogramService();
