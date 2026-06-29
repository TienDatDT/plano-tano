// shelf-template.service.ts

import {
  CreateShelfTemplateDTO,
  UpdateShelfTemplateDTO,
  ShelfTemplateFilterDTO,
} from '../dtos/shelf-template.dto';

import { ShelfTemplateRepository } from '../repositories/shelf-template.repository';

export class ShelfTemplateService {
  private repository = new ShelfTemplateRepository();

  async findMany(filter: ShelfTemplateFilterDTO) {
    return this.repository.findMany(filter);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const template = await this.repository.findById(id);

    if (!template) {
      throw new Error('Shelf template not found');
    }

    return template;
  }

  async create(data: CreateShelfTemplateDTO) {
    return this.repository.create(data);
  }

  async update(
    id: string,
    data: UpdateShelfTemplateDTO
  ) {
    await this.findById(id);

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);

    return this.repository.delete(id);
  }
}

export const shelfTemplateService = new ShelfTemplateService();