import { ProductRepository } from '../repositories/product.repository';
import { serializeProduct } from '../lib/serializeProduct';
import { CreateProductDTO, UpdateProductDTO } from '../dtos/product.dto';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async getAllProducts() {
    const rows = await this.repository.findAll();
    return rows.map(serializeProduct);
  }

  async getProductById(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return serializeProduct(product);
  }

  async createProduct(data: CreateProductDTO) {
    if (!data.name?.trim()) {
      throw new Error('Product name is required');
    }
    if (!data.categoryId) {
      throw new Error('Category is required');
    }

    const created = await this.repository.create({
      name: data.name.trim(),
      description: data.description ?? null,
      categoryId: data.categoryId,
    });
    return serializeProduct(created);
  }

  async updateProduct(id: string, data: UpdateProductDTO) {
    if (data.name !== undefined && !String(data.name).trim()) {
      throw new Error('Product name cannot be empty');
    }

    await this.getProductById(id);

    const updated = await this.repository.update(id, {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.status !== undefined && { status: data.status }),
    });
    return serializeProduct(updated);
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
    return await this.repository.delete(id);
  }

  async deleteProducts(ids: string[]) {
    if (!ids.length) throw new Error('No ids provided');
    return await this.repository.deleteMany(ids);
  }

  async updateProductsStatus(ids: string[], status: "ACTIVE" | "INACTIVE") {
    if (!ids.length) throw new Error('No ids provided');
    return await this.repository.updateManyStatus(ids, status);
  }
}

export const productService = new ProductService();
