import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../dtos/category.dto';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  async getCategories() {
    return await this.repository.findAll();
  }

  async getCategoryById(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }

  async createCategory(data: CreateCategoryDTO) {
    if (!data.name?.trim()) {
      throw new Error('Category name is required');
    }
    return await this.repository.create({
      name: data.name.trim(),
      description: data.description,
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDTO) {
    if (data.name !== undefined && !String(data.name).trim()) {
      throw new Error('Category name cannot be empty');
    }

    // Ensure exists
    await this.getCategoryById(id);

    return await this.repository.update(id, {
      ...(data.name !== undefined && { name: data.name.trim() }),
      description: data.description,
    });
  }

  async deleteCategory(id: string) {
    // Ensure exists
    await this.getCategoryById(id);
    return await this.repository.delete(id);
  }
}

export const categoryService = new CategoryService();
