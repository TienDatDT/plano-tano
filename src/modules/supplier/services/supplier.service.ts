import { SupplierRepository } from '../repositories/supplier.repository';
import { CreateSupplierDTO, UpdateSupplierDTO } from '../dtos/supplier.dto';

export class SupplierService {
  private repository: SupplierRepository;

  constructor() {
    this.repository = new SupplierRepository();
  }

  async getSuppliers() {
    return await this.repository.findAll();
  }

  async getSupplierById(id: string) {
    const supplier = await this.repository.findById(id);
    if (!supplier) {
      throw new Error(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async createSupplier(data: CreateSupplierDTO) {
    if (!data.name?.trim()) {
      throw new Error('Supplier name is required');
    }
    return await this.repository.create({
      name: data.name.trim(),
      representative: data.representative,
      address: data.address,
      email: data.email,
      phone: data.phone,
      status: data.status
    });
  }

  async updateSupplier(id: string, data: UpdateSupplierDTO) {
    if (data.name !== undefined && !String(data.name).trim()) {
      throw new Error('Category name cannot be empty');
    }

    // Ensure exists
    await this.getSupplierById(id);

    return await this.repository.update(id, {
      ...(data.name !== undefined && { name: data.name.trim() }),
      representative: data.representative,
      address: data.address,
      email: data.email,
      phone: data.phone,
      status: data.status
    });
  }

  async deleteSupplier(id: string) {
    // Ensure exists
    await this.getSupplierById(id);
    return await this.repository.delete(id);
  }

  async deleteSuppliers(ids: string[]) {
    if (!ids.length) throw new Error('No ids provided');
    return await this.repository.deleteMany(ids);
  }
}

export const supplierService = new SupplierService();
