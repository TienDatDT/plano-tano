import { StoreLayoutRepository } from '../repositories/store-layout.repository';
import {
  CreateStoreLayoutDTO,
  UpdateStoreLayoutDTO,
  StoreLayoutFilterDTO,
} from '../dtos/store-layout.dto';

export class StoreLayoutService {
  private repository: StoreLayoutRepository;

  constructor() {
    this.repository = new StoreLayoutRepository();
  }

  async getLayouts(filter: StoreLayoutFilterDTO = {}) {
    const page = Number(filter.page) || 1;
    const limit = Math.min(Number(filter.limit) || 10, 100);

    const { data, total } = await this.repository.findMany({
      ...filter,
      page,
      limit,
    });

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

  async getAllLayouts() {
    return this.repository.findAll();
  }

  async getLayoutById(id: string) {
    const layout = await this.repository.findById(id);
    if (!layout) {
      throw new Error(`Store layout with ID ${id} not found`);
    }
    return layout;
  }

  async createLayout(data: CreateStoreLayoutDTO) {
    if (!data.name?.trim()) {
      throw new Error('Layout name is required');
    }
    if (!data.width || data.width <= 0) {
      throw new Error('Width must be a positive number');
    }
    if (!data.height || data.height <= 0) {
      throw new Error('Height must be a positive number');
    }

    const exists = await this.repository.existsByName(data.name.trim());
    if (exists) {
      throw new Error(`Layout name "${data.name}" already exists`);
    }

    return this.repository.create({
      ...data,
      name: data.name.trim(),
    });
  }

  async updateLayout(id: string, data: UpdateStoreLayoutDTO) {
    await this.getLayoutById(id);

    if (data.name !== undefined) {
      if (!String(data.name).trim()) {
        throw new Error('Layout name cannot be empty');
      }
      const exists = await this.repository.existsByName(data.name.trim(), id);
      if (exists) {
        throw new Error(`Layout name "${data.name}" already exists`);
      }
    }
    if (data.width !== undefined && data.width <= 0) {
      throw new Error('Width must be a positive number');
    }
    if (data.height !== undefined && data.height <= 0) {
      throw new Error('Height must be a positive number');
    }

    return this.repository.update(id, {
      ...data,
      ...(data.name !== undefined && { name: data.name.trim() }),
    });
  }

  async deleteLayout(id: string) {
    await this.getLayoutById(id);
    return this.repository.delete(id);
  }
}

export const storeLayoutService = new StoreLayoutService();
